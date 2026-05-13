<template>
  <div class="left-panel">
    <div class="panel-header">
      <span>组件列表</span>
    </div>
    <div class="panel-body">
      <div v-for="cat in categories" :key="cat.key" class="component-group">
        <div class="group-title">{{ cat.label }}</div>
        <div class="component-list">
          <div
            v-for="item in filteredItems(cat.key)"
            :key="item.type"
            class="component-item"
            draggable="true"
            @dragstart="onDragStart($event, item)"
            @click="addToForm(item)"
          >
            <el-icon class="item-icon">
              <component :is="item.icon" />
            </el-icon>
            <span class="item-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
      <el-empty v-if="paletteItems.length === 0" description="暂无组件" />
    </div>
  </div>
</template>

<script setup>
import { categories, paletteItems } from '../utils/formConfig.js'
import { useFormStore } from '../stores/formStore.js'

const { addField } = useFormStore()

function filteredItems(categoryKey) {
  return paletteItems.filter(item => item.category === categoryKey)
}

function onDragStart(event, item) {
  event.dataTransfer.setData('component-type', item.type)
  event.dataTransfer.effectAllowed = 'copy'
}

function addToForm(item) {
  addField(item.type)
}
</script>

<style scoped>
.left-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e4e7ed;
}
.panel-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f7fa;
}
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.component-group {
  margin-bottom: 8px;
}
.group-title {
  font-size: 12px;
  color: #909399;
  padding: 8px 8px 4px;
}
.component-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 4px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s;
  user-select: none;
  font-size: 12px;
  color: #606266;
}
.component-item:hover {
  color: #409eff;
  border-color: #409eff;
  background: #ecf5ff;
}
.component-item:active {
  cursor: grabbing;
}
.item-icon {
  font-size: 20px;
}
.item-label {
  line-height: 1.2;
}
</style>
