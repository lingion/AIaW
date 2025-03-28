<template>
  <q-item>
    <q-item-section>
      {{ $t('payMethodItem.paymentMethod') }}
    </q-item-section>
    <q-item-section side>
      <q-btn-toggle
        v-model="model"
        toggle-color="primary"
        unelevated
        bg-sec-c
        text-on-sec-c
        :options="[
          { label: $t('payMethodItem.wxpay'), value: 'wxpay' },
          { label: $t('payMethodItem.stripe'), value: 'stripe' }
        ]"
      />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
const model = defineModel<'wxpay' | 'stripe'>()
</script>
