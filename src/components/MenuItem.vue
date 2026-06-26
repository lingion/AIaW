<template>
  <q-item
    clickable
    min-h-0
  >
    <q-item-section
      avatar
      min-w-0
    >
      <q-icon
        important:text="20px"
        :name="icon"
      />
    </q-item-section>
    <q-item-section>{{ label }}</q-item-section>
  </q-item>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
}>()
// Note: v-close-popup removed — we use manual overlay menu instead of q-dialog/q-menu.
// Parent components handle menu close in their own @click handlers (menuAction closes menuOpen).
</script>