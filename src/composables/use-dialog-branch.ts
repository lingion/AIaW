import type { Ref } from 'vue'
import type { Dialog, Message } from 'src/utils/types'

export function useDialogBranch(
  dialog: Ref<Dialog | null>,
  chain: Ref<string[]>,
  messageMap: Ref<Record<string, Message>>,
) {
  function getMessageBranchControl(index: number) {
    if (!dialog.value?.msgTree || !Array.isArray(chain.value) || index <= 0 || index >= chain.value.length) return null

    const parentId = chain.value[index - 1]
    const messageId = chain.value[index]
    const branches = dialog.value.msgTree[parentId]
    if (!Array.isArray(branches) || branches.length <= 1) return null

    const message = messageMap.value[messageId]
    const currentRoute = dialog.value.msgRoute?.[index - 1]
    if (typeof currentRoute !== 'number') return null

    return {
      current: currentRoute + 1,
      max: branches.length,
      deletable: !!message && !['pending', 'streaming'].includes(message.status)
    }
  }

  return { getMessageBranchControl }
}
