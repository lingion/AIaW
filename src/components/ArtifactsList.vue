<template>
  <q-list>
    <div p="x-4 y-2">
      <q-input
        dense
        outlined
        v-model="filter"
        clearable
        :placeholder="$t('artifactsList.searchPlaceholder')"
      />
    </div>
    <q-item
      v-for="artifact in filteredArtifacts"
      :key="artifact.id"
      clickable
      @click="$route.query.artifactId !== artifact.id && $router.push({ query: { openArtifact: artifact.id } })"
      :class="{ 'route-active': artifact.open }"
      item-rd
      min-h="32px"
      py-1
      px-3
    >
      <q-item-section
        avatar
        min-w-0
        pr-2
      >
        <artifact-item-icon
          size="16px"
          :artifact
        />
      </q-item-section>
      <q-item-section>
        {{ artifact.name }}
      </q-item-section>
      <q-item-section side>
        <q-btn
          v-if="artifact.open"
          flat
          dense
          round
          icon="sym_o_close"
          :title="$t('artifactsList.close')"
          size="sm"
          @click.prevent.stop="closeArtifact(artifact)"
        />
      </q-item-section>
      <artifact-item-menu :artifact />
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { caselessIncludes } from 'src/utils/functions'
import { Artifact } from 'src/utils/types'
import { computed, inject, ref, Ref } from 'vue'
import { useCloseArtifact } from 'src/composables/close-artifact'
import ArtifactItemMenu from './ArtifactItemMenu.vue'
import ArtifactItemIcon from './ArtifactItemIcon.vue'

const artifacts: Ref<Artifact[]> = inject('artifacts')
const filter = ref(null)
const filteredArtifacts = computed(() => {
  return artifacts.value.filter(d => !filter.value || caselessIncludes(d.name, filter.value)).reverse()
})

const { closeArtifact } = useCloseArtifact()
</script>
