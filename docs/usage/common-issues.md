# Common Issues

## Function Abnormalities

### Reasoning content (chain of thought) is not displayed when using deepseek-reasoner

**Possible reasons**:

- Make sure that the DeepSeek service provider is configured, and the service provider type is set to DeepSeek instead of OpenAI. Because the original OpenAI format does not have reasoning content.
- Make sure that the service provider you are using will return reasoning content. DeepSeek official and Silicon Flow support it, but some third-party service providers will not return reasoning content.

### The configured service provider is not working/the reply is empty

- Make sure that the service provider type, API address, and API Key are filled in correctly.
- Remember to add v1 to the end of the API address. For example, `https://api.xxxai.com/v1` instead of `https://api.xxxai.com`.

## Reply Error

### deepseek-reasoner does not support Function Calling

- Applicable model: DeepSeek
- Reason for error: The deepseek-r1 model does not support function calls, but a plugin with tool calls is enabled
- Solution: Turn off plugins with tool calls

### messages.1: all messages must have non-empty content except for the optional final assistant message

- Applicable model: Claude
- Reason for error: A message in the context is empty, but Claude does not accept empty messages
- Solution: When using Claude, empty messages should be avoided. If an empty message occurs due to abnormal circumstances, it should be regenerated or edited

### GenerateContentRequest.tools[0].function_declarations[0].parameters.properties[variables].properties: should be non-empty for OBJECT type

- Applicable model: Gemini
- Reason for error: Gemini is not compatible with some tool call parameter types
- Solution: Turn off incompatible plugins or replace other models

### Type validation failed: Value: {"id":"chatcmpl-…

Often appears when using plugins/uploading images

- Reason for error: The response format does not match the official API format, and the verification fails; often occurs in reverse API
- Solution: It is recommended to use the official API or the official transfer API
