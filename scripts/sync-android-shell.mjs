import fs from 'node:fs/promises'

const canonicalAndroidDir = process.env.AIAW_CANONICAL_ANDROID_DIR ?? '/Users/lingion/AIaW/android'
const packagedAndroidDir = process.env.AIAW_PACKAGED_ANDROID_DIR ?? '/Users/lingion/AIaW/src-capacitor/android'

await fs.rm(packagedAndroidDir, { recursive: true, force: true })
await fs.mkdir(new URL('.', `file://${packagedAndroidDir}/`).pathname, { recursive: true })
await fs.cp(canonicalAndroidDir, packagedAndroidDir, { recursive: true })

console.log(`Synchronized Android shell from ${canonicalAndroidDir} to ${packagedAndroidDir}`)
