<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import { getMenuTree, createMenu, updateMenu, deleteMenu, updateMenuSort } from '@/common/api/menu'
import type { MenuItem, ButtonPermission, ApiPermission } from '@/common/types/permission'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增菜单')
const menuFormRef = ref<FormInstance>()

// 菜单树数据
const menuTree = ref<MenuItem[]>([])

// 当前选中的菜单节点
const currentNode = ref<MenuItem | null>(null)

// 菜单表单
const menuForm = reactive<Partial<MenuItem>>({
  id: 0,
  path: '',
  title: '',
  icon: '',
  compPath: '',
  parentId: undefined,
  sort: 0,
  status: 1,
  buttonPermissionCodes: [],
  apiPermissionCodes: []
})

// 按钮权限表格数据
const buttonPermissionTable = ref<ButtonPermission[]>([])
const buttonPermissionForm = reactive<ButtonPermission>({
  code: '',
  name: '',
  hidden: false
})
const buttonPermissionDialogVisible = ref(false)
const buttonPermissionDialogTitle = ref('新增按钮权限')
const buttonPermissionFormRef = ref<FormInstance>()

// API权限表格数据
const apiPermissionTable = ref<ApiPermission[]>([])
const apiPermissionForm = reactive<ApiPermission>({
  code: '',
  name: '',
  method: 'GET'
})
const apiPermissionDialogVisible = ref(false)
const apiPermissionDialogTitle = ref('新增API权限')
const apiPermissionFormRef = ref<FormInstance>()

// 分割面板大小
const splitSize = ref(0.4)

// 加载菜单树
const loadMenuTree = async () => {
  loading.value = true
  try {
    const res = await getMenuTree()
    menuTree.value = res.tree
  } catch (error: any) {
    ElMessage.error(error.message || '加载菜单树失败')
  } finally {
    loading.value = false
  }
}

// 菜单树节点点击
const handleNodeClick = (data: MenuItem) => {
  currentNode.value = data
  // 加载按钮权限和API权限
  buttonPermissionTable.value = (data.buttonPermissionCodes || []).map((code) => {
    // 从code中提取name（简化处理）
    const name = code.split(':')[1] || code
    return {
      code,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      hidden: false
    }
  })
  apiPermissionTable.value = (data.apiPermissionCodes || []).map((code) => {
    // 解析API权限code
    const parts = code.split(':')
    const method = parts[0] || 'GET'
    const path = parts.slice(1).join(':')
    return {
      code,
      name: path,
      method
    }
  })
}

// 菜单树拖拽结束
const handleDragEnd = async (dragNode: any, dropNode: any, dropType: string) => {
  if (dropType === 'none') return

  // 构建排序数据
  const items: Array<{ id: number; parentId?: number; sort: number }> = []

  const traverse = (nodes: MenuItem[], parentId?: number, startSort = 0) => {
    nodes.forEach((node, index) => {
      items.push({
        id: node.id,
        parentId,
        sort: startSort + index
      })
      if (node.children && node.children.length > 0) {
        traverse(node.children, node.id, 0)
      }
    })
  }

  traverse(menuTree.value)

  try {
    await updateMenuSort(items)
    ElMessage.success('排序更新成功')
    await loadMenuTree()
  } catch (error: any) {
    ElMessage.error(error.message || '排序更新失败')
    // 重新加载以恢复原状态
    await loadMenuTree()
  }
}

// 新增菜单
const handleAdd = (parentNode?: MenuItem) => {
  dialogTitle.value = '新增菜单'
  dialogVisible.value = true
  resetForm()
  if (parentNode) {
    menuForm.parentId = parentNode.id
  }
}

// 编辑菜单
const handleEdit = (node: MenuItem) => {
  dialogTitle.value = '编辑菜单'
  dialogVisible.value = true
  Object.assign(menuForm, {
    ...node,
    buttonPermissionCodes: node.buttonPermissionCodes || [],
    apiPermissionCodes: node.apiPermissionCodes || []
  })
}

