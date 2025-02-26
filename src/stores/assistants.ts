import { defineStore } from 'pinia'
import { useLiveQuery } from 'src/composables/live-query'
import { db, defaultModelSettings } from 'src/utils/db'
import { defaultAvatar, genId } from 'src/utils/functions'
import { Assistant } from 'src/utils/types'
import { AssistantDefaultPrompt } from 'src/utils/templates'
import { useI18n } from 'vue-i18n'

export const useAssistantsStore = defineStore('assistants', () => {
  const assistants = useLiveQuery(() => db.assistants.toArray(), { initialValue: [] as Assistant[] })
  const { t } = useI18n()
  async function add(props: Partial<Assistant> = {}) {
    return await db.assistants.add({
      name: t('stores.assistants.newAssistant'),
      id: genId(),
      avatar: defaultAvatar('AI'),
      workspaceId: '$root',
      prompt: '',
      promptTemplate: AssistantDefaultPrompt,
      promptVars: [],
      provider: null,
      model: null,
      modelSettings: { ...defaultModelSettings },
      plugins: {},
      promptRole: 'system',
      stream: true,
      ...props
    })
  }

  async function update(id: string, changes) {
    return await db.assistants.update(id, changes)
  }

  async function put(assistant: Assistant) {
    return await db.assistants.put(assistant)
  }

  async function delete_(id: string) {
    return await db.assistants.delete(id)
  }

  return {
    assistants,
    add,
    update,
    put,
    delete: delete_
  }
})
