<template>
  <q-list>
    <q-item
      v-for="plugin in pluginsStore.plugins.filter(p => p.available)"
      :key="plugin.id"
      clickable
      :to="`/plugins/${plugin.id}`"
      active-class="route-active"
      item-rd
    >
      <q-item-section avatar>
        <a-avatar
          v-if="data[plugin.id]"
          size="md"
          :avatar="data[plugin.id].avatar"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label>
          {{ plugin.title }}<plugin-type-badge
            :type="plugin.type"
            ml-2
            lh="1.2em"
          />
        </q-item-label>
      </q-item-section>
      <q-item-section
        side
        important:pl-1
      >
        <q-btn
          flat
          dense
          round
          icon="sym_o_delete"
          title="卸载"
          v-if="plugin.type !== 'builtin'"
          @click.prevent.stop="deleteItem(plugin)"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import AAvatar from './AAvatar.vue'
import { usePluginsStore } from 'src/stores/plugins'
import PluginTypeBadge from 'src/components/PluginTypeBadge.vue'

const pluginsStore = usePluginsStore()
const { data } = pluginsStore

const $q = useQuasar()

function deleteItem(plugin) {
  $q.dialog({
    title: '卸载插件',
    message: `确定要卸载插件「${plugin.title}」吗？`,
    cancel: true,
    ok: {
      label: '卸载',
      color: 'err',
      flat: true
    }
  }).onOk(() => {
    pluginsStore.uninstall(plugin.id)
  })
}
</script>
