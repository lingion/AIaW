import assert from 'node:assert/strict'
import fs from 'node:fs'

const canonicalAndroidDir = process.env.AIAW_CANONICAL_ANDROID_DIR ?? '/Users/lingion/AIaW/android'
const packagedAndroidDir = process.env.AIAW_PACKAGED_ANDROID_DIR ?? '/Users/lingion/AIaW/src-capacitor/android'

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}

function readText(path) {
  return fs.readFileSync(path, 'utf8')
}

function buildPath(baseDir, relativePath) {
  return `${baseDir}/${relativePath}`
}

function extractMatch(text, regex, description) {
  const match = text.match(regex)
  assert.ok(match, `Could not find ${description}`)
  return match[1]
}

const canonicalConfig = readJson(buildPath(canonicalAndroidDir, 'app/src/main/assets/capacitor.config.json'))
const packagedConfig = readJson(buildPath(packagedAndroidDir, 'app/src/main/assets/capacitor.config.json'))
const canonicalPlugins = readJson(buildPath(canonicalAndroidDir, 'app/src/main/assets/capacitor.plugins.json'))
const packagedPlugins = readJson(buildPath(packagedAndroidDir, 'app/src/main/assets/capacitor.plugins.json'))
const canonicalStrings = readText(buildPath(canonicalAndroidDir, 'app/src/main/res/values/strings.xml'))
const packagedStrings = readText(buildPath(packagedAndroidDir, 'app/src/main/res/values/strings.xml'))
const canonicalGradle = readText(buildPath(canonicalAndroidDir, 'app/build.gradle'))
const packagedGradle = readText(buildPath(packagedAndroidDir, 'app/build.gradle'))
const canonicalMainActivity = readText(buildPath(canonicalAndroidDir, 'app/src/main/java/app/aiaw/MainActivity.java'))
const packagedMainActivity = readText(buildPath(packagedAndroidDir, 'app/src/main/java/app/aiaw/MainActivity.java'))

assert.equal(packagedConfig.appId, canonicalConfig.appId, `Expected packaged appId ${canonicalConfig.appId}, got ${packagedConfig.appId}`)
assert.equal(packagedConfig.appName, canonicalConfig.appName, `Expected packaged appName ${canonicalConfig.appName}, got ${packagedConfig.appName}`)
assert.match(packagedStrings, /<string name="app_name">AIaW<\/string>/, 'Packaged strings.xml must name the app AIaW')
assert.equal(
  extractMatch(packagedGradle, /applicationId\s+"([^"]+)"/, 'packaged applicationId'),
  extractMatch(canonicalGradle, /applicationId\s+"([^"]+)"/, 'canonical applicationId'),
  'Packaged build.gradle applicationId must match the canonical Android shell'
)
assert.equal(
  extractMatch(packagedGradle, /versionCode\s+(\d+)/, 'packaged versionCode'),
  extractMatch(canonicalGradle, /versionCode\s+(\d+)/, 'canonical versionCode'),
  'Packaged build.gradle versionCode must match the canonical Android shell'
)
assert.equal(
  extractMatch(packagedGradle, /versionName\s+"([^"]+)"/, 'packaged versionName'),
  extractMatch(canonicalGradle, /versionName\s+"([^"]+)"/, 'canonical versionName'),
  'Packaged build.gradle versionName must match the canonical Android shell'
)
assert.deepEqual(
  packagedPlugins.map(plugin => plugin.pkg).sort(),
  canonicalPlugins.map(plugin => plugin.pkg).sort(),
  'Packaged capacitor plugin manifest must match the canonical Android shell'
)
assert.equal(
  /registerPlugin\(LocalFsPlugin\.class\)/.test(packagedMainActivity),
  /registerPlugin\(LocalFsPlugin\.class\)/.test(canonicalMainActivity),
  'Packaged MainActivity plugin registration must match the canonical Android shell'
)

console.log('Android packaging shell matches canonical AIaW app shell')
