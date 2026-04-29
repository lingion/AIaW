from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, Response, UploadFile, Form, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
import aiohttp
from typing import Optional, Dict, Any, List
from fastapi.staticfiles import StaticFiles
from llama_parse import LlamaParse
import os
import asyncio
import subprocess
import tempfile
import shutil
import base64
import glob
import pathlib

http_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global http_client
    http_client = aiohttp.ClientSession()
    yield
    await http_client.close()

app = FastAPI(lifespan=lifespan)

ALLOWED_PREFIXES = [
    'https://lobehub.search1api.com/api/search',
    'https://pollinations.ai-chat.top/api/drawing',
    'https://web-crawler.chat-plugin.lobehub.com/api/v1'
]

class ProxyRequest(BaseModel):
    method: str
    url: str
    headers: Optional[Dict[str, str]] = None
    body: Optional[Any] = None

@app.post('/cors/proxy')
async def proxy(request: ProxyRequest):
    if not any(request.url.startswith(prefix) for prefix in ALLOWED_PREFIXES):
        raise HTTPException(status_code=403, detail='URL not allowed')

    kwargs = {
        'method': request.method,
        'url': request.url,
        'headers': request.headers or {}
    }

    if request.body is not None:
        if isinstance(request.body, (dict, list)):
            kwargs['json'] = request.body
        else:
            kwargs['data'] = request.body

    try:
        async with http_client.request(**kwargs) as response:
            content = await response.read()
            return Response(content=content, status_code=response.status)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/doc-parse/parse')
