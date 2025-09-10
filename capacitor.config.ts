import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'io.deeplycalm.knoxweb',
  appName: 'Luxe Touch',
  webDir: 'www',
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SplashScreen: {
      launchShowDuration: 5000,
      launchAutoHide: true,
      backgroundColor: "#ffff;",
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
    StatusBar: {
      style: "Default",
      backgroundColor: "#000026"
    },
    GoogleMaps: {
      apiKey: 'AIzaSyB-3a7E9u6sbb5GexwjlNYT7PN7GcHnXrI'
    },
    Keyboard: {
      resizeOnFullScreen: true,
      resize: KeyboardResize.Body,
    },
  },

  // ios: {
  //   handleApplicationNotifications: false
  // },
};

export default config;
