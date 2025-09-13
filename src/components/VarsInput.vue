<template>
  <div>
    <q-item
      v-for="(_, key) in model"
      :key
    >
      <q-item-section avatar>
        {{ key }}
      </q-item-section>
      <q-item-section>
        <a-input
          v-model="model[key]"
          v-bind="inputProps"
        />
      </q-item-section>
      <q-item-section side>
        <q-btn
          flat
          round
          icon="sym_o_close"
          @click="delete model[key]"
        />
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <q-btn
          :label="labels?.addVariable ?? $t('varsInput.addVariable')"
          icon="sym_o_add"
          flat
          no-caps
          text-sec
          @click="add"
        />
      </q-item-section>
    </q-item>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { dialogOptions } from 'src/utils/values'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const model = defineModel<Record<string, string>>()

const props = defineProps<{
  inputProps: Record<string, any>
  labels?: {
    addVariable: string
    variableName: string
  }
}>()

const $q = useQuasar()

function add() {
  $q.dialog({
    title: props.labels?.addVariable ?? t('varsInput.addVariable'),
    prompt: {
      model: '',
      type: 'text',
      label: props.labels?.variableName ?? t('varsInput.variableName')
    },
    cancel: true,
    ...dialogOptions
  }).onOk(name => {
    model.value[name] = ''
  })
}
</script>
