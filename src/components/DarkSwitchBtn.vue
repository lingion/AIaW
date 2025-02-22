<template>
  <q-btn
    flat
    dense
    round
    :icon="curr.icon"
    :title="curr.title"
    @click="switchDark"
  />
</template>

<script setup lang="ts">
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { perfs } = useUserPerfsStore()

const options = new Map()
options.set('auto', { title: t('darkSwitchBtn.switchToDark'), icon: 'sym_o_dark_mode', next: true })
options.set(true, { title: t('darkSwitchBtn.switchToLight'), icon: 'sym_o_light_mode', next: false })
options.set(false, { title: t('darkSwitchBtn.switchToAuto'), icon: 'sym_o_brightness_auto', next: 'auto' })

const curr = computed(() => options.get(perfs.darkMode))

function switchDark() {
  perfs.darkMode = curr.value.next
}
</script>
