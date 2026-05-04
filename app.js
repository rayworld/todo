// TodoList 应用主逻辑
class TodoList {
    constructor() {
        this.tasks = this.loadTasks();
        this.history = this.loadHistory();
        this.currentFilter = 'all';
        this.currentHistoryDate = '';
        
        this.init();
    }
    
    // 初始化应用
    init() {
        // 设置默认日期
        document.getElementById('taskDate').value = this.getTodayDate();
        document.getElementById('historyDate').value = this.getTodayDate();
        
        // 绑定事件
        this.bindEvents();
        
        // 渲染初始数据
        this.renderTasks();
        this.renderStats();
        this.renderHistory();
    }
    
    // 绑定事件处理
    bindEvents() {
        // 添加任务
        document.getElementById('addBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        // 筛选任务
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterTasks(e.target.dataset.filter));
        });
        
        // 历史记录操作
        document.getElementById('filterHistoryBtn').addEventListener('click', () => this.filterHistory());
        document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearHistory());
    }
    
    // 获取今天日期
    getTodayDate() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }
    
    // 添加新任务
    addTask() {
        const input = document.getElementById('taskInput');
        const dateInput = document.getElementById('taskDate');
        const text = input.value.trim();
        const date = dateInput.value;
        
        if (!text) {
            alert('请输入任务内容');
            return;
        }
        
        if (!date) {
            alert('请选择任务日期');
            return;
        }
        
        const task = {
            id: Date.now(),
            text: text,
            date: date,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.renderStats();
        
        // 清空输入框
        input.value = '';
        input.focus();
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
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.renderTasks();
        this.renderStats();
    }
    
    // 添加到历史记录
    addToHistory(task) {
        const today = this.getTodayDate();
        
        if (!this.history[today]) {
            this.history[today] = [];
        }
        
        // 避免重复添加
        if (!this.history[today].some(item => item.id === task.id)) {
            this.history[today].push({
                id: task.id,
                text: task.text,
                completedAt: new Date().toISOString()
            });
            
            this.saveHistory();
            this.renderHistory();
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
        const date = document.getElementById('historyDate').value;
        this.currentHistoryDate = date;
        this.renderHistory();
    }
    
    // 清空历史记录
    clearHistory() {
        if (confirm('确定要清空所有历史记录吗？')) {
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
        filteredTasks.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (filteredTasks.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'empty-message';
            emptyItem.textContent = this.currentFilter === 'all' ? '暂无任务' : 
                                   this.currentFilter === 'pending' ? '暂无待完成任务' : '暂无已完成任务';
            taskList.appendChild(emptyItem);
            return;
        }
        
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" 
                       ${task.completed ? 'checked' : ''} 
                       onchange="todoList.toggleTask(${task.id})">
                <div class="task-content">
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                    <span class="task-date">${task.date}</span>
                </div>
                <div class="task-actions">
                    <button class="delete-btn" onclick="todoList.deleteTask(${task.id})">
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
            emptyItem.textContent = this.currentHistoryDate ? 
                `在 ${this.currentHistoryDate} 没有历史记录` : '暂无历史记录';
            historyList.appendChild(emptyItem);
            return;
        }
        
        sortedDates.forEach(date => {
            const dateSection = document.createElement('div');
            dateSection.className = 'history-date-section';
            
            const dateHeader = document.createElement('div');
            dateHeader.className = 'history-date';
            dateHeader.textContent = `${date} (${historyData[date].length} 项)`;
            
            dateSection.appendChild(dateHeader);
            
            historyData[date].forEach(item => {
                const taskDiv = document.createElement('div');
                taskDiv.className = 'history-item';
                
                const time = new Date(item.completedAt).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                taskDiv.innerHTML = `
                    <div class="history-task">
                        <i class="fas fa-check-circle" style="color: #4CAF50; margin-right: 5px;"></i>
                        ${this.escapeHtml(item.text)}
                        <span style="color: #95a5a6; font-size: 12px; margin-left: 10px;">
                            ${time}
                        </span>
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
    
    todoList = new TodoList();
    
    // 暴露到全局，供 HTML 中的 onclick 调用
    window.todoList = todoList;
});
