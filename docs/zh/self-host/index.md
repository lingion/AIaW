# 自部署

## Docker 快速部署

```bash
docker run -d -p 9010:9010 --name aiaw krytro/aiaw:latest
```

如果要使用联网搜索插件，需部署 SearXNG 实例，并传入 `SEARXNG_URL` 环境变量：

```bash
docker run -d -p 9010:9010 -e SEARXNG_URL=https://example.com --name aiaw krytro/aiaw:latest
```

在 v1.7 之前，文档解析功能依赖 LlamaParse。在 v1.7+ 中，实现了针对 PDF, Docx, Xlsx, PPTX 文档的纯前端解析。但部分格式（如 .doc, .xls, .ppt）仍然使用 LlamaParse 解析。

若需要使用 LlamaParse，请登录 [LlamaCloud](https://cloud.llamaindex.ai/) 并创建 API Key，传入 `LLAMA_CLOUD_API_KEY` 环境变量。

### Docker Compose

也可以使用 Docker Compose。参考下面的 `docker-compose.yaml`：

```yaml
services:
  aiaw:
    image: krytro/aiaw:latest
    container_name: aiaw
    restart: unless-stopped
    ports:
      - '9010:9010'
    environment:
      # 如果要使用内置的联网搜索插件
      SEARXNG_URL: https://example.com
      # 如果要使用 LlamaParse
      LLAMA_CLOUD_API_KEY: xxxxxxx
```

## 更多功能

如果需要云同步功能，由于涉及前端构建环境变量的更改，需要自行构建，详见[进阶部署](advanced)。

此外，开箱即用的模型服务是我们的部署（[aiaw.app](https://aiaw.app)）独有的，相关后端暂未开源，不过并不复杂，你可以基于 LiteLLM 自行实现。

下面是不同部署方式的功能对照表：

| 功能 \ 部署方式 | [静态部署](advanced#静态部署)（仅前端） | Docker 快速部署 | 进阶部署（自行构建） | aiaw.app |
| --- | --- | --- | --- | --- |
| 基本功能 | √ | √ | √ | √ |
| 插件市场/助手市场/Gradio插件 | √ | √ | √ | √ |
| LobeChat插件 | × | √ | √ | √ |
| 云同步 | 需配置 DexieCloud | × | 需配置 DexieCloud | √ |
| 开箱即用的模型服务 | × | × | × | √ |

我们也使用 Docker 快速部署的方式，部署了一个没有云同步和模型服务的版本，可直接使用：[lite.aiaw.app](https://lite.aiaw.app)
