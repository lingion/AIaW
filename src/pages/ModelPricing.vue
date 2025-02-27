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
        {{ $t('modelPricing.modelPrice') }}
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
          {{ $t('modelPricing.modelPerformance') }}
        </div>
        <div
          mt-2
          lh-1.8em
        >
          <p>
            {{ $t('modelPricing.modelPerformanceDescription1') }}<br>
            {{ $t('modelPricing.modelPerformanceDescription2') }}<br>
          </p>
          <p>
            {{ $t('modelPricing.modelPerformanceDescription3') }}
          </p>
          <p>
            {{ $t('modelPricing.freeModelDisclaimer') }}
          </p>
        </div>
        <div
          text="on-sur-var xs"
          mt-2
        >
          * {{ $t('modelPricing.performanceNote') }}
        </div>
      </div>
      <div>
        <div
          text-lg
          mt-4
        >
          {{ $t('modelPricing.usageCalculator') }}
        </div>

        <div mt-2>
          {{ $t('modelPricing.usageDescription') }}
        </div>
        <div
          flex
          gap-2
          mt-2
        >
          <q-input
            v-model="usage.budget"
            @update:model-value="calc('budget')"
            :label="$t('modelPricing.budgetLabel')"
            filled
            class="flex-1"
          />
          <q-select
            v-model="usage.model"
            :options="modelInfo.map(x => x.model_name)"
            :label="$t('modelPricing.modelLabel')"
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
            :label="$t('modelPricing.outputLabel')"
            class="flex-1"
          />
        </div>
        <div
          mt-2
          text="on-sur-var xs"
        >
          * {{ $t('modelPricing.tokenOutputNote') }}
        </div>
      </div>
      <div mt-4>
        <div
          text-lg
          my-2
        >
          {{ $t('modelPricing.availableModels') }}
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
                {label: t('modelPricing.currencyCNY'), value: true},
                {label: t('modelPricing.currencyUSD'), value: false}
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
                {label: t('modelPricing.unitKTokens'), value: false},
                {label: t('modelPricing.unitMTokens'), value: true}
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
import { useI18n } from 'vue-i18n'
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
const { t, locale } = useI18n()

const unit = reactive({
  cny: locale.value === 'zh-CN',
  mTokens: true
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
      message: t('modelPricing.getModelPriceFailed'),
      color: 'negative'
    })
  }
}

const modelPricingColumns = computed(() => {
  const u = `${unit.cny ? '￥' : '$ '}/ ${unit.mTokens ? 'M Tokens' : 'K Tokens'}`
  return [
    { name: 'modelName', label: t('modelPricing.modelName'), field: 'modelName', align: 'left' as const, sortable: true },
    { name: 'inputCost', label: t('modelPricing.inputPrice') + ` (${u})`, field: 'inputCost', sortable: true },
    { name: 'outputCost', label: t('modelPricing.outputPrice') + ` (${u})`, field: 'outputCost', sortable: true }
  ]
})

</script>
