import PermissionButton from './permission-button/permission-button.vue'

declare module 'vue' {
  export interface GlobalComponents {
    PermissionButton: typeof PermissionButton
  }
}

export {}
