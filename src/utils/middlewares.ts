import { LanguageModelMiddleware } from 'ai'

const FormattingReenabled: LanguageModelMiddleware = {
  async transformParams({ params }) {
    const prompt = params.prompt
    prompt.unshift({
      role: 'system',
      content: 'Formatting re-enabled'
    })
    return {
      ...params,
      prompt
    }
  }
}

const MarkdownFormatting: LanguageModelMiddleware = {
  async transformParams({ params }) {
    const prompt = params.prompt
    prompt.unshift({
      role: 'system',
      content: '- Use Markdown **only where semantically correct** (e.g., `inline code`, ```code fences```, lists, tables).\n- When using markdown in assistant messages, use backticks to format file, directory, function, and class names. Use \\( and \\) for inline math, \\[ and \\] for block math.'
    })
    return {
      ...params,
      prompt
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

// Used for debugging only
export const LogMiddleware: LanguageModelMiddleware = {
  wrapGenerate: async ({ doGenerate, params }) => {
    console.log('doGenerate called')
    console.log(`params: ${JSON.stringify(params, null, 2)}`)

    const result = await doGenerate()

    console.log('doGenerate finished')

    return result
  },

  wrapStream: async ({ doStream, params }) => {
    console.log('doStream called')
    console.log(`params: ${JSON.stringify(params, null, 2)}`)

    const { stream, ...rest } = await doStream()

    let generatedText = ''

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        console.log(chunk)
        if (chunk.type === 'text-delta') {
          generatedText += chunk.textDelta
        }

        controller.enqueue(chunk)
      },

      flush() {
        console.log('doStream finished')
        console.log(`generated text: ${generatedText}`)
      }
    })

    return {
      stream: stream.pipeThrough(transformStream),
      ...rest
    }
  }
}

export {
  FormattingReenabled,
  MarkdownFormatting,
  AuthropicCors
}
