# 常见问题

## 功能异常

### 使用 deepseek-reasoner 时不显示推理内容（思维链）

**可能的原因**：

- 确保配置了 DeepSeek 服务商，且将服务商类型设置为 DeepSeek 而不是 OpenAI。因为 OpenAI 原版格式是没有推理内容的。
- 确保你使用的服务商会返回推理内容。DeepSeek 官方和硅基流动支持，部分第三方服务商不会返回推理内容。

### 配置的服务商用不了/回复为空

- 确保服务商类型、API 地址、API Key 填写正确。
- API 地址末尾记得加 v1。比如 `https://api.xxxai.com/v1` 而不是 `https://api.xxxai.com`。

## 回复报错

### deepseek-reasoner does not support Function Calling

- 适用模型：DeepSeek
- 错误原因：deepseek-r1 模型不支持函数调用，但是却启用了带有工具调用的插件
- 解决办法：关闭带有工具调用的插件

### messages.1: all messages must have non-empty content except for the optional final assistant message

- 适用模型：Claude
- 错误原因：上下文中某条消息内容为空，但 Claude 不接受空消息
- 解决办法：使用 Claude 时，应避免出现空消息的情况。若因为异常情况出现空消息，应重新生成或者编辑消息

### GenerateContentRequest.tools[0].function_declarations[0].parameters.properties[variables].properties: should be non-empty for OBJECT type

- 适用模型：Gemini
- 错误原因：Gemini 不兼容部分工具调用的参数类型
- 解决办法：关闭不兼容的插件或者更换其他模型

### Type validation failed: Value: {"id":"chatcmpl-…

往往出现在使用插件/上传图片时

- 错误原因：响应格式与官方 API 格式不符，校验未通过；往往出现于逆向 API
- 解决办法：建议使用官方 API 或者 官转 API

## 使用技巧

### 如何同时配置多个不同的服务商？

建议创建多个助手，每个助手配置不同的服务商和模型。若需要在多个工作区使用，可在「助手」页面创建全局助手。
