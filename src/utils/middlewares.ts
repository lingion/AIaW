import { LanguageModelMiddleware } from 'ai'

const FormattingReenabled: LanguageModelMiddleware = {
  async transformParams({ params }) {
    return {
      ...params,
      prompt: [
        {
          role: 'system',
          content: 'Formatting re-enabled'
        },
        ...params.prompt
      ]
    }
  }
}

const MarkdownFormatting: LanguageModelMiddleware = {
  async transformParams({ params }) {
    return {
      ...params,
      prompt: [
        {
          role: 'system',
          content: '- Use Markdown **only where semantically correct** (e.g., `inline code`, ```code fences```, lists, tables).\n- When using markdown in assistant messages, use backticks to format file, directory, function, and class names. Use \\( and \\) for inline math, \\[ and \\] for block math.'
        },
        ...params.prompt
      ]
    }
  }
}

const AuthropicCors: LanguageModelMiddleware = {
  async transformParams({ params }) {
    return {
      ...params,
      headers: {
        ...params.headers,
        'anthropic-dangerous-direct-browser-access': 'true'
      }
    }
  }
}

// LogMiddleware: disabled — was used for debugging, re-enable if needed
export const LogMiddleware: LanguageModelMiddleware = {
  wrapGenerate: async ({ doGenerate }) => {
    return await doGenerate()
  },

  wrapStream: async ({ doStream }) => {
    return await doStream()
  }
}

export {
  FormattingReenabled,
  MarkdownFormatting,
  AuthropicCors
}
