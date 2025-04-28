import { client } from 'quasar/src/plugins/platform/Platform.js'

export default function (onInput) {
  return function onComposition (e) {
    if (client.is.android) return
    if (e.type === 'compositionend' || e.type === 'change') {
      if (!e.target.qComposing) return
      e.target.qComposing = false
      onInput(e)
    } else if (e.type === 'compositionstart') {
      e.target.qComposing = true
    }
  }
}
