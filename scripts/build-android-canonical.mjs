import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'

const projectDir = process.cwd()
const buildCommand = process.env.AIAW_BUILD_ANDROID_COMMAND ?? 'quasar build -m capacitor -T android -d'
const canonicalAndroidDir = process.env.AIAW_CANONICAL_ANDROID_DIR ?? '/Users/lingion/AIaW/android'
const packagedAndroidDir = process.env.AIAW_PACKAGED_ANDROID_DIR ?? '/Users/lingion/AIaW/src-capacitor/android'
const packagedProjectDir = process.env.AIAW_PACKAGED_PROJECT_DIR ?? '/Users/lingion/AIaW/src-capacitor'
const canonicalConfigPath = `${canonicalAndroidDir}/app/src/main/assets/capacitor.config.json`
const packagedConfigPath = `${packagedAndroidDir}/app/src/main/assets/capacitor.config.json`

function runCommand(command, env = process.env, cwd = projectDir) {
  return new Promise((resolve) => {
    const child = spawn(command, {
      cwd,
      env,
      shell: true,
      stdio: 'inherit'
    })

    child.on('close', code => {
      resolve(code ?? 1)
    })
  })
}

async function copyCanonicalCapacitorConfig() {
  const canonicalConfig = await fs.readFile(canonicalConfigPath, 'utf8')
  await fs.mkdir(`${packagedAndroidDir}/app/src/main/assets`, { recursive: true })
  await fs.writeFile(packagedConfigPath, canonicalConfig)
}

const packageSyncCode = await runCommand(`node "/Users/lingion/AIaW/scripts/sync-capacitor-package.mjs"`)
if (packageSyncCode !== 0) {
  process.exit(packageSyncCode)
}

const packageInstallCode = await runCommand('pnpm install', process.env, packagedProjectDir)
if (packageInstallCode !== 0) {
  process.exit(packageInstallCode)
}

const syncCode = await runCommand(`node "/Users/lingion/AIaW/scripts/sync-android-shell.mjs"`)
if (syncCode !== 0) {
  process.exit(syncCode)
}

const preCheckCode = await runCommand(`node "/Users/lingion/AIaW/scripts/check-packaging-shell.mjs"`)
if (preCheckCode !== 0) {
  process.exit(preCheckCode)
}

const buildCode = await runCommand(buildCommand, {
  ...process.env,
  GRADLE_USER_HOME: process.env.GRADLE_USER_HOME ?? `${process.env.HOME}/.gradle`
})
if (buildCode !== 0) {
  process.exit(buildCode)
}

await copyCanonicalCapacitorConfig()

const postCheckCode = await runCommand(`node "/Users/lingion/AIaW/scripts/check-packaging-shell.mjs"`)
if (postCheckCode !== 0) {
  process.exit(postCheckCode)
}

console.log('Built Android package via canonical shell workflow')
