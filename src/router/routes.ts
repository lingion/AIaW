import MainLayout from 'layouts/MainLayout.vue'
import WorkspacePage from 'src/pages/WorkspacePage.vue'
import SettingsPage from '../pages/SettingsPage.vue'
import ErrorNotFound from 'pages/ErrorNotFound.vue'
import { RouteRecordRaw } from 'vue-router'
import WorkspaceSettings from 'src/views/WorkspaceSettings.vue'
import DialogView from 'src/views/DialogView.vue'
import AssistantView from 'src/views/AssistantView.vue'
import SetProvider from 'src/pages/SetProvider.vue'
import PluginAdjust from 'src/views/PluginAdjust.vue'
import PluginsPage from 'src/pages/PluginsPage.vue'
import AssistantsPage from 'src/pages/AssistantsPage.vue'
import WorkspaceIndex from 'src/views/WorkspaceIndex.vue'
import EmptyPage from 'src/pages/EmptyPage.vue'
import PluginsMarket from 'src/views/PluginsMarket.vue'
import PluginSettings from 'src/views/PluginSettings.vue'
import AssistantsMarket from 'src/views/AssistantsMarket.vue'
import AccountPage from 'src/pages/AccountPage.vue'
import ModelPricing from 'src/pages/ModelPricing.vue'
import { DexieDBURL, LitellmBaseURL } from 'src/utils/config'
import ShortcutKeys from 'src/pages/ShortcutKeys.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '/workspaces/:workspaceId/',
        component: WorkspacePage,
        props: route => ({ id: route.params.workspaceId }),
        children: [
          { path: '', component: WorkspaceIndex },
          { path: 'settings', component: WorkspaceSettings },
          { path: 'dialogs/:dialogId', component: DialogView, props: route => ({ id: route.params.dialogId }) },
          { path: 'assistants/:assistantId', component: AssistantView, props: route => ({ id: route.params.assistantId }) },
          {
            path: 'assistants/:assistantId/plugins/:pluginId',
            component: PluginAdjust,
            props: route => ({ id: route.params.pluginId, assistantId: route.params.assistantId })
          }
        ]
      },
      { path: '/settings', component: SettingsPage },
      { path: '/shortcut-keys', component: ShortcutKeys },
      {
        path: '/plugins/',
        component: PluginsPage,
        children: [
          { path: '', component: PluginsMarket },
          { path: ':pluginId', component: PluginSettings, props: route => ({ id: route.params.pluginId }) }
        ]
      },
      {
        path: '/assistants/',
        component: AssistantsPage,
        children: [
          { path: '', component: AssistantsMarket },
          { path: ':assistantId', component: AssistantView, props: route => ({ id: route.params.assistantId }) },
          {
            path: ':assistantId/plugins/:pluginId',
            component: PluginAdjust,
            props: route => ({ id: route.params.pluginId, assistantId: route.params.assistantId })
          }
        ]
      },
      { path: '/assistants', component: AssistantsPage },
      { path: '/set-provider', component: SetProvider },
      ...(DexieDBURL ? [
        { path: '/account', component: AccountPage }
      ] : []),
      ...(DexieDBURL && LitellmBaseURL ? [
        { path: '/model-pricing', component: ModelPricing }
      ] : []),
      { path: '/', component: EmptyPage },

      // Always leave this as last one,
      // but you can also remove it
      {
        path: '/:catchAll(.*)*',
        component: ErrorNotFound,
        props: {
          drawerToggle: true,
          timeout: 0
        }
      }
    ]
  }
]

export default routes
