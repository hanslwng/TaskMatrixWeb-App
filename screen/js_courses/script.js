let courses = [];
let tasks = [];
let selectedCourse = null;

// Modified to load courses from database
async function initializeData() {
    try {
        const response = await fetch('../php/get_courses.php');
        const data = await response.json();
        
        if (data.success) {
            courses = data.courses;
        } else {
            console.error('Failed to load courses:', data.message);
            // Fallback to default courses if database load fails
            courses = [
                { id: 1, course_code: 'IT 206', course_name: 'Advanced Database Systems', professor_name: 'Dr. Mark David Gonzalo' },
                { id: 2, course_code: 'IT 207', course_name: 'Object-Oriented Programming 2', professor_name: 'Dr. Anna Carmen Peralta' }
            ];
        }
        renderCourses();
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

// Modified to work with database structure
function renderCourses() {
    const coursesList = document.getElementById('coursesList');
    coursesList.innerHTML = '';
    
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = `course-card${selectedCourse === course.id ? ' selected' : ''}`;
        courseCard.onclick = () => selectCourse(course.id);
        courseCard.innerHTML = `
            <div class="course-code">${course.course_code}</div>
            <div class="course-name">${course.course_name}</div>
            <div class="prof-name">
                <i class="fas fa-user-tie"></i>
                ${course.professor_name}
            </div>
        `;
        coursesList.appendChild(courseCard);
    });

    updateTaskCourseDropdown();
}

// Modified to work with database structure
async function addCourse() {
    const code = document.getElementById('courseCode').value;
    const name = document.getElementById('courseName').value;
    const professor = document.getElementById('profName').value;

    if (code && name && professor) {
        const courseData = {
            course_code: code,
            course_name: name,
            professor_name: professor
        };

        try {
            const response = await fetch('../php/add_course.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(courseData)
            });

            const result = await response.json();
            
            if (result.success) {
                // Reload courses from database
                initializeData();
                closeModal('addCourseModal');
                showNotification('Success', 'Course added successfully');
            } else {
                showNotification('Error', result.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error', 'Failed to add course', 'error');
        }
    } else {
        showNotification('Error', 'Please fill in all fields', 'error');
    }
}

// Keep your existing functions but update them to use the new course structure
function getCourseCode(courseId) {
    const course = courses.find(c => c.id === courseId);
    return course ? course.course_code : '';
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    renderTasks();
});