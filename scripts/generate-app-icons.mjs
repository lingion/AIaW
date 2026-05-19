import fs from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const resourcesDir = process.env.AIAW_RESOURCES_DIR ?? '/Users/lingion/AIaW/resources'
const androidResDir = process.env.AIAW_ANDROID_RES_DIR ?? '/Users/lingion/AIaW/android/app/src/main/res'
const publicIconsDir = process.env.AIAW_PUBLIC_ICONS_DIR ?? '/Users/lingion/AIaW/public/icons'
const tauriIconsDir = process.env.AIAW_TAURI_ICONS_DIR ?? '/Users/lingion/AIaW/src-tauri/icons'
const iosAppIconDir = process.env.AIAW_IOS_APPICON_DIR ?? '/Users/lingion/AIaW/ios/App/App/Assets.xcassets/AppIcon.appiconset'

const logoSourcePath = path.join(resourcesDir, 'icon.png')
const androidResourcesDir = path.join(resourcesDir, 'android')
const androidForegroundSourcePath = path.join(androidResourcesDir, 'icon-foreground.png')
const androidBackgroundSourcePath = path.join(androidResourcesDir, 'icon-background.png')
const androidAdaptiveIconXmlPath = path.join(androidResDir, 'mipmap-anydpi-v26/ic_launcher.xml')
const androidAdaptiveIconRoundXmlPath = path.join(androidResDir, 'mipmap-anydpi-v26/ic_launcher_round.xml')

