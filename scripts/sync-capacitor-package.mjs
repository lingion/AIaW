import fs from 'node:fs/promises'

const rootPackagePath = process.env.AIAW_ROOT_PACKAGE_JSON ?? '/Users/lingion/AIaW/package.json'
const srcCapacitorPackagePath = process.env.AIAW_SRC_CAPACITOR_PACKAGE_JSON ?? '/Users/lingion/AIaW/src-capacitor/package.json'

const rootPackage = JSON.parse(await fs.readFile(rootPackagePath, 'utf8'))
const srcCapacitorPackage = JSON.parse(await fs.readFile(srcCapacitorPackagePath, 'utf8'))

const capacitorDependencies = Object.fromEntries(
  Object.entries(rootPackage.dependencies ?? {}).filter(([name]) =>
    name.startsWith('@capacitor/') || name.startsWith('@capawesome/') || name.startsWith('capacitor-')
  )
)

const capacitorDevDependencies = Object.fromEntries(
  Object.entries(rootPackage.devDependencies ?? {}).filter(([name]) =>
    name === '@capacitor/cli'
  )
)

srcCapacitorPackage.name = rootPackage.name
srcCapacitorPackage.version = rootPackage.version
srcCapacitorPackage.description = rootPackage.description
srcCapacitorPackage.author = rootPackage.author
srcCapacitorPackage.private = rootPackage.private
srcCapacitorPackage.dependencies = capacitorDependencies
srcCapacitorPackage.devDependencies = capacitorDevDependencies

await fs.writeFile(srcCapacitorPackagePath, `${JSON.stringify(srcCapacitorPackage, null, 2)}\n`)

console.log(`Synchronized src-capacitor package metadata from ${rootPackagePath} to ${srcCapacitorPackagePath}`)
