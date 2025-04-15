// Global variables
let userCourses = [];
let isEmailVerified = false;

// Load courses when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCourses();
    updateCounters();
    
    // Add search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', handleSearch);
});

// Function to load courses
async function loadCourses() {
    try {
        console.log('Loading courses...');
        const response = await fetch('../php/get_courses.php', {
            credentials: 'include' // Important: Include credentials for session
        });
        console.log('Response received:', response);
        
        const data = await response.json();
        console.log('Courses data:', data);
        
        if (data.success) {
            userCourses = data.courses;
            displayCourses();
            updateTaskCourseDropdown();
        } else {
            console.error('Failed to load courses:', data.message);
        }
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

// Function to display courses
function displayCourses() {
    const coursesList = document.getElementById('coursesList');
    if (!coursesList) {
        console.error('coursesList element not found');
        return;
    }
    
    coursesList.innerHTML = '';
    console.log('Displaying courses:', userCourses);

    userCourses.forEach(course => {
        const courseElement = document.createElement('div');
        courseElement.className = 'course-card';
        courseElement.innerHTML = `
            <h3>${course.course_code}</h3>
            <p>${course.course_name}</p>
            <p>Professor: ${course.professor_name}</p>
        `;
        coursesList.appendChild(courseElement);
    });
}

// Function to add course
async function addCourse() {
    const courseCode = document.getElementById('courseCode').value;
    const courseName = document.getElementById('courseName').value;
    const professorName = document.getElementById('profName').value;

    console.log('Adding course:', { courseCode, courseName, professorName });

    if (!courseCode || !courseName || !professorName) {
        alert('Please fill in all course fields');
        return;
    }

    const courseData = {
        course_code: courseCode,
        course_name: courseName,
        professor_name: professorName
    };

    try {
        console.log('Sending request to add course...');
        const response = await fetch('../php/add_course.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(courseData),
            credentials: 'include' // Important: Include credentials for session
        });

        console.log('Response received:', response);
        const result = await response.json();
        console.log('Result:', result);
        
        if (result.success) {
            alert('Course added successfully!');
            closeModal('addCourseModal');
            await loadCourses(); // Wait for courses to reload
            
            // Clear form fields
            document.getElementById('courseCode').value = '';
            document.getElementById('courseName').value = '';
            document.getElementById('profName').value = '';

            updateCounters();
            showNotification('Course added successfully', 'success');
        } else {
            alert('Error adding course: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding the course');
    }
}

// Function to update task course dropdown
function updateTaskCourseDropdown() {
    const taskCourse = document.getElementById('taskCourse');
    taskCourse.innerHTML = '<option value="">Select Course</option>';
    
    userCourses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.course_code;
        option.textContent = `${course.course_code} - ${course.course_name}`;
        taskCourse.appendChild(option);
    });
}

// Function to add task
async function addTask() {
    const taskName = document.getElementById('taskName').value;
    const taskCourse = document.getElementById('taskCourse').value;
    const taskTag = document.getElementById('taskTag').value;
    const taskDeadline = document.getElementById('taskDeadline').value;
    const enableReminder = document.getElementById('enableReminder').checked;

    if (!taskName || !taskDeadline || !taskCourse) {
        alert('Please fill in all required fields');
        return;
    }

    if (enableReminder) {
        if (!isEmailVerified) {
            alert('Please verify your email first to enable reminders');
            return;
        }
        if (!document.getElementById('userEmail').value) {
            alert('Please enter your email for reminders');
            return;
        }
    }

    const taskData = {
        title: taskName,
        course_code: taskCourse,
        tag: taskTag,
        deadline: taskDeadline,
        enable_reminder: enableReminder,
        email: enableReminder ? document.getElementById('userEmail').value : null,
        reminder_time: enableReminder ? document.getElementById('reminderTime').value : null
    };

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
            loadTasks(); // Reload tasks

            updateCounters();
            showNotification('Task added successfully', 'success');
        } else {
            alert('Error adding task: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding the task');
    }
}

// Email verification functions
function sendVerificationCode() {
    const email = document.getElementById('userEmail').value;
    if (!email) {
        alert('Please enter your email');
        return;
    }

    // Add your email verification logic here
    // For now, we'll simulate verification
    document.getElementById('verificationModal').style.display = 'block';
}

