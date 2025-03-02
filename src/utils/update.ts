import { LiveUpdate } from '@capawesome/capacitor-live-update'
import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'
import { fetch, IsCapacitor, IsTauri, IsWeb, TauriPlatform } from './platform-api'
import version from 'src/version.json'
import { Loading, Notify, QNotifyAction } from 'quasar'
import { i18n } from 'src/boot/i18n'
import { localData } from './local-data'

const BaseURL = 'https://github.com/NitroRCr/AIaW/releases/latest/download'
type Version = typeof version

async function checkUpdate() {
  if (IsWeb) return
  const res = await fetch(`${BaseURL}/version.json`)
  if (!res.ok) return
  const latest: Version = await res.json()
  if (latest.versionCode <= version.versionCode) return
  const force = version.versionCode <= latest.forceUpdateFrom
  if (IsCapacitor) {
    await capLiveUpdate(latest, force)
  } else if (IsTauri) {
    await tauriUpdate(latest, force)
  }
}

function wrapNotify(message: string, actions: QNotifyAction[]) {
  return Notify.create({
    message,
    actions: actions.map(a => ({ ...a, textColor: 'inv-pri' })),
    color: 'inv-sur',
    textColor: 'inv-on-sur'
  })
}

function isUpdateIgnored(version: string) {
  return localData.ignoredUpdate === version
}
function ignoreUpdate(version: string) {
  localData.ignoredUpdate = version
}

const { t } = i18n.global
async function capLiveUpdate(latest: Version, force: boolean) {
  if (latest.capChannel === version.capChannel) {
    force && Loading.show({
      message: t('update.updating')
    })
    await LiveUpdate.downloadBundle({
      url: `${BaseURL}/spa_bundle_${latest.version}.zip`,
      bundleId: latest.version
    })
    await LiveUpdate.setNextBundle({
      bundleId: latest.version
    })
    force && await LiveUpdate.reload()
  } else if (force && !isUpdateIgnored(latest.version)) {
    wrapNotify(
      t('update.updateFound', { version: latest.version }),
      [{
        label: t('update.ignore'),
        handler: () => {
          ignoreUpdate(latest.version)
        }
      }, {
        label: t('update.download'),
        handler: () => {
          window.open(`${BaseURL}/AIaW_${latest.version}.apk`)
        }
      }]
    )
  }
}

async function tauriUpdate(latest: Version, force: boolean) {
  const update = await check()
  if (!update) return
  if (TauriPlatform === 'windows') {
    if (force && !isUpdateIgnored(latest.version)) {
      wrapNotify(
        t('update.updateFound', { version: latest.version }),
        [{
          label: t('update.ignore'),
          handler: () => {
            ignoreUpdate(latest.version)
          }
        }, {
          label: t('update.update'),
          handler: () => {
            update.downloadAndInstall()
          }
        }]
      )
    }
  } else {
    await update.downloadAndInstall()
    force && wrapNotify(
      t('update.installedNewVersion', { version: latest.version }),
      [{
        label: t('update.relaunch'),
        handler: () => {
          relaunch()
        }
      }]
    )
  }
}

async function ready() {
  IsCapacitor && await LiveUpdate.ready()
}

export {
  checkUpdate,
  ready
}
