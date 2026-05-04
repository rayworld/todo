// Kindle TodoList 应用
class KindleTodoList {
    constructor() {
        this.tasks = this.loadTasks();
        this.history = this.loadHistory();
        this.currentFilter = 'all';
        this.currentHistoryDate = '';
        this.selectedDate = this.getTodayDate();
        this.currentMonth = new Date();
        
        this.init();
    }
    
    // 初始化应用
    init() {
        // 初始化日期选择器
        this.initDatePicker();
        
        // 设置初始日期
        document.getElementById('taskDate').value = this.formatDate(this.selectedDate);
        
        // 绑定事件
        this.bindEvents();
        
        // 渲染初始数据
        this.renderTasks();
        this.renderStats();
        this.renderHistory();
        
        // 设置标签页切换
        this.setupTabs();
    }
    
    // 初始化日期选择器
    initDatePicker() {
        this.renderDatePicker();
    }
    
    // 绑定事件处理
    bindEvents() {
        // 添加任务
        document.getElementById('addBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        // 日期选择器
        document.getElementById('datePickerBtn').addEventListener('click', () => this.showDatePicker('task'));
        document.getElementById('historyDatePickerBtn').addEventListener('click', () => this.showDatePicker('history'));
        
        // 筛选任务
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterTasks(e.target.dataset.filter || e.target.closest('.filter-btn').dataset.filter);
            });
        });
        
        // 历史记录操作
        document.getElementById('filterHistoryBtn').addEventListener('click', () => this.filterHistory());
        document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearHistory());
        
        // 模态框关闭
        document.querySelector('.close-btn').addEventListener('click', () => this.hideDatePicker());
        document.getElementById('datePickerModal').addEventListener('click', (e) => {
            if (e.target.id === 'datePickerModal') this.hideDatePicker();
        });
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
    
    // 显示日期选择器
    showDatePicker(type) {
        this.datePickerType = type;
        const modal = document.getElementById('datePickerModal');
        modal.classList.add('active');
        
        // 绑定日期选择器事件
        this.bindDatePickerEvents();
    }
    
    // 隐藏日期选择器
    hideDatePicker() {
        const modal = document.getElementById('datePickerModal');
        modal.classList.remove('active');
    }
    
    // 绑定日期选择器事件
    bindDatePickerEvents() {
        // 月份导航
        document.getElementById('prevMonth').onclick = () => this.navigateMonth(-1);
        document.getElementById('nextMonth').onclick = () => this.navigateMonth(1);
        
        // 今天按钮
        document.getElementById('todayBtn').onclick = () => this.selectToday();
        
        // 确定按钮
        document.getElementById('confirmDateBtn').onclick = () => this.confirmDate();
        
        // 日期点击事件
        const daysContainer = document.getElementById('datePickerDays');
        daysContainer.onclick = (e) => {
            const dayElement = e.target.closest('.day:not(.disabled)');
            if (dayElement && dayElement.dataset.date) {
                this.selectDay(dayElement.dataset.date);
            }
        };
    }
    
    // 导航月份
    navigateMonth(direction) {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
        this.renderDatePicker();
    }
    
    // 选择今天
    selectToday() {
        this.currentMonth = new Date();
        this.selectedDate = this.getTodayDate();
        this.renderDatePicker();
    }
    
    // 选择日期
    selectDay(dateString) {
        this.selectedDate = dateString;
        
        // 更新选中状态
        document.querySelectorAll('.day').forEach(day => {
            day.classList.remove('selected');
            if (day.dataset.date === dateString) {
                day.classList.add('selected');
            }
        });
    }
    
    // 确认日期选择
    confirmDate() {
        const formattedDate = this.formatDate(this.selectedDate);
        
        if (this.datePickerType === 'task') {
            document.getElementById('taskDate').value = formattedDate;
        } else {
            document.getElementById('historyDate').value = formattedDate;
        }
        
        this.hideDatePicker();
    }
    
    // 渲染日期选择器
    renderDatePicker() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        // 更新月份显示
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                          '七月', '八月', '九月', '十月', '十一月', '十二月'];
        document.getElementById('currentMonth').textContent = `${year}年 ${monthNames[month]}`;
        
        // 计算月份第一天和最后一天
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const firstDayOfWeek = firstDay.getDay();
        
        // 清空日期容器
        const daysContainer = document.getElementById('datePickerDays');
        daysContainer.innerHTML = '';
        
        // 添加空白占位
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'day empty';
            daysContainer.appendChild(emptyDiv);
        }
        
        // 添加日期
        const today = this.getTodayDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().split('T')[0];
            const dayElement = document.createElement('div');
            
            dayElement.className = 'day';
            dayElement.textContent = day;
            dayElement.dataset.date = dateString;
            
            // 标记今天
            if (dateString === today) {
                dayElement.classList.add('today');
            }
            
            // 标记选中日期
            if (dateString === this.selectedDate) {
                dayElement.classList.add('selected');
            }
            
            // 禁用过去日期（可选）
            if (dateString < today) {
                dayElement.classList.add('disabled');
            }
            
            daysContainer.appendChild(dayElement);
        }
    }
    
    // 格式化日期
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '-');
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
        const date = this.selectedDate;
        
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
        const date = this.selectedDate;
        this.currentHistoryDate = date;
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
            
            const escapedText = this.escapeHtml(task.text);
            const formattedDate = this.formatDate(task.date);
            
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" 
                       ${task.completed ? 'checked' : ''}
                       onclick="window.todoList.toggleTask(${task.id})">
                <div class="task-content">
                    <span class="task-text">${escapedText}</span>
                    <span class="task-date">${formattedDate}</span>
                </div>
                <div class="task-actions">
                    <button class="delete-btn" onclick="window.todoList.deleteTask(${task.id})">
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
                `在 ${this.formatDate(this.currentHistoryDate)} 没有历史记录` : '暂无历史记录';
            historyList.appendChild(emptyItem);
            return;
        }
        
        sortedDates.forEach(date => {
            const dateSection = document.createElement('div');
            dateSection.className = 'history-date-section';
            
            const formattedDate = this.formatDate(date);
            const dateHeader = document.createElement('div');
            dateHeader.className = 'history-date';
            dateHeader.textContent = `${formattedDate} (${historyData[date].length} 项)`;
            
            dateSection.appendChild(dateHeader);
            
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
                        <i class="fas fa-check-circle" style="color: #4CAF50;"></i>
                        ${escapedText}
                        <span style="color: #95a5a6; font-size: 12px; margin-left: auto;">
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
    
    todoList = new KindleTodoList();
    
    // 暴露到全局，供 HTML 中的 onclick 调用
    window.todoList = todoList;
    
    // 添加键盘支持
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('datePickerModal');
            if (modal.classList.contains('active')) {
                todoList.hideDatePicker();
            }
        }
    });
});
