import { computed, ref, watch, type Ref } from 'vue'
import { db } from 'src/utils/db'
import { JSONEqual, genId } from 'src/utils/functions'
import { collectReferencedItemIds } from 'src/utils/dialog-message-map'
import { toRaw } from 'vue'
import type { Dialog, Message, StoredItem } from 'src/utils/types'

export function useDialogChain(
  propsId: Ref<string>,
  liveDialog: Ref<Dialog | null>,
  liveMessages: Ref<Message[]>,
  messageMap: Ref<Record<string, Message>>,
  itemMap: Ref<Record<string, StoredItem>>,
  editingDraftState: Ref<{ parentId: string, draftId: string } | null>,
) {
  const chain = computed<string[]>(() => liveDialog.value ? getChain('$root', liveDialog.value.msgRoute)[0] : [])
  const normalizedRoute = computed<number[]>(() => liveDialog.value ? getChain('$root', liveDialog.value.msgRoute)[1] : [])
  const historyChain = ref<string[]>([])

  function getChain(node, route: number[]) {
    const tree = liveDialog.value?.msgTree || {}
    const children = tree[node]
    const r = route.at(0) || 0
    if (!Array.isArray(children) || children.length === 0) {
      return [[node], [r]]
    }
    const nextNode = children[r]
    if (nextNode) {
      const [restChain, restRoute] = getChain(nextNode, route.slice(1))
      return [[node, ...restChain], [r, ...restRoute]]
    } else {
      return [[node], [Math.min(Math.max(r, 0), children.length - 1)]]
    }
  }

  function switchChain(index, value) {
    if (!liveDialog.value?.msgRoute) return
    const route = [...liveDialog.value.msgRoute.slice(0, index), value]
    updateChain(route)
  }

  async function setRoute(route: number[]) {
    if (!liveDialog.value?.id) return
    await db.dialogs.update(liveDialog.value.id, { msgRoute: route })
  }

  function updateChain(route) {
    if (!liveDialog.value?.id || !liveDialog.value?.msgTree?.$root) return
    const res = getChain('$root', route)
    historyChain.value = res[0]
    db.dialogs.update(liveDialog.value.id, { msgRoute: res[1] })
  }

  // Sync route when messages change
  watch([() => liveMessages.value.length, () => liveDialog.value?.id], () => {
    if (!liveDialog.value?.msgTree?.$root || !liveDialog.value?.msgRoute) return
    if (editingDraftState.value && !messageMap.value[editingDraftState.value.draftId]) {
      editingDraftState.value = null
    }
    const route = normalizedRoute.value
    if (!JSONEqual(route, liveDialog.value.msgRoute)) {
      db.dialogs.update(liveDialog.value.id, { msgRoute: route })
    }
  })

  function expandMessageTree(root): string[] {
    return [root, ...liveDialog.value.msgTree[root].flatMap(id => expandMessageTree(id))]
  }

  async function deleteMessageBranch(parent: string, anchor: string) {
    const ids = expandMessageTree(anchor)
    const itemIds = collectReferencedItemIds(ids, messageMap.value)
    await db.transaction('rw', db.dialogs, db.messages, db.items, () => {
      db.messages.bulkDelete(ids)
      itemIds.forEach(id => {
        let { references } = itemMap.value[id]
        references--
        references === 0 ? db.items.delete(id) : db.items.update(id, { references })
      })
      const msgTree = { ...toRaw(liveDialog.value.msgTree) }
      msgTree[parent] = msgTree[parent].filter(id => id !== anchor)
      ids.forEach(id => {
        delete msgTree[id]
      })
      db.dialogs.update(propsId.value, { msgTree })
    })
  }

  async function deleteBranch(index) {
    const parent = chain.value[index - 1]
    const anchor = chain.value[index]
    const branch = liveDialog.value.msgRoute[index - 1]
    branch === liveDialog.value.msgTree[parent].length - 1 && switchChain(index - 1, branch - 1)
    await deleteMessageBranch(parent, anchor)
  }

  async function appendMessage(target, info: Partial<Message>, insert = false) {
    const id = genId()
    await db.transaction('rw', db.dialogs, db.messages, async () => {
      await db.messages.add({
        id,
        dialogId: propsId.value,
        workspaceId: liveDialog.value.workspaceId,
        ...info
      } as Message)
      const d = await db.dialogs.get(propsId.value)
      const children = d.msgTree[target]
      const changes = insert ? {
        [target]: [id],
        [id]: children
      } : {
        [target]: [...children, id],
        [id]: []
      }
      await db.dialogs.update(propsId.value, {
        msgTree: { ...d.msgTree, ...changes }
      })
    })
    return id
  }

  return {
    chain,
    normalizedRoute,
    historyChain,
    getChain,
    switchChain,
    setRoute,
    updateChain,
    expandMessageTree,
    deleteMessageBranch,
    deleteBranch,
    appendMessage,
  }
}
