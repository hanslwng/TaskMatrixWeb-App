let isEmailVerified = false;

function showReminderInfo() {
    const modal = document.getElementById('reminderInfoModal');
    modal.style.display = 'block';
}

function verifyCode() {
    // Add your verification logic here
    const code = document.getElementById('verificationCode').value;
    
    // Simulate verification (replace with actual verification)
    if (code.length === 6) {
        isEmailVerified = true;
        document.getElementById('verificationStatus').style.display = 'block';
        document.getElementById('verificationModal').style.display = 'none';
        document.querySelector('.email-verification-container').style.display = 'none';
    } else {
        alert('Invalid verification code. Please try again.');
    }
}

// Modify your existing addTask function
async function addTask() {
    const taskName = document.getElementById('taskName').value;
    const taskCourse = document.getElementById('taskCourse').value;
    const taskTag = document.getElementById('taskTag').value;
    const taskDeadline = document.getElementById('taskDeadline').value;
    const enableReminder = document.getElementById('enableReminder').checked;
    
    if (!taskName || !taskDeadline) {
        alert('Please fill in all required fields');
        return;
    }

    if (enableReminder && !isEmailVerified) {
        alert('Please verify your email first to enable reminders');
        return;
    }

    const taskData = {
        title: taskName,
        course_code: taskCourse,
        tag: taskTag,
        deadline: taskDeadline,
        enable_reminder: enableReminder
    };

    if (enableReminder) {
        taskData.email = document.getElementById('userEmail').value;
        taskData.reminder_time = document.getElementById('reminderTime').value;
    }

    try {
        const response = await fetch('api/add_task.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        const result = await response.json();
        
        if (result.success) {
            alert('Task added successfully!');
            closeModal('addTaskModal');
            // Refresh task list
            loadTasks();
        } else {
            alert('Error adding task: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding the task');
    }
}

// Update your existing checkbox handler
document.getElementById('enableReminder').addEventListener('change', function(e) {
    const reminderOptions = document.getElementById('reminderOptions');
    reminderOptions.style.display = e.target.checked ? 'block' : 'none';
}); 