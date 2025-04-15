// Task Management Class
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        this.soundEnabled = JSON.parse(localStorage.getItem('soundEnabled')) ?? true;
        this.init();
    }

    init() {
        // DOM Elements
        this.tasksList = document.getElementById('tasksList');
        this.notificationsList = document.getElementById('notificationsList');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskModal = document.getElementById('taskModal');
        this.taskForm = document.getElementById('taskForm');
        this.closeModal = document.querySelector('.close-modal');
        this.searchInput = document.getElementById('searchTask');
        this.sortSelect = document.getElementById('sortTasks');
        this.filterSelect = document.getElementById('filterCategory');
        this.toggleSoundBtn = document.getElementById('toggleSound');
        this.clearNotificationsBtn = document.getElementById('clearNotifications');
        
        // Audio Elements
        this.notificationSound = document.getElementById('notificationSound');
        this.taskCompleteSound = document.getElementById('taskCompleteSound');

        this.bindEvents();
        this.updateUI();
        this.startCountdowns();
    }

    bindEvents() {
        // Modal Events
        this.addTaskBtn.addEventListener('click', () => this.openModal());
        this.closeModal.addEventListener('click', () => this.closeModalHandler());
        this.taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));

        // Filter and Sort Events
        this.searchInput.addEventListener('input', () => this.updateUI());
        this.sortSelect.addEventListener('change', () => this.updateUI());
        this.filterSelect.addEventListener('change', () => this.updateUI());

        // Sound Toggle
        this.toggleSoundBtn.addEventListener('click', () => this.toggleSound());
        this.clearNotificationsBtn.addEventListener('click', () => this.clearNotifications());

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target === this.taskModal) this.closeModalHandler();
        });
    }

    openModal(taskId = null) {
        this.taskModal.style.display = 'block';
        if (taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) this.populateModal(task);
        } else {
            this.taskForm.reset();
        }
    }

    closeModalHandler() {
        this.taskModal.style.display = 'none';
        this.taskForm.reset();
        delete this.taskForm.dataset.editId;
    }

    handleTaskSubmit(e) {
        e.preventDefault();
        const formData = new FormData(this.taskForm);
        const taskData = {
            id: this.taskForm.dataset.editId || Date.now().toString(),
            title: formData.get('title'),
            description: formData.get('description'),
            deadline: formData.get('deadline'),
            priority: formData.get('priority'),
            category: formData.get('category'),
            completed: false,
            createdAt: this.taskForm.dataset.editId ? 
                this.tasks.find(t => t.id === this.taskForm.dataset.editId).createdAt : 
                new Date().toISOString()
        };

        if (this.taskForm.dataset.editId) {
            this.updateTask(taskData);
        } else {
            this.addTask(taskData);
        }

        this.closeModalHandler();
    }

    addTask(taskData) {
        this.tasks.push(taskData);
        this.saveTasks();
        this.updateUI();
        this.startCountdowns();
        this.showNotification('Task Added', `New task "${taskData.title}" has been added.`);
    }

    updateTask(taskData) {
        const index = this.tasks.findIndex(t => t.id === taskData.id);
        if (index !== -1) {
            this.tasks[index] = taskData;
            this.saveTasks();
            this.updateUI();
            this.showNotification('Task Updated', `Task "${taskData.title}" has been updated.`);
        }
    }

    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            const taskTitle = this.tasks[taskIndex].title;
            this.tasks.splice(taskIndex, 1);
            this.saveTasks();
            this.updateUI();
            this.showNotification('Task Deleted', `Task "${taskTitle}" has been deleted.`);
        }
    }

    completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = true;
            task.completedAt = new Date().toISOString();
            this.saveTasks();
            this.updateUI();
            if (this.soundEnabled) this.taskCompleteSound.play();
            this.showNotification('Task Completed', `Task "${task.title}" has been marked as complete.`);
        }
    }

    updateUI() {
        this.updateTasksList();
        this.updateNotificationsList();
        this.updateStats();
    }

    updateTasksList() {
        if (!this.tasksList) return;

        const filteredTasks = this.filterTasks(this.tasks);
        const sortedTasks = this.sortTasks(filteredTasks);

        this.tasksList.innerHTML = '';
        
        if (sortedTasks.length === 0) {
            this.tasksList.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons-sharp">assignment</span>
                    <p>No tasks found</p>
                </div>`;
            return;
        }

        sortedTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.tasksList.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const template = document.getElementById('taskTemplate');
        const taskElement = template.content.cloneNode(true);
        const taskItem = taskElement.querySelector('.task-item');

        taskItem.dataset.id = task.id;
        taskItem.querySelector('.task-title').textContent = task.title;
        taskItem.querySelector('.task-description').textContent = task.description;
        taskItem.querySelector('.task-category').textContent = task.category;
        
        const priorityElement = taskItem.querySelector('.task-priority');
        priorityElement.textContent = task.priority;
        priorityElement.dataset.priority = task.priority;

        // Add event listeners
        taskItem.querySelector('.edit-task').addEventListener('click', () => this.openModal(task.id));
        taskItem.querySelector('.delete-task').addEventListener('click', () => this.deleteTask(task.id));
        taskItem.querySelector('.complete-task').addEventListener('click', () => this.completeTask(task.id));

        return taskItem;
    }

    filterTasks(tasks) {
        const searchTerm = this.searchInput.value.toLowerCase();
        const category = this.filterSelect.value;

        return tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm) ||
                                task.description.toLowerCase().includes(searchTerm);
            const matchesCategory = category === 'all' || task.category === category;
            return matchesSearch && matchesCategory && !task.completed;
        });
    }

    sortTasks(tasks) {
        const sortBy = this.sortSelect.value;
        return [...tasks].sort((a, b) => {
            switch (sortBy) {
                case 'deadline':
                    return new Date(a.deadline) - new Date(b.deadline);
                case 'priority':
                    const priorityOrder = { high: 1, medium: 2, low: 3 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                case 'created':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });
    }

    updateStats() {
        document.getElementById('pendingCount').textContent = this.tasks.filter(t => !t.completed).length;
        document.getElementById('completedCount').textContent = this.tasks.filter(t => t.completed).length;
        document.getElementById('overdueCount').textContent = this.getOverdueTasks().length;
    }

    getOverdueTasks() {
        const now = new Date();
        return this.tasks.filter(task => 
            !task.completed && new Date(task.deadline) < now
        );
    }

    startCountdowns() {
        this.tasks.forEach(task => {
            if (!task.completed) {
                this.updateCountdown(task);
            }
        });
    }

    updateCountdown(task) {
        const countdownElement = document.querySelector(`[data-id="${task.id}"] .task-countdown`);
        if (!countdownElement) return;

        const deadline = new Date(task.deadline);
        const now = new Date();
        const timeLeft = deadline - now;

        if (timeLeft <= 0) {
            countdownElement.textContent = 'Overdue';
            countdownElement.style.color = 'var(--color-danger)';
            this.showNotification('Task Overdue', `Task "${task.title}" is overdue!`);
            return;
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        countdownElement.textContent = `${days}d ${hours}h ${minutes}m`;
        setTimeout(() => this.updateCountdown(task), 60000);
    }

    showNotification(title, message) {
        const notification = {
            id: Date.now().toString(),
            title,
            message,
            time: new Date().toISOString()
        };

        this.notifications.unshift(notification);
        if (this.notifications.length > 50) this.notifications.pop();
        this.saveNotifications();
        this.updateNotificationsList();

        if (this.soundEnabled) this.notificationSound.play();
    }

    updateNotificationsList() {
        if (!this.notificationsList) return;

        this.notificationsList.innerHTML = '';
        
        if (this.notifications.length === 0) {
            this.notificationsList.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons-sharp">notifications_none</span>
                    <p>No notifications</p>
                </div>`;
            return;
        }

        this.notifications.forEach(notification => {
            const notificationElement = this.createNotificationElement(notification);
            this.notificationsList.appendChild(notificationElement);
        });
    }

    createNotificationElement(notification) {
        const template = document.getElementById('notificationTemplate');
        const element = template.content.cloneNode(true);
        
        element.querySelector('.notification-title').textContent = notification.title;
        element.querySelector('.notification-message').textContent = notification.message;
        element.querySelector('.notification-time').textContent = this.formatTime(notification.time);
        
        element.querySelector('.dismiss-notification').addEventListener('click', () => {
            this.dismissNotification(notification.id);
        });

        return element;
    }

    dismissNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.saveNotifications();
        this.updateNotificationsList();
    }

    clearNotifications() {
        this.notifications = [];
        this.saveNotifications();
        this.updateNotificationsList();
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('soundEnabled', JSON.stringify(this.soundEnabled));
        this.toggleSoundBtn.querySelector('.material-icons-sharp').textContent = 
            this.soundEnabled ? 'volume_up' : 'volume_off';
    }

    formatTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleString();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }

    populateModal(task) {
        this.taskForm.dataset.editId = task.id;
        this.taskForm.elements.title.value = task.title;
        this.taskForm.elements.description.value = task.description;
        this.taskForm.elements.deadline.value = task.deadline;
        this.taskForm.elements.priority.value = task.priority;
        this.taskForm.elements.category.value = task.category;
    }
}

// Initialize the Task Manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});
