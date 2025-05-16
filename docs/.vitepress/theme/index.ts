
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    if (DefaultTheme.enhanceApp) {
      DefaultTheme.enhanceApp(ctx);
    }

    if (window && navigator.language.startsWith('zh') && !location.pathname.startsWith('/zh')) {
      ctx.router.go('/zh' + location.pathname)
    }
  }
}
