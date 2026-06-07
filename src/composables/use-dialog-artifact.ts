import { generateText } from 'ai'
import { db } from 'src/utils/db'
import { engine } from 'src/utils/template-engine'
import { ExtractArtifactPrompt, ExtractArtifactResult, NameArtifactPrompt } from 'src/utils/templates'
import { useCreateArtifact } from 'src/composables/create-artifact'
import { useGetModel } from 'src/composables/get-model'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { collectDialogContents } from 'src/utils/dialog-message-map'
import { useI18n } from 'vue-i18n'
import { useToast } from 'src/composables/useToast'
import type { Ref } from 'vue'
import type { Dialog, Message, Artifact, ConvertArtifactOptions, UserMessageContent, AssistantMessageContent } from 'src/utils/types'

export function useDialogArtifact(
  dialog: Ref<Dialog | null>,
  chain: Ref<string[]>,
  messageMap: Ref<Record<string, Message>>,
  workspace: Ref<any>,
  systemSdkModel: Ref<any>,
) {
  const { t } = useI18n()
  const { toastError } = useToast()
  const { perfs } = useUserPerfsStore()
  const { createArtifact } = useCreateArtifact(workspace)

  async function genArtifactName(content: string, lang?: string) {
    const { text } = await generateText({
      model: systemSdkModel.value,
      prompt: engine.parseAndRenderSync(NameArtifactPrompt, { content, lang })
    })
    return text
  }

  async function extractArtifact(message: Message, text: string, pattern, options: ConvertArtifactOptions) {
    const name = options.name || await genArtifactName(text, options.lang)
    const id = await createArtifact({
      name,
      language: options.lang,
      versions: [{
        date: new Date(),
        text
      }],
      tmp: text
    })
    if (options.reserveOriginal) return
    const to = `> ${t('dialogView.convertedToArtifact')}: <router-link to="?openArtifact=${id}">${name}</router-link>\n`
    const index = message.contents.findIndex(c => ['assistant-message', 'user-message'].includes(c.type))
    const content = message.contents[index] as UserMessageContent | AssistantMessageContent
    await db.messages.update(message.id, {
      [`contents.${index}.text`]: content.text.replace(pattern, to) as any
    })
  }

  async function autoExtractArtifact() {
    const message = messageMap.value[chain.value.at(-2)]
    const { text } = await generateText({
      model: systemSdkModel.value,
      prompt: engine.parseAndRenderSync(ExtractArtifactPrompt, {
        contents: collectDialogContents(chain.value.slice(-3), messageMap.value)
      })
    })
    const object: ExtractArtifactResult = JSON.parse(text)
    if (!object.found) return
    const reg = new RegExp(`(\`{3,}.*\\n)?(${object.regex})(\\s*\`{3,})?`)
    const content = message.contents.find(c => c.type === 'assistant-message')
    const match = content.text.match(reg)
    if (!match) return
    await extractArtifact(message, match[2], reg, {
      name: object.name,
      lang: object.language,
      reserveOriginal: perfs.artifactsReserveOriginal
    })
  }

  return {
    genArtifactName,
    extractArtifact,
    autoExtractArtifact,
  }
}
