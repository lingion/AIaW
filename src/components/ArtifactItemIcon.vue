<template>
  <q-icon :name="icon" />
</template>

<script setup lang="ts">
import { Artifact } from 'src/utils/types'
import { codeExtensions } from 'src/utils/values'
import { computed } from 'vue'

const props = defineProps<{
  artifact: Artifact
}>()

const icon = computed(() =>
  codeExtensions.includes(props.artifact.name.split('.').pop()) ? 'sym_o_code' : 'sym_o_description'
)
</script>
