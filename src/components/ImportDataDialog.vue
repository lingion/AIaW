<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card min-w="320px">
      <q-card-section>
        <div class="text-h6">
          导入用户数据
        </div>
      </q-card-section>
      <q-card-section
        py-0
        px-2
      >
        <div px-2>
          <q-file
            v-model="file"
            label="数据文件"
            dense
          />
        </div>
        <div my-2>
          <q-checkbox
            v-model="options.overwrite"
            label="覆盖已有数据"
          /><br>
          <q-checkbox
            v-model="options.force"
            label="强制写入"
          /><br>
          <q-checkbox
            color="err"
            v-model="options.clear"
            label="导入前清空现有数据"
          />
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          color="primary"
          label="取消"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          color="primary"
          label="导入"
          :loading
          :disable="!file"
          @click="importData"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { importInto } from 'dexie-export-import'
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { db } from 'src/utils/db'
import { ConvertArtifactOptions } from 'src/utils/types'
import { reactive, ref } from 'vue'

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
    clearTablesBeforeImport: clear
  }).then(() => {
    $q.notify({
      message: '导入成功',
      color: 'positive'
    })
    onDialogOK()
  }).catch(e => {
    console.error(e)
    $q.notify({
      message: `导入失败：${e.message}`,
      color: 'negative'
    })
  }).finally(() => {
    loading.value = false
  })
}

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent<ConvertArtifactOptions>()
</script>
