import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'

const scriptPath = '/Users/lingion/AIaW/scripts/sync-capacitor-package.mjs'

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(value, null, 2))
}

function runSync(env) {
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

test('sync-capacitor-package writes src-capacitor package metadata from root dependencies', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aiaw-sync-cap-pkg-'))
  const rootPackagePath = path.join(tempDir, 'package.json')
  const srcCapacitorPackagePath = path.join(tempDir, 'src-capacitor', 'package.json')

  await writeJson(rootPackagePath, {
    name: 'aiaw',
    version: '2.0.8.2.verified',
    description: 'AIaW root',
    author: 'NitroRCr <i@krytro.com>',
    private: true,
    dependencies: {
      '@capacitor/android': '^7.0.1',
      '@capacitor/app': '^7.0.0',
      '@capacitor/camera': '^6.1.3',
      '@capacitor/core': '^7.0.1',
      '@capacitor/filesystem': '^7.0.1',
      '@capawesome/capacitor-file-picker': '7.2.0',
      'capacitor-stream-fetch': '^0.0.6',
      vue: '^3.5.12'
    },
    devDependencies: {
      '@capacitor/cli': '^7.0.1',
      typescript: '~5.5.4'
    }
  })

  await writeJson(srcCapacitorPackagePath, {
    name: 'aiaw',
    version: '0.0.1',
    description: 'stale',
    author: 'old',
    private: true,
    dependencies: {
      '@capacitor/android': '^6.2.1',
      '@capacitor/app': '^6.0.0',
      '@capacitor/cli': '^6.0.0',
      '@capacitor/core': '^6.0.0'
    }
  })

  const result = await runSync({
    AIAW_ROOT_PACKAGE_JSON: rootPackagePath,
    AIAW_SRC_CAPACITOR_PACKAGE_JSON: srcCapacitorPackagePath
  })

  assert.equal(result.code, 0, `expected success, got stderr: ${result.stderr}`)
  assert.match(result.stdout, /Synchronized src-capacitor package metadata/)

  const syncedPackage = JSON.parse(await fs.readFile(srcCapacitorPackagePath, 'utf8'))
  assert.equal(syncedPackage.version, '2.0.8.1.verified')
  assert.equal(syncedPackage.description, 'AIaW root')
  assert.equal(syncedPackage.author, 'NitroRCr <i@krytro.com>')
  assert.equal(syncedPackage.private, true)
  assert.deepEqual(syncedPackage.dependencies, {
    '@capacitor/android': '^7.0.1',
    '@capacitor/app': '^7.0.0',
    '@capacitor/camera': '^6.1.3',
    '@capacitor/core': '^7.0.1',
    '@capacitor/filesystem': '^7.0.1',
    '@capawesome/capacitor-file-picker': '7.2.0',
    'capacitor-stream-fetch': '^0.0.6'
  })
  assert.deepEqual(syncedPackage.devDependencies, {
    '@capacitor/cli': '^7.0.1'
  })

  await fs.rm(tempDir, { recursive: true, force: true })
})
