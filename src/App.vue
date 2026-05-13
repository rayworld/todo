<template>
  <div class="app-container">
    <!-- Top header -->
    <header class="app-header">
      <div class="header-left">
        <h1 class="app-title">表单设计器</h1>
        <div class="panel-toggles">
          <el-tooltip content="左侧面板" placement="bottom">
            <el-button
              size="small"
              :type="leftVisible ? 'primary' : 'default'"
              @click="leftVisible = !leftVisible"
              class="toggle-btn"
            >
              <el-icon><Menu /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="右侧面板" placement="bottom">
            <el-button
              size="small"
              :type="rightVisible ? 'primary' : 'default'"
              @click="rightVisible = !rightVisible"
              class="toggle-btn"
            >
              <el-icon><Setting /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="header-center">
        <span style="color: #909399; font-size: 13px;">{{ state.formTitle }}</span>
      </div>
      <div class="header-right">
        <el-button size="small" @click="triggerImport">
          <el-icon><Upload /></el-icon>
          加载
        </el-button>
        <el-button size="small" @click="saveToFile">
          <el-icon><Download /></el-icon>
          保存
        </el-button>
        <el-button size="small" @click="showJSON">
          <el-icon><Document /></el-icon>
          JSON
        </el-button>
        <el-button size="small" type="primary" @click="state.previewVisible = true">
          <el-icon><View /></el-icon>
          预览
        </el-button>
      </div>
    </header>

    <!-- Hidden file input for import -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileImport"
    />

    <!-- Main content: three-column layout -->
    <div class="app-body">
      <transition name="panel-slide">
        <div v-show="leftVisible" class="side-panel left-panel-wrapper">
          <LeftPanel />
        </div>
      </transition>
      <CenterPanel />
      <transition name="panel-slide">
        <div v-show="rightVisible" class="side-panel right-panel-wrapper">
          <RightPanel />
        </div>
      </transition>
    </div>

    <!-- JSON Dialog -->
    <el-dialog v-model="state.jsonVisible" title="表单 JSON 结构" width="720px" top="5vh">
      <el-alert
        title="此 JSON 完整描述了表单的结构和配置，可用于表单渲染引擎"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 12px"
      />
      <div class="json-toolbar">
        <el-button size="small" @click="saveToFile">
          <el-icon><Download /></el-icon>
          保存到文件
        </el-button>
      </div>
      <el-input
        type="textarea"
        :rows="20"
        :model-value="state.generatedJSON"
        readonly
        class="json-output"
      />
      <template #footer>
        <el-button @click="copyJSON">复制 JSON</el-button>
        <el-button type="primary" @click="state.jsonVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- Preview Dialog (50% wider = 1080px) -->
    <el-dialog v-model="state.previewVisible" title="表单预览" width="1080px" top="5vh">
      <PreviewDialog />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useFormStore } from './stores/formStore.js'
import LeftPanel from './components/LeftPanel.vue'
import CenterPanel from './components/CenterPanel.vue'
import RightPanel from './components/RightPanel.vue'
import PreviewDialog from './components/PreviewDialog.vue'

const { state, showJSON, saveToFile, importFromJSON } = useFormStore()
const fileInputRef = ref(null)

const leftVisible = ref(true)
const rightVisible = ref(true)

function copyJSON() {
  navigator.clipboard.writeText(state.generatedJSON).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

function triggerImport() {
  fileInputRef.value?.click()
}

function handleFileImport(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    const success = importFromJSON(event.target.result)
    if (success) {
      ElMessage.success(`已加载表单: ${state.formTitle}`)
    } else {
      ElMessage.error('JSON 格式错误，导入失败')
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 48px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;
}
.header-center {
  flex: 1;
  text-align: center;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}
.app-title {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  margin: 0;
  white-space: nowrap;
}
.panel-toggles {
  display: flex;
  gap: 4px;
}
.toggle-btn {
  padding: 6px;
  font-size: 16px;
}
.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.side-panel {
  width: 260px;
  flex-shrink: 0;
  overflow: hidden;
}
.left-panel-wrapper {
  border-right: 1px solid #e4e7ed;
}
.right-panel-wrapper {
  border-left: 1px solid #e4e7ed;
}

/* Panel transition */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: width 0.25s ease, opacity 0.25s ease;
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  width: 0 !important;
  opacity: 0;
  overflow: hidden;
}

.json-output :deep(.el-textarea__inner) {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}
.json-toolbar {
  margin-bottom: 8px;
  display: flex;
  justify-content: flex-end;
}
</style>
