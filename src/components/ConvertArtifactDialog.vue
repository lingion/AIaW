<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card min-w="320px">
      <q-card-section>
        <div class="text-h6">
          {{ $t('convertArtifactDialog.title') }}
        </div>
      </q-card-section>
      <q-card-section
        py-0
        px-2
      >
        <div
          flex
          px-2
        >
          <q-input
            v-model="options.name"
            :label="$t('convertArtifactDialog.name')"
            dense
            class="grow"
            @keyup.enter="onDialogOK(options)"
            autofocus
          />
          <q-input
            v-model="options.lang"
            :label="$t('convertArtifactDialog.lang')"
            dense
            class="w-100px ml-2"
            @keyup.enter="onDialogOK(options)"
          />
        </div>
        <div my-2>
          <q-checkbox
            v-model="options.reserveOriginal"
            :label="$t('convertArtifactDialog.reserveOriginal')"
          />
        </div>
      </q-card-section>
      <q-card-actions>
        <q-btn
          flat
          color="primary"
          :label="$t('convertArtifactDialog.cancel')"
          @click="onDialogCancel"
        />
        <q-space />
        <q-btn
          flat
          color="primary"
          :label="$t('convertArtifactDialog.autoName')"
          @click="onDialogOK({ ...options, name: null })"
        />
        <q-btn
          flat
          color="primary"
          :label="$t('convertArtifactDialog.ok')"
          @click="onDialogOK(options)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { ConvertArtifactOptions } from 'src/utils/types'
import { ref } from 'vue'

const props = defineProps<{
  lang: string
}>()

const { perfs } = useUserPerfsStore()
const options = ref<ConvertArtifactOptions>({
  lang: props.lang,
  reserveOriginal: perfs.artifactsReserveOriginal
})

defineEmits([
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent<ConvertArtifactOptions>()
</script>
