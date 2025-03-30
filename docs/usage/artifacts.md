# Artifacts

Artifacts was originally a feature implemented by Anthropic on the Claude official website. By extracting large independent content (such as code, articles, etc.) from the assistant's answers as "Artifacts" and displaying them in a separate window, users can browse, modify, and reuse these content.

Our Artifacts function has some differences in implementation, but the function is similar, and it is more universal and controllable to use.

## Create Artifacts

Different from the Claude official website, the creation of AIaW's Artifacts is mainly controlled by users. You can convert any part of the assistant's answer into an Artifact.

For code blocks, you can click the button in the upper right corner to convert;

<img src="./res/code-convert-artifact.png" width="300px">

For other content, convert it to Artifacts through the menu after selecting multiple lines of text.

<img src="./res/selection-convert-artifact.png" width="300px">

In addition, you can manually create or upload local files in the right sidebar.

We also provide an option to automatically extract Artifacts, automatically detect whether there is content suitable for extraction as Artifacts in the assistant's answer, and if so, automatically extract and name it. However, this is achieved through an additional request to the system assistant and does not affect the current assistant's prompt.

## Modify

After opening Artifacts, you can directly modify the content of Artifacts, and press Ctrl + S to save the modification after completion.

Artifacts has simple version control, you can switch versions in the lower left corner of the editing page.

In the lower right corner of the editing page, you can control the assistant's read and write permissions for this Artifact. The default is readable and writable, and you can let the assistant modify the content of Artifacts.

The assistant can only see the opened Artifacts, and you can open multiple Artifacts at the same time. When there are no opened Artifacts, the assistant will not receive Artifacts-related prompts, and there will be no additional overhead and impact.

## Scope

Artifacts are stored at the workspace level, which means they are cross-conversation. The same Artifact is available in all conversations in the workspace to which it belongs. You can also move Artifacts to another workspace.

## Implementation Details

Although it looks simple, the original Artifacts function is actually a function that requires fine-tuning, and it is difficult to improve its versatility.

First of all, it does not use tool calls, but identifies Artifacts by letting the assistant insert the `<antArtifact>` tag in the answer. This means that it is necessary to separately implement the detection of streaming responses, which cannot be generalized with the logic of tool calls. In addition, the biggest difficulty lies in letting AI accurately judge whether Artifacts should be used.

According to Claude's leaked prompt, the Artifacts prompt has 4000+ tokens, which is not simple. If the implementation is basically the same, can you directly copy this prompt? LobeChat is like this, and it does work with the Claude model. But the same prompt, replaced with GPT 4o, will not work. It will not use Artifacts when it should be used, and it will only use it if you explicitly remind it. It is clear that there is no limitation on the model in the prompt, but the actual performance of different models is different, which can only be understood as the difference of the models.

This is also why I implemented a different Artifacts function: for more universality and controllability.
