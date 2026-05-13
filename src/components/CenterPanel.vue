<template>
  <div
    class="center-panel"
    @dragover.prevent="onDragOver"
    @drop.prevent="onGlobalDrop"
    :class="{ 'drag-over': isDragOver }"
  >
    <!-- Toolbar -->
    <div class="designer-toolbar">
      <span class="toolbar-title">{{ state.formTitle }}</span>
      <span class="field-count">{{ fieldCount }} 个字段</span>
    </div>

    <!-- Design Area -->
    <div class="design-area">
      <el-empty
        v-if="state.rows.length === 0"
        description="从左侧拖拽组件到此处，或点击左侧组件添加"
        :image-size="160"
      />

      <!-- Rows container with draggable -->
      <draggable
        v-if="state.rows.length > 0"
        v-model="state.rows"
        item-key="id"
        handle=".row-drag-handle"
        ghost-class="ghost-row"
        :animation="200"
        @change="onRowsReorder"
      >
        <template #item="{ element: row, index: rowIndex }">
          <div
            class="form-row"
            :class="{ 'row-selected': state.selectedRowId === row.id }"
            @click.stop="selectRow(row.id)"
          >
            <!-- Row header -->
            <div class="row-header">
              <div class="row-header-left">
                <span class="row-drag-handle" title="拖拽排序行">
                  <el-icon><Rank /></el-icon>
                </span>
                <span class="row-label">第 {{ rowIndex + 1 }} 行</span>
                <el-tag size="small" type="info" effect="plain" style="font-size:10px;height:18px;line-height:16px;">
                  {{ justifyLabel(row.justify) }}
                </el-tag>
                <span class="row-span-indicator">
                  已用 {{ usedSpan(row) }} / 24 列
                </span>
                <span v-if="usedSpan(row) > 24" class="span-overflow">
                  超出 {{ usedSpan(row) - 24 }} 列
                </span>
              </div>
              <div class="row-header-right">
                <!-- Quick add to row -->
                <el-popover
                  placement="bottom"
                  :width="220"
                  trigger="click"
                  :popper-options="{ strategy: 'fixed' }"
                >
                  <template #reference>
                    <el-button size="small" circle>
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </template>
                  <div class="quick-add-grid">
                    <div
                      v-for="item in paletteItems"
                      :key="item.type"
                      class="quick-add-item"
                      @click="addFieldToRow(row.id, item.type)"
                    >
                      <el-icon><component :is="item.icon" /></el-icon>
                      <span>{{ item.label }}</span>
                    </div>
                  </div>
                </el-popover>
                <el-button size="small" type="danger" plain circle @click.stop="removeRow(row.id)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>

            <!-- Row fields grid -->
            <div class="row-body">
              <el-row :gutter="8" :justify="row.justify || 'start'">
                <draggable
                  :list="row.fields"
                  item-key="id"
                  handle=".field-drag-handle"
                  ghost-class="ghost-field"
                  group="form-fields"
                  :animation="200"
                  :data-row-id="row.id"
                  @change="() => onRowFieldsReorder(row.id)"
                  class="row-fields-container"
                  tag="div"
                >
                  <template #item="{ element: field, index: fieldIndex }">
                    <el-col :span="field.span" class="field-col-wrapper">
                      <div
                        class="field-col"
                        :class="{ 'field-selected': state.selectedFieldId === field.id }"
                        @click.stop="selectField(field.id)"
                      >
                        <div class="field-wrapper">
                      <!-- Field drag handle -->
                      <div class="field-drag-handle" title="拖拽排序">
                        <el-icon><Rank /></el-icon>
                      </div>

                      <!-- Span badge -->
                      <el-tag
                        size="small"
                        :type="field.span <= 8 ? 'warning' : field.span <= 16 ? 'success' : 'primary'"
                        class="span-badge"
                      >
                        {{ field.span }}/24
                      </el-tag>

                      <!-- Mini render -->
                      <div class="field-preview">
                        <FieldRenderer :field="field" :index="fieldIndex" compact />
                      </div>

                      <!-- Field actions -->
                      <div class="field-actions-overlay">
                        <el-tooltip content="复制" placement="top">
                          <el-button size="small" circle @click.stop="copyField(row.id, field.id)">
                            <el-icon><CopyDocument /></el-icon>
                          </el-button>
                        </el-tooltip>
                        <el-tooltip content="移到...">
                          <el-popover placement="right" :width="160" trigger="click">
                            <template #reference>
                              <el-button size="small" circle @click.stop>
                                <el-icon><Right /></el-icon>
                              </el-button>
                            </template>
                            <div>
                              <div style="font-size:12px;color:#909399;margin-bottom:6px;">移动到目标行</div>
                              <el-radio-group
                                v-model="moveTargetRow"
                                @change="(targetId) => doMoveField(field.id, targetId)"
                              >
                                <el-radio
                                  v-for="(r, ri) in state.rows"
                                  :key="r.id"
                                  :value="r.id"
                                  style="display:block;margin-bottom:4px;"
                                >
                                  第 {{ ri + 1 }} 行
                                </el-radio>
                              </el-radio-group>
                            </div>
                          </el-popover>
                        </el-tooltip>
                        <el-tooltip content="删除" placement="top">
                          <el-button size="small" type="danger" circle @click.stop="removeField(row.id, field.id)">
                            <el-icon><Delete /></el-icon>
                          </el-button>
                        </el-tooltip>
                      </div>
                    </div>
                    </div>
                  </el-col>
                </template>
              </draggable>
              </el-row>

              <!-- Empty row prompt -->
              <div v-if="row.fields.length === 0" class="row-empty-hint">
                此行为空，从左侧拖拽组件到此处，或点击 + 添加
              </div>
            </div>
          </div>
        </template>
      </draggable>

      <!-- Add row button -->
      <div v-if="state.rows.length > 0" class="add-row-area" @click="addRow()">
        <el-icon><Plus /></el-icon>
        <span>添加新行</span>
      </div>

      <!-- Bottom drop zone -->
      <div
        v-if="state.rows.length > 0"
        class="bottom-drop-zone"
        @drop.prevent="onDropNewRow"
        @dragover.prevent
      >
        <span>拖放组件到此处新建行</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { ElMessage } from 'element-plus'
