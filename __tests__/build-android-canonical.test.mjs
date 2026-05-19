import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'

const scriptPath = '/Users/lingion/AIaW/scripts/build-android-canonical.mjs'

async function writeText(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, value)
}

function runBuild(env, cwd) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [scriptPath], {
      cwd,
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

test('build-android-canonical runs sync, packaged install, check, configured build command, and post-check', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aiaw-build-android-'))
  const canonicalDir = path.join(tempDir, 'android')
  const packagedProjectDir = path.join(tempDir, 'src-capacitor')
  const packagedDir = path.join(packagedProjectDir, 'android')
  const logFile = path.join(tempDir, 'steps.log')
  const fakeBuilder = path.join(tempDir, 'fake-build.sh')
  const fakePnpm = path.join(tempDir, 'pnpm')
  const beforeBuildSnapshot = path.join(tempDir, 'before-build.gradle')
  const rootPackagePath = path.join(tempDir, 'package.json')

  await writeText(rootPackagePath, JSON.stringify({
    name: 'aiaw',
    version: '2.0.8.2.verified',
    description: 'AIaW root',
    author: 'NitroRCr <i@krytro.com>',
    private: true,
    dependencies: {
      '@capacitor/android': '^7.0.1',
      '@capacitor/core': '^7.0.1'
    },
    devDependencies: {
      '@capacitor/cli': '^7.0.1'
    }
  }, null, 2))
  await writeText(path.join(canonicalDir, 'app/src/main/assets/capacitor.config.json'), '{"appId":"app.aiaw.glass","appName":"AIaW"}')
  await writeText(path.join(canonicalDir, 'app/src/main/assets/capacitor.plugins.json'), '[]')
  await writeText(path.join(canonicalDir, 'app/src/main/res/values/strings.xml'), '<string name="app_name">AIaW</string>\n')
  await writeText(path.join(canonicalDir, 'app/src/main/java/app/aiaw/MainActivity.java'), 'registerPlugin(LocalFsPlugin.class);\n')
  await writeText(path.join(canonicalDir, 'app/build.gradle'), 'applicationId "app.aiaw.glass"\nversionCode 20010\nversionName "Arona-v2.0.8.1.verified"\n')
  await writeText(path.join(packagedProjectDir, 'package.json'), '{"name":"aiaw-src-capacitor","dependencies":{},"devDependencies":{}}\n')
  await writeText(fakeBuilder, '#!/bin/sh\ncat "$AIAW_PACKAGED_ANDROID_DIR/app/build.gradle" > "$AIAW_BEFORE_BUILD_SNAPSHOT"\nprintf "build\\n" >> "$AIAW_STEP_LOG"\n')
  await writeText(fakePnpm, '#!/bin/sh\nprintf "install:%s\\n" "$PWD" >> "$AIAW_STEP_LOG"\nexit 0\n')
  await fs.chmod(fakeBuilder, 0o755)
  await fs.chmod(fakePnpm, 0o755)

  const result = await runBuild({
    AIAW_CANONICAL_ANDROID_DIR: canonicalDir,
    AIAW_PACKAGED_ANDROID_DIR: packagedDir,
    AIAW_PACKAGED_PROJECT_DIR: packagedProjectDir,
    AIAW_ROOT_PACKAGE_JSON: rootPackagePath,
    AIAW_SRC_CAPACITOR_PACKAGE_JSON: path.join(packagedProjectDir, 'package.json'),
    PATH: `${tempDir}:${process.env.PATH}`,
    AIAW_STEP_LOG: logFile,
    AIAW_BEFORE_BUILD_SNAPSHOT: beforeBuildSnapshot,
    AIAW_BUILD_ANDROID_COMMAND: fakeBuilder
  }, tempDir)

  assert.equal(result.code, 0, `expected success, got stderr: ${result.stderr}`)
  assert.match(result.stdout, /Built Android package via canonical shell workflow/)
  const installLog = await fs.readFile(logFile, 'utf8')
  assert.match(installLog, /install:.*\/src-capacitor\nbuild\n$/)
  assert.equal(
    await fs.readFile(beforeBuildSnapshot, 'utf8'),
    await fs.readFile(path.join(canonicalDir, 'app/build.gradle'), 'utf8')
  )
  assert.equal(
    await fs.readFile(path.join(packagedDir, 'app/build.gradle'), 'utf8'),
    await fs.readFile(path.join(canonicalDir, 'app/build.gradle'), 'utf8')
  )

  await fs.rm(tempDir, { recursive: true, force: true })
})

