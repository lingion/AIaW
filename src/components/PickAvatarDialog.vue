<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card
      flex
      :class="{ 'flex-col': $q.screen.lt.sm }"
    >
      <div>
        <q-tabs
          v-model="tab"
          dense
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab
            name="ai"
            :label="$t('pickAvatarDialog.ai')"
          />
          <q-tab
            name="icon"
            :label="$t('pickAvatarDialog.icon')"
          />
          <q-tab
            name="text"
            :label="$t('pickAvatarDialog.text')"
          />
          <q-tab
            name="image"
            :label="$t('pickAvatarDialog.image')"
          />
        </q-tabs>

        <q-separator />

        <q-tab-panels
          v-model="tab"
          animated
        >
          <q-tab-panel name="ai">
            <avatar-panel
              :title="$t('pickAvatarDialog.aiCompany')"
              :items="presetAvatars.monoSvgs"
              @select="select($event, true)"
              :selected
            />
            <avatar-panel
              mt-2
              :title="$t('pickAvatarDialog.color')"
              :items="presetAvatars.colorSvgs"
              @select="select($event, false)"
              :selected
            />
            <avatar-panel
              mt-2
              :title="$t('pickAvatarDialog.aiCompanyQuestion')"
              :items="presetAvatars.definitelyAIs"
              @select="select($event, $event.type === 'svg')"
              :selected
            />
          </q-tab-panel>

          <q-tab-panel
            name="icon"
            max-h="400px"
            of-y-auto
          >
            <avatar-panel
              :items="presetAvatars.icons"
              @select="select($event, true)"
              :selected
            />
          </q-tab-panel>

          <q-tab-panel name="text">
            <q-input
              :label="$t('pickAvatarDialog.textLabel')"
              :model-value="selected.type === 'text' ? selected.text : null"
              @update:model-value="setText($event as string)"
              class="mb-2"
              :hint="$t('pickAvatarDialog.textHint')"
            />
          </q-tab-panel>

          <q-tab-panel name="image">
            <image-input-area @input="onImageInput" />
          </q-tab-panel>
        </q-tab-panels>
      </div>
      <q-separator :vertical="!$q.screen.lt.sm" />
      <div flex="~ col">
        <q-list
          min-w="220px"
          mt-2
        >
          <q-item>
            <q-item-section>{{ $t('pickAvatarDialog.preview') }}</q-item-section>
            <q-item-section
              side
              text-on-sur
            >
              <a-avatar
                :avatar="selected"
                size="48px"
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>{{ $t('pickAvatarDialog.showBackground') }}</q-item-section>
            <q-item-section side>
              <q-toggle
                :model-value="typeof selected.hue === 'number'"
                @update:model-value="toggleHue"
              />
            </q-item-section>
          </q-item>
          <q-item v-if="typeof selected.hue === 'number'">
            <q-item-section avatar>
              {{ $t('pickAvatarDialog.backgroundColor') }}
            </q-item-section>
            <q-item-section>
              <hue-slider v-model="selected.hue" />
            </q-item-section>
          </q-item>
        </q-list>
        <q-space />
        <div
          flex
          mt-2
          p-2
        >
          <q-space />
          <q-btn
            :label="$t('pickAvatarDialog.cancel')"
            @click="onDialogCancel"
            flat
            bg-sec-c
            text-on-sec-c
          />
          <q-btn
            :label="$t('pickAvatarDialog.confirm')"
            @click="onDialogOK(selected)"
            flat
            bg-pri
            text-on-pri
            ml-2
          />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { Avatar } from 'src/utils/types'
import { ref, watch } from 'vue'
import AvatarPanel from './AvatarPanel.vue'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import AAvatar from './AAvatar.vue'
import HueSlider from './HueSlider.vue'
import ImageInputArea from './ImageInputArea.vue'
import { genId } from 'src/utils/functions'
import { cropSquareBlob } from 'src/utils/image-process'
import { db } from 'src/utils/db'
import { materialSymbols } from 'src/utils/values'

const props = defineProps<{
  defaultTab: string,
  model: Avatar
}>()

