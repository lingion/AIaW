<template>
  <q-dialog
    ref="dialogRef"
    v-model="open"
    @hide="onDialogHide"
    position="top"
  >
    <q-card
      mx-4
      important:bg-sur
      min-w="min(500px, 90vw)"
    >
      <div
        p-2
        flex
        gap-2
      >
        <a-input
          v-model="q"
          @keyup.enter="search"
          outlined
          dense
          clearable
          class="grow"
          autofocus
          :placeholder="$t('searchDialog.placeholder')"
        >
          <template #prepend>
            <q-icon name="sym_o_search" />
          </template>
        </a-input>
        <q-btn-toggle
          shrink-0
          unelevated
          toggle-color="pri-c"
          toggle-text-color="on-pri-c"
          v-model="global"
          no-caps
          :options="[{ label: $t('searchDialog.workspace'), value: false }, { label: $t('searchDialog.global'), value: true }]"
        />
      </div>
      <div
        v-if="results"
        max-h="80vh"
        overflow-y-auto
        pb-1
      >
        <q-list ref="listRef">
          <q-item v-if="!results.length">
            <q-item-section>
              <q-item-label text-on-sur-var>
                {{ $t('searchDialog.noResults') }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            v-for="(r, i) in results"
            :key="i"
            clickable
            item-rd
            :to="`/workspaces/${r.workspaceId}/dialogs/${r.dialogId}?goto=${JSON.stringify({ route: r.route, highlight: q })}`"
          >
            <q-item-section>
              <q-item-label>
                {{ r.title }}
              </q-item-label>
              <q-item-label
                caption
                v-if="r.preview"
              >
                {{ r.preview }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { QList, useDialogPluginComponent } from 'quasar'
import { db } from 'src/utils/db'
import { caselessIncludes, escapeRegex } from 'src/utils/functions'
import { Dialog } from 'src/utils/types'
import { nextTick, watch, ref, watchEffect } from 'vue'
import Mark from 'mark.js'

const props = defineProps<{
  workspaceId: string
}>()

defineEmits([
  ...useDialogPluginComponent.emits
])

const open = defineModel<boolean>({ required: true })

interface Doc {
  id: string
  dialogId: string
  content: string
}

const global = ref(false)
const dialogs = ref<Dialog[]>([])
const docs = ref<Doc[]>([])
const results = ref<Result[]>([])
watchEffect(async () => {
  try {
    dialogs.value = global.value
      ? await db.dialogs.toArray()
      : await db.dialogs.where('workspaceId').equals(props.workspaceId).toArray()
    const messages = global.value
      ? await db.messages.toArray()
      : dialogs.value.length
        ? await db.messages.where('dialogId').anyOf(dialogs.value.map(d => d.id)).toArray()
        : []
    docs.value = (messages || []).map(m => ({
      id: m.id,
      dialogId: m.dialogId,
      content: (Array.isArray(m.contents) ? m.contents : [])
        .filter(c => c && (c.type === 'assistant-message' || c.type === 'user-message'))
        .map(c => typeof c.text === 'string' ? c.text : '')
        .join('\n')
    }))
    search()
  } catch (error) {
    // Search is a sidebar utility and must never take down the whole SPA when
    // an older/malformed IndexedDB message is encountered.
    console.error('[SearchDialog] failed to load dialogs', error)
    dialogs.value = []
    docs.value = []
    results.value = []
  }
})

const q = ref('')
interface Result {
  workspaceId: string
  dialogId: string
  title: string
  route: number[]
  preview?: string
}
const listRef = ref<QList>()
function search() {
  if (!q.value || !docs.value || !dialogs.value) {
    results.value = []
    return
  }
  const hits = docs.value.filter(d => d && caselessIncludes(d.content || '', q.value)).slice(0, 100)
  unmark()
  results.value = [
    ...hits.map(h => {
      const dialog = dialogs.value.find(d => d.id === h.dialogId)
      return dialog && {
        workspaceId: dialog.workspaceId,
        dialogId: dialog.id,
        title: dialog.name || '',
        preview: h.content.match(new RegExp(`^.*${escapeRegex(q.value)}.*$`, 'im'))?.[0] || h.content.slice(0, 240),
        route: getRoute(dialog.msgTree, h.id) || []
      }
    }).filter(Boolean),
    ...dialogs.value.filter(d => caselessIncludes(d.name || '', q.value)).map(d => ({
      workspaceId: d.workspaceId,
      dialogId: d.id,
      title: d.name || '',
      route: []
    }))
  ].reverse()
  nextTick(() => {
    highlight()
  })
}

function unmark() {
  if (!listRef.value) return
  const mark = new Mark(listRef.value.$el)
  mark.unmark()
}

function highlight() {
  if (!q.value) return
  if (!listRef.value) return
  const mark = new Mark(listRef.value.$el)
  mark.mark(q.value)
}

watch(open, val => {
  val && results.value && nextTick(() => {
    highlight()
  })
})

function getRoute(tree: Record<string, string[]> | undefined, target: string, curr = '$root', seen = new Set<string>()): number[] | undefined {
  if (!tree || seen.has(curr)) return
  seen.add(curr)
  const children = Array.isArray(tree[curr]) ? tree[curr] : []
  for (const [i, v] of children.entries()) {
    if (v === target) return [i]
    const route = getRoute(tree, target, v, seen)
    if (route) return [i, ...route]
  }
}

const { dialogRef, onDialogHide } = useDialogPluginComponent()
</script>
