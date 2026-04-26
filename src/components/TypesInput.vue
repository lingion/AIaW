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
          v-if="secretHistory.length"
        >
          <q-menu>
            <q-list style="min-width: 260px; max-width: 360px">
              <q-item
                v-for="item in secretHistory"
                :key="item"
                clickable
                v-close-popup
                @click="model = item"
              >
                <q-item-section style="word-break: break-all">{{ maskSecret(item) }}</q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    dense
                    icon="sym_o_close"
                    @click.stop="removeSecretHistory(item)"
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
import { QInput } from 'quasar'

const props = defineProps<{
  type: 'string' | 'array' | 'number' | 'boolean'
  options?: string[]
  label?: string
  inputProps?: Record<string, any>
  lazy?: boolean
}>()
const model = defineModel<any>()

if (props.type === 'array' && !model.value) {
  model.value = []
}

const inputComponent = computed(() => props.lazy ? LazyInput : QInput)
const showSecret = ref(false)
const secretHistory = ref<string[]>([])

const secretHistoryKey = computed(() => `secret-history:${props.label || 'default'}`)

function loadSecretHistory() {
  if (props.inputProps?.type !== 'password') return
  try {
    secretHistory.value = JSON.parse(localStorage.getItem(secretHistoryKey.value) || '[]')
  } catch {
    secretHistory.value = []
  }
}

function saveSecretHistory() {
  if (props.inputProps?.type !== 'password') return
  const val = typeof model.value === 'string' ? model.value.trim() : ''
  if (!val) return
  const next = [val, ...secretHistory.value.filter(v => v !== val)].slice(0, 10)
  secretHistory.value = next
  try {
    localStorage.setItem(secretHistoryKey.value, JSON.stringify(next))
  } catch {}
}

function removeSecretHistory(item: string) {
  secretHistory.value = secretHistory.value.filter(v => v !== item)
  try {
    localStorage.setItem(secretHistoryKey.value, JSON.stringify(secretHistory.value))
  } catch {}
}

function maskSecret(v: string) {
  if (showSecret.value) return v
  if (v.length <= 8) return '•'.repeat(v.length)
  return `${v.slice(0, 4)}${'•'.repeat(Math.max(4, v.length - 8))}${v.slice(-4)}`
}

watch(secretHistoryKey, loadSecretHistory, { immediate: true })
</script>
