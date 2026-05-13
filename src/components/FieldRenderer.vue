<template>
  <div class="field-renderer" :class="{ compact }">
    <el-form-item :label="compact ? '' : field.props.label" :required="compact ? false : field.props.required">
      <!-- Input -->
      <el-input
        v-if="field.type === 'input'"
        :placeholder="field.props.placeholder"
        :disabled="field.props.disabled"
        :maxlength="field.props.maxlength"
        :model-value="field.props.defaultValue"
        :style="{ width: field.props.width, minWidth: compact ? '60px' : '' }"
        :size="compact ? 'small' : 'small'"
      />

      <!-- Textarea -->
      <el-input
        v-else-if="field.type === 'textarea'"
        type="textarea"
        :placeholder="field.props.placeholder"
        :disabled="field.props.disabled"
        :rows="field.props.rows"
        :maxlength="field.props.maxlength"
        :model-value="field.props.defaultValue"
        :style="{ width: field.props.width }"
      />

      <!-- Number -->
      <el-input-number
        v-else-if="field.type === 'number'"
        :min="field.props.min"
        :max="field.props.max"
        :step="field.props.step"
        :precision="field.props.precision"
        :disabled="field.props.disabled"
        :model-value="field.props.defaultValue"
        :style="{ width: field.props.width }"
        size="small"
        controls-position="right"
      />

      <!-- Select -->
      <el-select
        v-else-if="field.type === 'select'"
        :placeholder="field.props.placeholder"
        :disabled="field.props.disabled"
        :multiple="field.props.multiple"
        :clearable="field.props.clearable"
        :filterable="field.props.filterable"
        :model-value="field.props.multiple ? [] : ''"
        :style="{ width: field.props.width }"
        size="small"
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
        :disabled="field.props.disabled"
        :model-value="field.props.defaultValue"
      >
        <el-radio
          v-for="opt in field.props.options"
          :key="opt.value"
          :value="opt.value"
          :style="field.props.inline ? '' : { display: 'block', marginBottom: '6px' }"
        >
          {{ opt.label }}
        </el-radio>
      </el-radio-group>

      <!-- Checkbox -->
      <el-checkbox-group
        v-else-if="field.type === 'checkbox'"
        :disabled="field.props.disabled"
        :min="field.props.min"
        :max="field.props.max"
        :model-value="field.props.defaultValue"
      >
        <el-checkbox
          v-for="opt in field.props.options"
          :key="opt.value"
          :label="opt.value"
          :style="field.props.inline ? '' : { display: 'block', marginBottom: '6px' }"
        >
          {{ opt.label }}
        </el-checkbox>
      </el-checkbox-group>

      <!-- Switch -->
      <el-switch
        v-else-if="field.type === 'switch'"
        :disabled="field.props.disabled"
        :active-text="field.props.activeText"
        :inactive-text="field.props.inactiveText"
        :active-value="field.props.activeValue"
        :inactive-value="field.props.inactiveValue"
        :model-value="field.props.defaultValue"
      />

      <!-- Date -->
      <el-date-picker
        v-else-if="field.type === 'date'"
        :type="field.props.type"
        :placeholder="field.props.placeholder"
        :disabled="field.props.disabled"
        :format="field.props.format"
        :value-format="field.props.valueFormat"
        :clearable="field.props.clearable"
        :model-value="field.props.defaultValue || null"
        :style="{ width: field.props.width }"
        size="small"
      />

      <!-- Time -->
      <el-time-picker
        v-else-if="field.type === 'time'"
        :placeholder="field.props.placeholder"
        :disabled="field.props.disabled"
        :format="field.props.format"
        :value-format="field.props.valueFormat"
        :clearable="field.props.clearable"
        :model-value="field.props.defaultValue || null"
        :style="{ width: field.props.width }"
        size="small"
      />

      <!-- Rate -->
      <el-rate
        v-else-if="field.type === 'rate'"
        :max="field.props.max"
        :disabled="field.props.disabled"
        :low-threshold="field.props.lowThreshold"
        :high-threshold="field.props.highThreshold"
        :allow-half="field.props.allowHalf"
        :show-text="field.props.showText"
        :model-value="field.props.defaultValue"
      />

      <!-- Slider -->
      <el-slider
        v-else-if="field.type === 'slider'"
        :min="field.props.min"
        :max="field.props.max"
        :step="field.props.step"
        :disabled="field.props.disabled"
        :show-input="field.props.showInput"
        :range="field.props.range"
        :model-value="field.props.range ? [field.props.min, field.props.max] : field.props.defaultValue"
        :style="{ width: field.props.width }"
      />

      <!-- Color -->
      <el-color-picker
        v-else-if="field.type === 'color'"
        :disabled="field.props.disabled"
        :show-alpha="field.props.showAlpha"
        :model-value="field.props.defaultValue"
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
  </div>
</template>

<script setup>
defineProps({
  field: { type: Object, required: true },
  index: { type: Number, default: 0 },
  compact: { type: Boolean, default: false }
})
</script>

<style scoped>
.field-renderer {
  width: 100%;
}
.field-renderer.compact {
  font-size: 12px;
}
.field-renderer :deep(.el-form-item) {
  margin-bottom: 0;
}
.field-renderer :deep(.el-form-item__label) {
  font-size: 13px;
  color: #606266;
  padding-bottom: 0;
}
.field-renderer.compact :deep(.el-form-item) {
  margin-bottom: 0;
}
.field-renderer.compact :deep(.el-form-item__label) {
  font-size: 11px;
  height: auto;
  line-height: 1.3;
  padding-bottom: 0;
  color: #606266;
}
.field-renderer :deep(.el-slider) {
  padding: 0 8px;
}
.field-renderer.compact :deep(.el-slider) {
  padding: 0 4px;
}
.field-renderer.compact :deep(.el-rate) {
  line-height: 1;
}
.field-renderer.compact :deep(.el-checkbox),
.field-renderer.compact :deep(.el-radio) {
  margin-right: 8px;
}
</style>
