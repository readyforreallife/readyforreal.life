import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "life.readyforreal.app",
  appName: "Ready for Real Life",
  webDir: "capacitor-www",
  bundledWebRuntime: false,
  ios: {
    contentInset: "automatic",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
