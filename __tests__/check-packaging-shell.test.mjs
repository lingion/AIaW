import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'

const scriptPath = '/Users/lingion/AIaW/scripts/check-packaging-shell.mjs'

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(value, null, 2))
}

async function writeText(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, value)
}

function runCheck(env) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [scriptPath], {
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''
    child.stdout.on('data', chunk => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', chunk => {
      stderr += chunk.toString()
    })
    child.on('close', code => {
      resolve({ code, stdout, stderr })
    })
  })
}

test('check-packaging-shell validates matching shell fixtures and rejects drift in key metadata', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aiaw-shell-check-'))
  const canonicalDir = path.join(tempDir, 'canonical')
  const packagedDir = path.join(tempDir, 'packaged')

  const canonicalConfig = {
    appId: 'app.aiaw.glass',
    appName: 'AIaW',
    webDir: 'dist/spa'
  }
  const plugins = [
    { pkg: '@capacitor/app', classpath: 'com.capacitorjs.plugins.app.AppPlugin' },
    { pkg: 'capacitor-stream-fetch', classpath: 'app.aiaw.capacitor.fetch.StreamFetchPlugin' }
  ]
  const stringsXml = `<?xml version='1.0' encoding='utf-8'?>\n<resources>\n    <string name="app_name">AIaW</string>\n</resources>\n`
  const gradle = `android {\n    defaultConfig {\n        applicationId "app.aiaw.glass"\n        versionCode 20011\n        versionName "Arona-v2.0.8.2.verified"\n    }\n}\n`
  const mainActivity = `package app.aiaw;\n\nimport android.os.Bundle;\nimport com.getcapacitor.BridgeActivity;\n\npublic class MainActivity extends BridgeActivity {\n    @Override\n    public void onCreate(Bundle savedInstanceState) {\n        registerPlugin(LocalFsPlugin.class);\n        super.onCreate(savedInstanceState);\n    }\n}\n`

  await writeJson(path.join(canonicalDir, 'app/src/main/assets/capacitor.config.json'), canonicalConfig)
  await writeJson(path.join(packagedDir, 'app/src/main/assets/capacitor.config.json'), canonicalConfig)
  await writeJson(path.join(canonicalDir, 'app/src/main/assets/capacitor.plugins.json'), plugins)
  await writeJson(path.join(packagedDir, 'app/src/main/assets/capacitor.plugins.json'), plugins)
  await writeText(path.join(canonicalDir, 'app/src/main/res/values/strings.xml'), stringsXml)
  await writeText(path.join(packagedDir, 'app/src/main/res/values/strings.xml'), stringsXml)
  await writeText(path.join(canonicalDir, 'app/build.gradle'), gradle)
  await writeText(path.join(packagedDir, 'app/build.gradle'), gradle)
  await writeText(path.join(canonicalDir, 'app/src/main/java/app/aiaw/MainActivity.java'), mainActivity)
  await writeText(path.join(packagedDir, 'app/src/main/java/app/aiaw/MainActivity.java'), mainActivity)

  const passResult = await runCheck({
    AIAW_CANONICAL_ANDROID_DIR: canonicalDir,
    AIAW_PACKAGED_ANDROID_DIR: packagedDir
  })

  assert.equal(passResult.code, 0, `expected success, got stderr: ${passResult.stderr}`)
  assert.match(passResult.stdout, /matches canonical AIaW app shell/)

  await writeText(
    path.join(packagedDir, 'app/build.gradle'),
    gradle.replace('versionCode 20010', 'versionCode 19999').replace('applicationId "app.aiaw.glass"', 'applicationId "app.aiaw"')
  )

  const failResult = await runCheck({
    AIAW_CANONICAL_ANDROID_DIR: canonicalDir,
    AIAW_PACKAGED_ANDROID_DIR: packagedDir
  })

  assert.equal(failResult.code, 1)
  assert.match(failResult.stderr, /applicationId|versionCode/)

  await fs.rm(tempDir, { recursive: true, force: true })
})
