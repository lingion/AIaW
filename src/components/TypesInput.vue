<template>
  <template v-if="type === 'string'">
    <q-select
      v-if="options"
      v-model="model"
      :options
      :label
      v-bind="inputProps"
      :class="$attrs.class"
    />
    <component
      :is="inputComponent"
      v-else-if="!inputProps?.type || inputProps.type !== 'password'"
      v-model="model"
      :label
      v-bind="inputProps"
      :class="$attrs.class"
    />
    <component
      :is="inputComponent"
      v-else
      v-model="model"
      :label
      @blur="saveSecretHistory"
      v-bind="{
        ...inputProps,
        type: 'text',
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        spellcheck: false,
        inputmode: 'text',
        inputStyle: showSecret ? undefined : { WebkitTextSecurity: 'disc' }
      }"
      :class="$attrs.class"
    >
      <template #append>
        <q-icon
          name="sym_o_history"
          class="cursor-pointer q-mr-sm"
        >
          <q-menu>
            <q-list style="min-width: 280px; max-width: 420px">
              <q-item v-if="!secretHistory.length">
                <q-item-section>
                  <q-item-label caption>暂无历史 Key</q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                v-for="item in secretHistory"
                :key="item.value"
                clickable
                v-close-popup
                @click="model = item.value"
                @mousedown="startLongPress(item)"
                @mouseup="cancelLongPress"
                @mouseleave="cancelLongPress"
                @touchstart="startLongPress(item)"
                @touchend="cancelLongPress"
                @touchcancel="cancelLongPress"
              >
                <q-item-section>
                  <q-item-label style="word-break: break-all">{{ item.note || maskSecret(item.value) }}</q-item-label>
                  <q-item-label caption>{{ maskSecret(item.value) }}</q-item-label>
                </q-item-section>
                <q-item-section side class="row no-wrap items-center gap-1">
                  <q-btn
                    flat
                    round
                    dense
                    icon="sym_o_edit"
                    @click.stop="editSecretNote(item)"
                  />
                  <q-btn
                    flat
                    round
                    dense
                    icon="sym_o_close"
                    @click.stop="removeSecretHistory(item.value)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-icon>
        <q-icon
          :name="showSecret ? 'sym_o_visibility_off' : 'sym_o_visibility'"
          class="cursor-pointer"
          @click="showSecret = !showSecret"
        />
      </template>
    </component>
  </template>
  <template v-else-if="type === 'array'">
    <q-select
      v-if="options"
      v-model="model"
      multiple
      :options
      :label
      v-bind="inputProps"
      :class="$attrs.class"
    />
    <q-select
      v-else
      v-model="model"
      use-input
      use-chips
      multiple
      hide-dropdown-icon
      input-debounce="0"
      new-value-mode="add"
      class="input-item"
      :label
      v-bind="inputProps"
      :class="$attrs.class"
    />
  </template>

  <component
    :is="inputComponent"
    v-else-if="type === 'number'"
    :model-value="model"
    @update:model-value="model = $event ? Number($event) : undefined"
    :label
    v-bind="inputProps"
    type="number"
    :class="$attrs.class"
  />
  <q-toggle
    v-else-if="type === 'boolean'"
    v-model="model"
    left-label
    :label
    :class="$attrs.class"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import LazyInput from './LazyInput.vue'
import { Dialog, QInput } from 'quasar'

interface SecretHistoryItem {
  value: string
  note?: string
  updatedAt?: number
}

const props = defineProps<{
  type: 'string' | 'array' | 'number' | 'boolean'
  options?: string[]
  label?: string
  inputProps?: Record<string, any>
  lazy?: boolean
  context?: {
    secretScope?: string
    secretField?: string
    secretLabelPrefix?: string
  }
}>()
const model = defineModel<any>()

if (props.type === 'array' && !model.value) {
  model.value = []
}

const inputComponent = computed(() => props.lazy ? LazyInput : QInput)
const showSecret = ref(false)
const secretHistory = ref<SecretHistoryItem[]>([])
const longPressTimer = ref<number | null>(null)

const secretHistoryKey = computed(() => {
  const scope = props.context?.secretScope || 'default'
  const field = props.context?.secretField || props.label || 'default'
  return `secret-history:${scope}:${field}`
})

function normalizeHistory(list: Array<string | SecretHistoryItem>): SecretHistoryItem[] {
  return list.map(item => typeof item === 'string' ? { value: item } : item).filter(item => item?.value)
}

function loadSecretHistory() {
  if (props.inputProps?.type !== 'password') return
  try {
    secretHistory.value = normalizeHistory(JSON.parse(localStorage.getItem(secretHistoryKey.value) || '[]'))
  } catch {
    secretHistory.value = []
  }
}

function persistSecretHistory() {
  try {
    localStorage.setItem(secretHistoryKey.value, JSON.stringify(secretHistory.value))
  } catch {}
}

function saveSecretHistory() {
  if (props.inputProps?.type !== 'password') return
  const val = typeof model.value === 'string' ? model.value.trim() : ''
  if (!val) return
  const existed = secretHistory.value.find(v => v.value === val)
  const next: SecretHistoryItem = {
    value: val,
    note: existed?.note,
    updatedAt: Date.now()
  }
  secretHistory.value = [next, ...secretHistory.value.filter(v => v.value !== val)].slice(0, 10)
  persistSecretHistory()
}

function removeSecretHistory(value: string) {
  secretHistory.value = secretHistory.value.filter(v => v.value !== value)
  persistSecretHistory()
}

function maskSecret(v: string) {
  if (showSecret.value) return v
  if (v.length <= 8) return '•'.repeat(v.length)
  return `${v.slice(0, 4)}${'•'.repeat(Math.max(4, v.length - 8))}${v.slice(-4)}`
}

function editSecretNote(item: SecretHistoryItem) {
  Dialog.create({
    title: '备注 Key',
    message: `${props.context?.secretLabelPrefix || props.label || 'Provider'} · ${maskSecret(item.value)}`,
    prompt: {
      model: item.note || '',
      type: 'text'
    },
    cancel: true,
    persistent: true
  }).onOk(note => {
    item.note = typeof note === 'string' ? note.trim() : ''
    secretHistory.value = [...secretHistory.value]
    persistSecretHistory()
  })
}

function startLongPress(item: SecretHistoryItem) {
  cancelLongPress()
  longPressTimer.value = window.setTimeout(() => {
    editSecretNote(item)
    longPressTimer.value = null
  }, 500)
}

function cancelLongPress() {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
}

watch(secretHistoryKey, loadSecretHistory, { immediate: true })
</script>
