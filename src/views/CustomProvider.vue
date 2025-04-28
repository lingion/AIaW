<template>
  <view-common-header
    @toggle-drawer="$emit('toggle-drawer')"
    back-to="."
  >
    <q-toolbar-title>
      {{ $t('customProvider.title') }}
    </q-toolbar-title>
  </view-common-header>
  <q-page-container v-if="provider">
    <q-page :style-fn="pageFhStyle">
      <q-list
        py-2
        max-w="1000px"
        mx-a
      >
        <q-item>
          <q-item-section>{{ $t('customProvider.name') }}</q-item-section>
          <q-item-section side>
            <a-input
              class="w-150px"
              filled
              dense
              v-model="provider.name"
            />
          </q-item-section>
        </q-item>
        <q-item
          clickable
          @click="pickAvatar"
        >
          <q-item-section>{{ $t('customProvider.icon') }}</q-item-section>
          <q-item-section
            side
            text-on-sur
          >
            <a-avatar :avatar="provider.avatar" />
          </q-item-section>
        </q-item>
        <provider-input-items
          v-model="provider.fallbackProvider"
          :label="$t('customProvider.fallbackProvider')"
          :caption="$t('customProvider.fallbackProviderCaption')"
        />
        <q-separator spaced />
        <q-item-label header>
          {{ $t('customProvider.subproviders') }}
        </q-item-label>
        <template
          v-for="(subprovider, index) in provider.subproviders"
          :key="subprovider.id"
        >
          <subprovider-input v-model="provider.subproviders[index]" />
          <q-item>
            <q-item-section>
              <q-btn
                :label="$t('customProvider.removeSubprovider')"
                icon="sym_o_close"
                flat
                text-on-sur-var
                hover:text-err
                @click="provider.subproviders.splice(index, 1)"
              />
            </q-item-section>
          </q-item>
          <q-separator
            spaced
            inset
          />
        </template>
        <q-item>
          <q-item-section>
            <q-btn
              :label="$t('customProvider.addSubprovider')"
              icon="sym_o_add"
              flat
              w-full
              text-sec
              @click="addSubprovider"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-page>
  </q-page-container>
  <error-not-found v-else />
</template>

<script setup lang="ts">
import { computed, toRaw } from 'vue'
import { useProvidersStore } from 'src/stores/providers'
import ViewCommonHeader from 'src/components/ViewCommonHeader.vue'
import AAvatar from 'src/components/AAvatar.vue'
import { useQuasar } from 'quasar'
import PickAvatarDialog from 'src/components/PickAvatarDialog.vue'
import ErrorNotFound from 'src/pages/ErrorNotFound.vue'
import { useSetTitle } from 'src/composables/set-title'
import { useI18n } from 'vue-i18n'
import { CustomProvider } from 'src/utils/types'
import ProviderInputItems from 'src/components/ProviderInputItems.vue'
import SubproviderInput from 'src/components/SubproviderInput.vue'
import { syncRef } from 'src/composables/sync-ref'
import { genId, pageFhStyle } from 'src/utils/functions'

const props = defineProps<{
  id: string
}>()

defineEmits(['toggle-drawer'])

const store = useProvidersStore()

const provider = syncRef<CustomProvider>(
  () => store.providers.find(a => a.id === props.id),
  val => { store.put(toRaw(val)) },
  { valueDeep: true }
)

function addSubprovider() {
  provider.value.subproviders.push({
    id: genId(),
    provider: null,
    modelMap: {}
  })
}

const $q = useQuasar()
function pickAvatar() {
  $q.dialog({
    component: PickAvatarDialog,
    componentProps: {
      model: provider.value.avatar,
      defaultTab: 'icon'
    }
  }).onOk(avatar => {
    provider.value.avatar = avatar
  })
}
const { t } = useI18n()
useSetTitle(computed(() => provider.value && `${t('customProvider.title')} - ${provider.value.name}`))
</script>
