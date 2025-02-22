import { toRaw } from 'vue'
import { useWorkspacesStore } from 'src/stores/workspaces'
import { useQuasar } from 'quasar'
import { dialogOptions } from 'src/utils/values'
import PickAvatarDialog from 'src/components/PickAvatarDialog.vue'
import SelectWorkspaceDialog from 'src/components/SelectWorkspaceDialog.vue'
import { genId } from 'src/utils/functions'
import { useAssistantsStore } from 'src/stores/assistants'
import { db } from 'src/utils/db'
import { useI18n } from 'vue-i18n'

export function useWorkspaceActions() {
  const workspacesStore = useWorkspacesStore()
  const assistantsStore = useAssistantsStore()
  const $q = useQuasar()
  const { t } = useI18n()
  function addWorkspace(parentId = '$root') {
    $q.dialog({
      title: t('workspace.newWorkspace'),
      prompt: {
        model: '',
        type: 'text',
        isValid: v => !!v.trim(),
        label: t('workspace.name')
      },
      cancel: true,
      ok: t('workspace.create'),
      ...dialogOptions
    }).onOk(name => {
      const workspaceId = genId()
      const assistantId = genId()
      db.transaction('rw', db.workspaces, db.assistants, () => {
        workspacesStore.addWorkspace({ id: workspaceId, name: name.trim(), parentId, defaultAssistantId: assistantId })
        assistantsStore.add({ id: assistantId, name: t('workspace.defaultAssistant'), workspaceId })
      })
    })
  }
  function addFolder(parentId = '$root') {
    $q.dialog({
      title: t('workspace.newFolder'),
      prompt: {
        model: '',
        type: 'text',
        isValid: v => !!v.trim(),
        label: t('workspace.name')
      },
      cancel: true,
      ok: t('workspace.create'),
      ...dialogOptions
    }).onOk(name => {
      workspacesStore.addFolder({ name: name.trim(), parentId })
    })
  }
  function renameItem(item) {
    if (item) {
      $q.dialog({
        title: t('workspace.rename'),
        prompt: {
          model: item.name,
          type: 'text',
          isValid: v => !!v.trim() && v !== item.name,
          label: t('workspace.name')
        },
        cancel: true,
        ...dialogOptions
      }).onOk(newName => {
        workspacesStore.updateItem(item.id, { name: newName.trim() })
      })
    }
  }
  function changeAvatar(item) {
    $q.dialog({
      component: PickAvatarDialog,
      componentProps: { model: item.avatar, defaultTab: 'icon' }
    }).onOk(avatar => {
      workspacesStore.updateItem(item.id, { avatar: toRaw(avatar) })
    })
  }
  function moveItem({ id }, exclude?: string[]) {
    $q.dialog({
      component: SelectWorkspaceDialog,
      componentProps: {
        accept: 'folder',
        exclude
      }
    }).onOk(parentId => {
      workspacesStore.updateItem(id, { parentId })
    })
  }
  function deleteItem({ id, type, name }) {
    $q.dialog({
      title: type === 'workspace' ? t('workspace.deleteWorkspace') : t('workspace.deleteFolder'),
      message: type === 'workspace' ? t('workspace.confirmDeleteWorkspace', { name }) : t('workspace.confirmDeleteFolder', { name }),
      cancel: true,
      ok: {
        label: t('workspace.delete'),
        color: 'err',
        flat: true
      },
      ...dialogOptions
    }).onOk(() => { workspacesStore.deleteItem(id) })
  }
  return { addWorkspace, addFolder, renameItem, changeAvatar, moveItem, deleteItem }
}
