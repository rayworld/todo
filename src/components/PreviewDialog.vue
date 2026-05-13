<template>
  <div class="preview-container">
    <el-alert
      title="表单预览模式，实际使用时需绑定数据模型和提交逻辑"
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 16px"
    />
    <el-form
      ref="previewFormRef"
      :model="formData"
      label-width="120px"
      label-position="right"
      size="default"
    >
      <!-- Render each row as el-row with el-col -->
      <div v-for="(row, ri) in state.rows" :key="row.id" class="preview-row">
        <el-row :gutter="16" :justify="row.justify || 'start'">
          <el-col
            v-for="field in row.fields"
            :key="field.id"
            :span="field.span"
          >
            <el-form-item
              :label="field.props.label"
              :required="field.props.required"
              :prop="field.props.model"
              :rules="getRules(field)"
            >
              <!-- Input -->
              <el-input
                v-if="field.type === 'input'"
                v-model="formData[field.props.model]"
                :placeholder="field.props.placeholder"
                :disabled="field.props.disabled"
                :readonly="field.props.readonly"
                :maxlength="field.props.maxlength"
                :show-password="field.props.showPassword"
                style="width: 100%"
              />

              <!-- Textarea -->
              <el-input
                v-else-if="field.type === 'textarea'"
                v-model="formData[field.props.model]"
                type="textarea"
                :placeholder="field.props.placeholder"
                :disabled="field.props.disabled"
                :readonly="field.props.readonly"
                :rows="field.props.rows"
                :maxlength="field.props.maxlength"
                :show-word-limit="field.props.showWordLimit"
                style="width: 100%"
              />

              <!-- Number -->
              <el-input-number
                v-else-if="field.type === 'number'"
                v-model="formData[field.props.model]"
                :placeholder="field.props.placeholder"
                :disabled="field.props.disabled"
                :min="field.props.min"
                :max="field.props.max"
                :step="field.props.step"
                :precision="field.props.precision"
                controls-position="right"
                style="width: 100%"
              />

              <!-- Select -->
              <el-select
                v-else-if="field.type === 'select'"
                v-model="formData[field.props.model]"
                :placeholder="field.props.placeholder"
                :disabled="field.props.disabled"
                :multiple="field.props.multiple"
                :clearable="field.props.clearable"
                :filterable="field.props.filterable"
                style="width: 100%"
              >
                <el-option
                  v-for="opt in field.props.options"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>

              <!-- Radio -->
              <el-radio-group
                v-else-if="field.type === 'radio'"
                v-model="formData[field.props.model]"
                :disabled="field.props.disabled"
              >
                <el-radio
                  v-for="opt in field.props.options"
                  :key="opt.value"
                  :value="opt.value"
                  :style="field.props.inline ? {} : { display: 'block', marginBottom: '8px' }"
                >
                  {{ opt.label }}
                </el-radio>
              </el-radio-group>

              <!-- Checkbox -->
              <el-checkbox-group
                v-else-if="field.type === 'checkbox'"
                v-model="formData[field.props.model]"
                :disabled="field.props.disabled"
                :min="field.props.min"
                :max="field.props.max"
              >
                <el-checkbox
                  v-for="opt in field.props.options"
                  :key="opt.value"
                  :label="opt.value"
                  :style="field.props.inline ? {} : { display: 'block', marginBottom: '8px' }"
                >
                  {{ opt.label }}
                </el-checkbox>
              </el-checkbox-group>

              <!-- Switch -->
              <el-switch
                v-else-if="field.type === 'switch'"
                v-model="formData[field.props.model]"
                :disabled="field.props.disabled"
                :active-text="field.props.activeText"
                :inactive-text="field.props.inactiveText"
                :active-value="field.props.activeValue"
                :inactive-value="field.props.inactiveValue"
              />

              <!-- Date -->
              <el-date-picker
                v-else-if="field.type === 'date'"
                v-model="formData[field.props.model]"
                :type="field.props.type"
                :placeholder="field.props.placeholder"
                :disabled="field.props.disabled"
                :format="field.props.format"
                :value-format="field.props.valueFormat"
                :clearable="field.props.clearable"
                style="width: 100%"
              />

              <!-- Time -->
              <el-time-picker
                v-else-if="field.type === 'time'"
                v-model="formData[field.props.model]"
                :placeholder="field.props.placeholder"
                :disabled="field.props.disabled"
                :format="field.props.format"
                :value-format="field.props.valueFormat"
                :clearable="field.props.clearable"
                style="width: 100%"
              />

              <!-- Rate -->
              <el-rate
                v-else-if="field.type === 'rate'"
                v-model="formData[field.props.model]"
                :max="field.props.max"
                :disabled="field.props.disabled"
                :low-threshold="field.props.lowThreshold"
                :high-threshold="field.props.highThreshold"
                :allow-half="field.props.allowHalf"
                :show-text="field.props.showText"
              />

              <!-- Slider -->
              <el-slider
                v-else-if="field.type === 'slider'"
                v-model="formData[field.props.model]"
                :min="field.props.min"
                :max="field.props.max"
                :step="field.props.step"
                :disabled="field.props.disabled"
                :show-input="field.props.showInput"
                :range="field.props.range"
                style="width: 100%"
              />

              <!-- Color -->
              <el-color-picker
                v-else-if="field.type === 'color'"
                v-model="formData[field.props.model]"
                :disabled="field.props.disabled"
                :show-alpha="field.props.showAlpha"
              />

              <!-- Divider -->
              <el-divider
                v-else-if="field.type === 'divider'"
                :content-position="field.props.contentPosition"
                :border-style="field.props.borderStyle"
              >
                {{ field.props.title || field.props.label }}
              </el-divider>

              <!-- Button -->
              <el-button
                v-else-if="field.type === 'button'"
                :type="field.props.type"
                :size="field.props.size"
                :disabled="field.props.disabled"
                :icon="field.props.icon || undefined"
              >
                {{ field.props.text }}
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>

    <div style="margin-top: 20px; display: flex; gap: 12px;">
      <el-button type="primary" @click="submitForm">提交</el-button>
      <el-button @click="resetForm">重置</el-button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useFormStore } from '../stores/formStore.js'

