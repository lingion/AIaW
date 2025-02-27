import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.aiaw',
  appName: 'AIaW',
  webDir: 'dist/spa',
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    StatusBar: {
      overlaysWebView: false
    }
  }
}

export default config
