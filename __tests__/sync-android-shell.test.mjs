import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'

const scriptPath = '/Users/lingion/AIaW/scripts/sync-android-shell.mjs'

async function writeText(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, value)
}

function runSync(env) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [scriptPath], {
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''
    child.stdout.on('data', chunk => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', chunk => {
      stderr += chunk.toString()
    })
    child.on('close', code => {
      resolve({ code, stdout, stderr })
    })
  })
}

test('sync-android-shell replaces packaged android directory with canonical shell', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aiaw-shell-sync-'))
  const canonicalDir = path.join(tempDir, 'canonical-android')
  const packagedDir = path.join(tempDir, 'packaged-android')

  await writeText(path.join(canonicalDir, 'app/build.gradle'), 'versionName "Arona-v2.0.8.2.verified"\n')
  await writeText(path.join(canonicalDir, 'app/src/main/res/values/strings.xml'), '<string name="app_name">AIaW</string>\n')
  await writeText(path.join(canonicalDir, 'app/src/main/java/app/aiaw/MainActivity.java'), 'registerPlugin(LocalFsPlugin.class);\n')
  await writeText(path.join(canonicalDir, 'app/src/main/assets/public/index.html'), '<html>fresh</html>\n')

  await writeText(path.join(packagedDir, 'stale.txt'), 'remove me\n')
  await writeText(path.join(packagedDir, 'app/build.gradle'), 'versionName "Arona-v2.0.6"\n')

  const result = await runSync({
    AIAW_CANONICAL_ANDROID_DIR: canonicalDir,
    AIAW_PACKAGED_ANDROID_DIR: packagedDir
  })

  assert.equal(result.code, 0, `expected success, got stderr: ${result.stderr}`)
  assert.match(result.stdout, /Synchronized Android shell/)
  await assert.rejects(fs.access(path.join(packagedDir, 'stale.txt')))
  assert.equal(
    await fs.readFile(path.join(packagedDir, 'app/build.gradle'), 'utf8'),
    await fs.readFile(path.join(canonicalDir, 'app/build.gradle'), 'utf8')
  )
  assert.equal(
    await fs.readFile(path.join(packagedDir, 'app/src/main/assets/public/index.html'), 'utf8'),
    '<html>fresh</html>\n'
  )

  await fs.rm(tempDir, { recursive: true, force: true })
})