const { state } = useFormStore()
const previewFormRef = ref(null)
const formData = reactive({})

function initFormData() {
  Object.keys(formData).forEach(k => { delete formData[k] })
  state.rows.forEach(row => {
    row.fields.forEach(field => {
      if (field.type === 'divider' || field.type === 'button') return
      const model = field.props.model
      if (field.type === 'checkbox') {
        formData[model] = Array.isArray(field.props.defaultValue) ? [...field.props.defaultValue] : []
      } else if (field.type === 'switch') {
        formData[model] = field.props.defaultValue ?? false
      } else if (field.type === 'number') {
        formData[model] = field.props.defaultValue ?? null
      } else if (field.type === 'rate' || field.type === 'slider') {
        formData[model] = field.props.defaultValue ?? 0
      } else {
        formData[model] = field.props.defaultValue ?? ''
      }
    })
  })
}

// Watch for field changes
watch(() => state.rows.map(r => r.fields.map(f => f.id).join(',')).join('|'), initFormData, { immediate: true })

function getRules(field) {
  const rules = []
  if (field.props.required) {
    rules.push({ required: true, message: `${field.props.label}不能为空`, trigger: 'blur' })
  }
  return rules.length ? rules : undefined
}

function submitForm() {
  if (!previewFormRef.value) return
  previewFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('✅ 校验通过！表单数据：' + JSON.stringify(formData, null, 2))
    } else {
      ElMessage.error('❌ 校验失败，请检查表单')
    }
  })
}

function resetForm() {
  if (!previewFormRef.value) return
  previewFormRef.value.resetFields()
}
</script>

<style scoped>
.preview-container {
  max-height: 70vh;
  overflow-y: auto;
  padding: 4px 0;
}
.preview-row {
  margin-bottom: 4px;
}
</style>
