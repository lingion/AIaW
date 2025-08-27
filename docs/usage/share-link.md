# Share Link

You can automatically set the service provider via a link. Here's an example link for OpenAI:

```
https://aiaw.app/set-provider?provider={"type":"openai","settings":{"apiKey":"{key}","baseURL":"{address}/v1"}}
```

For other service providers, you can refer to the sharing link format in the settings.

## [New API](https://github.com/Calcium-Ion/new-api) Configuration Example

Add an entry in Operation Settings > Chat Configuration:

```json
{
  "AI as Workspace": "https://aiaw.app/set-provider?provider={\"type\":\"openai\",\"settings\":{\"apiKey\":\"{key}\",\"baseURL\":\"{address}/v1\"}}"
}
```
