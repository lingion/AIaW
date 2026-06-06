<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card min-w="320px">
      <q-card-section>
        <div class="text-h6">
          {{ $t('exportDataDialog.title') }}
        </div>
      </q-card-section>
      <q-card-section
        py-0
      >
        <div my-2>
          <q-checkbox
            v-model="removeUserMark"
            :label="$t('exportDataDialog.removeUserMark')"
          />
        </div>
        <div my-2>
          <q-checkbox
            v-model="excludeLargeBinary"
            label="轻量导出（跳过图片/附件二进制大字段，减少安卓崩溃）"
          />
        </div>
        <div v-if="loading" my-2>
          <q-linear-progress :value="progress" rounded />
          <div text-caption mt-1>
            {{ progressText }}
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          color="primary"
          :disable="loading"
          :label="$t('exportDataDialog.cancel')"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          color="primary"
          :loading="loading"
          :label="$t('exportDataDialog.export')"
          @click="exportData"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { exportDB } from 'dexie-export-import'
import { useDialogPluginComponent } from 'quasar'
import { db, schema } from 'src/utils/db'
import { exportFile } from 'src/utils/platform-api'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'src/composables/useToast'

const { t } = useI18n()

const removeUserMark = ref(false)
const excludeLargeBinary = ref(true)
const loading = ref(false)
const progress = ref(0)
const progressText = computed(() => `${Math.round(progress.value * 100)}%`)

defineEmits([
  ...useDialogPluginComponent.emits
])

const { toastError } = useToast()

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

function sanitizeValue(table, value) {
  let next = value
  if (removeUserMark.value) {
    next = { ...next, owner: 'unauthorized', realmId: 'unauthorized' }
  }
  if (excludeLargeBinary.value && table === 'avatarImages') {
    next = {
      ...next,
      contentBuffer: undefined
    }
  }
  if (excludeLargeBinary.value && table === 'items') {
    next = {
      ...next,
      contentBuffer: undefined
    }
  }
  return next
}

function exportData() {
  loading.value = true
  progress.value = 0
  const options = {
    filter: table => Object.keys(schema).includes(table),
    transform: (table, value) => ({ value: sanitizeValue(table, value) }),
    numRowsPerChunk: 100,
    progressCallback: p => {
      const byTables = p.totalTables ? p.completedTables / p.totalTables : 0
      const byRows = p.totalRows ? p.completedRows / p.totalRows : byTables
      progress.value = Math.max(byTables * 0.3, byRows)
      return true
    }
  }
  exportDB(db, options).then(async blob => {
    progress.value = 1
    await exportFile(excludeLargeBinary.value ? 'aiaw_user_db_light.json' : 'aiaw_user_db.json', blob)
    onDialogOK()
  }).catch(err => {
    console.error(err)
    toastError(t('exportDataDialog.exportFailed'))
  }).finally(() => {
    loading.value = false
  })
}

</script>