// 删除菜单
const handleDelete = async (node: MenuItem) => {
  try {
    await ElMessageBox.confirm('确定要删除该菜单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteMenu(node.id)
    ElMessage.success('删除成功')
    currentNode.value = null
    await loadMenuTree()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 保存菜单
const handleSave = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        if (menuForm.id) {
          // 编辑
          await updateMenu(menuForm.id, menuForm)
          ElMessage.success('编辑成功')
        } else {
          // 新增
          await createMenu(menuForm)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        await loadMenuTree()
      } catch (error: any) {
        ElMessage.error(error.message || '保存失败')
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  menuForm.id = 0
  menuForm.path = ''
  menuForm.title = ''
  menuForm.icon = ''
  menuForm.compPath = ''
  menuForm.parentId = undefined
  menuForm.sort = 0
  menuForm.status = 1
  menuForm.buttonPermissionCodes = []
  menuForm.apiPermissionCodes = []
}

// 添加按钮权限
const handleAddButtonPermission = () => {
  buttonPermissionDialogTitle.value = '新增按钮权限'
  buttonPermissionDialogVisible.value = true
  resetButtonPermissionForm()
}

// 编辑按钮权限
const handleEditButtonPermission = (row: ButtonPermission) => {
  buttonPermissionDialogTitle.value = '编辑按钮权限'
  buttonPermissionDialogVisible.value = true
  Object.assign(buttonPermissionForm, row)
}

// 删除按钮权限
const handleDeleteButtonPermission = (row: ButtonPermission) => {
  const index = buttonPermissionTable.value.findIndex((item) => item.code === row.code)
  if (index > -1) {
    buttonPermissionTable.value.splice(index, 1)
    updateMenuPermissionCodes()
  }
}

// 保存按钮权限
const handleSaveButtonPermission = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid) => {
    if (valid) {
      // 检查code是否已存在
      const exists = buttonPermissionTable.value.some(
        (item) => item.code === buttonPermissionForm.code && item !== buttonPermissionForm
      )
      if (exists) {
        ElMessage.warning('按钮权限code已存在')
        return
      }

      const index = buttonPermissionTable.value.findIndex(
        (item) => item.code === buttonPermissionForm.code
      )
      if (index > -1) {
        // 更新
        buttonPermissionTable.value[index] = { ...buttonPermissionForm }
      } else {
        // 新增
        buttonPermissionTable.value.push({ ...buttonPermissionForm })
      }

      buttonPermissionDialogVisible.value = false
      updateMenuPermissionCodes()
    }
  })
}

// 重置按钮权限表单
const resetButtonPermissionForm = () => {
  buttonPermissionForm.code = ''
  buttonPermissionForm.name = ''
  buttonPermissionForm.hidden = false
}

// 添加API权限
const handleAddApiPermission = () => {
  apiPermissionDialogTitle.value = '新增API权限'
  apiPermissionDialogVisible.value = true
  resetApiPermissionForm()
}

// 编辑API权限
const handleEditApiPermission = (row: ApiPermission) => {
  apiPermissionDialogTitle.value = '编辑API权限'
  apiPermissionDialogVisible.value = true
  Object.assign(apiPermissionForm, row)
}

// 删除API权限
const handleDeleteApiPermission = (row: ApiPermission) => {
  const index = apiPermissionTable.value.findIndex((item) => item.code === row.code)
  if (index > -1) {
    apiPermissionTable.value.splice(index, 1)
    updateMenuPermissionCodes()
  }
}

// 保存API权限
const handleSaveApiPermission = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid) => {
    if (valid) {
      // 构建code：METHOD:/api/path
      const code = `${apiPermissionForm.method}:${apiPermissionForm.name}`

      // 检查code是否已存在
      const exists = apiPermissionTable.value.some(
        (item) => item.code === code && item !== apiPermissionForm
      )
      if (exists) {
        ElMessage.warning('API权限code已存在')
        return
      }

      const index = apiPermissionTable.value.findIndex((item) => item.code === code)
      if (index > -1) {
        // 更新
        apiPermissionTable.value[index] = {
          code,
          name: apiPermissionForm.name,
          method: apiPermissionForm.method
        }
      } else {
        // 新增
        apiPermissionTable.value.push({
          code,
          name: apiPermissionForm.name,
          method: apiPermissionForm.method
        })
      }

      apiPermissionDialogVisible.value = false
      updateMenuPermissionCodes()
    }
  })
}

