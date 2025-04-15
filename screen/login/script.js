// Sidebar and submenu handling
const toggleButton = document.getElementById('toggle-btn');
const sidebar = document.getElementById('sidebar');

// Toggles the sidebar visibility and button rotation
function toggleSidebar() {
    sidebar.classList.toggle('close');
    toggleButton.classList.toggle('rotate');
    closeAllSubMenus(); // Close any open submenus when sidebar toggles
}

// Toggles a specific submenu and ensures only one submenu is open at a time
function toggleSubMenu(button) {
    const submenu = button.nextElementSibling;

    // Close all submenus if the clicked one isn't open
    if (!submenu.classList.contains('show')) {
        closeAllSubMenus();
    }

    // Toggle submenu visibility and button rotation
    submenu.classList.toggle('show');
    button.classList.toggle('rotate');

    // Ensure sidebar is open if a submenu is being shown
    if (sidebar.classList.contains('close')) {
        sidebar.classList.remove('close');
        toggleButton.classList.remove('rotate');
    }
}

// Closes all open submenus and resets button rotations
function closeAllSubMenus() {
    Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
        ul.classList.remove('show');
        ul.previousElementSibling.classList.remove('rotate');
    });
}

// Toggle between Login and Register panels
const registerButton = document.getElementById("register");
const loginButton = document.getElementById("login");
const container = document.getElementById("container");

// Function to switch to the Register panel
function showRegisterPanel() {
    container.classList.add("right-panel-active");
}

// Function to switch to the Login panel
function showLoginPanel() {
    container.classList.remove("right-panel-active");
}

// Event listeners for toggling panels
registerButton.addEventListener("click", showRegisterPanel);
loginButton.addEventListener("click", showLoginPanel);

// Register form submission handling
document.querySelector('.register-container form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);

    // Send registration request to connect.php
    fetch("connect.php", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Registration successful! Please log in.");
            showLoginPanel(); // Switch to login panel
        } else {
            alert(data.message || "Registration failed.");
        }
    })
    .catch(error => console.error("Error during registration:", error));
});

// Login form submission handling
document.querySelector('.login-container form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);

    // Send login request to login.php
    fetch("login.php", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Redirect to screen1.html if login is successful
            window.location.href = data.redirect; // Use redirect URL from the response
        } else {
            alert(data.message || 'Invalid login credentials');
        }
    })
    .catch(error => console.error("Error during login:", error));
});
