// Single source of truth for course and task management
const courseManager = {
    // Initialize
    init() {
        this.displayCourses();
        this.updateCounts();
        this.setupEventListeners();
        
        // Check reminders every minute
        setInterval(() => this.checkReminders(), 60000);
    },

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            if (modalId === 'addTaskModal') {
                this.populateTaskCourseDropdown();
            }
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            // Clear form inputs
            modal.querySelectorAll('input').forEach(input => {
                input.value = '';
            });
            if (modal.querySelector('select')) {
                modal.querySelector('select').value = '';
            }
        }
    },

    // Course Management with Database
    async addCourse() {
        const courseCode = document.getElementById('courseCode').value;
        const courseName = document.getElementById('courseName').value;
        const profName = document.getElementById('profName').value;

        if (!courseCode || !courseName || !profName) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('course_code', courseCode);
            formData.append('course_name', courseName);
            formData.append('professor_name', profName);

            const response = await fetch('../php/add_course.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            console.log('Server response:', data); // Debug log

            if (data.success) {
                // Save to localStorage
                const courses = this.getCourses();
                const newCourse = {
                    id: data.course_id,
                    code: courseCode,
                    name: courseName,
                    professor: profName
                };
                courses.push(newCourse);
                this.saveCourses(courses);

                // Update UI
                this.displayCourses();
                this.populateTaskCourseDropdown();
                this.closeModal('addCourseModal');
                this.showNotification('Course added successfully!', 'success');
            } else {
                throw new Error(data.message || 'Failed to add course');
            }
        } catch (error) {
            console.error('Error adding course:', error);
            this.showNotification(error.message || 'Error adding course', 'error');
        }
    },

    async deleteCourse(courseId) {
        console.log('Delete called with courseId:', courseId); // Debug log

        if (!courseId) {
            console.error('No course ID provided');
            return;
        }

        if (!confirm('Are you sure you want to delete this course?')) return;

        try {
            const formData = new FormData();
            formData.append('course_id', courseId.toString()); // Convert to string explicitly

            console.log('Sending delete request for course ID:', courseId); // Debug log

            const response = await fetch('../php/delete_course.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            console.log('Server response:', data); // Debug log

            if (data.success) {
                // Update localStorage
                let courses = this.getCourses();
                console.log('Before deletion:', courses); // Debug log
                courses = courses.filter(course => course.id.toString() !== courseId.toString());
                console.log('After deletion:', courses); // Debug log
                this.saveCourses(courses);

                // Update UI
                this.displayCourses();
                this.populateTaskCourseDropdown();
                this.showNotification('Course deleted successfully', 'success');
            } else {
                throw new Error(data.message || 'Failed to delete course');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            this.showNotification('Error deleting course: ' + error.message, 'error');
        }
    },

    // Email Verification
    showVerificationModal() {
        const modal = document.getElementById('verificationModal');
        if (modal) {
            modal.style.display = 'block';
        }
    },

    closeVerificationModal() {
        const modal = document.getElementById('verificationModal');
        if (modal) {
            modal.style.display = 'none';
        }
        if (window.codeExpiryTimer) {
            clearInterval(window.codeExpiryTimer);
        }
    },

    async sendVerificationCode() {
        const emailInput = document.getElementById('userEmail');
        const enableReminder = document.getElementById('enableReminder');
        
        if (!emailInput?.value || !enableReminder?.checked) {
            this.showNotification('Please enter email and enable reminders first', 'error');
            return;
        }

        const verifyButton = document.querySelector('.verify-email-btn');
        if (verifyButton) {
            verifyButton.disabled = true;
            verifyButton.textContent = 'Sending...';
        }

        try {
            const formData = new FormData();
            formData.append('email', emailInput.value);
            formData.append('action', 'send_code');

            const response = await fetch('../php/verify_email.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                localStorage.setItem('temp_email', emailInput.value);
                this.showNotification('Verification code sent!', 'success');
                this.showVerificationModal();
                this.startCodeExpiryTimer();
            } else {
                throw new Error(data.message || 'Failed to send verification code');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification(error.message, 'error');
        } finally {
            if (verifyButton) {
                verifyButton.disabled = false;
                verifyButton.textContent = 'Verify Email';
            }
        }
    },

    async verifyCode() {
        const codeInput = document.getElementById('verificationCode');
        const email = localStorage.getItem('temp_email');

        if (!codeInput || !codeInput.value) {
            this.showNotification('Please enter verification code', 'error');
            return;
        }

        if (!email) {
            this.showNotification('Email not found. Please try again.', 'error');
            return;
        }

        const verifyButton = document.querySelector('#verificationModal .verify-btn');
        if (verifyButton) {
            verifyButton.disabled = true;
            verifyButton.textContent = 'Verifying...';
        }

        try {
            const response = await fetch('../php/verify_email.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `code=${encodeURIComponent(codeInput.value)}&email=${encodeURIComponent(email)}&action=verify_code`
            });

            const data = await response.json();
            if (data.success) {
                this.showNotification('Email verified successfully!', 'success');
                this.closeVerificationModal();
                localStorage.removeItem('temp_email');
                
                // Show verification status
                const verificationStatus = document.getElementById('verificationStatus');
                if (verificationStatus) {
                    verificationStatus.style.display = 'block';
                }
            } else {
                throw new Error(data.message || 'Verification failed');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification(error.message, 'error');
        } finally {
            if (verifyButton) {
                verifyButton.disabled = false;
                verifyButton.textContent = 'Verify';
            }
        }
    },

    startCodeExpiryTimer() {
        let timeLeft = 120; // 2 minutes
        const timerElement = document.getElementById('codeExpiry');
        if (!timerElement) return;
        
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
    },

    // Task Management
    async addTask() {
        const taskName = document.getElementById('taskName').value;
        const courseId = document.getElementById('taskCourse').value;
        const taskTag = document.getElementById('taskTag').value;
        const taskDeadline = document.getElementById('taskDeadline').value;
        
        // Add these lines to get reminder settings
        const enableReminder = document.getElementById('enableReminder')?.checked;
        const reminderTime = document.getElementById('reminderTime')?.value;
        const userEmail = document.getElementById('userEmail')?.value;

        if (!taskName || !courseId || !taskDeadline) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Add validation for reminder settings
        if (enableReminder && (!userEmail || !reminderTime)) {
            this.showNotification('Please fill in email and reminder time', 'error');
            return;
        }

        try {
            // Debug log to check values
            console.log('Adding task with data:', {
                name: taskName,
                course_id: courseId,
                tag: taskTag,
                deadline: taskDeadline
            });

            // Check if course exists in localStorage
            const courses = this.getCourses();
            const courseExists = courses.some(course => course.id.toString() === courseId.toString());
            
            if (!courseExists) {
                this.showNotification('Selected course not found', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('name', taskName);
            formData.append('course_id', courseId);
            formData.append('tag', taskTag);
            formData.append('deadline', taskDeadline);

            const response = await fetch('../php/add_task.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            console.log('Server response:', data); // Debug log

            if (data.success) {
                // Save to local storage
                const tasks = this.getTasks();
                const newTask = {
                    id: data.task_id,
                    name: taskName,
                    courseId: courseId,
                    tag: taskTag,
                    deadline: taskDeadline,
                    // Add these reminder properties
                    reminder_enabled: enableReminder,
                    reminder_time: reminderTime,
                    email: userEmail,
                    reminder_sent: false
                };
                tasks.push(newTask);
                this.saveTasks(tasks);

                // Set up reminder if enabled
                if (enableReminder) {
                    await this.setupTaskReminder(newTask);
                }

                this.displayTasks();
                this.closeModal('addTaskModal');
                this.showNotification('Task added successfully!', 'success');
                this.updateCounts();
            } else {
                throw new Error(data.message || 'Failed to add task');
            }
        } catch (error) {
            console.error('Error adding task:', error);
            this.showNotification(error.message || 'Error adding task', 'error');
        }
    },

    // New method to set up task reminder
    async setupTaskReminder(task) {
        try {
            const formData = new FormData();
            formData.append('task_id', task.id);
            formData.append('email', task.email);
            formData.append('task_name', task.name);
            formData.append('deadline', task.deadline);
            formData.append('reminder_time', task.reminder_time);

            const response = await fetch('../php/schedule_reminder.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to schedule reminder');
            }
        } catch (error) {
            console.error('Error scheduling reminder:', error);
            this.showNotification('Reminder scheduled, but notification might be delayed', 'warning');
        }
    },

    // Add method to check for upcoming reminders
    async checkReminders() {
        try {
            const tasks = this.getTasks();
            const now = new Date();

            tasks.forEach(task => {
                if (task.reminder_enabled) {
                    const deadline = new Date(task.deadline);
                    const reminderTime = parseInt(task.reminder_time);
                    let reminderDate;

                    switch(reminderTime) {
                        case 30:
                            reminderDate = new Date(deadline.getTime() - (30 * 60 * 1000));
                            break;
                        case 60:
                            reminderDate = new Date(deadline.getTime() - (60 * 60 * 1000));
                            break;
                        case 1440:
                            reminderDate = new Date(deadline.getTime() - (24 * 60 * 60 * 1000));
                            break;
                    }

                    // If it's time to send reminder
                    if (reminderDate && now >= reminderDate && !task.reminder_sent) {
                        this.sendReminderEmail(task);
                        task.reminder_sent = true;
                    }
                }
            });

            this.saveTasks(tasks);
        } catch (error) {
            console.error('Error checking reminders:', error);
        }
    },

    // Method to send reminder email
    async sendReminderEmail(task) {
        try {
            const response = await fetch('../php/send_reminder.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    task_id: task.id,
                    email: task.email,
                    task_name: task.name,
                    deadline: task.deadline
                })
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error sending reminder:', error);
        }
    },

    // Display Functions
    displayCourses() {
        const coursesList = document.getElementById('coursesList');
        if (!coursesList) return;

        const courses = this.getCourses();
        console.log('Current courses:', courses); // Debug log

        coursesList.innerHTML = courses.map(course => {
            console.log('Rendering course:', course); // Debug log for each course
            return `
                <div class="course-card" data-id="${course.id}">
                    <div class="course-content">
                        <h3>${course.code}</h3>
                        <p>${course.name}</p>
                        <p class="professor">Prof. ${course.professor}</p>
                    </div>
                    <button class="delete-course-btn" type="button" 
                        onclick="courseManager.deleteCourse('${course.id}')" 
                        data-courseid="${course.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');

        this.updateCounts();
    },

    displayTasks() {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;

        const tasks = this.getTasks();
        const courses = this.getCourses();

        taskList.innerHTML = tasks.map(task => {
            const course = courses.find(c => c.id === task.courseId);
            return `
                <div class="task-item">
                    <h3>${task.name}</h3>
                    <p>${course ? course.code : 'Unknown Course'}</p>
                    <p class="tag">${task.tag}</p>
                    <p class="deadline">${new Date(task.deadline).toLocaleString()}</p>
                    <button onclick="courseManager.deleteTask('${task.id}')" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');

        this.updateCounts();
    },

    // Utility Functions
    getCourses() {
        return JSON.parse(localStorage.getItem('courses')) || [];
    },

    saveCourses(courses) {
        localStorage.setItem('courses', JSON.stringify(courses));
    },

    getTasks() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    },

    saveTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    },

    populateTaskCourseDropdown() {
        const taskCourseSelect = document.getElementById('taskCourse');
        if (!taskCourseSelect) return;

        const courses = this.getCourses();
        console.log('Available courses:', courses); // Debug log

        taskCourseSelect.innerHTML = '<option value="">Select Course</option>';
        
        courses.forEach(course => {
            console.log('Adding course to dropdown:', course); // Debug log
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = `${course.code} - ${course.name}`;
            taskCourseSelect.appendChild(option);
        });
    },

    updateCounts() {
        const courses = this.getCourses();
        const tasks = this.getTasks();
        
        const activeCourseCount = document.getElementById('activeCourseCount');
        if (activeCourseCount) {
            activeCourseCount.textContent = courses.length;
        }

        const totalTaskCount = document.getElementById('totalTaskCount');
        if (totalTaskCount) {
            totalTaskCount.textContent = tasks.length;
        }
    },

    showNotification(message, type = 'success') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        container.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    // Event Listeners
    setupEventListeners() {
        // Add Course button
        const addCourseBtn = document.querySelector('[onclick="courseManager.showModal(\'addCourseModal\')"]');
        if (addCourseBtn) {
            addCourseBtn.onclick = () => this.showModal('addCourseModal');
        }

        // Add Task button
        const addTaskBtn = document.querySelector('[onclick="courseManager.showModal(\'addTaskModal\')"]');
        if (addTaskBtn) {
            addTaskBtn.onclick = () => this.showModal('addTaskModal');
        }

        // Email verification listeners
        const verifyEmailBtn = document.querySelector('.verify-email-btn');
        if (verifyEmailBtn) {
            verifyEmailBtn.onclick = () => this.sendVerificationCode();
        }

        const verifyCodeBtn = document.querySelector('.verify-btn');
        if (verifyCodeBtn) {
            verifyCodeBtn.onclick = () => this.verifyCode();
        }

        // Enable reminder checkbox
        const enableReminder = document.getElementById('enableReminder');
        if (enableReminder) {
            enableReminder.onchange = (e) => {
                const reminderOptions = document.getElementById('reminderOptions');
                if (reminderOptions) {
                    reminderOptions.style.display = e.target.checked ? 'block' : 'none';
                }
            };
        }

        // Close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.onclick = (e) => {
                const modalId = e.target.closest('.modal').id;
                this.closeModal(modalId);
            };
        });

        // Outside click
        window.onclick = (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        };
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    courseManager.init();
}); 