const pythonScript = String.raw`
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import os

resources_dir = Path(os.environ['AIAW_RESOURCES_DIR'])
android_res_dir = Path(os.environ['AIAW_ANDROID_RES_DIR'])
public_icons_dir = Path(os.environ['AIAW_PUBLIC_ICONS_DIR'])
tauri_icons_dir = Path(os.environ['AIAW_TAURI_ICONS_DIR'])
ios_appicon_dir = Path(os.environ['AIAW_IOS_APPICON_DIR'])

logo_source_path = resources_dir / 'icon.png'
android_resources_dir = resources_dir / 'android'
android_foreground_source_path = android_resources_dir / 'icon-foreground.png'
android_background_source_path = android_resources_dir / 'icon-background.png'

def ensure_parent(file_path: Path):
    file_path.parent.mkdir(parents=True, exist_ok=True)

def save_png(image: Image.Image, file_path: Path):
    ensure_parent(file_path)
    image.save(file_path, format='PNG')

def make_base_icon(size: int) -> Image.Image:
    src = Image.open(logo_source_path).convert('RGBA')
    return ImageOps.fit(src, (size, size), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))

def crop_adaptive_foreground_source(src: Image.Image) -> Image.Image:
    pixels = src.load()
    left = src.width
    top = src.height
    right = -1
    bottom = -1

    for y in range(src.height):
        for x in range(src.width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            if r == 0 and g == 0 and b == 0:
                continue
            left = min(left, x)
            top = min(top, y)
            right = max(right, x)
            bottom = max(bottom, y)

    if right < left or bottom < top:
        return src

    return src.crop((left, top, right + 1, bottom + 1))

def make_foreground(size: int) -> Image.Image:
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    inner_size = int(size * 0.78)
    src = crop_adaptive_foreground_source(Image.open(logo_source_path).convert('RGBA'))
    icon = ImageOps.fit(src, (inner_size, inner_size), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    offset = ((size - inner_size) // 2, (size - inner_size) // 2)
    canvas.alpha_composite(icon, dest=offset)
    return canvas

def make_background(size: int) -> Image.Image:
    return Image.new('RGBA', (size, size), (255, 255, 255, 255))

def make_round_icon(size: int) -> Image.Image:
    base = make_base_icon(size)
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size - 1, size - 1), fill=255)
    rounded = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    rounded.paste(base, (0, 0), mask)
    return rounded

def save_multi_icon(source_image: Image.Image, file_path: Path, fmt: str, sizes):
    ensure_parent(file_path)
    source_image.save(file_path, format=fmt, sizes=sizes)

save_png(make_base_icon(1024), logo_source_path)
save_png(make_foreground(1024), android_foreground_source_path)
save_png(make_background(1024), android_background_source_path)

adaptive_icon_xml = '''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
'''
(android_res_dir / 'mipmap-anydpi-v26' / 'ic_launcher.xml').write_text(adaptive_icon_xml, encoding='utf-8')
(android_res_dir / 'mipmap-anydpi-v26' / 'ic_launcher_round.xml').write_text(adaptive_icon_xml, encoding='utf-8')

android_launcher_sizes = {
    'mipmap-ldpi': 36,
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}
android_layer_sizes = {
    'mipmap-ldpi': 81,
    'mipmap-mdpi': 108,
    'mipmap-hdpi': 162,
    'mipmap-xhdpi': 216,
    'mipmap-xxhdpi': 324,
    'mipmap-xxxhdpi': 432,
}
for density, size in android_launcher_sizes.items():
    save_png(make_base_icon(size), android_res_dir / density / 'ic_launcher.png')
    save_png(make_round_icon(size), android_res_dir / density / 'ic_launcher_round.png')
for density, size in android_layer_sizes.items():
    save_png(make_foreground(size), android_res_dir / density / 'ic_launcher_foreground.png')
    save_png(make_background(size), android_res_dir / density / 'ic_launcher_background.png')

for size in [128, 192, 256, 384, 512]:
    save_png(make_base_icon(size), public_icons_dir / f'icon-{size}x{size}.png')
for size in [32, 96, 128]:
    save_png(make_base_icon(size), public_icons_dir / f'favicon-{size}x{size}.png')
for size in [120, 152, 167, 180]:
    save_png(make_base_icon(size), public_icons_dir / f'apple-icon-{size}x{size}.png')
save_png(make_base_icon(144), public_icons_dir / 'ms-icon-144x144.png')
(public_icons_dir / 'safari-pinned-tab.svg').write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#000000"/></svg>\n',
    encoding='utf-8'
)

tauri_png_sizes = {
    '32x32.png': 32,
    '64x64.png': 64,
    '128x128.png': 128,
    '128x128@2x.png': 256,
    'icon.png': 512,
    'Square30x30Logo.png': 30,
    'Square44x44Logo.png': 44,
    'Square71x71Logo.png': 71,
    'Square89x89Logo.png': 89,
    'Square107x107Logo.png': 107,
    'Square142x142Logo.png': 142,
    'Square150x150Logo.png': 150,
    'Square284x284Logo.png': 284,
    'Square310x310Logo.png': 310,
    'StoreLogo.png': 50,
}
for name, size in tauri_png_sizes.items():
    save_png(make_base_icon(size), tauri_icons_dir / name)

multi_icon_source = make_base_icon(1024)
save_multi_icon(multi_icon_source, tauri_icons_dir / 'icon.ico', 'ICO', [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
save_multi_icon(multi_icon_source, tauri_icons_dir / 'icon.icns', 'ICNS', [(16, 16), (32, 32), (64, 64), (128, 128), (256, 256), (512, 512), (1024, 1024)])

ios_sizes = {
    'AppIcon60x60@2x.png': 120,
    'AppIcon60x60@3x.png': 180,
    'AppIcon76x76@2x.png': 152,
    'AppIcon83.5x83.5@2x.png': 167,
    'AppIcon-512@2x.png': 1024,
}
for name, size in ios_sizes.items():
    save_png(make_base_icon(size), ios_appicon_dir / name)
`

const result = spawnSync('python3', ['-c', pythonScript], {
  env: {
    ...process.env,
    AIAW_RESOURCES_DIR: resourcesDir,
    AIAW_ANDROID_RES_DIR: androidResDir,
    AIAW_PUBLIC_ICONS_DIR: publicIconsDir,
    AIAW_TAURI_ICONS_DIR: tauriIconsDir,
    AIAW_IOS_APPICON_DIR: iosAppIconDir
  },
  stdio: 'inherit'
})

if (result.status !== 0) process.exit(result.status ?? 1)

await fs.access(logoSourcePath)
await fs.access(androidForegroundSourcePath)
await fs.access(androidBackgroundSourcePath)

console.log(`Generated app icons from ${logoSourcePath}`)