function verifyCode() {
    const code = document.getElementById('verificationCode').value;
    if (code.length === 6) { // Simple validation
        isEmailVerified = true;
        document.getElementById('verificationStatus').style.display = 'block';
        document.getElementById('verificationModal').style.display = 'none';
        alert('Email verified successfully!');
    } else {
        alert('Invalid verification code');
    }
}

function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course?')) {
        return;
    }

    fetch('php/delete_course.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'id=' + courseId
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Remove the course row from the table
            const courseElement = document.querySelector(`tr[data-course-id="${courseId}"]`);
            if (courseElement) {
                courseElement.remove();
            }
        } else {
            alert('Error deleting course: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting course');
    });

    updateCounters();
    showNotification('Course deleted successfully', 'success');
}

// Find the function that creates course cards and modify it to include the delete button
function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = 'course-card';
    card.dataset.id = course.id;
    
    card.innerHTML = `
        <div class="course-header">
            <div class="course-info">
                <div class="course-code">${course.course_code}</div>
                <div class="course-name">${course.course_name}</div>
                <div class="prof-name">
                    <i class="fas fa-user"></i> ${course.prof_name}
                </div>
            </div>
            <button class="delete-course-btn" onclick="deleteCourse(${course.id}, event)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return card;
}

// Add this function to handle course deletion
async function deleteCourse(courseId, event) {
    event.stopPropagation(); // Prevent card selection when clicking delete
    
    if (!confirm('Are you sure you want to delete this course?')) {
        return;
    }

    try {
        const formData = new FormData();
        formData.append('id', courseId);

        const response = await fetch('../php/delete_course.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            // Remove the course card from the UI
            const courseCard = document.querySelector(`.course-card[data-id="${courseId}"]`);
            courseCard.remove();
            
            // Show success notification
            showNotification('Course deleted successfully', 'success');
            
            // Refresh the task list if it exists
            if (typeof loadTasks === 'function') {
                loadTasks();
            }
        } else {
            showNotification(data.message || 'Failed to delete course', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred while deleting the course', 'error');
    }
} 

// Add these functions to update the counters
function updateCounters() {
    // Update Active Courses counter
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    document.getElementById('activeCourseCount').textContent = courses.length;

    // Update Total Tasks counter
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    document.getElementById('totalTaskCount').textContent = tasks.length;
}

// Modify your existing addCourse function
function addCourse() {
    // ... existing addCourse code ...

    // After successfully adding the course:
    updateCounters();
    showNotification('Course added successfully', 'success');
}

// Modify your existing addTask function
function addTask() {
    // ... existing addTask code ...

    // After successfully adding the task:
    updateCounters();
    showNotification('Task added successfully', 'success');
}

// Modify your existing deleteCourse function
function deleteCourse(courseId) {
    // ... existing deleteCourse code ...

    // After successfully deleting the course:
    updateCounters();
    showNotification('Course deleted successfully', 'success');
}

// Call updateCounters when the page loads
document.addEventListener('DOMContentLoaded', function() {
    updateCounters();
    // ... any other existing initialization code ...
}); 

// Add this new function for search handling
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const coursesList = document.getElementById('coursesList');
    const taskList = document.getElementById('taskList');
    
    // Search through courses
    const courses = Array.from(coursesList.getElementsByClassName('course-card'));
    courses.forEach(course => {
        const courseName = course.querySelector('.course-name').textContent.toLowerCase();
        const courseCode = course.querySelector('.course-code').textContent.toLowerCase();
        const profName = course.querySelector('.prof-name').textContent.toLowerCase();
        
        if (courseName.includes(searchTerm) || 
            courseCode.includes(searchTerm) || 
            profName.includes(searchTerm)) {
            course.style.display = 'block';
        } else {
            course.style.display = 'none';
        }
    });
    
    // Search through tasks if they exist
    if (taskList) {
        const tasks = Array.from(taskList.getElementsByClassName('task-item'));
        tasks.forEach(task => {
            const taskName = task.querySelector('h3').textContent.toLowerCase();
            const taskCourse = task.querySelector('.task-meta').textContent.toLowerCase();
            
            if (taskName.includes(searchTerm) || taskCourse.includes(searchTerm)) {
                task.style.display = 'block';
            } else {
                task.style.display = 'none';
            }
        });
    }
} 