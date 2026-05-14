# Copilot Instructions for AI Agents

## 项目架构概览
- 本项目为基于 Vue 3 + Element Plus 的低代码表单设计器，采用前端单页应用（SPA）架构。
- 主要目录结构：
  - `src/components/`：核心 UI 组件（如 LeftPanel、CenterPanel、RightPanel、FieldRenderer、PreviewDialog），分别对应左侧组件区、中间设计区、右侧属性区、字段渲染、预览弹窗。
  - `src/stores/formStore.js`：全局表单状态管理，包含表单结构、行/字段的增删改查、JSON 导入导出等逻辑。
  - `src/utils/formConfig.js`：表单组件类型、默认属性、分类、palette 配置等元数据。
  - `src/main.js`：应用入口，注册 Element Plus 及其图标。

## 主要开发约定
- 所有表单字段类型、属性、palette 配置均集中在 `formConfig.js`，如需扩展新组件类型，需同步维护此文件。
- 组件间通过 props 传递数据，状态变更统一通过 `formStore.js` 提供的 API 操作。
- 拖拽排序依赖 `vuedraggable`，行/字段的顺序变更需调用 `reorderRows`、`reorderRowFields` 等方法。
- 设计区（CenterPanel）和属性区（RightPanel）均通过 `useFormStore()` 获取和操作全局状态。
- 预览区（PreviewDialog）为只读渲染，实际表单提交逻辑需在业务集成时实现。

## 构建与运行
- 开发环境启动：`npm run dev`（默认端口 3000，见 `vite.config.js`）
- 构建生产包：`npm run build`
- 本地预览：`npm run preview`
- 无测试脚本，调试以页面交互为主。

## 关键模式与注意事项
- 行（row）为表单的布局单元，每行可包含多个字段（field），字段宽度通过 `span`（1-24）控制，自动均分。
- 字段属性（如 label、placeholder、options 等）均存储于 `props`，右侧属性面板动态渲染。
- 支持 JSON 导入导出，结构见 `generateJSON`/`importFromJSON`，兼容旧版 flat fields。
- 拖拽/复制/移动字段时需同步更新 span，保持总宽度为 24。
- 组件样式采用 scoped CSS，部分 Element Plus 样式通过 `:deep` 定制。

## 外部依赖
- Vue 3、Element Plus、@element-plus/icons-vue、vuedraggable、sortablejs
- 构建工具：Vite

## 示例：扩展新字段类型
1. 在 `formConfig.js` 增加类型定义、默认属性、palette 配置。
2. 在 `FieldRenderer.vue`、`PreviewDialog.vue` 增加渲染分支。
3. 在 `RightPanel.vue` 增加属性编辑 UI（如有特定属性）。

---
如遇不明确的结构或约定，请优先查阅 `formStore.js` 和 `formConfig.js`，并参考现有组件实现。