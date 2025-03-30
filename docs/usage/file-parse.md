# File Parsing

Generally speaking, models can only receive input types that they natively support. For example, gpt-3.5 only supports text input; many newer models also support image input; and the latest models also support audio input. But what if the file type is not supported by the model? This requires a **file parser**.

The role of the file parser is to convert files of types not supported by the model (such as documents and videos) into types supported by the model (usually text).

File parsers are also provided by plugins. We have built-in several plugins for parsing files, which you can see on the [Plugins page](https://aiaw.app/plugins):

- Speech Recognition Whisper: Through the Whisper model, recognize the text in the voice, and realize the conversion of audio to text.

- Video to Text: Extract the audio from the video, and then, like the above, convert it to text through the Whisper model.

- Document Parsing: Parse the content of documents (PDF, Word, Excel, PPT, etc.) and convert it to Markdown text.

The first two plugins call the Whisper model through Huggingface🤗 Spaces, so they are free. The document parsing backend calls LlamaParse, which we also provide for free.

## Type Matching Process

When adding a file, AIaW first detects whether the file is a type directly supported by the model. If it is, it is added directly; otherwise, the file parsing dialog box pops up.

At this time, it will check the types supported by all file parsers. When the MIME type set by a file parser matches the MIME type of the file, this file parser will be one of the parsing options. The MIME type of the file parser can be modified in the plugin settings.
