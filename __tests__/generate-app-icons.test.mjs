import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'

const scriptPath = '/Users/lingion/AIaW/scripts/generate-app-icons.mjs'

async function writeText(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, value)
}

async function makePng(filePath, color) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await new Promise((resolve, reject) => {
    const child = spawn('python3', ['-c', `from PIL import Image; Image.new('RGBA', (1024, 1024), ${color}).save(r'''${filePath}''')`], {
      stdio: ['ignore', 'pipe', 'pipe']
    })
    let stderr = ''
    child.stderr.on('data', chunk => {
      stderr += chunk.toString()
    })
    child.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(stderr || `python exited with ${code}`))
    })
  })
}

async function makeAdaptiveSourcePng(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await new Promise((resolve, reject) => {
    const child = spawn('python3', ['-c', `from PIL import Image, ImageDraw; img=Image.new('RGBA',(1024,1024),(0,0,0,255)); draw=ImageDraw.Draw(img); draw.rounded_rectangle((128,128,896,896), radius=180, fill=(250,250,250,255)); draw.ellipse((320,320,704,704), fill=(52,33,89,255)); img.save(r'''${filePath}''')`], {
      stdio: ['ignore', 'pipe', 'pipe']
    })
    let stderr = ''
    child.stderr.on('data', chunk => {
      stderr += chunk.toString()
    })
    child.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(stderr || `python exited with ${code}`))
    })
  })
}

async function inspectImage(filePath) {
  return new Promise((resolve, reject) => {
    const child = spawn('python3', ['-c', `from PIL import Image; img=Image.open(r'''${filePath}'''); print(f"{img.size[0]}x{img.size[1]} {img.mode}")`], {
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
      if (code === 0) resolve(stdout.trim())
      else reject(new Error(stderr || `python exited with ${code}`))
    })
  })
}

async function inspectPixel(filePath, x, y) {
  return new Promise((resolve, reject) => {
    const child = spawn('python3', ['-c', `from PIL import Image; img=Image.open(r'''${filePath}''').convert('RGBA'); print(','.join(map(str, img.getpixel((${x}, ${y})))))`], {
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
      if (code === 0) resolve(stdout.trim())
      else reject(new Error(stderr || `python exited with ${code}`))
    })
  })
}

