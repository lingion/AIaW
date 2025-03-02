import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.aiaw',
  appName: 'AIaW',
  webDir: 'dist/spa',
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#00000000'
    }
  }
}

export default config
