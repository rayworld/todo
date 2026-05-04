// Kindle TodoList 应用
class KindleTodoList {
    constructor() {
        this.tasks = this.loadTasks();
        this.history = this.loadHistory();
        this.currentFilter = 'all';
        this.currentHistoryDate = '';
        
        this.init();
    }
    
    // 初始化应用
    init() {
        // 设置今天日期
        this.setTodayDate();
        
        // 绑定事件
        this.bindEvents();
        
        // 设置标签页
        this.setupTabs();
        
        // 渲染初始数据
        this.renderTasks();
        this.renderStats();
        this.renderHistory();
    }
    
    // 设置今天日期显示
    setTodayDate() {
        const today = new Date();
        const formattedDate = this.formatDate(today);
        document.getElementById('todayDate').textContent = formattedDate;
        
        // 设置任务日期输入框默认值为今天
        document.getElementById('taskDate').value = this.getDateString(today);
    }
    
    // 绑定事件处理
    bindEvents() {
        // 添加任务
        document.getElementById('addBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        // 日期输入框实时验证
        document.getElementById('taskDate').addEventListener('input', (e) => {
            this.validateDateInput(e.target);
        });
        
        document.getElementById('historyDate').addEventListener('input', (e) => {
            this.validateDateInput(e.target);
        });
        
        // 日期输入框失去焦点时格式化
        document.getElementById('taskDate').addEventListener('blur', (e) => {
            this.formatDateInput(e.target);
        });
        
        document.getElementById('historyDate').addEventListener('blur', (e) => {
            this.formatDateInput(e.target);
        });
        
        // 筛选任务
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterTasks(e.target.dataset.filter || e.target.closest('.filter-btn').dataset.filter);
            });
        });
        
        // 历史记录操作
        document.getElementById('filterHistoryBtn').addEventListener('click', () => this.filterHistory());
        document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearHistory());
    }
    
    // 设置标签页切换
    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                
                // 更新按钮状态
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 显示对应内容
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${tabId}-tab`) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }
    
    // 验证日期输入
    validateDateInput(input) {
        const value = input.value.trim();
        const errorMessage = input.nextElementSibling?.classList?.contains('error-message') 
            ? input.nextElementSibling 
            : null;
        
        // 清除之前的错误状态
        input.classList.remove('error', 'success');
        if (errorMessage) {
            errorMessage.classList.remove('show');
        }
        
        // 如果为空，不验证
        if (!value) {
            return true;
        }
        
        // 验证格式：YYYY-MM-DD
        const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
        const match = value.match(dateRegex);
        
        if (!match) {
            this.showDateError(input, '日期格式必须为 YYYY-MM-DD');
            return false;
        }
        
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const day = parseInt(match[3], 10);
        
        // 验证月份
        if (month < 1 || month > 12) {
            this.showDateError(input, '月份必须在 01-12 之间');
            return false;
        }
        
        // 验证日期
        const daysInMonth = new Date(year, month, 0).getDate();
        if (day < 1 || day > daysInMonth) {
            this.showDateError(input, `该月份最多有  天`);
            return false;
        }
        
        // 验证不是未来日期（可选，可根据需求调整）
        const inputDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (inputDate > today) {
            this.showDateError(input, '不能选择未来日期');
            return false;
        }
        
        // 验证通过
        input.classList.add('success');
        return true;
    }
    
    // 显示日期错误
    showDateError(input, message) {
        input.classList.add('error');
        
        // 创建或更新错误消息
        let errorMessage = input.nextElementSibling;
        if (!errorMessage || !errorMessage.classList.contains('error-message')) {
            errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            input.parentNode.appendChild(errorMessage);
        }
        
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
    }
    
    // 格式化日期输入
    formatDateInput(input) {
        const value = input.value.trim();
        
        // 如果为空，不处理
        if (!value) return;
        
        // 尝试自动补全
        const parts = value.split(/[-\/]/);
        if (parts.length === 3) {
            let year = parts[0];
            let month = parts[1];
            let day = parts[2];
            
            // 补零
            if (month.length === 1) month = '0' + month;
            if (day.length === 1) day = '0' + day;
            
            // 如果是两位数年份，假设为20xx
            if (year.length === 2) {
                year = '20' + year;
            }
            
            const formatted = `-`;
            input.value = formatted;
            
            // 重新验证
            this.validateDateInput(input);
        }
    }
    
    // 获取日期字符串（YYYY-MM-DD格式）
    getDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `-`;
    }
    
    // 格式化日期显示
    formatDate(date) {
        if (!date) return '';
        
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return '无效日期';
        
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        
        return d.toLocaleDateString('zh-CN', options);
    }
    
    // 添加新任务
    addTask() {
        const input = document.getElementById('taskInput');
        const dateInput = document.getElementById('taskDate');
        const text = input.value.trim();
        const dateString = dateInput.value.trim();
        
        // 验证任务内容
        if (!text) {
            alert('请输入任务内容');
            input.focus();
            return;
        }
        
        // 验证日期
        if (!dateString) {
            alert('请输入任务日期');
            dateInput.focus();
            return;
        }
        
        if (!this.validateDateInput(dateInput)) {
            dateInput.focus();
            return;
        }
        
        // 解析日期
        const dateParts = dateString.split('-');
        const date = new Date(
            parseInt(dateParts[0], 10),
            parseInt(dateParts[1], 10) - 1,
            parseInt(dateParts[2], 10)
        );
        
        const task = {
            id: Date.now(),
            text: text,
            date: dateString,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.renderStats();
        
        // 清空输入框并重置
        input.value = '';
        dateInput.value = this.getDateString(new Date());
        dateInput.classList.remove('success');
        
        // 移除错误消息
        const errorMessage = dateInput.nextElementSibling;
        if (errorMessage && errorMessage.classList.contains('error-message')) {
            errorMessage.classList.remove('show');
        }
        
        input.focus();
        
        // 显示成功提示
        this.showSuccess('任务添加成功！');
    }
    
    // 显示成功提示
    showSuccess(message) {
        const btn = document.getElementById('addBtn');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = `<i class="fas fa-check"></i> `;
        btn.classList.add('success');
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('success');
        }, 2000);
    }
    
    // 切换任务状态
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            
            // 如果标记为完成，添加到历史记录
            if (task.completed) {
                this.addToHistory(task);
            }
            
            this.saveTasks();
            this.renderTasks();
            this.renderStats();
        }
    }
    
    // 删除任务
    deleteTask(id) {
        if (confirm('确定要删除这个任务吗？')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.renderTasks();
            this.renderStats();
        }
    }
    
    // 添加到历史记录
    addToHistory(task) {
        const today = this.getDateString(new Date());
        
        if (!this.history[today]) {
            this.history[today] = [];
        }
        
        // 避免重复添加
        if (!this.history[today].some(item => item.id === task.id)) {
            this.history[today].push({
                id: task.id,
                text: task.text,
                originalDate: task.date,
                completedAt: new Date().toISOString()
            });
            
            this.saveHistory();
            
            // 如果当前在历史标签页，更新显示
            if (document.getElementById('history-tab').classList.contains('active')) {
                this.renderHistory();
            }
        }
    }
    
    // 筛选任务
    filterTasks(filter) {
        this.currentFilter = filter;
        
        // 更新按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        
        this.renderTasks();
    }
    
    // 筛选历史记录
    filterHistory() {
        const dateInput = document.getElementById('historyDate');
        const dateString = dateInput.value.trim();
        
        if (dateString && !this.validateDateInput(dateInput)) {
            dateInput.focus();
            return;
        }
        
        this.currentHistoryDate = dateString || '';
        this.renderHistory();
    }
    
    // 清空历史记录
    clearHistory() {
        if (confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
            this.history = {};
            this.saveHistory();
            this.renderHistory();
        }
    }
    
    // 渲染任务列表
    renderTasks() {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';
        
        let filteredTasks = this.tasks;
        
        // 根据筛选条件过滤
        if (this.currentFilter === 'pending') {
            filteredTasks = this.tasks.filter(task => !task.completed);
        } else if (this.currentFilter === 'completed') {
            filteredTasks = this.tasks.filter(task => task.completed);
        }
        
        // 按日期排序（最新的在前面）
        filteredTasks.sort((a, b) => {
            if (a.date === b.date) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return new Date(b.date) - new Date(a.date);
        });
        
        if (filteredTasks.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'empty-message';
            
            let message = '';
            let icon = 'fas fa-inbox';
            
            if (this.currentFilter === 'all') {
                message = '暂无任务，添加第一个任务吧！';
                icon = 'fas fa-plus-circle';
            } else if (this.currentFilter === 'pending') {
                message = '暂无待完成任务';
                icon = 'fas fa-check-circle';
            } else {
                message = '暂无已完成任务';
                icon = 'fas fa-tasks';
            }
            
            emptyItem.innerHTML = `
                <i class=""></i>
                <div></div>
            `;
            
            taskList.appendChild(emptyItem);
            return;
        }
        
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item `;
            
            const escapedText = this.escapeHtml(task.text);
            const displayDate = this.formatDate(task.date);
            
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" 
                       
                       onclick="window.todoList.toggleTask()">
                <div class="task-content">
                    <span class="task-text"></span>
                    <span class="task-date"></span>
                </div>
                <div class="task-actions">
                    <button class="delete-btn" onclick="window.todoList.deleteTask()">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            taskList.appendChild(li);
        });
    }
    
    // 渲染统计信息
    renderStats() {
        const total = this.tasks.length;
        const pending = this.tasks.filter(t => !t.completed).length;
        const completed = this.tasks.filter(t => t.completed).length;
        
        document.getElementById('totalTasks').textContent = total;
        document.getElementById('pendingTasks').textContent = pending;
        document.getElementById('completedTasks').textContent = completed;
    }
    
    // 渲染历史记录
    renderHistory() {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';
        
        let historyData = this.history;
        
        // 如果指定了日期筛选
        if (this.currentHistoryDate) {
            const filtered = {};
            if (this.history[this.currentHistoryDate]) {
                filtered[this.currentHistoryDate] = this.history[this.currentHistoryDate];
            }
            historyData = filtered;
        }
        
        // 按日期排序（最新的在前面）
        const sortedDates = Object.keys(historyData).sort((a, b) => new Date(b) - new Date(a));
        
        if (sortedDates.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'empty-message';
            
            let message = '暂无历史记录';
            let icon = 'fas fa-history';
            
            if (this.currentHistoryDate) {
                message = `在 ${this.currentHistoryDate} 没有历史记录`;
                icon = 'fas fa-calendar-times';
            }
            
            emptyItem.innerHTML = `
                <i class=""></i>
                <div></div>
            `;
            
            historyList.appendChild(emptyItem);
            return;
        }
        
        sortedDates.forEach(date => {
            const dateSection = document.createElement('div');
            dateSection.className = 'history-date-section';
            
            const displayDate = this.formatDate(date);
            const dateHeader = document.createElement('div');
            dateHeader.className = 'history-date';
            dateHeader.innerHTML = `
                <i class="fas fa-calendar-day"></i>
                <span></span>
                <span style="color: #7f8c8d; font-size: 12px; margin-left: auto;">
                    ( 项)
                </span>
            `;
            
            dateSection.appendChild(dateHeader);
            
            // 按完成时间排序（最新的在前面）
            historyData[date].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
            
            historyData[date].forEach(item => {
                const taskDiv = document.createElement('div');
                taskDiv.className = 'history-item';
                
                const time = new Date(item.completedAt).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                const escapedText = this.escapeHtml(item.text);
                
                taskDiv.innerHTML = `
                    <div class="history-task">
                        <i class="fas fa-check"></i>
                        <span></span>
                        <span class="history-time"></span>
                    </div>
                `;
                
                dateSection.appendChild(taskDiv);
            });
            
            historyList.appendChild(dateSection);
        });
    }
    
    // 保存任务到 localStorage
    saveTasks() {
        try {
            localStorage.setItem('kindle-todolist-tasks', JSON.stringify(this.tasks));
        } catch (e) {
            console.error('保存任务失败:', e);
        }
    }
    
    // 从 localStorage 加载任务
    loadTasks() {
        try {
            const data = localStorage.getItem('kindle-todolist-tasks');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('加载任务失败:', e);
            return [];
        }
    }
    
    // 保存历史记录到 localStorage
    saveHistory() {
        try {
            localStorage.setItem('kindle-todolist-history', JSON.stringify(this.history));
        } catch (e) {
            console.error('保存历史记录失败:', e);
        }
    }
    
    // 从 localStorage 加载历史记录
    loadHistory() {
        try {
            const data = localStorage.getItem('kindle-todolist-history');
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('加载历史记录失败:', e);
            return {};
        }
    }
    
    // HTML 转义，防止 XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 初始化应用
let todoList;

// 确保 DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查 localStorage 支持
    if (typeof(Storage) === "undefined") {
        alert("您的浏览器不支持本地存储，应用功能将受限");
    }
    
    todoList = new KindleTodoList();
    
    // 暴露到全局，供 HTML 中的 onclick 调用
    window.todoList = todoList;
    
    // 添加键盘快捷键支持
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter 或 Cmd+Enter 添加任务
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            todoList.addTask();
        }
        
        // ESC 清除错误状态
        if (e.key === 'Escape') {
            document.querySelectorAll('.error').forEach(el => {
                el.classList.remove('error');
                const errorMsg = el.nextElementSibling;
                if (errorMsg && errorMsg.classList.contains('error-message')) {
                    errorMsg.classList.remove('show');
                }
            });
        }
    });
});
