# 提示词变量

一般的提示词是静态文本，你可以在助手的「角色设定」中设置普通的静态提示词。

除此之外，AIaW 还支持通过创建提示词变量、编辑提示词模板，来构建**动态**且**可复用**的提示词。

在助手的「提示词变量」处，你可以定义提示词变量。

![](res/assistant-prompt-vars.png)

这些变量可以在「提示词模板」中使用；它们的值将在对话时由用户选择/输入。

<img src="./res/prompt-var-input.png" width="300px">

## 定义变量

「变量名」是在提示词模板中使用变量时用的名称；「标签」是对话时变量值输入框的标签；

变量「类型」与JS数据类型的对应关系如下：
- 文本：string
- 数字：number
- 开关：boolean
- 选择：string
- 多选：array

## 语法规则

提示词模板使用[LiquidJS](https://liquidjs.com/)模板引擎渲染，语法规则请参考[LiquidJS文档](https://liquidjs.com/zh-cn/tutorials/intro-to-liquid.html)。

值得注意的是，我们在引擎选项中启用了 `jsTruthy`，这意味着真/假值的判断基于 JavaScript 规则而非 Shopify 的规则。比如，空字符串的真值为假。详见[这里](https://liquidjs.com/tutorials/truthy-and-falsy.html)。

::: tip 「渲染」
尽管提示词并不是拿来“显示”的，但我们仍然把使用模板引擎处理提示词模板和变量得到提示词的过程叫做「渲染」，因为它使用了和传统渲染HTML一样的方式。
:::

## 内置变量

这是提示词模板的默认内容：

```
{%- if _rolePrompt %}
<role_prompt>
{{ _rolePrompt }}
</role_prompt>
{%- endif %}

{{ _pluginsPrompt }}
```

可以看到，使用了 `_rolePrompt` 和 `_pluginsPrompt` 两个变量，这两个变量都是内置变量。

`_rolePrompt` 的值正是上面「角色设定」的内容；而 `_pluginsPrompt` 是所有已启用插件的提示词（如果有的话）渲染得到的最终结果。

这意味着助手的「提示词模板」是整个系统提示词渲染过程的最后一个模板，此模板的渲染结果将直接作为系统提示词输入给模型。用户在这里拥有对提示词的完全控制。如果将此模板清空，最终的系统提示词必然为空，即使有「角色设定」或者插件的提示词。

此外，还有几个提供当前信息的**通用内置变量**：

| 变量名 | 内容 | 示例值 |
| ----- | ---- | ---- |
| _currentTime | 当前时间 | "Tue Dec 10 2024 17:22:11 GMT+0800 (中国标准时间)" |
| _userLanguage | 用户语言 `navigator.language` | "zh-CN" |
| _workspaceId | 工作区 ID | "1ielm0e6n464itr2ps" |
| _workspaceName | 工作区名称 | "示例工作区" |
| _assistantId | 助手 ID | "1ielm0e6n464itssd3" |
| _assistantName | 助手名称 | "默认助手" |
| _dialogId | 对话 ID | "1ielm5fg6464ittksm" |
| _modelId | 模型 ID | "gpt-4o" |
| _isDarkMode | 当前是否为深色模式 | false |
| _platform | 根据用户使用的平台信息 | quasar 的 Platform 对象。详见[这里](https://quasar.dev/options/platform-detection#properties) |

之所以叫「通用」内置变量，是因为这些变量在插件的提示词模板中也可以使用。详见[插件系统](plugins)。

## 工作区变量

除了助手的提示词变量和内置变量以外，你还可以在工作区设置中定义「工作区变量」。

工作区变量都是文本类型；它们的值在定义的同时指定。

工作区变量在这个工作区的不同助手的提示词模板中都可以使用。因此可以把整个工作区共有的信息放在这里，或是把不同助手提示词中的重复部分抽离出来，实现提示词的复用。

## XML 标签

在上面的示例和默认的提示词模板中，我们都使用了 `<role_prompt>...</role_prompt>` 这样的 XML 标签。这不是必须的，但使用 XML 确实是使复杂提示词结构清晰的好方法。对于简单的提示词，使用 Markdown 语法甚至是纯文本就足够了，但当提示词的层次嵌套变得复杂时，就可以使用 XML 清晰地划分各部分，以便模型准确地理解。

