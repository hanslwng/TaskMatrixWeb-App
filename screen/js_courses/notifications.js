function showNotification(title, message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'check-circle' :
                type === 'warning' ? 'exclamation-triangle' :
                'exclamation-circle';
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;

    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function checkDeadlines() {
    const now = new Date();
    tasks.forEach(task => {
        const deadline = new Date(task.deadline);
        const timeLeft = deadline - now;
        
        if (timeLeft > 0 && timeLeft < 24 * 60 * 60 * 1000) {
            const hours = Math.floor(timeLeft / (60 * 60 * 1000));
            showNotification(
                'Upcoming Deadline',
                `Task "${task.name}" is due in ${hours} hours!`,
                'warning'
            );
        } else if (timeLeft < 0 && timeLeft > -60 * 60 * 1000) { // Show only for recently overdue tasks
            showNotification(
                'Task Overdue',
                `Task "${task.name}" has passed its deadline!`,
                'error'
            );
        }
    });
}

setInterval(checkDeadlines, 60000);
setTimeout(checkDeadlines, 1000);