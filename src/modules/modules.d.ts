import PermissionButton from './permission-button/permission-button.vue'
import PermissionArea from './permission-button/permission-area.vue'

declare module 'vue' {
  export interface GlobalComponents {
    PermissionButton: typeof PermissionButton
    PermissionArea: typeof PermissionArea
  }
}

export {}
