<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card min-w="300px">
      <q-card-section>
        <div class="text-h6">
          {{ message.type === 'user' ? '用户消息信息' : '助手消息信息' }}
        </div>
      </q-card-section>
      <q-card-section p-0>
        <q-list>
          <q-item>
            <q-item-section>
              ID
            </q-item-section>
            <q-item-section side>
              {{ message.id }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              创建时间
            </q-item-section>
            <q-item-section side>
              {{ createdAt }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              文本长度
            </q-item-section>
            <q-item-section side>
              {{ length }}
            </q-item-section>
          </q-item>
          <q-item v-if="message.modelName">
            <q-item-section>
              模型
            </q-item-section>
            <q-item-section side>
              {{ message.modelName }}
            </q-item-section>
          </q-item>
          <q-item v-if="message.usage">
            <q-item-section>
              Token 开销
            </q-item-section>
            <q-item-section side>
              提示：{{ message.usage.promptTokens }} ，补全：{{ message.usage.completionTokens }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          color="primary"
          label="确定"
          @click="onDialogOK"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { idDateString } from 'src/utils/functions'
import { Message } from 'src/utils/types'
import { computed } from 'vue'

const props = defineProps<{
  message: Message
}>()

const length = computed(() => props.message.contents.filter(
  c => c.type === 'assistant-message' || c.type === 'user-message'
).reduce((prev, cur) => prev + cur.text.length, 0))
const createdAt = computed(() => idDateString(props.message.id))

defineEmits([
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent()

</script>
