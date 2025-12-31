import { join } from 'path'
import { viteMockServe } from 'vite-plugin-mock'
import type { PluginOption } from 'vite'

/**
 * Mock服务配置
 * 仅在开发环境启用
 */
export function setupMockPlugin(enable: boolean): PluginOption {
  return viteMockServe({
    mockPath: join(__dirname, 'mock'), // mock 文件目录（相对于当前文件）
    enable,
    watchFiles: true, // 监听文件变化
    logger: true // 显示日志
  })
}