// 重置API权限表单
const resetApiPermissionForm = () => {
  apiPermissionForm.code = ''
  apiPermissionForm.name = ''
  apiPermissionForm.method = 'GET'
}

// 更新菜单的权限code数组
const updateMenuPermissionCodes = () => {
  if (!currentNode.value) return

  menuForm.buttonPermissionCodes = buttonPermissionTable.value.map((item) => item.code)
  menuForm.apiPermissionCodes = apiPermissionTable.value.map((item) => item.code)
}

// 保存菜单权限（更新当前选中菜单的权限）
const handleSaveMenuPermissions = async () => {
  if (!currentNode.value) {
    ElMessage.warning('请先选择菜单')
    return
  }

  updateMenuPermissionCodes()

  try {
    await updateMenu(currentNode.value.id, {
      buttonPermissionCodes: menuForm.buttonPermissionCodes,
      apiPermissionCodes: menuForm.apiPermissionCodes
    })
    ElMessage.success('权限保存成功')
    await loadMenuTree()
    // 重新选中节点以刷新权限列表
    if (currentNode.value) {
      const node = findNodeById(menuTree.value, currentNode.value.id)
      if (node) {
        handleNodeClick(node)
      }
    }
  } catch (error: any) {
    ElMessage.error(error.message || '保存权限失败')
  }
}