function runGenerator(env) {
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

test('generate-app-icons creates platform icon assets from canonical logo source', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aiaw-generate-icons-'))
  const resourcesDir = path.join(tempDir, 'resources')
  const androidResDir = path.join(tempDir, 'android/app/src/main/res')
  const publicIconsDir = path.join(tempDir, 'public/icons')
  const tauriIconsDir = path.join(tempDir, 'src-tauri/icons')
  const iosIconsDir = path.join(tempDir, 'ios/App/App/Assets.xcassets/AppIcon.appiconset')

  await makeAdaptiveSourcePng(path.join(resourcesDir, 'icon.png'))
  await writeText(path.join(resourcesDir, 'android/icon-background.png'), 'stale background')
  await writeText(path.join(resourcesDir, 'android/icon-foreground.png'), 'stale foreground')
  await writeText(path.join(androidResDir, 'mipmap-anydpi-v26/ic_launcher.xml'), '<adaptive-icon/>\n')
  await writeText(path.join(androidResDir, 'mipmap-anydpi-v26/ic_launcher_round.xml'), '<adaptive-icon/>\n')
  await writeText(path.join(publicIconsDir, 'safari-pinned-tab.svg'), '<svg></svg>\n')
  await writeText(path.join(iosIconsDir, 'Contents.json'), JSON.stringify({
    images: [
      { size: '60x60', idiom: 'iphone', filename: 'AppIcon60x60@2x.png', scale: '2x' },
      { size: '60x60', idiom: 'iphone', filename: 'AppIcon60x60@3x.png', scale: '3x' },
      { size: '76x76', idiom: 'ipad', filename: 'AppIcon76x76@2x.png', scale: '2x' },
      { size: '83.5x83.5', idiom: 'ipad', filename: 'AppIcon83.5x83.5@2x.png', scale: '2x' },
      { size: '1024x1024', idiom: 'ios-marketing', filename: 'AppIcon-512@2x.png', scale: '1x' }
    ],
    info: { version: 1, author: 'xcode' }
  }, null, 2))

  const result = await runGenerator({
    AIAW_RESOURCES_DIR: resourcesDir,
    AIAW_ANDROID_RES_DIR: androidResDir,
    AIAW_PUBLIC_ICONS_DIR: publicIconsDir,
    AIAW_TAURI_ICONS_DIR: tauriIconsDir,
    AIAW_IOS_APPICON_DIR: iosIconsDir
  })

  assert.equal(result.code, 0, `expected success, got stderr: ${result.stderr}`)
  assert.match(result.stdout, /Generated app icons/)

  assert.equal(await inspectImage(path.join(resourcesDir, 'icon.png')), '1024x1024 RGBA')
  assert.equal(await inspectImage(path.join(resourcesDir, 'android/icon-foreground.png')), '1024x1024 RGBA')
  assert.equal(await inspectImage(path.join(resourcesDir, 'android/icon-background.png')), '1024x1024 RGBA')
  assert.equal(await inspectPixel(path.join(resourcesDir, 'android/icon-foreground.png'), 512, 40), '0,0,0,0')

  assert.equal(await inspectImage(path.join(androidResDir, 'mipmap-xxxhdpi/ic_launcher.png')), '192x192 RGBA')
  assert.equal(await inspectImage(path.join(androidResDir, 'mipmap-xxxhdpi/ic_launcher_round.png')), '192x192 RGBA')
  assert.equal(await inspectImage(path.join(androidResDir, 'mipmap-xxxhdpi/ic_launcher_foreground.png')), '432x432 RGBA')
  assert.equal(await inspectImage(path.join(androidResDir, 'mipmap-xxxhdpi/ic_launcher_background.png')), '432x432 RGBA')
  assert.equal(await inspectPixel(path.join(androidResDir, 'mipmap-xxxhdpi/ic_launcher_foreground.png'), 216, 20), '0,0,0,0')

  const launcherXml = await fs.readFile(path.join(androidResDir, 'mipmap-anydpi-v26/ic_launcher.xml'), 'utf8')
  const launcherRoundXml = await fs.readFile(path.join(androidResDir, 'mipmap-anydpi-v26/ic_launcher_round.xml'), 'utf8')
  assert.match(launcherXml, /<background android:drawable="@mipmap\/ic_launcher_background" \/>/)
  assert.match(launcherXml, /<foreground android:drawable="@mipmap\/ic_launcher_foreground" \/>/)
  assert.doesNotMatch(launcherXml, /android:inset=/)
  assert.match(launcherRoundXml, /<background android:drawable="@mipmap\/ic_launcher_background" \/>/)
  assert.match(launcherRoundXml, /<foreground android:drawable="@mipmap\/ic_launcher_foreground" \/>/)
  assert.doesNotMatch(launcherRoundXml, /android:inset=/)

  assert.equal(await inspectImage(path.join(publicIconsDir, 'icon-512x512.png')), '512x512 RGBA')
  assert.equal(await inspectImage(path.join(publicIconsDir, 'favicon-32x32.png')), '32x32 RGBA')
  assert.equal(await inspectImage(path.join(publicIconsDir, 'apple-icon-180x180.png')), '180x180 RGBA')

  assert.equal(await inspectImage(path.join(tauriIconsDir, '32x32.png')), '32x32 RGBA')
  assert.equal(await inspectImage(path.join(tauriIconsDir, '128x128@2x.png')), '256x256 RGBA')
  await fs.access(path.join(tauriIconsDir, 'icon.ico'))
  await fs.access(path.join(tauriIconsDir, 'icon.icns'))

  assert.equal(await inspectImage(path.join(iosIconsDir, 'AppIcon60x60@2x.png')), '120x120 RGBA')
  assert.equal(await inspectImage(path.join(iosIconsDir, 'AppIcon-512@2x.png')), '1024x1024 RGBA')

  await fs.rm(tempDir, { recursive: true, force: true })
})
