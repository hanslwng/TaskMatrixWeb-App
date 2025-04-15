class ActivityHistory {
    constructor() {
        this.historyContainer = document.querySelector('.recent-tasks tbody');
        this.initializeHistory();
    }

    initializeHistory() {
        this.loadHistory();
        this.setupEventListeners();
    }

    async loadHistory() {
        try {
            const response = await fetch('handlers/activity_handler.php?action=get_history');
            const data = await response.json();
            
            if (data.status === 'success') {
                this.displayHistory(data.activities);
            }
        } catch (error) {
            console.error('Error loading history:', error);
            this.showError();
        }
    }

    displayHistory(groupedActivities) {
        if (!this.historyContainer) return;

        let html = '';
        
        // Time category headers
        const categoryTitles = {
            'recent': 'Last Hour',
            'today': 'Today',
            'week': 'This Week',
            'older': 'Older'
        };

        for (const [category, activities] of Object.entries(groupedActivities)) {
            html += `
                <tr class="category-header">
                    <td colspan="4">${categoryTitles[category]}</td>
                </tr>
            `;

            activities.forEach(activity => {
                html += `
                    <tr class="activity-row ${activity.action_type.toLowerCase()}">
                        <td>
                            <span class="material-icons-sharp">${activity.icon}</span>
                        </td>
                        <td>${activity.description}</td>
                        <td>${this.formatDate(activity.timestamp)}</td>
                        <td class="action-type ${activity.action_type.toLowerCase()}">
                            ${activity.action_type}
                        </td>
                    </tr>
                `;
            });
        }

        this.historyContainer.innerHTML = html;
    }

    getActionIcon(actionType) {
        const icons = {
            'CREATE': 'add_circle',
            'UPDATE': 'edit',
            'DELETE': 'delete',
            'COMPLETE': 'check_circle',
            'LOGIN': 'login',
            'LOGOUT': 'logout'
        };
        return `<span class="material-icons-sharp ${actionType.toLowerCase()}">${icons[actionType] || 'info'}</span>`;
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // If less than 24 hours, show relative time
        if (diff < 24 * 60 * 60 * 1000) {
            const hours = Math.floor(diff / (60 * 60 * 1000));
            if (hours < 1) {
                const minutes = Math.floor(diff / (60 * 1000));
                return `${minutes} minutes ago`;
            }
            return `${hours} hours ago`;
        }
        
        // Otherwise show date
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    addActivity(action_type, description) {
        const activity = {
            action_type,
            description,
            timestamp: new Date().toISOString()
        };

        fetch('handlers/activity_handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'add_activity',
                activity: activity
            })
        })
        .then(response => response.json())
        .then(() => this.loadHistory())
        .catch(error => console.error('Error adding activity:', error));
    }

    showError() {
        if (!this.historyContainer) return;
        
        this.historyContainer.innerHTML = `
            <tr>
                <td colspan="4" class="error-message">
                    <span class="material-icons-sharp">error_outline</span>
                    Unable to load activity history
                </td>
            </tr>
        `;
    }
} 