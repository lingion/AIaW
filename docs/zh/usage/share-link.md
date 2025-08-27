# 中转站对接

可通过链接自动设置服务商，openai 示例链接：

```
https://aiaw.app/set-provider?provider={"type":"openai","settings":{"apiKey":"{key}","baseURL":"{address}/v1"}}
```

对于其他服务商，也可以参考设置中的分享链接格式设置。

## [New API](https://github.com/Calcium-Ion/new-api) 设置示例

在 运营设置 > 聊天配置 中添加一项：

```json
{
  "AI as Workspace": "https://aiaw.app/set-provider?provider={\"type\":\"openai\",\"settings\":{\"apiKey\":\"{key}\",\"baseURL\":\"{address}/v1\"}}"
}
```
