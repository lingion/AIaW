<template>
  <q-header
    bg-sur-c-low
    text-on-sur
  >
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        icon="sym_o_menu"
        @click="uiStateStore.mainDrawerOpen = !uiStateStore.mainDrawerOpen"
      />
      <q-toolbar-title>
        模型价格
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page-container>
    <q-page
      p-4
      v-if="modelInfo"
      max-w="1000px"
      mx-a
    >
      <div>
        <div
          text-lg
          mt-4
        >
          模型性能
        </div>
        <div
          mt-2
          lh-1.8em
        >
          <p>
            以 gpt-4o 作为性能基准，与之相比，claude-3-5-sonnet 在代码方面更强，o1 系列特别擅长逻辑推理，gemini-1.5-pro 则是更便宜的替代选项。<br>
            gpt-4o-mini 和 gemini-1.5-flash 是低价模型的不错选择，比上述模型价格低了一个数量级，适合用于简单问题和需要大量输出的场景。<br>
          </p>
          <p>
            国产模型的第一梯队是通义千问（qwen）和 deepseek，deepseek v3（即目前的 deepseek-chat）是第一个真正达到 gpt-4o 级别的国产模型，性价比很高；其他国产模型（文心一言、豆包、kimi等）则还要排在后面。模型排行榜可参考 <a
              pri-link
              href="https://livebench.ai/#/"
              target="_blank"
            >LiveBench</a>。
          </p>
          <p>
            此外，还有几个免费模型（下方价格为 0 的），它们主要是实验模型。免费模型不保证可用性。
          </p>
        </div>
        <div
          text="on-sur-var xs"
          mt-2
        >
          * 以上观点仅供参考，模型效果以实际使用为准
        </div>
      </div>
      <div>
        <div
          text-lg
          mt-4
        >
          用量计算器
        </div>

        <div mt-2>
          所有模型以各服务商官方API价格扣费，按USD/CNY=7汇率计算。
        </div>
        <div
          flex
          gap-2
          mt-2
        >
          <q-input
            v-model="usage.budget"
            @update:model-value="calc('budget')"
            label="使用额度（元）"
            filled
            class="flex-1"
          />
          <q-select
            v-model="usage.model"
            :options="modelInfo.map(x => x.model_name)"
            label="模型"
            @update:model-value="calc('budget')"
            filled
            class="flex-1"
          >
            <template #option="{ opt, itemProps, selected }">
              <model-item
                :model="opt"
                :selected="selected"
                v-bind="itemProps"
              />
            </template>
          </q-select>
          <q-input
            v-model="usage.output"
            @update:model-value="calc('output')"
            filled
            label="输出字数"
            class="flex-1"
          />
        </div>
        <div
          mt-2
          text="on-sur-var xs"
        >
          * 按每Token输出1.4个汉字（新GPT模型）或1个汉字（其他模型）或1.8个汉字（国产模型）计算。实际比率有波动，平均而言略大于此值，但还需考虑输入开销
        </div>
      </div>
      <div mt-4>
        <div
          text-lg
          my-2
        >
          可用模型
        </div>
        <q-table
          flat
          card-class="bg-sur"
          hide-bottom
          :columns="modelPricingColumns"
          :rows="modelPrices"
          :pagination="{ rowsPerPage: Infinity }"
          row-key="name"
        />
        <div flex>
          <div m-2>
            <q-btn-toggle
              v-model="unit.cny"
              toggle-color="primary"
              unelevated
              :options="[
                {label: '￥', value: true},
                {label: '$', value: false}
              ]"
              bg-sur-c
            />
          </div>
          <div m-2>
            <q-btn-toggle
              v-model="unit.mTokens"
              toggle-color="primary"
              unelevated
              :options="[
                {label: 'K Tokens', value: false},
                {label: 'M Tokens', value: true}
              ]"
              no-caps
              bg-sur-c
            />
          </div>
        </div>
      </div>
    </q-page>
    <q-page v-else>
      <q-inner-loading
        showing
      />
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useUiStateStore } from 'src/stores/ui-state'
import { useObservable } from '@vueuse/rxjs'
import { db } from 'src/utils/db'
import { useQuasar } from 'quasar'
import { LitellmBaseURL, UsdToCnyRate } from 'src/utils/config'
import { useRouter } from 'vue-router'
import ModelItem from 'src/components/ModelItem.vue'

const user = useObservable(db.cloud.currentUser)
const router = useRouter()
db.on('ready', () => {
  if (!user.value.isLoggedIn) {
    router.replace('/')
    db.cloud.login()
  } else {
    loadModels()
  }
})
const uiStateStore = useUiStateStore()

const unit = reactive({
  cny: true,
  mTokens: false
})

const usage = reactive({
  budget: 1,
  model: 'gpt-4o',
  output: null
})
function calc(accord: 'budget' | 'output') {
  if (accord === 'budget') {
    usage.output = Math.round(usage.budget / UsdToCnyRate / costPerWord(usage.model))
  } else {
    usage.budget = usage.output * UsdToCnyRate * costPerWord(usage.model)
  }
}
function costPerWord(model: string) {
  const x = modelInfo.value.find(x => x.model_name === model)
  return x.output_cost_per_token / (model.startsWith('gpt-4') ? 1.4 : model.startsWith('deepseek') ? 1.8 : 1)
}

const modelPrices = computed(() => modelInfo.value.map(x => {
  let rate = 1e3
  if (unit.cny) rate *= UsdToCnyRate
  if (unit.mTokens) rate *= 1e3
  return {
    modelName: x.model_name,
    inputCost: Math.round(rate * x.input_cost_per_token * 1e8) / 1e8,
    outputCost: Math.round(rate * x.output_cost_per_token * 1e8) / 1e8
  }
}).sort((a, b) => a.modelName.localeCompare(b.modelName)))

const $q = useQuasar()
const modelInfo = ref(null)
async function loadModels() {
  try {
    const resp = await fetch(`${LitellmBaseURL}/model/info`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${user.value.data.apiKey}`
      }
    })
    if (!resp.ok) {
      throw new Error(`${resp.status} ${resp.statusText}`)
    }
    const set = new Set()
    const val = []
    const { data } = await resp.json()
    data.forEach(x => {
      if (set.has(x.model_name)) {
        return
      }
      set.add(x.model_name)
      val.push({ model_name: x.model_name, ...x.model_info })
    })
    modelInfo.value = val
    calc('budget')
  } catch (e) {
    console.error(e)
    $q.notify({
      message: '获取模型价格失败',
      color: 'negative'
    })
  }
}

const modelPricingColumns = computed(() => {
  const u = `${unit.cny ? '￥' : '$ '}/ ${unit.mTokens ? 'M Tokens' : 'K Tokens'}`
  return [
    { name: 'modelName', label: '模型', field: 'modelName', align: 'left' as const, sortable: true },
    { name: 'inputCost', label: `输入价格 (${u})`, field: 'inputCost', sortable: true },
    { name: 'outputCost', label: `输出价格 (${u})`, field: 'outputCost', sortable: true }
  ]
})

</script>
