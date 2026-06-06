<template>
  <q-btn
    :icon="icon"
    @click="copy"
    :title="$t('copyBtn.title')"
    flat
    round
    dense
  />
</template>
<script setup>
import { copyToClipboard } from 'quasar'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'src/composables/useToast'

const { t } = useI18n()
const { toastError } = useToast()

const props = defineProps({
  value: {
    type: String,
    required: true
  }
})

const icon = ref('sym_o_content_copy')

function copy() {
  copyToClipboard(props.value).then(() => {
    icon.value = 'sym_o_check'
    setTimeout(() => {
      icon.value = 'sym_o_content_copy'
    }, 2000)
  }).catch(() => {
    toastError(t('copyBtn.copyFailed'))
  })
}
</script>
