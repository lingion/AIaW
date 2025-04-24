# Assistants

In a workspace, you can create multiple assistants and set different prompts, models, plugins, etc. for each assistant to adapt to different tasks.

Ordinary assistants are only available in the current workspace, but you can also create global assistants in the right sidebar of the "Assistants" page. These assistants are available in any workspace.

When creating a workspace, an assistant will also be created as the default assistant for that workspace. You can change the default assistant in the workspace settings.

Assistants can be moved from one workspace to another, or to global, and vice versa.

## Share Assistants

Through the "Export" button at the bottom of the assistant settings page, you can export the assistant to the clipboard or export it as a file. Others can click the plus sign in the upper right corner of the plugin market to import assistants through files or the clipboard.

You can also publish assistants to the assistant market so that other users can directly see and add them in the market. The publishing method is:

- Complete the assistant's description, author and other information, and then export
- Add the exported JSON to `/public/json/assistants.[language].json` of the source code and submit a PR
