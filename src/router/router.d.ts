import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta extends Record<string | number | symbol, unknown> {
    id?: number
    visible?: boolean
    icon?: string
    title: string
  }
}
