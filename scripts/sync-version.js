import fs from 'fs/promises'

async function updateVersions() {
  try {
    const versionData = JSON.parse(
      await fs.readFile(new URL('../src/version.json', import.meta.url))
    )

    const tauriConfigPath = new URL('../src-tauri/tauri.conf.json', import.meta.url)
    const tauriConfig = JSON.parse(await fs.readFile(tauriConfigPath, 'utf-8'))
    tauriConfig.version = versionData.version.replace('v', '')
    await fs.writeFile(tauriConfigPath, JSON.stringify(tauriConfig, null, 2))

    const gradlePath = new URL('../android/app/build.gradle', import.meta.url)
    let gradleContent = await fs.readFile(gradlePath, 'utf-8')

    gradleContent = gradleContent.replace(
      /versionCode\s+\d+/,
      `versionCode ${versionData.versionCode}`
    )
    gradleContent = gradleContent.replace(
      /versionName\s+["'][^"']*["']/,
      `versionName "${versionData.version}"`
    )

    await fs.writeFile(gradlePath, gradleContent)

    console.log('Version information updated successfully!')
    console.log(`Version: ${versionData.version}`)
    console.log(`Version Code: ${versionData.versionCode}`)
  } catch (error) {
    console.error('Error updating versions:', error)
    process.exit(1)
  }
}

updateVersions()
