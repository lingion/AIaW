import test from 'node:test'
import assert from 'node:assert/strict'

const helperModulePath = 'file:///Users/lingion/AIaW/src/utils/dialog-message-map.js'

async function loadHelpers() {
  return import(helperModulePath)
}

test('collectConversationMessageContents falls back to current chain for a brand new dialog', async () => {
  const { collectConversationMessageContents } = await loadHelpers()

  const messageMap = {
    user1: {
      id: 'user1',
      status: 'default',
      contents: [{ type: 'user-message', text: 'first question', items: [] }]
    },
    draft1: {
      id: 'draft1',
      status: 'inputing',
      contents: [{ type: 'user-message', text: '', items: [] }]
    }
  }

  assert.deepEqual(
    collectConversationMessageContents([], ['$root', 'user1', 'draft1'], 10, messageMap),
    [
      { type: 'user-message', text: 'first question', items: [] }
    ]
  )
})

test('collectConversationMessageContents prefers history chain during branch transitions', async () => {
  const { collectConversationMessageContents } = await loadHelpers()

  const messageMap = {
    user1: {
      id: 'user1',
      status: 'default',
      contents: [{ type: 'user-message', text: 'branch question', items: [] }]
    },
    draft1: {
      id: 'draft1',
      status: 'inputing',
      contents: [{ type: 'user-message', text: '', items: [] }]
    }
  }

  assert.deepEqual(
    collectConversationMessageContents(['$root', 'user1'], ['$root', 'draft1'], 10, messageMap),
    [
      { type: 'user-message', text: 'branch question', items: [] }
    ]
  )
})

test('collectConversationMessageContents ignores stale history chain after normal sends continue on current chain', async () => {
  const { collectConversationMessageContents } = await loadHelpers()

  const messageMap = {
    user1: {
      id: 'user1',
      status: 'default',
      contents: [{ type: 'user-message', text: 'first question', items: [] }]
    },
    assistant1: {
      id: 'assistant1',
      status: 'default',
      contents: [{ type: 'assistant-message', text: 'first answer' }]
    },
    user2: {
      id: 'user2',
      status: 'default',
      contents: [{ type: 'user-message', text: '587883', items: [] }]
    },
    draft2: {
      id: 'draft2',
      status: 'inputing',
      contents: [{ type: 'user-message', text: '', items: [] }]
    }
  }

  assert.deepEqual(
    collectConversationMessageContents(
      ['$root', 'user1'],
      ['$root', 'user1', 'assistant1', 'user2', 'draft2'],
      10,
      messageMap
    ),
    [
      { type: 'user-message', text: 'first question', items: [] },
      { type: 'assistant-message', text: 'first answer' },
      { type: 'user-message', text: '587883', items: [] }
    ]
  )
})

test('collectDialogContents skips missing messages inside the visible chain', async () => {
  const { collectDialogContents } = await loadHelpers()

  const messageMap = {
    user1: {
      id: 'user1',
      status: 'default',
      contents: [{ type: 'user-message', text: 'hi', items: [] }]
    },
    assistant1: {
      id: 'assistant1',
      status: 'default',
      contents: [{ type: 'assistant-message', text: 'hello' }]
    }
  }

  assert.deepEqual(
    collectDialogContents(['$root', 'user1', 'missing1', 'assistant1', 'input1'], messageMap),
    [
      { type: 'user-message', text: 'hi', items: [] },
      { type: 'assistant-message', text: 'hello' }
    ]
  )
})

test('collectReferencedItemIds skips missing messages', async () => {
  const { collectReferencedItemIds } = await loadHelpers()

  const messageMap = {
    user1: {
      id: 'user1',
      status: 'default',
      contents: [{ type: 'user-message', text: 'hi', items: ['item-a', 'item-b'] }]
    },
    tool1: {
      id: 'tool1',
      status: 'default',
      contents: [{ type: 'assistant-tool', status: 'completed', result: ['item-c'] }]
    }
  }

  assert.deepEqual(
    collectReferencedItemIds(['user1', 'missing1', 'tool1'], messageMap),
    ['item-a', 'item-b', 'item-c']
  )
})
