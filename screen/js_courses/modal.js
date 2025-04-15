function showAddCourseModal() {
    const modal = document.getElementById('addCourseModal');
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('show'), 10);
    document.getElementById('courseCode').focus();
}

function showAddTaskModal() {
    const modal = document.getElementById('addTaskModal');
    if (modal) {
        modal.style.display = 'block';
        populateTaskCourseDropdown();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
        // Clear form inputs
        modal.querySelectorAll('input').forEach(input => {
            input.value = '';
        });
    }, 300);
}

// Close modal when clicking outside
window.onclick = (event) => {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
};
// Add these new functions

function toggleReminderOptions() {
    const reminderOptions = document.getElementById('reminderOptions');
    reminderOptions.style.display = document.getElementById('enableReminder').checked ? 'block' : 'none';
}

function verifyEmail() {
    const emailInput = document.getElementById('userEmail');
    const email = emailInput.value.trim();
    
    if (!email) {
        showNotification('Please enter an email address', 'error');
        return;
    }

    // Show loading state
    const verifyButton = event.target;
    verifyButton.disabled = true;
    verifyButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    // Update the URL to point to the correct location
    fetch('../php/verify_email.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `email=${encodeURIComponent(email)}&action=send_code`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showModal('verificationModal');
            startCodeExpityTimer();
            showNotification('Verification code sent!', 'success');
        } else {
            throw new Error(data.message || 'Failed to send verification code');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error: ' + error.message, 'error');
    })
    .finally(() => {
        // Reset button state
        verifyButton.disabled = false;
        verifyButton.innerHTML = '<i class="fas fa-envelope"></i> Verify Email';
    });
}

function verifyCode() {
    const code = document.getElementById('verificationCode')?.value;
    
    if (!code) {
        alert('Please enter verification code');
        return;
    }

    // Show loading state
    const verifyButton = document.querySelector('#verificationModal button');
    if (verifyButton) {
        verifyButton.disabled = true;
        verifyButton.textContent = 'Verifying...';
    }

    fetch('../php/verify_email.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `code=${encodeURIComponent(code)}&action=verify_code`
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.success) {
            // Store verified email in session
            if (document.getElementById('userEmail')) {
                const email = document.getElementById('userEmail').value;
                sessionStorage.setItem('verified_email', email);
            }
            
            // Close verification modal
            closeModal('verificationModal');
            
            // Show success message
            alert('Email verified successfully!');
            
            // Enable the add task button if it exists
            const addTaskButton = document.querySelector('#addTaskModal .primary-btn');
            if (addTaskButton) {
                addTaskButton.disabled = false;
            }
        } else {
            throw new Error(data?.message || 'Invalid verification code');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error verifying code: ' + error.message);
    })
    .finally(() => {
        // Reset button state
        if (verifyButton) {
            verifyButton.disabled = false;
            verifyButton.textContent = 'Verify';
        }
    });
}

function startCodeExpityTimer() {
    let timeLeft = 120; // 2 minutes
    const timerElement = document.getElementById('codeExpiry');
    
    if (window.codeExpiryTimer) {
        clearInterval(window.codeExpiryTimer);
    }
    
    timerElement.textContent = `Code expires in: ${timeLeft} seconds`;
    
    window.codeExpiryTimer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Code expires in: ${timeLeft} seconds`;
        
        if (timeLeft <= 0) {
            clearInterval(window.codeExpiryTimer);
            timerElement.textContent = 'Code has expired';
        }
    }, 1000);
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
    if (modalId === 'verificationModal' && window.codeExpiryTimer) {
        clearInterval(window.codeExpiryTimer);
    }
}

function addTask() {
    const taskName = document.getElementById('taskName').value;
    const courseId = document.getElementById('taskCourse').value;
    const taskTag = document.getElementById('taskTag').value;
    const taskDeadline = document.getElementById('taskDeadline').value;
    
    if (!taskName || !courseId || !taskDeadline) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Get the selected course details
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    const selectedCourse = courses.find(course => course.id === courseId);

    if (!selectedCourse) {
        showNotification('Please select a valid course', 'error');
        return;
    }

    // Create task object
    const newTask = {
        id: Date.now().toString(),
        name: taskName,
        courseId: courseId,
        courseName: `${selectedCourse.code} - ${selectedCourse.name}`,
        tag: taskTag,
        deadline: taskDeadline
    };

    // Save task
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    // Update display
    closeModal('addTaskModal');
    showNotification('Task added successfully!', 'success');
    displayTasks(); // Make sure you have this function defined
    updateTaskCount(); // Update the task count in insights
}

function saveReminder(taskId) {
    const reminderTime = document.getElementById('reminderTime').value;
    
    fetch('../php/verify_email.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=save_reminder&task_id=${taskId}&reminder_time=${reminderTime}`
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.message || 'Failed to save reminder');
        }
    })
    .catch(error => {
        showNotification('Error saving reminder: ' + error.message, 'error');
    });
}