import { useFormStore } from '../stores/formStore.js'
import { paletteItems, typeLabels } from '../utils/formConfig.js'
import FieldRenderer from './FieldRenderer.vue'

const {
  state, selectField, selectRow, removeField, removeRow, copyField,
  reorderRows, reorderRowFields, addRow, addField, moveFieldToRow
} = useFormStore()

const isDragOver = ref(false)
const designAreaRef = ref(null)
const moveTargetRow = ref('')

const fieldCount = ref(0)
watch(() => state.rows, () => {
  fieldCount.value = state.rows.reduce((n, r) => n + r.fields.length, 0)
}, { deep: true, immediate: true })

function usedSpan(row) {
  return row.fields.reduce((s, f) => s + (f.span || 0), 0)
}

function onDragOver() {
  isDragOver.value = true
}

function onGlobalDrop(e) {
  isDragOver.value = false
  const type = e.dataTransfer.getData('component-type')
  if (!type) return
  // If dropped on a specific row, the row's drop handler catches it
  // Otherwise add as new row
  addRowAndField(type)
}

function onDropNewRow(e) {
  const type = e.dataTransfer.getData('component-type')
  if (type) {
    addRowAndField(type)
  }
}

function addRowAndField(type) {
  const row = addRow()
  addField(type, row.id)
}

function addFieldToRow(rowId, type) {
  addField(type, rowId)
}

function onRowsReorder() {
  reorderRows(state.rows)
}

function onRowFieldsReorder(rowId) {
  const row = state.rows.find(r => r.id === rowId)
  if (row) reorderRowFields(rowId, row.fields)
}

function doMoveField(fieldId, targetRowId) {
  moveFieldToRow(fieldId, targetRowId)
  moveTargetRow.value = ''
}

const justifyLabels = {
  start: '左对齐',
  center: '居中',
  end: '右对齐',
  'space-around': '均匀分布',
  'space-between': '两端对齐',
  'space-evenly': '等距分布'
}
function justifyLabel(key) {
  return justifyLabels[key] || '左对齐'
}
</script>

