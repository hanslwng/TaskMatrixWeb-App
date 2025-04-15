function displayCourses() {
    const coursesList = document.getElementById('coursesList');
    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    
    coursesList.innerHTML = courses.map(course => `
        <div class="course-card">
            <div class="course-content">
                <h3>${course.code}</h3>
                <p>${course.name}</p>
                <p class="professor">Prof. ${course.professor}</p>
            </div>
            <button class="delete-course-btn" onclick="deleteCourse('${course.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    // Update the active course count in the insights section
    const activeCourseCount = document.getElementById('activeCourseCount');
    if (activeCourseCount) {
        activeCourseCount.textContent = courses.length.toString();
        console.log('Updated active course count:', courses.length); // Debug log
    }

    // Update the total tasks count
    updateTaskCount();
}

// Function to update task count
function updateTaskCount() {
    const tasks = document.querySelectorAll('.task-item');
    const totalTaskCount = document.getElementById('totalTaskCount');
    if (totalTaskCount) {
        totalTaskCount.textContent = tasks.length.toString();
        console.log('Updated task count:', tasks.length); // Debug log
    }
}

// Function to add a course
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

    // Update display
    displayCourses();
    
    // Close modal and show success message
    closeModal('addCourseModal');
    showNotification('Course added successfully!', 'success');
}

// Function to delete course
function deleteCourse(courseId) {
    if (confirm('Are you sure you want to delete this course?')) {
        let courses = JSON.parse(localStorage.getItem('courses')) || [];
        courses = courses.filter(course => course.id !== courseId);
        localStorage.setItem('courses', JSON.stringify(courses));
        displayCourses();
        showNotification('Course deleted successfully', 'success');
    }
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing...'); // Debug log
    displayCourses();
}); 