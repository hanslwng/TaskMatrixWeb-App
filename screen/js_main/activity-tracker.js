class ActivityTracker {
    static async logActivity(action_type, description) {
        try {
            const formData = new FormData();
            formData.append('action', 'add_activity');
            formData.append('action_type', action_type);
            formData.append('description', description);

            const response = await fetch('handlers/activity_handler.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.status === 'success') {
                // Refresh activity history if it's visible
                if (window.activityHistory) {
                    window.activityHistory.loadHistory();
                }
            }
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }
}

// Track Map Events
function addEventToMapAndList(event) {
    // Existing code...
    ActivityTracker.logActivity('CREATE', `Added new event: ${event.name}`);
}

function deleteEvent(eventId) {
    // Existing code...
    ActivityTracker.logActivity('DELETE', `Deleted event: ${eventName}`);
}

// Track Task Actions
function addTask(taskData) {
    // Existing code...
    ActivityTracker.logActivity('CREATE', `Created new task: ${taskData.title}`);
}

function completeTask(taskId) {
    // Existing code...
    ActivityTracker.logActivity('COMPLETE', `Completed task: ${taskTitle}`);
}

function deleteTask(taskId) {
    // Existing code...
    ActivityTracker.logActivity('DELETE', `Deleted task: ${taskTitle}`);
}

// Track Note Actions
function addNote(noteData) {
    // Existing code...
    ActivityTracker.logActivity('CREATE', `Added new note: ${noteData.title}`);
}

function deleteNote(noteId) {
    // Existing code...
    ActivityTracker.logActivity('DELETE', `Deleted note: ${noteTitle}`);
}

// Track User Actions
function login(userData) {
    // Existing code...
    ActivityTracker.logActivity('LOGIN', `User logged in: ${userData.username}`);
}

function logout() {
    // Existing code...
    ActivityTracker.logActivity('LOGOUT', 'User logged out');
}

// Track Profile Updates
function updateProfile(profileData) {
    // Existing code...
    ActivityTracker.logActivity('UPDATE', 'Updated profile information');
}

// Track Settings Changes
function updateSettings(settingsData) {
    // Existing code...
    ActivityTracker.logActivity('UPDATE', 'Updated application settings');
} 