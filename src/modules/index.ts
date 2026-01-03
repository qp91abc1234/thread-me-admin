import PermissionButton from './permission-button/permission-button.vue'

import type { App } from 'vue'

export const setupGlobalModules = (app: App<Element>) => {
  app.component('PermissionButton', PermissionButton)
}
