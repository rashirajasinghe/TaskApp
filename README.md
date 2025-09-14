# Task Manager - Personal To-Do List App

A modern, full-stack task management application with a beautiful UI and robust backend API. Built with HTML5, CSS3, JavaScript, Node.js, Express, and SQLite.

## ✨ Features

### Frontend Features
- **Modern UI Design**: Beautiful, responsive interface with gradient backgrounds and smooth animations
- **Task Management**: Add, edit, delete, and mark tasks as complete
- **Deadline Support**: Set deadlines for tasks with visual indicators for overdue items
- **Smart Filtering**: Filter tasks by status (All, Pending, Completed)
- **Real-time Stats**: Live task count and completion statistics
- **Keyboard Shortcuts**: Quick task creation and editing with keyboard shortcuts
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Local Storage**: Tasks persist in browser storage for offline use

### Backend Features
- **RESTful API**: Complete CRUD operations for task management
- **SQLite Database**: Lightweight, file-based database for data persistence
- **CORS Support**: Cross-origin resource sharing enabled for web integration
- **Error Handling**: Comprehensive error handling and validation
- **Statistics API**: Get task statistics and analytics
- **Graceful Shutdown**: Proper database cleanup on server shutdown

## 🚀 Quick Start

### Option 1: Frontend Only (Local Storage)
1. Open `index.html` in your web browser
2. Start managing your tasks immediately!

### Option 2: Full Stack (Frontend + Backend)
1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Open Your Browser**:
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
TaskApp/
├── index.html          # Main HTML file
├── styles.css          # CSS styling and responsive design
├── script.js           # Frontend JavaScript (localStorage version)
├── api-client.js       # Enhanced JavaScript with API integration
├── server.js           # Node.js/Express backend server
├── package.json        # Node.js dependencies and scripts
├── tasks.db            # SQLite database (created automatically)
└── README.md           # This file
```

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup and modern web standards
- **CSS3**: Flexbox, Grid, animations, and responsive design
- **Vanilla JavaScript**: ES6+ features, async/await, classes
- **Font Awesome**: Icons for enhanced UI

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **SQLite3**: Lightweight database
- **CORS**: Cross-origin resource sharing
- **UUID**: Unique identifier generation

## 📱 Usage Guide

### Adding Tasks
1. Type your task in the input field
2. Optionally set a deadline using the date picker
3. Click "Add Task" or press Ctrl/Cmd + Enter

### Managing Tasks
- **Mark Complete**: Click the checkbox next to any task
- **Edit Task**: Click the edit button (pencil icon)
- **Delete Task**: Click the delete button (trash icon)
- **Filter Tasks**: Use the filter buttons to view different task categories

### Keyboard Shortcuts
- `Ctrl/Cmd + Enter`: Add new task
- `Escape`: Cancel editing mode
- `Enter`: Save edited task

## 🔧 API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks?filter=pending` - Get filtered tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Statistics
- `GET /api/stats` - Get task statistics

### Example API Usage
```javascript
// Create a task
const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        text: 'Learn JavaScript',
        deadline: '2024-12-31T23:59:59.000Z'
    })
});
```

## 🎨 Customization

### Styling
The app uses CSS custom properties for easy theming. Modify the gradient colors in `styles.css`:

```css
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Features
- Modify `script.js` or `api-client.js` to add new features
- Extend the API in `server.js` for additional functionality
- Customize the database schema in the `initializeDatabase()` function

## 🔒 Data Persistence

### Local Storage (Frontend Only)
- Tasks are stored in browser's localStorage
- Data persists between browser sessions
- No server required

### Database (Full Stack)
- Tasks stored in SQLite database
- Automatic database creation and table initialization
- Data persists across server restarts

## 🌐 Deployment

### Frontend Deployment
- Upload files to any web hosting service
- Works with GitHub Pages, Netlify, Vercel, etc.

### Full Stack Deployment
- Deploy to Heroku, Railway, DigitalOcean, etc.
- Ensure Node.js and SQLite are supported
- Set environment variables as needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the package.json file for details.

## 🆘 Troubleshooting

### Common Issues

**Server won't start:**
- Ensure Node.js is installed
- Run `npm install` to install dependencies
- Check if port 3000 is available

**Database errors:**
- Ensure write permissions in the project directory
- SQLite database will be created automatically

**API not working:**
- Check if the server is running
- Verify CORS settings
- Check browser console for errors

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Ensure all dependencies are properly installed

---

**Happy Task Managing! 🎯**
# TaskApp
