import { reactive, computed } from 'vue'
import { generateId, generateRowId, getDefaultProps, typeLabels } from '../utils/formConfig.js'

const state = reactive({
  formTitle: '未命名表单',
  rows: [],
  selectedFieldId: null,
  selectedRowId: null,
  previewVisible: false,
  jsonVisible: false,
  generatedJSON: ''
})

function createField(type, span) {
  const id = generateId()
  const props = getDefaultProps(type)
  const existingCount = state.rows.reduce((count, row) =>
    count + row.fields.filter(f => f.type === type).length, 0
  )
  props.model = `${type}_${existingCount + 1}`
  return { id, type, span: span ?? 24, props }
}

function createRow() {
  return { id: generateRowId(), fields: [], justify: 'start' }
}

// ── Row operations ──

function addRow(index) {
  const row = createRow()
  if (index !== null && index >= 0 && index <= state.rows.length) {
    state.rows.splice(index, 0, row)
  } else {
    state.rows.push(row)
  }
  selectRow(row.id)
  return row
}

function removeRow(rowId) {
  const rowIdx = state.rows.findIndex(r => r.id === rowId)
  if (rowIdx === -1) return
  state.rows.splice(rowIdx, 1)
  if (state.selectedRowId === rowId) {
    state.selectedRowId = state.rows.length > 0
      ? state.rows[Math.min(rowIdx, state.rows.length - 1)].id
      : null
  }
  if (state.selectedFieldId) {
    // Check if the selected field is still in a row
    const stillExists = state.rows.some(r =>
      r.fields.some(f => f.id === state.selectedFieldId)
    )
    if (!stillExists) state.selectedFieldId = null
  }
}

function reorderRows(newRows) {
  state.rows.splice(0, state.rows.length, ...newRows)
}

function selectRow(rowId) {
  state.selectedRowId = rowId
}

// ── Field operations ──

function findRow(fieldId) {
  return state.rows.find(r => r.fields.some(f => f.id === fieldId)) || null
}

function findRowIndex(fieldId) {
  return state.rows.findIndex(r => r.fields.some(f => f.id === fieldId))
}

function addField(type, rowId, index) {
  const row = state.rows.find(r => r.id === rowId)
  if (!row) return null
  const field = createField(type, 24)
  // Calculate span: if other fields exist, evenly split
  const count = row.fields.length
  if (count > 0) {
    field.span = Math.floor(24 / (count + 1))
    // Redistribute spans
    const each = Math.floor(24 / (count + 1))
    row.fields.forEach(f => { f.span = each })
    const total = each * (count + 1)
    // Give remainder to last field
    if (total < 24) {
      row.fields[row.fields.length > 0 ? row.fields.length - 1 : 0].span += (24 - total)
    }
  }
  if (index !== null && index >= 0 && index <= row.fields.length) {
    row.fields.splice(index, 0, field)
  } else {
    row.fields.push(field)
  }
  selectField(field.id)
  return field
}

function removeField(rowId, fieldId) {
  const row = state.rows.find(r => r.id === rowId)
  if (!row) return
  const idx = row.fields.findIndex(f => f.id === fieldId)
  if (idx === -1) return
  row.fields.splice(idx, 1)
  if (state.selectedFieldId === fieldId) {
    state.selectedFieldId = row.fields.length > 0
      ? row.fields[Math.min(idx, row.fields.length - 1)].id
      : null
  }
  // Redistribute spans in the row if fields remain
  if (row.fields.length > 0) {
    const each = Math.floor(24 / row.fields.length)
    row.fields.forEach(f => { f.span = each })
    const total = each * row.fields.length
    if (total < 24) {
      row.fields[row.fields.length - 1].span += (24 - total)
    }
  }
}

function selectField(id) {
  state.selectedFieldId = id
  if (id) {
    const row = findRow(id)
    if (row) state.selectedRowId = row.id
  }
}

const selectedField = computed(() => {
  if (!state.selectedFieldId) return null
  for (const row of state.rows) {
    const field = row.fields.find(f => f.id === state.selectedFieldId)
    if (field) return field
  }
  return null
})

const selectedRow = computed(() => {
  if (!state.selectedRowId) return null
  return state.rows.find(r => r.id === state.selectedRowId) || null
})

function updateFieldProps(rowId, fieldId, props) {
  const row = state.rows.find(r => r.id === rowId)
  if (!row) return
  const field = row.fields.find(f => f.id === fieldId)
  if (field) {
    Object.assign(field.props, props)
  }
}

function updateFieldSpan(rowId, fieldId, span) {
  const row = state.rows.find(r => r.id === rowId)
  if (!row) return
  const field = row.fields.find(f => f.id === fieldId)
  if (field) {
    field.span = Math.max(1, Math.min(24, span))
  }
}

