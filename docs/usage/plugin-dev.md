# Plugin Configuration and Development

Make sure you understand the content of the [Plugin System](plugins).

If you want to add a custom new plugin, you need to write a plugin configuration file, which is in JSON format and is generally called `manifest`.

AIaW supports several different types of plugins, and their configuration files are also written differently. Let's start with the Gradio type plugin, which has the most complete support.

## Gradio Plugins

[Gradio](https://www.gradio.app/) is an application development framework based on python. It can be used to quickly develop simple applications. The various [Spaces](https://huggingface.co/spaces) on HuggingFace are the most common examples.

Gradio applications provide simple interfaces and APIs. AIaW's Gradio type plugins use APIs to call Gradio applications to implement various functions.

Using Gradio to develop plugins has the following benefits:

- The plugin itself is a Gradio application, which can be used separately and is convenient for testing
- python is simple and easy to learn, has a rich ecosystem, and is closely related to AI
- Gradio plugins support multimodal call results
- Gradio applications are easy to call other AI models
- Gradio applications can be hosted for free on HF Spaces
- Gradio applications have a rich ecosystem. If HF Spaces has a ready-made application that meets the function, you can directly configure it as a plugin without development

For the development of Gradio applications, please refer to the documentation of [Gradio](https://www.gradio.app/). Here, we only talk about the configuration of plugins.

The following uses the built-in "Image Generation: FLUX" plugin as an example to introduce the configuration file format of Gradio plugins:

::: code-group
```json [Configuration File]
{
  "id": "hf-000000000000000000000001",
  "title": "Image Generation: FLUX",
  "description": "Let AI call the FLUX model to generate images. It is called through 🤗 Spaces, so it is free",
  "baseUrl": "https://black-forest-labs-flux-1-schnell.hf.space",
  "avatar": {
    "type": "icon",
    "icon": "sym_o_palette",
    "hue": 80
  },
  "endpoints": [/* Omitted, will be introduced later */],
  "noRoundtrip": true
}
```
```typescript [TS Type Definition]
interface GradioPluginManifest {
  id: string
  title: string
  description: string
  prompt?: string
  promptVars?: PromptVar[]
  baseUrl: string
  avatar: Avatar
  endpoints: GradioManifestEndpoint[]
  noRoundtrip?: boolean
  author?: string
  homepage?: string
}
```
:::

- `id`: The ID of the plugin; the ID of each plugin must be different
- `title`: The display name of the plugin
- `description`: The plugin description displayed to the user; this description will not be input to AI
- `prompt`: Optional; [Plugin prompt](plugins#prompt). [Prompt variables](#promptvars) can be used in the prompt
- `promptVars`: Optional; prompt variables; [Specific instructions](#promptvars)
- `avatar`: The icon of the plugin; [Specific instructions](#avatar)
- `endpoints`: The interface definition of the plugin; tool calls/file parsers/information acquisition are all defined here; [Specific instructions](#endpoints)
- `baseURL`: The address of the Gradio application. For Gradio applications hosted on HF Spaces, there are two ways to write it:
  - Path: such as `black-forest-labs/FLUX.1-schnell`
  - Link: such as `https://black-forest-labs-flux-1-schnell.hf.space`

  Both formats are acceptable. However, since mainland China blocks the HuggingFace main site but does not block `*.hf.space`, we recommend **always using the latter method** (that is, using a link) to avoid users in mainland China from being unable to call the plugin. By observing the two formats, it is not difficult to find that the corresponding link can be obtained by simply rewriting the path.
- `noRoundtrip`: Optional; by default, after calling the tool, the LLM will be called again with the call result to generate an answer based on the call result. However, since this is an image generation plugin, there is no need for the assistant to continue answering after the image is generated, so set it to `true` to disable this behavior.
- `author`: Optional; the author of the plugin
- `homepage`: Optional; the homepage of the plugin/author

### avatar

The `avatar` attribute specifies the default icon of the plugin; it supports different types of icons

::: code-group
```json [Example: Icon]
{
  "type": "icon",
  "icon": "sym_o_palette",
  "hue": 80
}
```
```json [Example: Text]
{
  "type": "text",
  "text": "🍉"
}
```
```json [Example: Image Link]
{
  "type": "url",
  "url": "https://url.to.my/image.avif"
}
```
```typescript [TS Type Definition]
interface TextAvatar {
  type: 'text'
  text: string
  hue?: number
}
interface UrlAvatar {
  type: 'url'
  url: string
  hue?: number
}
interface IconAvatar {
  type: 'icon'
  icon: string
  hue?: number
}
type Avatar = TextAvatar | UrlAvatar | IconAvatar
```
:::

For `icon` type icons, you can select an icon from [Material Symbols](https://fonts.google.com/icons), write the icon name in underscore format, and add the `sym_o_` prefix. For example, for an icon named `Photo Camera`, the `icon` attribute value is `sym_o_photo_camera`.

::: info Icon Prefix
The icon prefix indicates the icon set used. AIaW uses Material Symbols Outlined, so the prefix is `sym_o_`
:::

You can add the `hue` attribute to display the background color; you can select a color in the theme color dialog on the [Settings page](https://aiaw.app/settings#ui) to get the hue value; if you don’t fill it in, there will be no background

### endpoints

`endpoints` defines the interfaces that the plugin can call. Gradio type plugins call the interfaces of Gradio applications. Click "Use via API" at the bottom of the HF Space page to see the interface and parameters of the application.

`endpoint` can be defined as the following three types:
- `tool`: Tool call
- `fileparser`: File parser
- `info`: Information acquisition

The "Image Generation: FLUX" plugin only defines one tool call interface:

::: code-group

```json [Example Value]
[
  {
    "type": "tool",
    "name": "image_generation",
    "description": "Use this tool to generate images based on a prompt.",
    "prompt": "Use this tool to generate images based on a prompt.",
    "path": "/infer",
    "inputs": [
      {
        "name": "prompt",
        "description": "A prompt to generate an image from",
        "paramType": "required",
        "type": "str"
      },
      {
        "name": "seed",
        "paramType": "fixed",
        "value": 0,
        "type": "float"
      },
      {
        "name": "randomize_seed",
        "paramType": "fixed",
        "value": true,
        "type": "bool"
      },
      {
        "name": "width",
        "description": "numeric value between 256 and 2048",
        "paramType": "optional",
        "default": 1024,
        "type": "float"
      },
      {
        "name": "height",
        "description": "numeric value between 256 and 2048",
        "paramType": "optional",
        "default": 1024,
        "type": "float"
      },
      {
        "name": "num_inference_steps",
        "paramType": "fixed",
        "value": 4,
        "type": "float"
      }
    ],
    "outputIdxs": [
      0
    ],
    "showComponents": [
      "image"
    ]
  }
]
```
```typescript [TS Type Definition]
interface GradioManifestFileparser {
  type: 'fileparser'
  name: string
  description: string
  path: string
  inputs: GradioFileparserInput[]
  outputIdxs: number[]
}
interface GradioManifestTool {
  type: 'tool'
  name: string
  description: string
  prompt: string
  path: string
  inputs: GradioApiInput[]
  showComponents?: string[]
  outputIdxs: number[]
}
interface GradioManifestInfo {
  type: 'info'
  name: string
  description: string
  path: string
  inputs: GradioApiInput[]
  outputIdxs: number[]
}
type GradioManifestEndpoint = GradioManifestFileparser | GradioManifestTool | GradioManifestInfo
```
:::

#### Tool Call

For `endpoint` of type tool, there are the following attributes:

- `type`: The value is `tool`, indicating the tool type
- `name`: Name
- `description`: The description of the tool displayed to the user
- `prompt`: The description/prompt of the tool displayed to AI
- `path`: The path of the interface, corresponding to the `api_name` of the Gradio application interface; common values are `/predict`, `/infer`, etc.
- `inputs`: Defines the input parameters of the interface; [Specific instructions](#inputs)
- `outputIdxs`: Select the index array of the return value of the Gradio interface; for example, if the value is `[0]`, only the item with index `0` (that is, the first item) in the return value is selected as the only item in the tool call result array. It is an array, which means that if the interface has multiple return values, you can select multiple items as the call result.
- `showComponents`: Optional; defines the components used to display each item of the call result to the user. Available components are:
  - `textbox`: Used to display text;
  - `markdown`: Used to display markdown formatted text
  - `image`: Used to display images
  - `audio`: Used to play audio
  - `json`: Used to display json
  - `code`: Used to display code
  - `$none`: Do not display

  The value of the above example is `["image"]` because the call result is only one image, and the `image` component is used to display it to the user. If `showComponents` is not filled in, the call result will not be displayed

##### inputs

`inputs` defines the input parameters of the interface

::: code-group
```json [Example Value]
[
  {
    "name": "prompt",
    "description": "A prompt to generate an image from",
    "paramType": "required",
    "type": "str"
  },
  {
    "name": "seed",
    "paramType": "fixed",
    "value": 0,
    "type": "float"
  },
  {
    "name": "randomize_seed",
    "paramType": "fixed",
    "value": true,
    "type": "bool"
  },
  {
    "name": "width",
    "description": "numeric value between 256 and 2048",
    "paramType": "optional",
    "default": 1024,
    "type": "float"
  },
  {
    "name": "height",
    "description": "numeric value between 256 and 2048",
    "paramType": "optional",
    "default": 1024,
    "type": "float"
  },
  {
    "name": "num_inference_steps",
    "paramType": "fixed",
    "value": 4,
    "type": "float"
  }
]
```
```typescript [TS Type Definition]
interface GradioFixedInput {
  name: string
  paramType: 'fixed'
  type: string
  value
  description?: string
}
interface GradioOptionalInput {
  name: string
  description?: string
  paramType: 'optional'
  type: string
  default
}
interface GradioRequiredInput {
  name: string
  description?: string
  paramType: 'required'
  type: string
}
type GradioApiInput = GradioFixedInput | GradioOptionalInput | GradioRequiredInput
```
:::

- `name`: The name of the parameter in the Gradio application interface
- `paramType`: Parameter type; there are the following types:
  - `required`: The model must provide the value of this parameter when calling
  - `fixed`: Fix the value of the parameter to the value of the `value` attribute. The model cannot change it, but the user can change this fixed value in the plugin settings
  - `optional`: Defined as an optional value. If the model does not provide a parameter value, the default value is the value of the `default` attribute; the user can also modify the value of `default`
- `description`: The description of the parameter; for `required` and `optional` types, it will be provided to the model; for `fixed` and `optional` types, the user can see it on the plugin settings page
- `type`: The data type of the parameter. Supported types are: `str`, `float`, `int`, `bool`

#### File Parser

The element of `endpoints` can also be a file parser (`fileparser`); take the file parser of the "Speech Recognition: Whisper" plugin as an example:

::: code-group
```json [Example Value]
{
  "type": "fileparser",
  "name": "transcribe",
  "description": "Convert speech to text",
  "path": "/transcribe",
  "inputs": [
    {
      "name": "audio",
      "type": "file",
      "mimeTypes": [
        "audio/*"
      ],
      "paramType": "file"
    },
    {
      "name": "task",
      "description": "Task type",
      "type": "str",
      "paramType": "fixed",
      "value": "transcribe"
    }
  ],
  "outputIdxs": [
    0
  ]
}
```
```typescript [TS Type Definition]
interface GradioFileInput {
  name: string
  paramType: 'file'
  mimeTypes: string[]
}
interface GradioRangeInput {
  name: string
  paramType: 'range'
  label?: string
  hint?: string
  mask?: string
}
interface GradioFixedInput {
  name: string
  paramType: 'fixed'
  type: string
  value
  description?: string
}
type GradioFileparserInput = GradioFileInput | GradioRangeInput | GradioFixedInput
interface GradioManifestFileparser {
  type: 'fileparser'
  name: string
  description: string
  path: string
  inputs: GradioFileparserInput[]
  outputIdxs: number[]
}
```
:::

It has the following attributes:

- `type`: The value is `fileparser`, indicating that it is a file parser
- `name`: Name
- `description`: The description of the file parser displayed to the user
- `path`: The path of the interface, corresponding to the `api_name` of the Gradio application interface; common values are `/predict`, `/infer`, etc.
- `inputs`: Defines the input parameters of the interface; see below for details
- `outputIdxs`: Select the index array of the return value of the Gradio interface; for example, if the value is `[0]`, only the item with index `0` (that is, the first item) in the return value is selected as the only item in the file parsing result array. It is an array, which means that if the interface has multiple return values, you can select multiple items as the parsing result.

The types of `inputs` for file parsers are: `file`, `range` and `fixed`.

A file parser must have one and only one input of type `file`, which is the file to be parsed.

It has the following attributes:

- `name`: The name of the parameter in the Gradio application interface
- `paramType`: The value is `file`
- `mimeTypes`: The default accepted file type; the value is an array of MIME Types. As long as one item matches the MIME Type of the file to be parsed, this parser will be used as one of the parsing options.

File parsers can also have `fixed` type inputs, which are the same as the `fixed` inputs for tool calls.

In addition, you can add a `range` type parameter so that the user can fill in this additional parameter when parsing the file. This parameter can be used to allow the user to specify the parsing range (such as: page number range, duration range, etc.). There can be at most one parameter of this type and it must be a string type. It has the following attributes:

- `name`: The name of the parameter in the Gradio application interface
- `paramType`: The value is `range`
- `label`: Optional; the label of the input box
- `hint`: Optional; the prompt (placeholder) of the input box
- `mask`: Optional; used for fixed-format input, see the Quasar documentation for rules: [Mask](https://quasar.dev/vue-components/input#mask)

#### Information Acquisition

The information acquisition (`info`) interface is used to provide information to the model. The difference between it and tool calls is that the input parameter values ​​are predefined instead of being provided by the model.

Information acquisition needs to be used in conjunction with `prompt`. Its call result will be used as the value of a prompt variable, and then this variable can be used in the plugin's `prompt` to provide information to the model through the prompt.

It is called before each generation, and the call result is not cached.

```typescript [TS Type Definition]
interface GradioManifestInfo {
  type: 'info'
  name: string
  description: string
  path: string
  inputs: GradioApiInput[]
  outputIdxs: number[]
}
```

- `type`: The value is `info`
- `name`: Name; use `infos.{name}` in `prompt` to access the variable
- `description`: The description displayed to the user on the plugin function page
- `inputs`: Input parameters, the format is the same as the `tool` parameter, except that the parameter values ​​are entered by the user on the plugin function page instead of being provided by the model; the user can still change the values ​​of `fixed` parameters and the default values ​​of `optional` parameters on the plugin settings page.
- `outputIdxs`: Select the index array of the call result;

The call result of `info` is also an array, and the format of the array element is:

```typescript
interface ApiResultItem {
  type: 'text' | 'file'
  contentText?: string
  contentBuffer?: ArrayBuffer
  name?: string
  mimeType?: string
}
```

You can use `infos.info_a[0].contentText` and similar formats in `prompt` to access the call result.

### promptVars

You can define the variables of the plugin through `promptVars`. The variables can be used in the `prompt` of the plugin; the values ​​of the variables can be changed on the plugin function page. Using variables allows users to fine-tune the prompts of the plugin.

::: code-group
```json [Example Value]
[
  {
    "id": "displayWidth",
    "name": "displayWidth",
    "label": "Display Size",
    "type": "number",
    "default": 100
  }
]
```
```typescript [TS Type Definition]
type PromptVarValue = string | number | boolean | string[]
interface PromptVar {
  id: string
  name: string
  type: 'text' | 'number' | 'select' | 'multi-select' | 'toggle'
  label?: string
  options?: string[]
  default?: PromptVarValue
}
```
:::

In addition, there are several "general prompt variables" that can be used in the `prompt` of the plugin:

| Variable Name | Content | Example Value |
| ----- | ---- | ---- |
| _currentTime | Current time | "Tue Dec 10 2024 17:22:11 GMT+0800 (China Standard Time)" |
| _userLanguage | User language `navigator.language` | "zh-CN" |
| _workspaceId | Workspace ID | "1ielm0e6n464itr2ps" |
| _workspaceName | Workspace name | "Example Workspace" |
| _assistantId | Assistant ID | "1ielm0e6n464itssd3" |
| _assistantName | Assistant name | "Default Assistant" |
| _dialogId | Dialogue ID | "1ielm5fg6464ittksm" |
| _modelId | Model ID | "gpt-4o" |
| _isDarkMode | Whether the current mode is dark mode | false |
| _platform | Platform information based on the user's platform | Quasar's Platform object. See [here](https://quasar.dev/options/platform-detection#properties) for details |

### Prompt-Only Plugins

Gradio type plugins do not necessarily have to call Gradio interfaces. Gradio type plugins that only contain prompts are also possible.

Specifically, `endpoints` can be an empty array, and then set `prompt`, or you can add `promptVars`.

## LobeChat Plugins

AIaW is compatible with some LobeChat plugins, specifically:

- Supports `default` and `markdown` type plugins, but does not support `standalone` type.
- Does not support openapi plugins
- Does not support the `ui` attribute

For supported plugins, you can directly add their Manifest in the plugin market.

For the development guide of LobeChat plugins, please refer to [LobeChat's documentation](https://lobehub.com/zh/docs/usage/plugins/development).

## Publish Plugins

You can use custom plugins by manually adding Manifest in the plugin market. You can also publish the plugin so that others can install it directly in the plugin market.

To publish a plugin, add the plugin information and Manifest to `/public/plugins.json` in the source code, and then submit a PR.

It is recommended to write the manifest directly in the file, because if you use a link, the manifest is variable. We are more likely to suspect its security and reject the PR.
