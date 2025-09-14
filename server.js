const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Initialize SQLite database
const db = new sqlite3.Database('./tasks.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            text TEXT NOT NULL,
            completed BOOLEAN DEFAULT 0,
            deadline TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating tasks table:', err.message);
        } else {
            console.log('Tasks table ready');
        }
    });
}

// Routes

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Get all tasks
app.get('/api/tasks', (req, res) => {
    const { filter } = req.query;
    let query = 'SELECT * FROM tasks ORDER BY created_at DESC';
    let params = [];

    if (filter === 'pending') {
        query = 'SELECT * FROM tasks WHERE completed = 0 ORDER BY created_at DESC';
    } else if (filter === 'completed') {
        query = 'SELECT * FROM tasks WHERE completed = 1 ORDER BY created_at DESC';
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Convert deadline strings back to proper format
        const tasks = rows.map(row => ({
            id: row.id,
            text: row.text,
            completed: Boolean(row.completed),
            deadline: row.deadline ? new Date(row.deadline).toISOString() : null,
            createdAt: new Date(row.created_at).toISOString()
        }));
        
        res.json(tasks);
    });
});

// Get a single task
app.get('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (!row) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        
        res.json({
            id: row.id,
            text: row.text,
            completed: Boolean(row.completed),
            deadline: row.deadline ? new Date(row.deadline).toISOString() : null,
            createdAt: new Date(row.created_at).toISOString()
        });
    });
});

// Create a new task
app.post('/api/tasks', (req, res) => {
    const { text, deadline } = req.body;
    
    if (!text || text.trim() === '') {
        res.status(400).json({ error: 'Task text is required' });
        return;
    }
    
    const id = uuidv4();
    const deadlineValue = deadline ? new Date(deadline).toISOString() : null;
    
    db.run(
        'INSERT INTO tasks (id, text, deadline) VALUES (?, ?, ?)',
        [id, text.trim(), deadlineValue],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            // Return the created task
            db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                
                res.status(201).json({
                    id: row.id,
                    text: row.text,
                    completed: Boolean(row.completed),
                    deadline: row.deadline ? new Date(row.deadline).toISOString() : null,
                    createdAt: new Date(row.created_at).toISOString()
                });
            });
        }
    );
});

// Update a task
app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { text, completed, deadline } = req.body;
    
    const updates = [];
    const params = [];
    
    if (text !== undefined) {
        updates.push('text = ?');
        params.push(text.trim());
    }
    
    if (completed !== undefined) {
        updates.push('completed = ?');
        params.push(completed ? 1 : 0);
    }
    
    if (deadline !== undefined) {
        updates.push('deadline = ?');
        params.push(deadline ? new Date(deadline).toISOString() : null);
    }
    
    if (updates.length === 0) {
        res.status(400).json({ error: 'No valid fields to update' });
        return;
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
    
    db.run(query, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        
        // Return the updated task
        db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            res.json({
                id: row.id,
                text: row.text,
                completed: Boolean(row.completed),
                deadline: row.deadline ? new Date(row.deadline).toISOString() : null,
                createdAt: new Date(row.created_at).toISOString()
            });
        });
    });
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (this.changes === 0) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        
        res.status(204).send();
    });
});

// Get task statistics
app.get('/api/stats', (req, res) => {
    const queries = [
        'SELECT COUNT(*) as total FROM tasks',
        'SELECT COUNT(*) as completed FROM tasks WHERE completed = 1',
        'SELECT COUNT(*) as pending FROM tasks WHERE completed = 0',
        'SELECT COUNT(*) as overdue FROM tasks WHERE deadline IS NOT NULL AND deadline < datetime("now") AND completed = 0'
    ];
    
    Promise.all(queries.map(query => 
        new Promise((resolve, reject) => {
            db.get(query, (err, row) => {
                if (err) reject(err);
                else resolve(Object.values(row)[0]);
            });
        })
    )).then(([total, completed, pending, overdue]) => {
        res.json({ total, completed, pending, overdue });
    }).catch(err => {
        res.status(500).json({ error: err.message });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Task Manager API running on http://localhost:${PORT}`);
    console.log(`📱 Open your browser and navigate to http://localhost:${PORT}`);
});
