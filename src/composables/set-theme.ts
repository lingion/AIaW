import { Hct, hexFromArgb, themeFromSourceColor, TonalPalette } from '@material/material-color-utilities'
import { Dark } from 'quasar'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { useUiStateStore } from 'src/stores/ui-state'
import { watchEffect } from 'vue'
import { IsCapacitor, CapacitorPlatform } from 'src/utils/platform-api'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Keyboard } from '@capacitor/keyboard'
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support'

// Android safe-area insets (top status bar / bottom nav bar) in CSS pixels.
// Set once at boot from Capacitor's StatusBar + WindowInsets, kept in sync with
// the keyboard height so fixed-bottom composer doesn't get covered.
let cachedSafeAreaTop = 0
let cachedSafeAreaBottom = 0

export function getSafeAreaTop(): number { return cachedSafeAreaTop }
export function getSafeAreaBottom(): number { return cachedSafeAreaBottom }

function writeInsets() {
  const top = cachedSafeAreaTop
  const bot = cachedSafeAreaBottom
  document.documentElement.style.setProperty('--sat', top > 0 ? `${Math.round(top)}px` : '0px')
  document.documentElement.style.setProperty('--sab', bot > 0 ? `${Math.round(bot)}px` : '0px')
}

export function useSetTheme() {
  const uiStateStore = useUiStateStore()
  watchEffect(() => {
    const { perfs } = useUserPerfsStore()
    document.body.classList.toggle('platform-android', CapacitorPlatform === 'android')
    document.body.classList.toggle('platform-ios', CapacitorPlatform === 'ios')
    const theme = themeFromSourceColor(Hct.from(perfs.themeHue, 48, 40).toInt())
    const { primary, secondary, tertiary, neutral, neutralVariant, error } = theme.palettes
    const success = TonalPalette.fromHueAndChroma(140, 55)
    const warning = TonalPalette.fromHueAndChroma(80, 45)
    const colors = Dark.isActive ? {
      pri: primary.tone(80),
      sec: secondary.tone(80),
      ter: tertiary.tone(80),
      err: error.tone(80),
      suc: success.tone(80),
      warn: warning.tone(80),
      'pri-dim': primary.tone(60),
      'on-pri': primary.tone(20),
      'on-sec': secondary.tone(20),
      'on-ter': tertiary.tone(20),
      'on-err': error.tone(20),
      'pri-c': primary.tone(30),
      'sec-c': secondary.tone(30),
      'ter-c': tertiary.tone(30),
      'err-c': error.tone(30),
      'on-pri-c': primary.tone(90),
      'on-sec-c': secondary.tone(90),
      'on-ter-c': tertiary.tone(90),
      'on-err-c': error.tone(90),
      'sur-dim': neutral.tone(6),
      sur: neutral.tone(6),
      'sur-bri': neutral.tone(24),
      'sur-c-lowest': neutral.tone(4),
      'sur-c-low': neutral.tone(10),
      'sur-c': neutral.tone(12),
      'sur-c-high': neutral.tone(17),
      'sur-c-highest': neutral.tone(24),
      'on-sur': neutral.tone(90),
      'on-sur-var': neutralVariant.tone(80),
      out: neutralVariant.tone(60),
      'out-mid': neutralVariant.tone(45),
      'out-var': neutralVariant.tone(30),
      'inv-sur': neutral.tone(90),
      'inv-on-sur': neutral.tone(20),
      'inv-pri': primary.tone(40)
    } : {
      pri: primary.tone(40),
      sec: secondary.tone(40),
      ter: tertiary.tone(40),
      err: error.tone(40),
      suc: success.tone(40),
      warn: warning.tone(40),
      'pri-dim': primary.tone(60),
      'on-pri': primary.tone(100),
      'on-sec': secondary.tone(100),
      'on-ter': tertiary.tone(100),
      'on-err': error.tone(100),
      'pri-c': primary.tone(90),
      'sec-c': secondary.tone(90),
      'ter-c': tertiary.tone(90),
      'err-c': error.tone(90),
      'on-pri-c': primary.tone(10),
      'on-sec-c': secondary.tone(10),
      'on-ter-c': tertiary.tone(10),
      'on-err-c': error.tone(10),
      'sur-dim': neutral.tone(87),
      sur: neutral.tone(98),
      'sur-bri': neutral.tone(98),
      'sur-c-lowest': neutral.tone(100),
      'sur-c-low': neutral.tone(96),
      'sur-c': neutral.tone(94),
      'sur-c-high': neutral.tone(92),
      'sur-c-highest': neutral.tone(90),
      'on-sur': neutral.tone(10),
      'on-sur-var': neutralVariant.tone(30),
      out: neutralVariant.tone(50),
      'out-mid': neutralVariant.tone(65),
      'out-var': neutralVariant.tone(80),
      'inv-sur': neutral.tone(20),
      'inv-on-sur': neutral.tone(95),
      'inv-pri': primary.tone(80)
    }
    Object.keys(colors).forEach((key) => {
      document.documentElement.style.setProperty(`--a-${key}`, hexFromArgb(colors[key]))
    })
    document.querySelector('meta[name="theme-color"]').setAttribute('content', hexFromArgb(colors['sur-c']))
    IsCapacitor && StatusBar.setStyle({ style: Dark.isActive ? Style.Dark : Style.Light })
    IsCapacitor && EdgeToEdge.setBackgroundColor({ color: hexFromArgb(colors['sur-c']) })
    uiStateStore.colors = colors
    // Android: compute top + bottom insets so headers/footers aren't covered by
    // status bar / nav bar / keyboard. StatusBar.getInfo().height is the
    // authoritative top inset on Android (env(safe-area-inset-*) isn't
    // supported on older WebViews). Keyboard events override bottom inset
    // while a software keyboard is visible.
    if (IsCapacitor && CapacitorPlatform === 'android') {
      StatusBar.getInfo().then((info) => {
        cachedSafeAreaTop = info.height || 24
        writeInsets()
      }).catch(() => {
        cachedSafeAreaTop = 24
        writeInsets()
      })
      Keyboard.addListener('keyboardWillShow', (info) => {
        cachedSafeAreaBottom = info.keyboardHeight
        writeInsets()
      })
      Keyboard.addListener('keyboardWillHide', () => {
        cachedSafeAreaBottom = 0
        writeInsets()
      })
    }
  })
}
