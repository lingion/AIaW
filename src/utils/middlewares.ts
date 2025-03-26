import { LanguageModelV1Middleware } from 'ai'

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
export {
  FormattingReenabled,
  AuthropicCors
}
