<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    :persistent="model !== value"
  >
    <q-card
      w="xs:90vw sm:80vw md:70vw lg:60vw xl:50vw"
      important:max-w-none
    >
      <q-card-section>
        <div class="text-h6">
          {{ props.title }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="value"
          max-h-60vh
          of-y-auto
          outlined
          autogrow
          :autofocus="$q.platform.is.desktop"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          color="primary"
          :label="$t('textareaDialog.cancel')"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          color="primary"
          :label="$t('textareaDialog.confirm')"
          @click="onDialogOK(value)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { ref } from 'vue'

const props = defineProps<{
  title: string
  model: string
}>()

defineEmits([
  ...useDialogPluginComponent.emits
])

const value = ref(props.model)

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
</script>
