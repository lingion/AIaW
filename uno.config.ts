import { Hct, hexFromArgb } from '@material/material-color-utilities'
import presetRemToPx from '@unocss/preset-rem-to-px'
import { defineConfig, presetAttributify, presetUno, transformerDirectives, transformerVariantGroup } from 'unocss'

const textColors = {
  pri: 'var(--a-pri)',
  sec: 'var(--a-sec)',
  ter: 'var(--a-ter)',
  err: 'var(--a-err)',
  suc: 'var(--a-suc)',
  warn: 'var(--a-warn)',
  'pri-dim': 'var(--a-pri-dim)',
  'on-pri': 'var(--a-on-pri)',
  'on-sec': 'var(--a-on-sec)',
  'on-ter': 'var(--a-on-ter)',
  'on-err': 'var(--a-on-err)',
  'on-pri-c': 'var(--a-on-pri-c)',
  'on-sec-c': 'var(--a-on-sec-c)',
  'on-ter-c': 'var(--a-on-ter-c)',
  'on-err-c': 'var(--a-on-err-c)',
  'on-sur': 'var(--a-on-sur)',
  'on-sur-var': 'var(--a-on-sur-var)',
  out: 'var(--a-out)',
  'out-mid': 'var(--a-out-mid)',
  'out-var': 'var(--a-out-var)',
  'inv-on-sur': 'var(--a-inv-on-sur)',
  'inv-pri': 'var(--a-inv-pri)'
}

const bgColors = {
  pri: 'var(--a-pri)',
  sec: 'var(--a-sec)',
  ter: 'var(--a-ter)',
  err: 'var(--a-err)',
  'pri-c': 'var(--a-pri-c)',
  'sec-c': 'var(--a-sec-c)',
  'ter-c': 'var(--a-ter-c)',
  'err-c': 'var(--a-err-c)',
  'sur-dim': 'var(--a-sur-dim)',
  sur: 'var(--a-sur)',
  'sur-bri': 'var(--a-sur-bri)',
  'sur-c-lowest': 'var(--a-sur-c-lowest)',
  'sur-c-low': 'var(--a-sur-c-low)',
  'sur-c': 'var(--a-sur-c)',
  'sur-c-high': 'var(--a-sur-c-high)',
  'sur-c-highest': 'var(--a-sur-c-highest)',
  out: 'var(--a-out)',
  'out-mid': 'var(--a-out-mid)',
  'out-var': 'var(--a-out-var)',
  'inv-sur': 'var(--a-inv-sur)',
  'inv-pri': 'var(--a-inv-pri)'
}

export default defineConfig({
  theme: {
    colors: {
      ...textColors,
      ...bgColors
    },
    breakpoints: {
      xs: '0px',
      sm: '600px',
      md: '1024px',
      lg: '1440px',
      xl: '1920px'
    }
  },
  presets: [
    presetUno({ dark: { light: '.body--light', dark: '.body--dark' } }),
    presetAttributify(),
    presetRemToPx()
  ],
  rules: [
    ['icon-fill', { 'font-variation-settings': "'FILL' 1" }],
    ['break-word', { 'word-break': 'break-word' }],
    [/^(text|bg)-(\d+)-(\d+)-(\d+)$/, ([, type, h, c, t]) => ({
      [type === 'text' ? 'color' : 'background-color']: hexFromArgb(Hct.from(+h, +c, +t).toInt())
    })],
    [/^bg-gradient-(top|bottom|left|right)-(w|b)$/, ([, pos, color]) => {
      const rgb = color === 'w' ? '255 255 255' : '0 0 0'
      return {
        background: `linear-gradient(to ${pos}, rgb(${rgb} / 0%) 0%, rgb(${rgb} / 5%) 20%, rgb(${rgb} / 30%) 100%)`
      }
    }]
  ],
  shortcuts: [
    [
      /^(text|bg)-(\d+)-(\d+)-(\d+)-a$/,
      ([, type, h, c, t]) => `light:${type}-${h}-${c}-${t} dark:${type}-${h}-${c}-${Math.min(110 - +t, 100)}`
    ],
    [
      /^bg-gradient-(top|bottom|left|right)-a$/,
      ([, pos]) => `light:bg-gradient-${pos}-w dark:bg-gradient-${pos}-b`
    ],
    ['item-rd', 'rd mx-2 my-1 of-hidden'],
    ['pri-link', 'text-pri decoration-none transition-color duration-300 hover:text-pri-dim'],
    ['route-active', 'bg-sec-c text-on-sec-c icon-fill']
  ],
  safelist: [
    ...Object.keys(textColors).map(x => `text-${x}`),
    ...Object.keys(bgColors).map(x => `bg-${x}`)
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup()
  ]
})
