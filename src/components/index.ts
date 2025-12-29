import GFlex from '@/components/g-flex/g-flex.vue'

import type { App } from 'vue'

export const setupGlobalComponents = (app: App<Element>) => {
  app.component('GFlex', GFlex)
}
