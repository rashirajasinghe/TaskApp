// Task Manager Application
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.editingTaskId = null;
        
        this.initializeEventListeners();
        this.renderTasks();
        this.updateTaskCount();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Task form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Set minimum date to today for deadline input
        const deadlineInput = document.getElementById('deadlineInput');
        const today = new Date().toISOString().slice(0, 16);
        deadlineInput.min = today;
    }

    // Add a new task
    addTask() {
        const taskInput = document.getElementById('taskInput');
        const deadlineInput = document.getElementById('deadlineInput');
        
        const text = taskInput.value.trim();
        const deadline = deadlineInput.value;
        
        if (!text) return;

        const task = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            deadline: deadline ? new Date(deadline) : null,
            createdAt: new Date()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        this.updateTaskCount();
        
        // Clear form
        taskInput.value = '';
        deadlineInput.value = '';
        taskInput.focus();
    }

    // Toggle task completion
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateTaskCount();
        }
    }

    // Edit task
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        this.editingTaskId = id;
        const taskElement = document.querySelector(`[data-task-id="${id}"]`);
        const taskTextElement = taskElement.querySelector('.task-text');
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = task.text;
        input.className = 'edit-input';
        input.style.cssText = `
            width: 100%;
            padding: 8px 12px;
            border: 2px solid #667eea;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 500;
        `;
        
        taskTextElement.replaceWith(input);
        input.focus();
        input.select();

        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== task.text) {
                task.text = newText;
                this.saveTasks();
                this.renderTasks();
            } else {
                this.renderTasks();
            }
            this.editingTaskId = null;
        };

        const cancelEdit = () => {
            this.renderTasks();
            this.editingTaskId = null;
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        });
    }

    // Delete task
    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            const taskElement = document.querySelector(`[data-task-id="${id}"]`);
            taskElement.classList.add('removing');
            
            setTimeout(() => {
                this.tasks = this.tasks.filter(t => t.id !== id);
                this.saveTasks();
                this.renderTasks();
                this.updateTaskCount();
            }, 300);
        }
    }

    // Set filter
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderTasks();
    }

    // Get filtered tasks
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    // Render tasks
    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            tasksList.style.display = 'none';
            emptyState.style.display = 'block';
            emptyState.querySelector('h3').textContent = 
                this.currentFilter === 'all' ? 'No tasks yet' :
                this.currentFilter === 'pending' ? 'No pending tasks' :
                'No completed tasks';
            emptyState.querySelector('p').textContent = 
                this.currentFilter === 'all' ? 'Add your first task to get started!' :
                this.currentFilter === 'pending' ? 'All tasks are completed!' :
                'Complete some tasks to see them here!';
        } else {
            tasksList.style.display = 'block';
            emptyState.style.display = 'none';
            
            tasksList.innerHTML = filteredTasks.map(task => this.createTaskElement(task)).join('');
        }
    }

    // Create task element
    createTaskElement(task) {
        const isOverdue = task.deadline && new Date() > task.deadline && !task.completed;
        const deadlineText = task.deadline ? this.formatDeadline(task.deadline) : '';
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="taskManager.toggleTask('${task.id}')">
                <div class="task-content">
                    <div class="task-text ${task.completed ? 'completed' : ''}">${this.escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        <span class="task-created">
                            <i class="fas fa-calendar-plus"></i>
                            ${this.formatDate(task.createdAt)}
                        </span>
                        ${deadlineText ? `
                            <span class="task-deadline ${isOverdue ? 'overdue' : ''}">
                                <i class="fas fa-clock"></i>
                                ${deadlineText}
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-btn edit-btn" onclick="taskManager.editTask('${task.id}')" title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-btn delete-btn" onclick="taskManager.deleteTask('${task.id}')" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Format deadline
    formatDeadline(deadline) {
        const now = new Date();
        const taskDate = new Date(deadline);
        const diffTime = taskDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
        } else if (diffDays === 0) {
            return 'Due today';
        } else if (diffDays === 1) {
            return 'Due tomorrow';
        } else if (diffDays <= 7) {
            return `Due in ${diffDays} days`;
        } else {
            return `Due ${taskDate.toLocaleDateString()}`;
        }
    }

    // Format date
    formatDate(date) {
        const now = new Date();
        const taskDate = new Date(date);
        const diffTime = now - taskDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays <= 7) {
            return `${diffDays} days ago`;
        } else {
            return taskDate.toLocaleDateString();
        }
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Update task count
    updateTaskCount() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        
        let countText = '';
        switch (this.currentFilter) {
            case 'pending':
                countText = `${pendingTasks} pending task${pendingTasks !== 1 ? 's' : ''}`;
                break;
            case 'completed':
                countText = `${completedTasks} completed task${completedTasks !== 1 ? 's' : ''}`;
                break;
            default:
                countText = `${totalTasks} task${totalTasks !== 1 ? 's' : ''} (${pendingTasks} pending, ${completedTasks} completed)`;
        }
        
        document.getElementById('taskCount').textContent = countText;
    }

    // Save tasks to localStorage
    saveTasks() {
        localStorage.setItem('taskManager_tasks', JSON.stringify(this.tasks));
    }

    // Load tasks from localStorage
    loadTasks() {
        const saved = localStorage.getItem('taskManager_tasks');
        if (saved) {
            const tasks = JSON.parse(saved);
            // Convert deadline strings back to Date objects
            return tasks.map(task => ({
                ...task,
                deadline: task.deadline ? new Date(task.deadline) : null,
                createdAt: new Date(task.createdAt)
            }));
        }
        return [];
    }

    // Clear all tasks
    clearAllTasks() {
        if (confirm('Are you sure you want to delete all tasks? This action cannot be undone.')) {
            this.tasks = [];
            this.saveTasks();
            this.renderTasks();
            this.updateTaskCount();
        }
    }

    // Export tasks
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tasks_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    // Import tasks
    importTasks(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTasks = JSON.parse(e.target.result);
                if (Array.isArray(importedTasks)) {
                    this.tasks = importedTasks.map(task => ({
                        ...task,
                        deadline: task.deadline ? new Date(task.deadline) : null,
                        createdAt: new Date(task.createdAt)
                    }));
                    this.saveTasks();
                    this.renderTasks();
                    this.updateTaskCount();
                    alert('Tasks imported successfully!');
                } else {
                    alert('Invalid file format. Please select a valid tasks file.');
                }
            } catch (error) {
                alert('Error importing tasks. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the application
let taskManager;

document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to add task
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            document.getElementById('taskForm').dispatchEvent(new Event('submit'));
        }
        
        // Escape to cancel editing
        if (e.key === 'Escape' && taskManager.editingTaskId) {
            taskManager.renderTasks();
            taskManager.editingTaskId = null;
        }
    });
});

// Add some sample tasks on first load
if (!localStorage.getItem('taskManager_tasks')) {
    const sampleTasks = [
        {
            id: '1',
            text: 'Welcome to Task Manager! Click the checkbox to mark this as complete.',
            completed: false,
            deadline: null,
            createdAt: new Date()
        },
        {
            id: '2',
            text: 'Try adding a new task with a deadline',
            completed: false,
            deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            createdAt: new Date()
        },
        {
            id: '3',
            text: 'Use the filter buttons to view different task categories',
            completed: true,
            deadline: null,
            createdAt: new Date()
        }
    ];
    localStorage.setItem('taskManager_tasks', JSON.stringify(sampleTasks));
}
