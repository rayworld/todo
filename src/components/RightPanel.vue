<template>
  <div class="right-panel">
    <div class="panel-header">
      <span>{{ panelTitle }}</span>
    </div>
    <div class="panel-body">
      <!-- No selection: show form-level settings -->
      <template v-if="!selectedField && !selectedRow">
        <div class="prop-section">
          <div class="section-title">表单设置</div>
          <el-form label-position="top" size="small">
            <el-form-item label="表单标题">
              <el-input v-model="state.formTitle" placeholder="请输入表单标题" />
            </el-form-item>
            <el-form-item label="行数 / 字段数">
              <el-input :model-value="`${state.rows.length} 行 / ${fieldCount} 个字段`" disabled />
            </el-form-item>
          </el-form>
          <el-divider />
          <el-button type="danger" plain @click="clearForm" style="width: 100%">
            <el-icon><Delete /></el-icon>
            清空所有字段
          </el-button>
          <div style="margin-top: 8px;">
            <el-upload
              accept=".json"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleImport"
            >
              <el-button plain style="width: 100%">
                <el-icon><Upload /></el-icon>
                导入 JSON
              </el-button>
            </el-upload>
          </div>
        </div>
      </template>

      <!-- Row selected but no field: show row info -->
      <template v-else-if="selectedRow && !selectedField">
        <div class="prop-section">
          <div class="section-title">行属性</div>
          <el-form label-position="top" size="small">
            <el-form-item label="行 ID">
              <el-input :model-value="selectedRow.id" disabled />
            </el-form-item>
            <el-form-item label="字段数量">
              <el-input :model-value="selectedRow.fields.length + ' 个'" disabled />
            </el-form-item>
            <el-form-item label="已用列宽">
              <el-tag :type="rowSpanStatus.type">{{ rowSpanStatus.text }}</el-tag>
            </el-form-item>
            <el-form-item label="行对齐方式">
              <el-select v-model="selectedRow.justify" placeholder="选择对齐方式" style="width: 100%">
                <el-option label="左对齐" value="start" />
                <el-option label="居中" value="center" />
                <el-option label="右对齐" value="end" />
                <el-option label="均匀分布" value="space-around" />
                <el-option label="两端对齐" value="space-between" />
                <el-option label="等距分布" value="space-evenly" />
              </el-select>
              <div v-if="(selectedRow.justify || 'start') !== 'start'" class="justify-hint">
                当前：{{ justifyLabels[selectedRow.justify] || '左对齐' }}
                <span v-if="rowJustifyActive">（字段总宽 < 24 列时生效）</span>
              </div>
            </el-form-item>
          </el-form>
          <el-divider />
          <div class="row-actions">
            <el-button plain style="width: 100%; margin-bottom: 4px;" @click="addField(selectedRow.id)">
              <el-icon><Plus /></el-icon>
              添加输入框
            </el-button>
            <el-button type="danger" plain style="width: 100%;" @click="removeRow(selectedRow.id)">
              <el-icon><Delete /></el-icon>
              删除此行
            </el-button>
          </div>
        </div>
      </template>

      <!-- Field selected: show field properties -->
      <template v-else-if="selectedField">
        <div class="prop-section">
          <div class="section-title">
            基本属性
            <el-tag size="small" type="info">{{ typeLabels[selectedField.type] }}</el-tag>
          </div>
          <el-form label-position="top" size="small">
            <!-- Column span (1-24) -->
            <el-form-item label="列宽 (1-24)">
              <div class="span-editor">
                <el-slider
                  v-model="currentSpan"
                  :min="1"
                  :max="24"
                  :step="1"
                  show-input
                  input-size="small"
                  style="width: 100%"
                />
                <div class="span-visual">
                  <div
                    class="span-bar"
                    :style="{ width: (currentSpan / 24 * 100) + '%' }"
                    :class="spanBarClass"
                  >
                    {{ currentSpan }}/24
                  </div>
                  <div class="span-remain" :style="{ width: ((24 - currentSpan) / 24 * 100) + '%' }">
                    {{ rowRemainingSpan > 0 ? '剩余 ' + rowRemainingSpan : '' }}
                  </div>
                </div>
              </div>
            </el-form-item>

            <!-- Common properties -->
            <el-form-item label="字段标识 (model)">
              <el-input v-model="selectedField.props.model" placeholder="字段标识" />
            </el-form-item>
            <el-form-item label="标签文本">
              <el-input v-model="selectedField.props.label" placeholder="标签" />
            </el-form-item>

            <!-- Required (not for divider, button) -->
            <el-form-item v-if="!['divider', 'button'].includes(selectedField.type)" label="必填">
              <el-switch v-model="selectedField.props.required" />
            </el-form-item>

            <!-- Placeholder (input, textarea, number, select, date, time) -->
            <el-form-item v-if="hasProp('placeholder')" label="占位文本">
              <el-input v-model="selectedField.props.placeholder" placeholder="占位文本" />
            </el-form-item>

            <!-- Disabled (most components) -->
            <el-form-item v-if="!['divider'].includes(selectedField.type)" label="禁用">
              <el-switch v-model="selectedField.props.disabled" />
            </el-form-item>

            <!-- Default value (most components) -->
            <el-form-item v-if="hasProp('defaultValue') && selectedField.type !== 'checkbox'" label="默认值">
              <el-input
                v-if="['input', 'textarea'].includes(selectedField.type)"
                v-model="selectedField.props.defaultValue"
                placeholder="默认值"
              />
              <el-input-number
                v-else-if="selectedField.type === 'number'"
                v-model="selectedField.props.defaultValue"
                :min="selectedField.props.min"
                :max="selectedField.props.max"
                controls-position="right"
              />
              <el-switch
                v-else-if="selectedField.type === 'switch'"
                v-model="selectedField.props.defaultValue"
              />
              <el-rate
                v-else-if="selectedField.type === 'rate'"
                v-model="selectedField.props.defaultValue"
                :max="selectedField.props.max"
              />
              <el-slider
                v-else-if="selectedField.type === 'slider'"
                v-model="selectedField.props.defaultValue"
                :min="selectedField.props.min"
                :max="selectedField.props.max"
                :step="selectedField.props.step"
              />
              <el-color-picker
                v-else-if="selectedField.type === 'color'"
                v-model="selectedField.props.defaultValue"
              />
              <el-input
                v-else
                v-model="selectedField.props.defaultValue"
                placeholder="默认值"
              />
            </el-form-item>

            <!-- Checkbox default value (array) -->
            <el-form-item v-if="selectedField.type === 'checkbox'" label="默认值">
              <el-checkbox-group v-model="selectedField.props.defaultValue">
                <el-checkbox
                  v-for="opt in selectedField.props.options"
                  :key="opt.value"
                  :label="opt.value"
                >
                  {{ opt.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </div>

        <!-- Type-specific properties -->
        <div class="prop-section" v-if="hasSpecificProps">
          <div class="section-title">高级属性</div>
          <el-form label-position="top" size="small">
            <!-- Input: maxlength, showPassword -->
            <template v-if="selectedField.type === 'input'">
              <el-form-item label="最大长度">
                <el-input-number v-model="selectedField.props.maxlength" :min="0" :max="9999" controls-position="right" style="width: 100%" />
              </el-form-item>
              <el-form-item label="密码模式">
                <el-switch v-model="selectedField.props.showPassword" />
              </el-form-item>
            </template>

            <!-- Textarea: rows, maxlength, showWordLimit -->
            <template v-if="selectedField.type === 'textarea'">
              <el-form-item label="行数">
                <el-input-number v-model="selectedField.props.rows" :min="1" :max="20" controls-position="right" style="width: 100%" />
              </el-form-item>
              <el-form-item label="最大长度">
                <el-input-number v-model="selectedField.props.maxlength" :min="0" :max="9999" controls-position="right" style="width: 100%" />
              </el-form-item>
              <el-form-item label="显示字数统计">
                <el-switch v-model="selectedField.props.showWordLimit" />
              </el-form-item>
            </template>

            <!-- Number: min, max, step, precision -->
            <template v-if="selectedField.type === 'number'">
              <el-form-item label="最小值">
                <el-input-number v-model="selectedField.props.min" controls-position="right" style="width: 100%" />
              </el-form-item>
              <el-form-item label="最大值">
                <el-input-number v-model="selectedField.props.max" controls-position="right" style="width: 100%" />
              </el-form-item>
              <el-form-item label="步长">
                <el-input-number v-model="selectedField.props.step" :min="0" :step="0.1" controls-position="right" style="width: 100%" />
              </el-form-item>
              <el-form-item label="精度">
                <el-input-number v-model="selectedField.props.precision" :min="0" :max="10" controls-position="right" style="width: 100%" />
              </el-form-item>
            </template>

            <!-- Select: multiple, clearable, filterable, options -->
            <template v-if="selectedField.type === 'select'">
              <el-form-item label="多选">
                <el-switch v-model="selectedField.props.multiple" />
              </el-form-item>
              <el-form-item label="可清空">
                <el-switch v-model="selectedField.props.clearable" />
              </el-form-item>
              <el-form-item label="可搜索">
                <el-switch v-model="selectedField.props.filterable" />
              </el-form-item>
              <el-form-item label="选项列表">
                <div class="options-editor">
                  <div v-for="(opt, idx) in selectedField.props.options" :key="idx" class="option-row">
                    <el-input v-model="opt.label" placeholder="显示名" size="small" />
                    <el-input v-model="opt.value" placeholder="值" size="small" />
                    <el-button size="small" type="danger" :icon="Delete" circle @click="removeOption(idx)" />
                  </div>
                  <el-button size="small" type="primary" plain @click="addOption">
                    <el-icon><Plus /></el-icon> 添加选项
                  </el-button>
                </div>
              </el-form-item>
            </template>

            <!-- Radio: inline, options -->
            <template v-if="selectedField.type === 'radio'">
              <el-form-item label="行内排列">
                <el-switch v-model="selectedField.props.inline" />
              </el-form-item>
              <el-form-item label="选项列表">
                <div class="options-editor">
                  <div v-for="(opt, idx) in selectedField.props.options" :key="idx" class="option-row">
                    <el-input v-model="opt.label" placeholder="显示名" size="small" />
                    <el-input v-model="opt.value" placeholder="值" size="small" />
                    <el-button size="small" type="danger" :icon="Delete" circle @click="removeOption(idx)" />
                  </div>
                  <el-button size="small" type="primary" plain @click="addOption">
                    <el-icon><Plus /></el-icon> 添加选项
                  </el-button>
                </div>
              </el-form-item>
            </template>

            <!-- Checkbox: inline, min, max, options -->
            <template v-if="selectedField.type === 'checkbox'">
              <el-form-item label="行内排列">
                <el-switch v-model="selectedField.props.inline" />
              </el-form-item>
              <el-form-item label="最小可选">
                <el-input-number v-model="selectedField.props.min" :min="0" controls-position="right" style="width: 100%" />
              </el-form-item>
              <el-form-item label="最大可选">
                <el-input-number v-model="selectedField.props.max" :min="0" controls-position="right" style="width: 100%" />
              </el-form-item>
              <el-form-item label="选项列表">
                <div class="options-editor">
                  <div v-for="(opt, idx) in selectedField.props.options" :key="idx" class="option-row">
                    <el-input v-model="opt.label" placeholder="显示名" size="small" />
                    <el-input v-model="opt.value" placeholder="值" size="small" />
                    <el-button size="small" type="danger" :icon="Delete" circle @click="removeOption(idx)" />
                  </div>
                  <el-button size="small" type="primary" plain @click="addOption">
                    <el-icon><Plus /></el-icon> 添加选项
                  </el-button>
                </div>
              </el-form-item>
            </template>

            <!-- Switch: active/inactive text -->
            <template v-if="selectedField.type === 'switch'">
              <el-form-item label="开启文字">
                <el-input v-model="selectedField.props.activeText" />
              </el-form-item>
              <el-form-item label="关闭文字">
                <el-input v-model="selectedField.props.inactiveText" />
              </el-form-item>
            </template>

            <!-- Date: type, format -->
            <template v-if="selectedField.type === 'date'">
              <el-form-item label="选择类型">
                <el-select v-model="selectedField.props.type">
                  <el-option label="日期" value="date" />
                  <el-option label="周" value="week" />
                  <el-option label="月份" value="month" />
                  <el-option label="年份" value="year" />
                  <el-option label="多日期" value="dates" />
                </el-select>
              </el-form-item>
              <el-form-item label="显示格式">
                <el-input v-model="selectedField.props.format" placeholder="YYYY-MM-DD" />
              </el-form-item>
              <el-form-item label="值格式">
                <el-input v-model="selectedField.props.valueFormat" placeholder="YYYY-MM-DD" />
              </el-form-item>
            </template>

            <!-- Time: format -->
            <template v-if="selectedField.type === 'time'">
              <el-form-item label="显示格式">
                <el-input v-model="selectedField.props.format" placeholder="HH:mm:ss" />
              </el-form-item>
              <el-form-item label="值格式">
                <el-input v-model="selectedField.props.valueFormat" placeholder="HH:mm:ss" />
              </el-form-item>
            </template>

            <!-- Rate: max, allowHalf, showText -->
            <template v-if="selectedField.type === 'rate'">
              <el-form-item label="最大分值">
                <el-input-number v-model="selectedField.props.max" :min="1" :max="10" controls-position="right" style="width: 100%" />
              </el-form-item>
              <el-form-item label="低分阈值">
                <el-input-number v-model="selectedField.props.lowThreshold" :min="1" :max="selectedField.props.max" controls-position="right" style="width: 100%" />
              </el-form-item>
              <el-form-item label="高分阈值">
                <el-input-number v-model="selectedField.props.highThreshold" :min="1" :max="selectedField.props.max" controls-position="right" style="width: 100%" />
              </el-form-item>
              <el-form-item label="允许半选">
                <el-switch v-model="selectedField.props.allowHalf" />
              </el-form-item>
              <el-form-item label="显示文本">
                <el-switch v-model="selectedField.props.showText" />
              </el-form-item>
            </template>

            <!-- Slider: min, max, step, showInput -->
            <template v-if="selectedField.type === 'slider'">
              <el-form-item label="最小值">
                <el-input-number v-model="selectedField.props.min" controls-position="right" style="width: 100%" />
              </el-form-item>
              <el-form-item label="最大值">
                <el-input-number v-model="selectedField.props.max" controls-position="right" style="width: 100%" />
              </el-form-item>
              <el-form-item label="步长">
                <el-input-number v-model="selectedField.props.step" :min="0.1" :step="0.1" controls-position="right" style="width: 100%" />
              </el-form-item>
              <el-form-item label="显示输入框">
                <el-switch v-model="selectedField.props.showInput" />
              </el-form-item>
              <el-form-item label="范围模式">
                <el-switch v-model="selectedField.props.range" />
              </el-form-item>
            </template>

            <!-- Color: showAlpha -->
            <template v-if="selectedField.type === 'color'">
              <el-form-item label="支持透明度">
                <el-switch v-model="selectedField.props.showAlpha" />
              </el-form-item>
            </template>

            <!-- Divider: title, borderStyle, contentPosition -->
            <template v-if="selectedField.type === 'divider'">
              <el-form-item label="标题文本">
                <el-input v-model="selectedField.props.title" placeholder="分割线标题" />
              </el-form-item>
              <el-form-item label="边框样式">
                <el-select v-model="selectedField.props.borderStyle">
                  <el-option label="实线 (solid)" value="solid" />
                  <el-option label="虚线 (dashed)" value="dashed" />
                  <el-option label="点线 (dotted)" value="dotted" />
                </el-select>
              </el-form-item>
              <el-form-item label="内容位置">
                <el-select v-model="selectedField.props.contentPosition">
                  <el-option label="居左" value="left" />
                  <el-option label="居中" value="center" />
                  <el-option label="居右" value="right" />
                </el-select>
              </el-form-item>
            </template>

            <!-- Button: text, type, size -->
            <template v-if="selectedField.type === 'button'">
              <el-form-item label="按钮文字">
                <el-input v-model="selectedField.props.text" />
              </el-form-item>
              <el-form-item label="按钮类型">
                <el-select v-model="selectedField.props.type">
                  <el-option label="默认" value="default" />
                  <el-option label="主要" value="primary" />
                  <el-option label="成功" value="success" />
                  <el-option label="警告" value="warning" />
                  <el-option label="危险" value="danger" />
                  <el-option label="信息" value="info" />
                </el-select>
              </el-form-item>
              <el-form-item label="按钮尺寸">
                <el-select v-model="selectedField.props.size">
                  <el-option label="大" value="large" />
                  <el-option label="默认" value="default" />
                  <el-option label="小" value="small" />
                </el-select>
              </el-form-item>
            </template>
          </el-form>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { Delete, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useFormStore } from '../stores/formStore.js'
import { typeLabels } from '../utils/formConfig.js'

const {
  state, selectedField, selectedRow, clearForm,
  updateFieldSpan, addField, removeRow
} = useFormStore()

const propsWithMap = {
  placeholder: ['input', 'textarea', 'number', 'select', 'date', 'time'],
  defaultValue: ['input', 'textarea', 'number', 'select', 'radio', 'checkbox', 'switch', 'date', 'time', 'rate', 'slider', 'color']
}

function hasProp(propName) {
  return (propsWithMap[propName] || []).includes(selectedField.value?.type)
}

const hasSpecificProps = computed(() => {
  return !!selectedField.value
})

const fieldCount = computed(() =>
  state.rows.reduce((n, r) => n + r.fields.length, 0)
)

const justifyLabels = {
  start: '左对齐',
  center: '居中',
  end: '右对齐',
  'space-around': '均匀分布',
  'space-between': '两端对齐',
  'space-evenly': '等距分布'
}

const rowJustifyActive = computed(() => {
  if (!selectedRow.value) return false
  const total = selectedRow.value.fields.reduce((s, f) => s + (f.span || 0), 0)
  return total < 24
})

const panelTitle = computed(() => {
  if (selectedField.value) return '组件属性'
  if (selectedRow.value) return '行属性'
  return '表单属性'
})

// ── Span editor ──
const currentSpan = computed({
  get: () => selectedField.value?.span ?? 24,
  set: (val) => {
    if (selectedField.value && selectedRow.value) {
      updateFieldSpan(selectedRow.value.id, selectedField.value.id, val)
    }
  }
})

function getFieldRow() {
  if (!selectedField.value) return null
  return state.rows.find(r =>
    r.fields.some(f => f.id === selectedField.value?.id)
  ) || null
}

const rowRemainingSpan = computed(() => {
  const row = getFieldRow()
  if (!row) return 24
  const otherFieldsTotal = row.fields
    .filter(f => f.id !== selectedField.value?.id)
    .reduce((s, f) => s + (f.span || 0), 0)
  return 24 - otherFieldsTotal - (selectedField.value?.span || 0)
})

const rowSpanStatus = computed(() => {
  if (!selectedRow.value) return { type: 'info', text: '' }
  const total = selectedRow.value.fields.reduce((s, f) => s + (f.span || 0), 0)
  if (total === 24) return { type: 'success', text: `正好 24/24 列` }
  if (total < 24) return { type: 'warning', text: `已用 ${total}/24 列` }
  return { type: 'danger', text: `超出 ${total - 24} 列！` }
})

const spanBarClass = computed(() => {
  if (!selectedRow.value) return ''
  const remaining = rowRemainingSpan.value
  if (remaining < 0) return 'span-over'
  if (remaining === 0) return 'span-full'
  return 'span-ok'
})

// ── Options editor ──
function addOption() {
  if (!selectedField.value) return
  const idx = selectedField.value.props.options.length + 1
  selectedField.value.props.options.push({ label: `选项${idx}`, value: `option${idx}` })
}

function removeOption(index) {
  if (!selectedField.value) return
  selectedField.value.props.options.splice(index, 1)
}

// ── Import JSON ──
function handleImport(uploadFile) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const { importFromJSON } = useFormStore()
    const success = importFromJSON(e.target.result)
    if (success) {
      ElMessage.success('导入成功')
    } else {
      ElMessage.error('JSON 格式错误')
    }
  }
  reader.readAsText(uploadFile.raw)
}
</script>

<style scoped>
.right-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-left: 1px solid #e4e7ed;
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
  padding: 12px;
}
.prop-section {
  margin-bottom: 8px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #ebeef5;
}
.options-editor {
  width: 100%;
}
.option-row {
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
  align-items: center;
}
.option-row .el-input {
  width: 90px;
}

/* ── Span editor ── */
.span-editor {
  width: 100%;
}
.span-visual {
  display: flex;
  height: 20px;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 6px;
  font-size: 11px;
  line-height: 20px;
  text-align: center;
}
.span-bar {
  background: #409eff;
  color: #fff;
  transition: width 0.2s;
  white-space: nowrap;
  overflow: hidden;
}
.span-bar.span-ok {
  background: #67c23a;
}
.span-bar.span-full {
  background: #409eff;
}
.span-bar.span-over {
  background: #f56c6c;
}
.span-remain {
  background: #f0f2f5;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
}

.row-actions {
  display: flex;
  flex-direction: column;
}

.justify-hint {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.3;
}
</style>