function reorderRowFields(rowId, newFields) {
  const row = state.rows.find(r => r.id === rowId)
  if (row) {
    row.fields.splice(0, row.fields.length, ...newFields)
  }
}

function copyField(rowId, fieldId) {
  const row = state.rows.find(r => r.id === rowId)
  if (!row) return
  const field = row.fields.find(f => f.id === fieldId)
  if (!field) return
  const newField = JSON.parse(JSON.stringify(field))
  newField.id = generateId()
  newField.props.model = `${field.props.model}_copy`
  const idx = row.fields.findIndex(f => f.id === fieldId)
  row.fields.splice(idx + 1, 0, newField)
  selectField(newField.id)
  // Redistribute
  const each = Math.floor(24 / row.fields.length)
  row.fields.forEach(f => { f.span = each })
  const total = each * row.fields.length
  if (total < 24) {
    row.fields[row.fields.length - 1].span += (24 - total)
  }
}

function moveFieldToRow(fieldId, targetRowId, targetIndex) {
  const sourceRowIdx = findRowIndex(fieldId)
  if (sourceRowIdx === -1) return
  const sourceRow = state.rows[sourceRowIdx]
  const fieldIdx = sourceRow.fields.findIndex(f => f.id === fieldId)
  if (fieldIdx === -1) return
  const [field] = sourceRow.fields.splice(fieldIdx, 1)
  field.span = 24
  const targetRow = state.rows.find(r => r.id === targetRowId)
  if (!targetRow) return
  if (targetIndex !== null && targetIndex >= 0 && targetIndex <= targetRow.fields.length) {
    targetRow.fields.splice(targetIndex, 0, field)
  } else {
    targetRow.fields.push(field)
  }
  selectField(field.id)
  // Redistribute spans in both rows
  if (sourceRow.fields.length > 0) {
    const each = Math.floor(24 / sourceRow.fields.length)
    sourceRow.fields.forEach(f => { f.span = each })
    const total = each * sourceRow.fields.length
    if (total < 24) sourceRow.fields[sourceRow.fields.length - 1].span += (24 - total)
  }
  if (targetRow.fields.length > 0) {
    const each = Math.floor(24 / targetRow.fields.length)
    targetRow.fields.forEach(f => { f.span = each })
    const total = each * targetRow.fields.length
    if (total < 24) targetRow.fields[targetRow.fields.length - 1].span += (24 - total)
  }
}

// ── JSON operations ──

function generateJSON() {
  return JSON.stringify({
    title: state.formTitle,
    rows: state.rows.map(row => ({
      id: row.id,
      justify: row.justify || 'start',
      fields: row.fields.map(f => ({
        id: f.id,
        type: f.type,
        span: f.span,
        props: JSON.parse(JSON.stringify(f.props))
      }))
    }))
  }, null, 2)
}

function showJSON() {
  state.generatedJSON = generateJSON()
  state.jsonVisible = true
}

function saveToFile() {
  const json = generateJSON()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${state.formTitle || 'form'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importFromJSON(jsonStr) {
  try {
    const data = JSON.parse(jsonStr)
    state.formTitle = data.title || '未命名表单'
    state.rows.splice(0, state.rows.length)
    if (data.rows && Array.isArray(data.rows)) {
      data.rows.forEach(row => {
        const newRow = { id: row.id || generateRowId(), fields: [], justify: row.justify || 'start' }
        if (row.fields && Array.isArray(row.fields)) {
          row.fields.forEach(f => {
            newRow.fields.push({
              id: f.id || generateId(),
              type: f.type || 'input',
              span: f.span ?? 24,
              props: f.props || {}
            })
          })
        }
        state.rows.push(newRow)
      })
    } else if (data.fields && Array.isArray(data.fields)) {
      // Legacy flat fields support
      const row = createRow()
      data.fields.forEach(f => {
        row.fields.push({
          id: f.id || generateId(),
          type: f.type || 'input',
          span: f.span ?? 24,
          props: f.props || {}
        })
      })
      state.rows.push(row)
    }
    state.selectedFieldId = null
    state.selectedRowId = null
    return true
  } catch {
    return false
  }
}

function clearForm() {
  state.rows.splice(0, state.rows.length)
  state.selectedFieldId = null
  state.selectedRowId = null
}

export function useFormStore() {
  return {
    state,
    selectedField,
    selectedRow,
    // Row
    addRow,
    removeRow,
    reorderRows,
    selectRow,
    // Field
    addField,
    removeField,
    selectField,
    updateFieldProps,
    updateFieldSpan,
    reorderRowFields,
    copyField,
    moveFieldToRow,
    findRow,
    // JSON
    generateJSON,
    showJSON,
    saveToFile,
    importFromJSON,
    clearForm
  }
}
