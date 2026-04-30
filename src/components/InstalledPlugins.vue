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
          size="md"
          :avatar="resolveAvatar(plugin)"
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
      <q-item-section side important:pl-1>
        <div flex items-center no-wrap gap-1>
          <q-btn
            flat
            dense
            round
            icon="sym_o_refresh"
            :title="t('installedPlugins.refreshMcp')"
            v-if="plugin.type === 'mcp'"
            :loading="refreshing === plugin.id"
            @click.prevent.stop="refreshMcp(plugin)"
          />
          <q-btn
            flat
            dense
            round
            icon="sym_o_delete"
            :title="t('installedPlugins.uninstall')"
            v-if="plugin.type !== 'builtin'"
            @click.prevent.stop="deleteItem(plugin)"
          />
        </div>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import AAvatar from './AAvatar.vue'
import { usePluginsStore } from 'src/stores/plugins'
import PluginTypeBadge from 'src/components/PluginTypeBadge.vue'
import { useI18n } from 'vue-i18n'
import { Plugin } from 'src/utils/types'

const { t } = useI18n()

function fallbackAvatar(plugin: Plugin) {
  return { type: 'text' as const, text: plugin.title?.[0]?.toUpperCase() ?? '?', hue: 250 }
}

function resolveAvatar(plugin: Plugin) {
  const raw = data[plugin.id]?.avatar
  if (raw && typeof raw === 'object' && raw.type) return raw
  return fallbackAvatar(plugin)
}

const pluginsStore = usePluginsStore()
const { data } = pluginsStore

const $q = useQuasar()
const refreshing = ref<string | null>(null)

async function refreshMcp(plugin) {
  refreshing.value = plugin.id
  try {
    await pluginsStore.refreshMcpPlugin(plugin.id)
    $q.notify({ type: 'positive', message: t('installedPlugins.refreshSuccess') })
  } catch (e) {
    $q.notify({ type: 'negative', message: String(e) })
  } finally {
    refreshing.value = null
  }
}

function deleteItem(plugin) {
  $q.dialog({
    title: t('installedPlugins.uninstallPlugin'),
    message: t('installedPlugins.uninstallConfirm', { title: plugin.title }),
    cancel: true,
    ok: {
      label: t('installedPlugins.uninstall'),
      color: 'err',
      flat: true
    }
  }).onOk(() => {
    pluginsStore.uninstall(plugin.id)
  })
}
</script>
