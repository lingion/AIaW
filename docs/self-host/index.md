# Self-Hosting

## Quick Docker Deployment

```bash
docker run -d -p 9010:9010 --name aiaw krytro/aiaw:latest
```

If you want to use the web search plugin, you need to deploy a SearXNG instance and pass in the `SEARXNG_URL` environment variable:

```bash
docker run -d -p 9010:9010 -e SEARXNG_URL=https://example.com --name aiaw krytro/aiaw:latest
```

Before v1.7, the document parsing function relied on LlamaParse. In v1.7+, pure front-end parsing for PDF, Docx, Xlsx, PPTX documents is implemented. However, some formats (such as .doc, .xls, .ppt) are still parsed using LlamaParse.

If you need to use LlamaParse, please log in to [LlamaCloud](https://cloud.llamaindex.ai/) and create an API Key, passing it in the `LLAMA_CLOUD_API_KEY` environment variable.

### Docker Compose

You can also use Docker Compose. Refer to the following `docker-compose.yaml`:

```yaml
services:
  aiaw:
    image: krytro/aiaw:latest
    container_name: aiaw
    restart: unless-stopped
    ports:
      - '9010:9010'
    environment:
      # If you want to use the built-in web search plugin
      SEARXNG_URL: https://example.com
      # If you want to use LlamaParse
      LLAMA_CLOUD_API_KEY: xxxxxxx
```

## More Features

If you need cloud synchronization, you need to build it yourself due to changes in the front-end build environment variables. See [Advanced Deployment](advanced).

In addition, the out-of-the-box model service is unique to our deployment ([aiaw.app](https://aiaw.app)). The relevant backend is not yet open source, but it is not complicated. You can implement it yourself based on LiteLLM.

Below is a feature comparison table for different deployment methods:

| Feature \ Deployment Method | [Static Deployment](advanced#static-deployment) (Frontend Only) | Quick Docker Deployment | Advanced Deployment (Self-Built) | aiaw.app |
| --- | --- | --- | --- | --- |
| Basic Features | √ | √ | √ | √ |
| Plugin Market / Assistant Market / Gradio Plugins | √ | √ | √ | √ |
| LobeChat Plugins | × | √ | √ | √ |
| Cloud Synchronization | Requires DexieCloud Configuration | × | Requires DexieCloud Configuration | √ |
| Out-of-the-Box Model Service | × | × | × | √ |

We also used the docker image to deploy a version without cloud synchronization and model service, which can be used directly: [lite.aiaw.app](https://lite.aiaw.app)
