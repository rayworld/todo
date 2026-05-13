/**
 * Form component definitions for the designer.
 * Each component type defines its default properties and category.
 */

let _idCounter = 0

export function generateId(prefix = 'field') {
  _idCounter++
  return `${prefix}_${Date.now()}_${_idCounter}`
}

export function generateRowId() {
  return generateId('row')
}

export function generateModel(label) {
  // Convert label to camelCase model name
  const cleaned = label.replace(/[^一-龥a-zA-Z0-9]/g, '')
  if (/^[一-龥]/.test(cleaned)) {
    return `field_${_idCounter}`
  }
  return cleaned.charAt(0).toLowerCase() + cleaned.slice(1).replace(/\s+(.)/g, (_, c) => c.toUpperCase())
}

/**
 * Component categories for the left panel group.
 */
export const categories = [
  { key: 'basic', label: '基础组件' },
  { key: 'advanced', label: '高级组件' },
  { key: 'layout', label: '布局组件' }
]

/**
 * Get default field properties for a given component type.
 * When a user drags a component to the design area, these defaults are used.
 */
export function getDefaultProps(type) {
  const defs = {
    input: {
      label: '单行输入',
      placeholder: '请输入',
      required: false,
      disabled: false,
      readonly: false,
      defaultValue: '',
      maxlength: null,
      showPassword: false,
      prefixIcon: '',
      suffixIcon: '',
      width: '100%'
    },
    textarea: {
      label: '多行输入',
      placeholder: '请输入',
      required: false,
      disabled: false,
      readonly: false,
      defaultValue: '',
      maxlength: null,
      rows: 3,
      showWordLimit: false,
      width: '100%'
    },
    number: {
      label: '数字输入',
      placeholder: '请输入数字',
      required: false,
      disabled: false,
      defaultValue: null,
      min: null,
      max: null,
      step: 1,
      precision: 0,
      width: '100%'
    },
    select: {
      label: '下拉选择',
      placeholder: '请选择',
      required: false,
      disabled: false,
      multiple: false,
      clearable: true,
      filterable: false,
      defaultValue: '',
      options: [
        { label: '选项一', value: 'option1' },
        { label: '选项二', value: 'option2' },
        { label: '选项三', value: 'option3' }
      ],
      width: '100%'
    },
    radio: {
      label: '单选框组',
      required: false,
      disabled: false,
      inline: false,
      defaultValue: '',
      options: [
        { label: '选项一', value: 'option1' },
        { label: '选项二', value: 'option2' },
        { label: '选项三', value: 'option3' }
      ],
      width: '100%'
    },
    checkbox: {
      label: '多选框组',
      required: false,
      disabled: false,
      inline: false,
      min: null,
      max: null,
      defaultValue: [],
      options: [
        { label: '选项一', value: 'option1' },
        { label: '选项二', value: 'option2' },
        { label: '选项三', value: 'option3' }
      ],
      width: '100%'
    },
    switch: {
      label: '开关',
      required: false,
      disabled: false,
      defaultValue: false,
      activeText: '开启',
      inactiveText: '关闭',
      activeValue: true,
      inactiveValue: false,
      width: '100%'
    },
    date: {
      label: '日期选择',
      placeholder: '选择日期',
      required: false,
      disabled: false,
      type: 'date', // date, week, month, year, dates
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
      defaultValue: '',
      clearable: true,
      width: '100%'
    },
    time: {
      label: '时间选择',
      placeholder: '选择时间',
      required: false,
      disabled: false,
      format: 'HH:mm:ss',
      valueFormat: 'HH:mm:ss',
      defaultValue: '',
      clearable: true,
      width: '100%'
    },
    rate: {
      label: '评分',
      required: false,
      disabled: false,
      defaultValue: 0,
      max: 5,
      lowThreshold: 2,
      highThreshold: 4,
      allowHalf: false,
      showText: false,
      width: '100%'
    },
    slider: {
      label: '滑块',
      required: false,
      disabled: false,
      defaultValue: 0,
      min: 0,
      max: 100,
      step: 1,
      showInput: false,
      range: false,
      width: '100%'
    },
    color: {
      label: '颜色选择',
      required: false,
      disabled: false,
      defaultValue: '#409EFF',
      showAlpha: false,
      width: '100%'
    },
    divider: {
      label: '分割线',
      title: '',
      borderStyle: 'solid',
      contentPosition: 'center',
      width: '100%'
    },
    button: {
      label: '按钮',
      text: '提交',
      type: 'primary', // primary, success, warning, danger, info
      size: 'default',
      icon: '',
      disabled: false,
      width: '100%'
    }
  }
  return JSON.parse(JSON.stringify(defs[type] || {}))
}

/**
 * The component palette items shown in the left panel.
 */
export const paletteItems = [
  // Basic
  { type: 'input', label: '单行输入', icon: 'Edit', category: 'basic' },
  { type: 'textarea', label: '多行输入', icon: 'Notebook', category: 'basic' },
  { type: 'number', label: '数字输入', icon: 'PlusMinus', category: 'basic' },
  { type: 'select', label: '下拉选择', icon: 'Select', category: 'basic' },
  { type: 'radio', label: '单选框组', icon: 'CircleCheck', category: 'basic' },
  { type: 'checkbox', label: '多选框组', icon: 'Check', category: 'basic' },
  { type: 'switch', label: '开关', icon: 'Switch', category: 'basic' },
  // Advanced
  { type: 'date', label: '日期选择', icon: 'Date', category: 'advanced' },
  { type: 'time', label: '时间选择', icon: 'Timer', category: 'advanced' },
  { type: 'rate', label: '评分', icon: 'Star', category: 'advanced' },
  { type: 'slider', label: '滑块', icon: 'Rank', category: 'advanced' },
  { type: 'color', label: '颜色选择', icon: 'Brush', category: 'advanced' },
  // Layout
  { type: 'divider', label: '分割线', icon: 'Minus', category: 'layout' },
  { type: 'button', label: '按钮', icon: 'Iphone', category: 'layout' }
]

/**
 * Human-readable labels for component types.
 */
export const typeLabels = {
  input: '单行输入',
  textarea: '多行输入',
  number: '数字输入',
  select: '下拉选择',
  radio: '单选框组',
  checkbox: '多选框组',
  switch: '开关',
  date: '日期选择',
  time: '时间选择',
  rate: '评分',
  slider: '滑块',
  color: '颜色选择',
  divider: '分割线',
  button: '按钮'
}