// 根据ID查找节点
const findNodeById = (nodes: MenuItem[], id: number): MenuItem | null => {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

// 初始化
onMounted(() => {
  loadMenuTree()
})
</script>

<template>
  <div class="menu-page">
    <el-splitter style="height: calc(100vh - 200px)">
      <el-splitter-panel :size="splitSize * 100 + '%'">
        <el-card class="tree-card">
          <template #header>
            <div class="card-header">
              <span>菜单树</span>
              <el-button type="primary" :icon="Plus" size="small" @click="handleAdd()">
                新增
              </el-button>
            </div>
          </template>
          <el-tree
            v-loading="loading"
            ref="menuTreeRef"
            :data="menuTree"
            :props="{ children: 'children', label: 'title' }"
            node-key="id"
            default-expand-all
            draggable
            :allow-drop="() => true"
            :allow-drag="() => true"
            @node-click="handleNodeClick"
            @node-drop="handleDragEnd"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <span>{{ node.label }}</span>
                <span class="node-actions">
                  <el-button
                    type="primary"
                    link
                    size="small"
                    :icon="Plus"
                    @click.stop="handleAdd(data)"
                  >
                    添加
                  </el-button>
                  <el-button
                    type="primary"
                    link
                    size="small"
                    :icon="Edit"
                    @click.stop="handleEdit(data)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="danger"
                    link
                    size="small"
                    :icon="Delete"
                    @click.stop="handleDelete(data)"
                  >
                    删除
                  </el-button>
                </span>
              </div>
            </template>
          </el-tree>
        </el-card>
      </el-splitter-panel>
      <el-splitter-panel>
        <el-card v-if="currentNode" class="permission-card">
          <template #header>
            <div class="card-header">
              <span>{{ currentNode.title }} - 权限配置</span>
              <el-button type="primary" size="small" @click="handleSaveMenuPermissions">
                保存权限
              </el-button>
            </div>
          </template>

          <!-- 按钮权限 -->
          <div class="permission-section">
            <div class="section-header">
              <span>按钮权限</span>
              <el-button
                type="primary"
                :icon="Plus"
                size="small"
                @click="handleAddButtonPermission"
              >
                新增
              </el-button>
            </div>
            <el-table :data="buttonPermissionTable" stripe border style="margin-top: 10px">
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column prop="code" label="权限Code" min-width="150" show-overflow-tooltip />
              <el-table-column prop="name" label="权限名称" min-width="120" show-overflow-tooltip />
              <el-table-column prop="hidden" label="是否隐藏" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.hidden ? 'danger' : 'success'">
                    {{ row.hidden ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" align="center">
                <template #default="{ row }">
                  <el-button
                    type="primary"
                    link
                    size="small"
                    @click="handleEditButtonPermission(row)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="danger"
                    link
                    size="small"
                    @click="handleDeleteButtonPermission(row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- API权限 -->
          <div class="permission-section" style="margin-top: 30px">
            <div class="section-header">
              <span>API权限</span>
              <el-button type="primary" :icon="Plus" size="small" @click="handleAddApiPermission">
                新增
              </el-button>
            </div>
            <el-table :data="apiPermissionTable" stripe border style="margin-top: 10px">
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column prop="method" label="请求方法" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.method === 'GET' ? 'success' : 'primary'">
                    {{ row.method }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="API路径" min-width="200" show-overflow-tooltip />
              <el-table-column prop="code" label="权限Code" min-width="200" show-overflow-tooltip />
              <el-table-column label="操作" width="120" align="center">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click="handleEditApiPermission(row)">
                    编辑
                  </el-button>
                  <el-button
                    type="danger"
                    link
                    size="small"
                    @click="handleDeleteApiPermission(row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
        <el-empty v-else description="请选择菜单节点查看权限配置" />
      </el-splitter-panel>
    </el-splitter>

    <!-- 菜单表单弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="menuFormRef" :model="menuForm" label-width="100px">
        <el-form-item
          label="菜单路径"
          prop="path"
          :rules="[{ required: true, message: '请输入菜单路径', trigger: 'blur' }]"
        >
          <el-input v-model="menuForm.path" placeholder="请输入菜单路径，如：user" />
        </el-form-item>
        <el-form-item
          label="菜单名称"
          prop="title"
          :rules="[{ required: true, message: '请输入菜单名称', trigger: 'blur' }]"
        >
          <el-input v-model="menuForm.title" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="menuForm.icon" placeholder="请输入图标名称，如：User" />
        </el-form-item>
        <el-form-item label="组件路径">
          <el-input
            v-model="menuForm.compPath"
            placeholder="请输入组件路径，如：/src/views/user/user.vue"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="menuForm.sort" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="menuForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave(menuFormRef)">确定</el-button>
      </template>
    </el-dialog>

    <!-- 按钮权限表单弹窗 -->
    <el-dialog
      v-model="buttonPermissionDialogVisible"
      :title="buttonPermissionDialogTitle"
      width="500px"
    >
      <el-form ref="buttonPermissionFormRef" :model="buttonPermissionForm" label-width="100px">
        <el-form-item
          label="权限Code"
          prop="code"
          :rules="[{ required: true, message: '请输入权限Code', trigger: 'blur' }]"
        >
          <el-input v-model="buttonPermissionForm.code" placeholder="如：user:add" />
        </el-form-item>
        <el-form-item
          label="权限名称"
          prop="name"
          :rules="[{ required: true, message: '请输入权限名称', trigger: 'blur' }]"
        >
          <el-input v-model="buttonPermissionForm.name" placeholder="如：新增用户" />
        </el-form-item>
        <el-form-item label="是否隐藏">
          <el-switch v-model="buttonPermissionForm.hidden" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="buttonPermissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveButtonPermission(buttonPermissionFormRef)">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- API权限表单弹窗 -->
    <el-dialog v-model="apiPermissionDialogVisible" :title="apiPermissionDialogTitle" width="500px">
      <el-form ref="apiPermissionFormRef" :model="apiPermissionForm" label-width="100px">
        <el-form-item
          label="请求方法"
          prop="method"
          :rules="[{ required: true, message: '请选择请求方法', trigger: 'change' }]"
        >
          <el-select v-model="apiPermissionForm.method" style="width: 100%">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
            <el-option label="PATCH" value="PATCH" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="API路径"
          prop="name"
          :rules="[{ required: true, message: '请输入API路径', trigger: 'blur' }]"
        >
          <el-input v-model="apiPermissionForm.name" placeholder="如：/api/user/list" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="apiPermissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveApiPermission(apiPermissionFormRef)"
          >确定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.menu-page {
  padding: 20px;

  .tree-card,
  .permission-card {
    height: 100%;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  .tree-node {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    padding-right: 8px;

    .node-actions {
      display: none;
    }

    &:hover .node-actions {
      display: block;
    }
  }

  .permission-section {
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      font-weight: bold;
    }
  }
}
</style>
