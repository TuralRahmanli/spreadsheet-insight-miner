import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.eadd56d6378d4085ace9d19bb9608d0d',
  appName: 'spreadsheet-insight-miner',
  webDir: 'dist',
  server: {
    url: 'https://eadd56d6-378d-4085-ace9-d19bb9608d0d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    App: {
      handleOpen: true,
    },
  },
  // File associations for auto-import
  intentFilters: [
    {
      action: "android.intent.action.VIEW",
      category: "android.intent.category.DEFAULT",
      data: {
        mimeType: "application/json"
      }
    },
    {
      action: "android.intent.action.SEND",
      category: "android.intent.category.DEFAULT", 
      data: {
        mimeType: "application/json"
      }
    }
  ],
};

export default config;