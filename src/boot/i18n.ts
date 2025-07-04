import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'

import messages from 'src/i18n'
import { Quasar } from 'quasar'
import { nextTick, watch } from 'vue'
import { localData } from 'src/utils/local-data'

export type MessageLanguages = keyof typeof messages;
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = typeof messages['en-US'];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-interface */
declare module 'vue-i18n' {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema { }

  // define the datetime format schema
  export interface DefineDateTimeFormat { }

  // define the number format schema
  export interface DefineNumberFormat { }
}
/* eslint-enable @typescript-eslint/no-empty-interface */

const langList = import.meta.glob('../../node_modules/quasar/lang/(en-US|zh-CN|zh-TW).js')

type SupportedLang = 'en-US' | 'zh-CN' | 'zh-TW'

const languages = Object.keys(messages)
function getLanguage(): SupportedLang {
  if (localData.language) return localData.language

  if (languages.includes(navigator.language)) {
    return navigator.language as SupportedLang
  } else if (navigator.language === 'zh-HK') {
    return 'zh-TW'
  } else {
    return 'en-US'
  }
}

const language = getLanguage()
const i18n = createI18n({
  locale: language,
  legacy: false,
  fallbackLocale: 'en-US',
  messages
})

function setQuasarLang(language) {
  try {
    langList[`../../node_modules/quasar/lang/${language}.js`]().then((lang: any) => {
      Quasar.lang.set(lang.default)
    })
  } catch (err) {
    // Requested Quasar Language Pack does not exist,
    // let's not break the app, so catching error
    console.error('Request Quasar Language Page failed')
  }
}
setQuasarLang(language)

export { i18n }

export default boot(({ app }) => {
  watch(() => localData.language, async () => {
    await nextTick()
    location.reload()
  })

  // Set i18n instance on app
  app.use(i18n)
})
