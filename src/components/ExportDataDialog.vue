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
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          color="primary"
          :label="$t('exportDataDialog.cancel')"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          color="primary"
          :label="$t('exportDataDialog.export')"
          @click="exportData"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { exportDB } from 'dexie-export-import'
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { db, schema } from 'src/utils/db'
import { exportFile } from 'src/utils/platform-api'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const removeUserMark = ref(false)

defineEmits([
  ...useDialogPluginComponent.emits
])

const $q = useQuasar()

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

function exportData() {
  const options = removeUserMark.value ? {
    filter: table => Object.keys(schema).includes(table),
    transform: (table, value) => ({ value: { ...value, owner: 'unauthorized', realmId: 'unauthorized' } })
  } : {}
  exportDB(db, options).then(async blob => {
    await exportFile('aiaw_user_db.json', blob)
    onDialogOK()
  }).catch(err => {
    console.error(err)
    $q.notify({
      message: t('exportDataDialog.exportFailed'),
      color: 'negative'
    })
  })
}

</script>