// Update loadTasks function
function loadTasks() {
    fetch('../php/get_tasks.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const tasksContainer = document.getElementById('tasksContainer');
                tasksContainer.innerHTML = ''; // Clear existing tasks
                
                data.tasks.forEach(task => {
                    const taskElement = `
                        <div class="task-item">
                            <h3>${task.name}</h3>
                            <p>${task.tag}</p>
                            <p>Deadline: ${task.deadline}</p>
                            <button onclick="testReminder(${task.id})" class="test-reminder-btn">
                                Test Reminder
                            </button>
                        </div>
                    `;
                    tasksContainer.innerHTML += taskElement;
                });
            }
        })
        .catch(error => {
            console.error('Error loading tasks:', error);
        });
}

// Add delete task function
function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    fetch('../php/delete_task.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `task_id=${taskId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadTasks(); // Reload the tasks
            alert('Task deleted successfully');
        } else {
            throw new Error(data.message || 'Failed to delete task');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting task: ' + error.message);
    });
}

// Call loadTasks when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});

// Function to show verification modal
function showVerificationModal() {
    const modalHTML = `
        <div id="verificationModal" class="modal">
            <div class="modal-content">
                <span class="close" onclick="closeModal('verificationModal')">&times;</span>
                <h3>Email Verification</h3>
                <div class="form-group">
                    <label for="verificationCode">Enter Verification Code:</label>
                    <input type="text" id="verificationCode" placeholder="Enter 6-digit code">
                    <button class="verify-btn" onclick="verifyCode()">Verify</button>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('verificationModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add new modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = document.getElementById('verificationModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Function to send verification code
function sendVerificationCode() {
    const emailInput = document.getElementById('userEmail');
    const enableReminder = document.getElementById('enableReminder');
    
    if (!emailInput || !emailInput.value || !enableReminder?.checked) {
        showNotification('Please enter email and enable reminders first', 'error');
        return;
    }

    const email = emailInput.value;
    const verifyButton = document.querySelector('.verify-email-btn');
    
    if (verifyButton) {
        verifyButton.disabled = true;
        verifyButton.textContent = 'Sending...';
    }

    fetch('../php/verify_email.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `email=${encodeURIComponent(email)}&action=send_code`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('temp_email', email);
            showNotification('Verification code sent to your email!', 'success');
            showVerificationModal();
        } else {
            throw new Error(data.message || 'Error sending code');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification(error.message, 'error');
    })
    .finally(() => {
        if (verifyButton) {
            verifyButton.disabled = false;
            verifyButton.textContent = 'Verify Email';
        }
    });
}

// Function to verify code
function verifyCode() {
    const codeInput = document.getElementById('verificationCode');
    const email = localStorage.getItem('temp_email');

    if (!codeInput || !codeInput.value) {
        showNotification('Please enter verification code', 'error');
        return;
    }

    if (!email) {
        showNotification('Email not found. Please try again.', 'error');
        return;
    }

    const verifyButton = document.querySelector('#verificationModal .verify-btn');
    if (verifyButton) {
        verifyButton.disabled = true;
        verifyButton.textContent = 'Verifying...';
    }

    fetch('../php/verify_email.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `code=${encodeURIComponent(codeInput.value)}&email=${encodeURIComponent(email)}&action=verify_code`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Email verified successfully!', 'success');
            closeModal('verificationModal');
            localStorage.removeItem('temp_email');
            
            // Enable the add task button
            const addTaskBtn = document.querySelector('#addTaskModal .submit-btn');
            if (addTaskBtn) {
                addTaskBtn.disabled = false;
            }
        } else {
            throw new Error(data.message || 'Verification failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification(error.message, 'error');
    })
    .finally(() => {
        if (verifyButton) {
            verifyButton.disabled = false;
            verifyButton.textContent = 'Verify';
        }
    });
}

// Initialize when document loads
document.addEventListener('DOMContentLoaded', () => {
    // Add verify email button if it doesn't exist
    const emailContainer = document.getElementById('userEmail')?.parentElement;
    if (emailContainer && !emailContainer.querySelector('.verify-email-btn')) {
        const verifyButton = document.createElement('button');
        verifyButton.type = 'button';
        verifyButton.className = 'verify-email-btn';
        verifyButton.textContent = 'Verify Email';
        verifyButton.onclick = sendVerificationCode;
        emailContainer.appendChild(verifyButton);
    }
});

// Add this at the bottom of the file
document.addEventListener('DOMContentLoaded', function() {
    const reminderCheckbox = document.getElementById('enableReminder');
    if (reminderCheckbox) {
        reminderCheckbox.addEventListener('change', function() {
            const reminderOptions = document.getElementById('reminderOptions');
            if (reminderOptions) {
                reminderOptions.style.display = this.checked ? 'block' : 'none';
            }
        });
    }
});

// Function to test reminder
function testReminder(taskId) {
    fetch('../php/test_reminder.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `task_id=${taskId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Test reminder sent successfully!', 'success');
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        showNotification(error.message, 'error');
    });
}

