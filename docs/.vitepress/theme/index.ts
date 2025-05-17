
import DefaultTheme from 'vitepress/theme'
import './custom.css'

if (typeof window !== 'undefined' && navigator.language.startsWith('zh') && !location.pathname.startsWith('/zh')) {
  location.href = '/zh' + location.pathname
}

export default DefaultTheme
