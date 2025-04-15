// Function to populate course dropdown
function populateCourseDropdown() {
    fetch('get_user_courses.php')
        .then(response => response.json())
        .then(courses => {
            const courseSelect = document.getElementById('courseSelect');
            courseSelect.innerHTML = '<option value="">Select Course</option>';
            
            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.course_code;
                option.textContent = course.course_name;
                courseSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching courses:', error));
}

// Call populateCourseDropdown when the modal opens
document.addEventListener('DOMContentLoaded', function() {
    const addTaskBtn = document.querySelector('.add-task-btn'); // Adjust selector based on your button
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', function() {
            populateCourseDropdown();
        });
    }
});

// Add your existing task modal code here
// Such as opening/closing modal, form submission, etc. 