<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card min-w="320px">
      <q-card-section>
        <div class="text-h6">
          {{ $t('importDataDialog.title') }}
        </div>
      </q-card-section>
      <q-card-section
        py-0
        px-2
      >
        <div px-2>
          <q-file
            v-model="file"
            :label="$t('importDataDialog.fileLabel')"
            dense
          />
        </div>
        <div px-2 class="text-caption q-mt-sm">
          支持完整导出包和轻量导出包。轻量导出包不会恢复图片/附件二进制内容，只恢复数据库主数据。
        </div>
        <div my-2>
          <q-checkbox
            v-model="options.overwrite"
            :label="$t('importDataDialog.overwrite')"
          /><br>
          <q-checkbox
            v-model="options.force"
            :label="$t('importDataDialog.force')"
          /><br>
          <q-checkbox
            color="err"
            v-model="options.clear"
            :label="$t('importDataDialog.clear')"
          />
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          color="primary"
          :label="$t('importDataDialog.cancel')"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          color="primary"
          :loading
          :disable="!file"
          @click="importData"
          :label="$t('importDataDialog.import')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { importInto } from 'dexie-export-import'
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { db } from 'src/utils/db'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const file = ref<File>(null)

const options = reactive({
  overwrite: true,
  force: false,
  clear: false
})

defineEmits([
  ...useDialogPluginComponent.emits
])

const $q = useQuasar()
const loading = ref(false)
function importData() {
  const { force, overwrite, clear } = options
  loading.value = true
  importInto(db, file.value, {
    acceptMissingTables: force,
    acceptVersionDiff: force,
    overwriteValues: overwrite,
    clearTablesBeforeImport: clear,
    progressCallback: () => true
  }).then(() => {
    $q.notify({
      message: t('importDataDialog.importSuccess'),
      color: 'positive'
    })
    onDialogOK()
  }).catch(e => {
    console.error(e)
    $q.notify({
      message: t('importDataDialog.importFailed', { message: e.message }),
      color: 'negative'
    })
  }).finally(() => {
    loading.value = false
  })
}

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
</script>
