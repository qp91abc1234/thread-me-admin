import PermissionButton from './permission-button/permission-button.vue'
import PermissionArea from './permission-button/permission-area.vue'

import type { App } from 'vue'

export const setupGlobalModules = (app: App<Element>) => {
  app.component('PermissionButton', PermissionButton)
  app.component('PermissionArea', PermissionArea)
}