// Function to populate course dropdown in add task modal
function populateTaskCourseDropdown() {
    const taskCourseSelect = document.getElementById('taskCourse');
    if (!taskCourseSelect) {
        console.log('Task course select element not found');
        return;
    }

    // Get courses from localStorage
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    console.log('Found courses:', courses); // Debug log

    // Clear existing options
    taskCourseSelect.innerHTML = '<option value="">Select Course</option>';
    
    // Add courses to dropdown
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = `${course.code} - ${course.name}`;
        taskCourseSelect.appendChild(option);
        console.log('Added course to dropdown:', course.code, course.name); // Debug log
    });
}

// Add this to ensure dropdown is populated when needed
document.addEventListener('DOMContentLoaded', () => {
    // Initial population of dropdown
    populateTaskCourseDropdown();
    
    // Add click event listener to the "Add Task" button
    const addTaskBtn = document.querySelector('[onclick="showAddTaskModal()"]');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            setTimeout(populateTaskCourseDropdown, 100); // Small delay to ensure modal is open
        });
    }

    console.log('DOM loaded, initialized task course dropdown');
});

function addCourse() {
    const courseCode = document.getElementById('courseCode').value;
    const courseName = document.getElementById('courseName').value;
    const profName = document.getElementById('profName').value;

    if (!courseCode || !courseName || !profName) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    // Create new course object
    const newCourse = {
        id: Date.now().toString(),
        code: courseCode,
        name: courseName,
        professor: profName
    };

    // Get existing courses and add new one
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    courses.push(newCourse);
    
    // Save to localStorage
    localStorage.setItem('courses', JSON.stringify(courses));
    console.log('Saved courses:', courses); // Debug log

    // Update displays
    displayCourses();
    populateTaskCourseDropdown(); // Update dropdown immediately
    
    // Close modal and show success message
    closeModal('addCourseModal');
    showNotification('Course added successfully!', 'success');
}

// Function to display courses
function displayCourses() {
    const coursesList = document.getElementById('coursesList');
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    
    coursesList.innerHTML = courses.map(course => `
        <div class="course-card">
            <h3>${course.code}</h3>
            <p>${course.name}</p>
            <p class="professor">Prof. ${course.professor}</p>
            <button class="delete-course-btn" onclick="deleteCourse('${course.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    // Update course count in insights
    const activeCourseCount = document.getElementById('activeCourseCount');
    if (activeCourseCount) {
        activeCourseCount.textContent = courses.length;
    }
}

// Function to delete course
function deleteCourse(courseId) {
    if (confirm('Are you sure you want to delete this course?')) {
        // Get existing courses
        let courses = JSON.parse(localStorage.getItem('courses')) || [];
        
        // Filter out the course to delete
        courses = courses.filter(course => course.id !== courseId);
        
        // Save updated courses back to localStorage
        localStorage.setItem('courses', JSON.stringify(courses));
        
        // Refresh the display
        displayCourses();
        
        // Refresh the task course dropdown if it exists
        populateTaskCourseDropdown();
        
        showNotification('Course deleted successfully', 'success');
    }
}

// Call displayCourses when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayCourses();
});