<style scoped>
.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  min-width: 0;
  transition: background 0.2s;
}
.center-panel.drag-over {
  background: #e6f1ff;
}
.designer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}
.toolbar-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
.field-count {
  font-size: 12px;
  color: #909399;
}
.toolbar-actions {
  display: flex;
  gap: 8px;
}
.design-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  margin: 12px;
  background: #fff;
  border-radius: 4px;
  min-height: 200px;
}

/* ── Row ── */
.form-row {
  margin-bottom: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fafafa;
  transition: all 0.2s;
}
.form-row:hover {
  border-color: #dcdfe6;
}
.form-row.row-selected {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.15);
}
.row-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  border-radius: 6px 6px 0 0;
}
.row-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.row-header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}
.row-drag-handle {
  cursor: grab;
  color: #c0c4cc;
  display: flex;
}
.row-drag-handle:hover {
  color: #409eff;
}
.row-label {
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}
.row-span-indicator {
  font-size: 11px;
  color: #909399;
}
.span-overflow {
  font-size: 11px;
  color: #f56c6c;
  font-weight: 600;
}
.row-body {
  padding: 8px;
  min-height: 60px;
}
.row-fields-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  min-height: 40px;
}
.row-empty-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: #c0c4cc;
  font-size: 12px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

/* ── Field Column ── */
.field-col-wrapper {
  padding: 4px 0;
}
.field-col {
  padding: 0;
  min-width: 60px;
}
.field-wrapper {
  position: relative;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 8px 6px 6px;
  background: #fff;
  transition: all 0.2s;
  cursor: pointer;
}
.field-wrapper:hover {
  border-color: #409eff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.field-col.field-selected .field-wrapper {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
.field-drag-handle {
  position: absolute;
  top: 2px;
  left: 2px;
  cursor: grab;
  color: #c0c4cc;
  font-size: 12px;
  display: flex;
  z-index: 1;
}
.field-drag-handle:hover {
  color: #409eff;
}
.span-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 1;
  font-size: 10px;
  height: 18px;
  line-height: 16px;
  padding: 0 4px;
}
.field-preview {
  margin-top: 2px;
  min-height: 24px;
}
.field-preview :deep(.el-form-item) {
  margin-bottom: 0;
}
.field-preview :deep(.el-form-item__label) {
  font-size: 12px;
  height: auto;
  line-height: 1.4;
  padding-bottom: 2px;
  color: #606266;
}
.field-preview :deep(.el-form-item__content) {
  line-height: 1;
}
.field-preview :deep(.el-input__wrapper),
.field-preview :deep(.el-textarea__inner),
.field-preview :deep(.el-select__wrapper) {
  min-height: 28px;
}
.field-preview :deep(.el-input__inner) {
  height: 28px;
}

/* Actions overlay on hover */
.field-actions-overlay {
  display: none;
  position: absolute;
  bottom: -16px;
  right: 4px;
  z-index: 2;
  gap: 2px;
}
.field-wrapper:hover .field-actions-overlay {
  display: flex;
}
.field-actions-overlay .el-button {
  width: 22px;
  height: 22px;
  padding: 0;
}

/* ── Add row ── */
.add-row-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  color: #909399;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
}
.add-row-area:hover {
  border-color: #409eff;
  color: #409eff;
  background: #ecf5ff;
}

/* ── Bottom drop zone ── */
.bottom-drop-zone {
  margin-top: 8px;
  padding: 16px;
  border: 1px dashed transparent;
  border-radius: 4px;
  text-align: center;
  color: #c0c4cc;
  font-size: 12px;
  transition: all 0.2s;
}
.bottom-drop-zone:hover {
  border-color: #409eff;
  background: #ecf5ff;
  color: #409eff;
}

/* ── Ghost ── */
.ghost-row {
  opacity: 0.3;
  background: #ecf5ff;
  border: 1px dashed #409eff;
  border-radius: 6px;
}
.ghost-field {
  opacity: 0.3;
}

/* ── Quick add grid ── */
.quick-add-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
}
.quick-add-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 2px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  color: #606266;
  transition: all 0.1s;
}
.quick-add-item:hover {
  color: #409eff;
  border-color: #409eff;
  background: #ecf5ff;
}
</style>
