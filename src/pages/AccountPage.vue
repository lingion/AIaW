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
        {{ $t('accountPage.accountTitle') }}
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page-container>
    <q-page :style-fn="pageFhStyle">
      <q-list
        pb-2
        v-if="user.license"
        max-w="1000px"
        mx-a
      >
        <q-item-label header>
          {{ $t('accountPage.infoHeader') }}
        </q-item-label>
        <q-item>
          <q-item-section>
            {{ $t('accountPage.emailLabel') }}
          </q-item-section>
          <q-item-section side>
            {{ user.email }}
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item-label header>
          {{ $t('accountPage.cloudSyncHeader') }}
        </q-item-label>
        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ $t('accountPage.cloudSyncDescription') }}
              <span v-if="SyncServicePrice">{{ $t('accountPage.cloudSyncPrice', { priceCNY: SyncServicePrice, priceUSD: SyncServicePriceUSD }) }}</span>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('accountPage.statusLabel') }}
            </q-item-label>
            <q-item-label caption>
              {{ licenseStatus }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="user.license.type === 'eval'">
          <q-item-section>
            <q-item-label>
              {{ $t('accountPage.evalLabel') }}
            </q-item-label>
            <q-item-label caption>
              {{ $t('accountPage.evalDaysLeft', { days: user.license.evalDaysLeft }) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              v-if="BudgetBaseURL"
              unelevated
              :label="$t('accountPage.subscribeButton')"
              bg-pri-c
              text-on-pri-c
              @click="subscribeDialog"
            />
          </q-item-section>
        </q-item>
        <q-item v-else-if="user.license.type === 'prod'">
          <q-item-section>
            <q-item-label>
              {{ $t('accountPage.subscribedLabel') }}
            </q-item-label>
            <q-item-label caption>
              {{ $t('accountPage.validUntil', { date: user.license.validUntil.toLocaleString() }) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              unelevated
              bg-pri-c
              text-on-pri-c
              :label="$t('accountPage.renewButton')"
              @click="subscribeDialog"
            />
          </q-item-section>
        </q-item>
        <template v-if="LitellmBaseURL">
          <q-separator spaced />
          <q-item-label header>
            {{ $t('accountPage.modelServicesHeader') }}
          </q-item-label>
          <q-item>
            <q-item-section>
              <q-item-label
                caption
                important:lh="1.5em"
              >
                {{ $t('accountPage.modelServicesDescription') }}
                <router-link
                  to="/model-pricing"
                  pri-link
                >
                  {{ $t('accountPage.modelPricingLink') }}
                </router-link>
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>
                {{ $t('accountPage.statusLabel') }}
              </q-item-label>
              <q-item-label caption>
                {{ !perfs.provider && user.isLoggedIn ? $t('accountPage.usingDefaultService') : $t('accountPage.customService') }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>
                {{ $t('accountPage.remainingBudget') }}
              </q-item-label>
              <q-item-label caption>
                <span v-if="llmBalance != null">{{ localePrice(llmBalance, 4) }}</span>
                <span v-else>-</span>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                v-if="BudgetBaseURL"
                unelevated
                bg-pri-c
                text-on-pri-c
                :label="$t('accountPage.topupButton')"
                @click="topupDialog"
              />
            </q-item-section>
          </q-item>
        </template>
        <template v-if="user.data.orderHistory?.length">
          <q-separator spaced />
          <q-item-label header>
            {{ $t('accountPage.orderHistoryHeader') }}
          </q-item-label>
          <q-table
            flat
            card-class="bg-sur"
            hide-bottom
            :rows="[...user.data.orderHistory].reverse()"
            :columns="orderHistoryColumns"
            :pagination="{ rowsPerPage: Infinity }"
            v-if="user.data.orderHistory?.length"
          />
        </template>

        <q-item-label
          caption
          p="x-4 y-2"
          v-if="BudgetBaseURL"
        >
          {{ $t('accountPage.contactDeveloper') }}<a
            href="mailto:i@krytro.com"
            pri-link
          >
            i@krytro.com
          </a>
        </q-item-label>
        <q-separator spaced />
        <q-item
          clickable
          v-ripple
          @click="logout"
        >
          <q-item-section avatar>
            <q-icon name="sym_o_logout" />
          </q-item-section>
          <q-item-section>
            {{ $t('accountPage.logoutButton') }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUiStateStore } from 'src/stores/ui-state'
import { useObservable } from '@vueuse/rxjs'
import { db } from 'src/utils/db'
import { useQuasar } from 'quasar'
import SubscribeDialog from 'src/components/SubscribeDialog.vue'
import { BudgetBaseURL, LitellmBaseURL, SyncServicePrice, SyncServicePriceUSD } from 'src/utils/config'
import TopupDialog from 'src/components/TopupDialog.vue'
import { useRouter } from 'vue-router'
import PayDialog from 'src/components/PayDialog.vue'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { localePrice, pageFhStyle } from 'src/utils/functions'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const user = useObservable(db.cloud.currentUser)
const router = useRouter()
db.on('ready', () => {
  if (!user.value.isLoggedIn) {
    router.replace('/')
    db.cloud.login()
  } else {
    refreshLlmBalance()
  }
})
const licenseStatus = computed(() => {
  switch (user.value.license.status) {
    case 'ok': return t('accountPage.licenseOk')
    case 'expired': return t('accountPage.licenseExpired')
    case 'deactivated': return t('accountPage.licenseDeactivated')
    default: return t('accountPage.licenseUnknown')
  }
})
const uiStateStore = useUiStateStore()

const $q = useQuasar()
function subscribeDialog() {
  $q.dialog({
    component: SubscribeDialog
  }).onOk(res => {
    window.open(res.payUrl, '_blank')
    $q.dialog({
      component: PayDialog,
      componentProps: {
        link: res.payUrl
      }
    }).onOk(() => {
      db.cloud.sync()
    })
  })
}
function topupDialog() {
  $q.dialog({
    component: TopupDialog
  }).onOk(res => {
    window.open(res.payUrl, '_blank')
    $q.dialog({
      component: PayDialog,
      componentProps: {
        link: res.payUrl
      }
    }).onOk(() => {
      refreshLlmBalance()
      db.cloud.sync()
    })
  })
}

async function logout() {
  await db.cloud.logout()
  router.replace('/')
}

const llmBalance = ref(null)
async function refreshLlmBalance() {
  if (!LitellmBaseURL) return
  const resp = await fetch(`${LitellmBaseURL}/key/info`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${user.value.data.apiKey}`
    }
  })
  const { info, error } = await resp.json()
  if (resp.status === 400 && error.type === 'budget_exceeded') {
    llmBalance.value = 0
    return
  }
  llmBalance.value = info.max_budget - info.spend
}

const itemTypes = {
  'sync-service': t('accountPage.syncServiceType'),
  'api-budget': t('accountPage.apiBudgetType'),
  'api-budget-usd': t('accountPage.apiBudgetUsdType')
}
const orderHistoryColumns = [
  { name: 'orderId', label: t('accountPage.orderId'), field: 'orderId', align: 'left' as const },
  { name: 'createdAt', label: t('accountPage.paymentTime'), field: 'timestamp', format: (val: string) => new Date(val).toLocaleString() },
  { name: 'type', label: t('accountPage.orderType'), field: row => row.item.type, format: val => itemTypes[val] },
  { name: 'amount', label: t('accountPage.amount'), field: row => row.item.amount }
]

const { perfs } = useUserPerfsStore()
</script>