defineEmits([
  ...useDialogPluginComponent.emits
])

const tab = ref(props.defaultTab)

const { perfs } = useUserPerfsStore()
const selected = ref<Avatar>({ ...props.model })
function select(avatar: Avatar, addColor: boolean = false) {
  if (addColor) {
    selected.value = { ...avatar, hue: perfs.themeHue }
  } else {
    selected.value = avatar
  }
}

const presetAvatars = {
  monoSvgs: [
    { type: 'svg', name: 'openai' },
    { type: 'svg', name: 'claude' },
    { type: 'svg', name: 'gemini' },
    { type: 'svg', name: 'qwen' },
    { type: 'svg', name: 'grok' },
    { type: 'svg', name: 'gemma' },
    { type: 'svg', name: 'meta' },
    { type: 'svg', name: 'mistral' },
    { type: 'svg', name: 'deepseek' },
    { type: 'svg', name: 'anthropic' },
    { type: 'svg', name: 'google' },
    { type: 'svg', name: 'alibaba' },
    { type: 'svg', name: 'huggingface' },
    { type: 'svg', name: 'aiaw' }
  ] as Avatar[],
  colorSvgs: [
    { type: 'svg', name: 'claude-c' },
    { type: 'svg', name: 'gemini-c' },
    { type: 'svg', name: 'qwen-c' },
    { type: 'svg', name: 'gemma-c' },
    { type: 'svg', name: 'meta-c' },
    { type: 'svg', name: 'mistral-c' },
    { type: 'svg', name: 'deepseek-c' },
    { type: 'svg', name: 'google-c' },
    { type: 'svg', name: 'alibaba-c' },
    { type: 'svg', name: 'huggingface-c' },
    { type: 'svg', name: 'microsoft-c' },
    { type: 'svg', name: 'togetherai-c' },
    { type: 'svg', name: 'cohere-c' }
  ] as Avatar[],
  definitelyAIs: [
    { type: 'url', url: '/ai-avatars/alice.webp', title: 'AL-1S' },
    { type: 'url', url: '/ai-avatars/arona.webp', title: 'Arona' },
    { type: 'url', url: '/ai-avatars/ptilopsis.webp', title: '白面鸮' },
    { type: 'url', url: '/ai-avatars/atri.webp', title: 'ATRI' },
    { type: 'url', url: '/ai-avatars/glados.webp', title: 'GLaDOS' },
    { type: 'url', url: '/ai-avatars/neuro.webp', title: 'Neuro' },
    { type: 'url', url: '/ai-avatars/evil.webp', title: 'Evil' },
    { type: 'url', url: '/ai-avatars/win11.webp', title: 'Win11' },
    { type: 'url', url: '/ai-avatars/delamain.webp', title: 'Delamain' },
    { type: 'svg', name: 'aperture', title: 'Aperture' },
    { type: 'url', url: '/ai-avatars/cyberlife.png', title: 'CyberLife' },
    { type: 'url', url: '/ai-avatars/android.webp', title: 'Android' },
    { type: 'url', url: '/ai-avatars/detroit.webp', title: 'Detroit' },
    { type: 'url', url: '/ai-avatars/33.avif', title: '33' }
  ] as Avatar[],
  icons: materialSymbols.map(icon => ({ type: 'icon', icon: `sym_o_${icon}`, title: icon })) as Avatar[]
}

function toggleHue(value: boolean) {
  selected.value.hue = value ? perfs.themeHue : undefined
}
function setText(text: string) {
  selected.value = { type: 'text', text, hue: perfs.themeHue }
}
async function onImageInput(file: File) {
  const blob = await cropSquareBlob(file, 96)
  const id = genId()
  await db.avatarImages.add({ id, contentBuffer: await blob.arrayBuffer(), mimeType: file.type })
  selected.value = { type: 'image', imageId: id }
}
watch(selected, (to, from) => {
  if (from.type === 'image') {
    db.avatarImages.delete(from.imageId)
  }
})

const { dialogRef, onDialogCancel, onDialogHide, onDialogOK } = useDialogPluginComponent()
</script>
