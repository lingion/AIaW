export function getMessageRecord(messageMap, id) {
  if (!id) return undefined
  return messageMap[id]
}

export function collectExistingItems(ids, itemMap) {
  return ids
    .map(id => itemMap[id])
    .filter(Boolean)
}

export function collectChainMessageContents(historyChain, contextNum, messageMap) {
  const scopedIds = historyChain
    .slice(1)
    .slice(-(contextNum || 0))

  return scopedIds
    .map(id => getMessageRecord(messageMap, id))
    .filter(message => message && message.status !== 'inputing')
    .flatMap(message => message.contents || [])
}

export function collectExistingMessageContents(ids, messageMap) {
  return ids
    .map(id => getMessageRecord(messageMap, id))
    .filter(Boolean)
    .flatMap(message => message.contents || [])
}

export function collectConversationMessageContents(historyChain, chain, contextNum, messageMap) {
  const currentChainContents = collectChainMessageContents(chain, contextNum, messageMap)
  if (currentChainContents.length > 0) return currentChainContents
  return collectChainMessageContents(historyChain, contextNum, messageMap)
}

export function collectReferencedItemIds(ids, messageMap) {
  return collectExistingMessageContents(ids, messageMap)
    .flatMap(content => {
      if (content.type === 'user-message') return content.items || []
      if (content.type === 'assistant-tool') return content.result || []
      return []
    })
}

export function collectDialogContents(chain, messageMap) {
  return collectExistingMessageContents(chain.slice(1, -1), messageMap)
}