async def parse_document(
    file: UploadFile = File(...),
    language: Optional[str] = Form(default='en'),
    target_pages: Optional[str] = Form(default=None)
):
    parser = LlamaParse(
        result_type='markdown',
        language=language,
        target_pages=target_pages
    )

    file_content = await file.read()

    try:
        documents = await parser.aload_data(
            file_content,
            {'file_name': file.filename}
        )

        return {
            'success': True,
            'content': [{'text': doc.text, 'meta': doc.metadata} for doc in documents]
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

    finally:
        await file.close()

@app.get('/searxng')
async def searxng(request: Request):
    searxng_url = os.environ.get('SEARXNG_URL')

    if not searxng_url:
        raise HTTPException(status_code=502, detail="SEARXNG_URL environment variable not set")

    query_string = request.url.query
    target_url = f"{searxng_url}?{query_string}" if query_string else searxng_url

    headers = dict(request.headers)
    # 移除 host header 以避免冲突
    headers.pop('host', None)

    try:
        async with http_client.get(target_url, headers=headers) as response:
            content = await response.read()
            return Response(
                content=content,
                status_code=response.status
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Code Execution Plugin Backend ──

CODE_EXEC_TIMEOUT = int(os.environ.get('CODE_EXEC_TIMEOUT', '30'))
CODE_MAX_MEMORY = int(os.environ.get('CODE_MAX_MEMORY_MB', '512'))

class CodeExecRequest(BaseModel):
    code: str
    timeout: int = CODE_EXEC_TIMEOUT

@app.post('/code-exec')
async def code_exec(req: CodeExecRequest):
    """Execute Python code in a temp sandbox. Returns stdout/stderr + images."""
    tmpdir = tempfile.mkdtemp(prefix='aiaw_code_')
    try:
        # Inject matplotlib savefig hook: auto-save to tmpdir if plt is used
        wrapper = (
            "import sys, os, io, base64\n"
            "os.chdir(sys.argv[1])\n"
            "\n"
            "# Auto matplotlib capture\n"
            "try:\n"
            "    import matplotlib\n"
            "    matplotlib.use('Agg')\n"
            "    import matplotlib.pyplot as _plt\n"
            "    _orig_show = _plt.show\n"
            "    def _auto_save(*a, **kw):\n"
            "        for i, fig in enumerate(_plt.get_figs()):\n"
            "            fig.savefig(f'{sys.argv[1]}/plot_{i}.png', dpi=150, bbox_inches='tight')\n"
            "        _plt.close('all')\n"
            "    _plt.show = _auto_save\n"
            "except Exception:\n"
            "    pass\n"
            "\n"
            "# ---- User code ----\n"
            f"{req.code}\n"
            "\n"
            "# ---- Auto-save any remaining figures ----\n"
            "try:\n"
            "    import matplotlib.pyplot as _plt2\n"
            "    for i, fig in enumerate(_plt2.get_figs()):\n"
            "        fig.savefig(f'{sys.argv[1]}/plot_{i}.png', dpi=150, bbox_inches='tight')\n"
            "    _plt2.close('all')\n"
            "except Exception:\n"
            "    pass\n"
        )

        script_path = os.path.join(tmpdir, '_exec.py')
        with open(script_path, 'w') as f:
            f.write(wrapper)

        timeout = min(req.timeout, 120)
        proc = await asyncio.create_subprocess_exec(
            'python3', script_path, tmpdir,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        try:
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=timeout)
        except asyncio.TimeoutError:
            proc.kill()
            return {'stdout': '', 'stderr': f'Timeout after {timeout}s', 'images': []}

        images: List[Dict] = []
        for img_path in sorted(glob.glob(os.path.join(tmpdir, 'plot_*.png'))):
            with open(img_path, 'rb') as f:
                img_data = base64.b64encode(f.read()).decode('ascii')
            images.append({
                'name': os.path.basename(img_path),
                'mime': 'image/png',
                'data': img_data
            })

        # Also capture svg if generated
        for svg_path in sorted(glob.glob(os.path.join(tmpdir, '*.svg'))):
            with open(svg_path, 'rb') as f:
                svg_data = base64.b64encode(f.read()).decode('ascii')
            images.append({
                'name': os.path.basename(svg_path),
                'mime': 'image/svg+xml',
                'data': svg_data
            })

        return {
            'stdout': stdout.decode('utf-8', errors='replace'),
            'stderr': stderr.decode('utf-8', errors='replace'),
            'images': images
        }
    except Exception as e:
        return {'stdout': '', 'stderr': str(e), 'images': []}
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


# ── File Operations Plugin Backend ──

FILE_OPS_ROOT = os.environ.get('FILE_OPS_ROOT', os.path.expanduser('~'))
FILE_OPS_MAX_READ = int(os.environ.get('FILE_OPS_MAX_READ_MB', '10')) * 1024 * 1024

def _resolve(path: str) -> str:
    """Resolve and validate path is within allowed root."""
    resolved = os.path.realpath(os.path.join(FILE_OPS_ROOT, path))
    if not resolved.startswith(os.path.realpath(FILE_OPS_ROOT)):
        raise HTTPException(status_code=403, detail='Path outside allowed root')
    return resolved

class FileReadRequest(BaseModel):
    path: str
    encoding: str = 'utf-8'

class FileWriteRequest(BaseModel):
    path: str
    content: str
    append: bool = False

class FileListRequest(BaseModel):
    path: str = '.'
    recursive: bool = False

class FileExecRequest(BaseModel):
    command: str
    cwd: Optional[str] = None
    timeout: str = '30'

@app.post('/file/read')
async def file_read(req: FileReadRequest):
    try:
        resolved = _resolve(req.path)
        if not os.path.isfile(resolved):
            raise HTTPException(status_code=404, detail=f'Not a file: {req.path}')
        size = os.path.getsize(resolved)
        if size > FILE_OPS_MAX_READ:
            raise HTTPException(status_code=413, detail=f'File too large: {size} bytes (max {FILE_OPS_MAX_READ})')
        with open(resolved, 'r', encoding=req.encoding) as f:
            content = f.read()
        return {'content': content, 'size': size, 'path': req.path}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/file/write')
async def file_write(req: FileWriteRequest):
    try:
        resolved = _resolve(req.path)
        os.makedirs(os.path.dirname(resolved), exist_ok=True)
        mode = 'a' if req.append else 'w'
        with open(resolved, mode, encoding='utf-8') as f:
            written = f.write(req.content)
        return {'message': f'Written {written} chars to {req.path}', 'bytes': len(req.content.encode('utf-8'))}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/file/list')
async def file_list(req: FileListRequest):
    try:
        resolved = _resolve(req.path)
        if not os.path.isdir(resolved):
            raise HTTPException(status_code=404, detail=f'Not a directory: {req.path}')
        entries = []
        if req.recursive:
            for root, dirs, files in os.walk(resolved):
                for d in dirs:
                    entries.append({'name': os.path.relpath(os.path.join(root, d), resolved), 'type': 'dir', 'size': 0})
                for f in files:
                    fp = os.path.join(root, f)
                    try: sz = os.path.getsize(fp)
                    except: sz = 0
                    entries.append({'name': os.path.relpath(fp, resolved), 'type': 'file', 'size': sz})
        else:
            for item in sorted(os.listdir(resolved)):
                fp = os.path.join(resolved, item)
                if os.path.isdir(fp):
                    entries.append({'name': item, 'type': 'dir', 'size': 0})
                elif os.path.isfile(fp):
                    try: sz = os.path.getsize(fp)
                    except: sz = 0
                    entries.append({'name': item, 'type': 'file', 'size': sz})
                else:
                    entries.append({'name': item, 'type': 'link', 'size': 0})
        return {'entries': entries, 'path': req.path}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/file/exec')
async def file_exec(req: FileExecRequest):
    try:
        cwd = _resolve(req.cwd) if req.cwd else FILE_OPS_ROOT
        timeout = min(int(req.timeout), 120)
        proc = await asyncio.create_subprocess_shell(
            req.command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=cwd,
        )
        try:
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=timeout)
        except asyncio.TimeoutError:
            proc.kill()
            raise HTTPException(status_code=408, detail=f'Timeout after {timeout}s')
        return {
            'stdout': stdout.decode('utf-8', errors='replace'),
            'stderr': stderr.decode('utf-8', errors='replace'),
            'exit_code': proc.returncode
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


app.mount('/', StaticFiles(directory='static', html=True), name='static')

@app.exception_handler(404)
async def return_index(request: Request, exc: HTTPException):
    return FileResponse("static/index.html")
