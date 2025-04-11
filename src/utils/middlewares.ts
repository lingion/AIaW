import { LanguageModelV1Middleware, LanguageModelV1StreamPart } from 'ai'

const FormattingReenabled: LanguageModelV1Middleware = {
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

const AuthropicCors: LanguageModelV1Middleware = {
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
export const LogMiddleware: LanguageModelV1Middleware = {
  wrapGenerate: async ({ doGenerate, params }) => {
    console.log('doGenerate called')
    console.log(`params: ${JSON.stringify(params, null, 2)}`)

    const result = await doGenerate()

    console.log('doGenerate finished')
    console.log(`generated text: ${result.text}`)

    return result
  },

  wrapStream: async ({ doStream, params }) => {
    console.log('doStream called')
    console.log(`params: ${JSON.stringify(params, null, 2)}`)

    const { stream, ...rest } = await doStream()

    let generatedText = ''

    const transformStream = new TransformStream<
      LanguageModelV1StreamPart,
      LanguageModelV1StreamPart
    >({
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
  AuthropicCors
}
