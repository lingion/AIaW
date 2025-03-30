# Self-Hosting

## Quick Docker Deployment

```bash
docker run -d -p 9010:9010 --name aiaw krytro/aiaw:latest
```

To use the built-in document parsing plugin, you need to log in to [LlamaCloud](https://cloud.llamaindex.ai/) and create an API Key, then pass it as the `LLAMA_CLOUD_API_KEY` environment variable:

```bash
docker run -d -p 9010:9010 -e LLAMA_CLOUD_API_KEY=xxxxxxx --name aiaw krytro/aiaw:latest
```

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
      # If you want to use the built-in document parsing plugin
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
| Document Parsing Plugin | × | Requires `LLAMA_CLOUD_API_KEY` | Requires `LLAMA_CLOUD_API_KEY` | √ |
| Cloud Synchronization | Requires DexieCloud Configuration | × | Requires DexieCloud Configuration | √ |
| Out-of-the-Box Model Service | × | × | × | √ |

We also use the Quick Docker Deployment method to deploy a version: [lite.aiaw.app](https://lite.aiaw.app), which supports LobeChat plugins and document parsing, but does not have cloud synchronization and out-of-the-box model services.
