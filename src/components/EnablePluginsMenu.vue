<template>
  <q-menu
    content-style="max-height: 60vh; width: min(92vw, 360px);"
  >
    <div style="max-height: 60vh; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch;">
      <q-list>
        <enable-plugins-items
          :assistant-id
          dense
        />
        <q-item
          clickable
          :to="`../assistants/${assistantId}#plugins`"
          min-h="40px"
          py-0
        >
          <q-item-section
            avatar
            min-w-0
          >
            <q-avatar
              icon="sym_o_more_vert"
              size="32px"
              font-size="0.6em"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ $t('enablePluginsMenu.moreInfo') }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-menu>
</template>

<script setup lang="ts">
import EnablePluginsItems from './EnablePluginsItems.vue'

defineProps<{
  assistantId: string
}>()

</script>
