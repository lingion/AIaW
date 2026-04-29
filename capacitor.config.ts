import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: "app.aiaw.glass",
  appName: 'AIaW',
  webDir: 'dist/spa',
  plugins: {
    EdgeToEdge: {
      backgroundColor: '#00ffffff'
    },
    Keyboard: {
      resizeOnFullScreen: true
    }
  }
}

export default config
