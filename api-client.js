// API Client for Task Manager Backend
class TaskAPI {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}/api${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `HTTP error! status: ${response.status}`);
            }

            if (response.status === 204) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Get all tasks with optional filtering
    async getTasks(filter = 'all') {
        const endpoint = filter === 'all' ? '/tasks' : `/tasks?filter=${filter}`;
        return await this.request(endpoint);
    }

    // Get a single task
    async getTask(id) {
        return await this.request(`/tasks/${id}`);
    }

    // Create a new task
    async createTask(taskData) {
        return await this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
    }

    // Update a task
    async updateTask(id, updates) {
        return await this.request(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    // Delete a task
    async deleteTask(id) {
        return await this.request(`/tasks/${id}`, {
            method: 'DELETE'
        });
    }

    // Get task statistics
    async getStats() {
        return await this.request('/stats');
    }
}

// Enhanced Task Manager with API integration
class APITaskManager extends TaskManager {
    constructor(useAPI = false) {
        super();
        this.useAPI = useAPI;
        this.api = new TaskAPI();
        this.syncInProgress = false;
        
        if (useAPI) {
            this.initializeAPI();
        }
    }

    async initializeAPI() {
        try {
            // Test API connection
            await this.api.getStats();
            console.log('✅ Connected to API backend');
            this.loadTasksFromAPI();
        } catch (error) {
            console.warn('⚠️ API not available, falling back to localStorage:', error.message);
            this.useAPI = false;
        }
    }

    async loadTasksFromAPI() {
        try {
            const apiTasks = await this.api.getTasks();
            this.tasks = apiTasks.map(task => ({
                ...task,
                deadline: task.deadline ? new Date(task.deadline) : null,
                createdAt: new Date(task.createdAt)
            }));
            this.renderTasks();
            this.updateTaskCount();
        } catch (error) {
            console.error('Failed to load tasks from API:', error);
        }
    }

    async addTask() {
        const taskInput = document.getElementById('taskInput');
        const deadlineInput = document.getElementById('deadlineInput');
        
        const text = taskInput.value.trim();
        const deadline = deadlineInput.value;
        
        if (!text) return;

        const taskData = {
            text: text,
            deadline: deadline ? new Date(deadline).toISOString() : null
        };

        if (this.useAPI) {
            try {
                const newTask = await this.api.createTask(taskData);
                this.tasks.unshift({
                    ...newTask,
                    deadline: newTask.deadline ? new Date(newTask.deadline) : null,
                    createdAt: new Date(newTask.createdAt)
                });
            } catch (error) {
                console.error('Failed to create task via API:', error);
                alert('Failed to save task. Please try again.');
                return;
            }
        } else {
            // Fallback to local storage
            const task = {
                id: Date.now().toString(),
                text: text,
                completed: false,
                deadline: deadline ? new Date(deadline) : null,
                createdAt: new Date()
            };
            this.tasks.unshift(task);
        }

        this.saveTasks();
        this.renderTasks();
        this.updateTaskCount();
        
        // Clear form
        taskInput.value = '';
        deadlineInput.value = '';
        taskInput.focus();
    }

    async toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const newCompleted = !task.completed;

        if (this.useAPI) {
            try {
                await this.api.updateTask(id, { completed: newCompleted });
                task.completed = newCompleted;
            } catch (error) {
                console.error('Failed to update task via API:', error);
                alert('Failed to update task. Please try again.');
                return;
            }
        } else {
            task.completed = newCompleted;
        }

        this.saveTasks();
        this.renderTasks();
        this.updateTaskCount();
    }

    async editTask(id) {
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

        const saveEdit = async () => {
            const newText = input.value.trim();
            if (newText && newText !== task.text) {
                if (this.useAPI) {
                    try {
                        await this.api.updateTask(id, { text: newText });
                        task.text = newText;
                    } catch (error) {
                        console.error('Failed to update task via API:', error);
                        alert('Failed to update task. Please try again.');
                        this.renderTasks();
                        this.editingTaskId = null;
                        return;
                    }
                } else {
                    task.text = newText;
                }
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

    async deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            const taskElement = document.querySelector(`[data-task-id="${id}"]`);
            taskElement.classList.add('removing');
            
            setTimeout(async () => {
                if (this.useAPI) {
                    try {
                        await this.api.deleteTask(id);
                    } catch (error) {
                        console.error('Failed to delete task via API:', error);
                        alert('Failed to delete task. Please try again.');
                        return;
                    }
                }
                
                this.tasks = this.tasks.filter(t => t.id !== id);
                this.saveTasks();
                this.renderTasks();
                this.updateTaskCount();
            }, 300);
        }
    }

    async setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        if (this.useAPI) {
            try {
                const apiTasks = await this.api.getTasks(filter);
                this.tasks = apiTasks.map(task => ({
                    ...task,
                    deadline: task.deadline ? new Date(task.deadline) : null,
                    createdAt: new Date(task.createdAt)
                }));
            } catch (error) {
                console.error('Failed to filter tasks via API:', error);
            }
        }
        
        this.renderTasks();
    }

    // Override saveTasks to handle API sync
    saveTasks() {
        if (!this.useAPI) {
            localStorage.setItem('taskManager_tasks', JSON.stringify(this.tasks));
        }
    }

    // Override loadTasks to handle API loading
    loadTasks() {
        if (this.useAPI) {
            return []; // Tasks will be loaded from API
        }
        return super.loadTasks();
    }
}

// Initialize with API support
let taskManager;

document.addEventListener('DOMContentLoaded', () => {
    // Check if we should use API (you can modify this logic)
    const useAPI = window.location.hostname !== 'file://' && window.location.hostname !== '';
    
    taskManager = new APITaskManager(useAPI);
    
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
