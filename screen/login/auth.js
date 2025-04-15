$(document).ready(function() {
    // Handle Login Form Submission
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();

        var email = $('#loginEmail').val();
        var password = $('#loginPassword').val();

        $.ajax({
            type: "POST",
            url: "login.php",
            data: { email: email, password: password },
            dataType: "json",
            success: function(response) {
                if (response.success) {
                    window.location.href = response.redirect;
                } else {
                    alert(response.message || "Login failed.");
                }
            },
            error: function() {
                alert("An error occurred while processing your request.");
            }
        });
    });

    // Handle Register Form Submission
    $('#registerForm').on('submit', function(e) {
        e.preventDefault();

        var formData = new FormData(this);

        console.log("Form Data:", Object.fromEntries(formData));

        $.ajax({
            type: "POST",
            url: "connect.php",
            data: formData,
            processData: false,
            contentType: false,
            dataType: "json",
            success: function(response) {
                if (response.success) {
                    alert("Registration successful! You can now log in.");
                    $('#registerForm')[0].reset();
                    $('#login').click();
                } else {
                    alert(response.message || "Registration failed.");
                }
            },
            error: function(xhr, status, error) {
                console.error("Error details:", xhr.responseText);
                alert("An error occurred while processing your registration. Please try again.");
            }
        });
    });

    // Handle forgot password form submission
    $('#forgotPasswordForm').on('submit', function(e) {
        e.preventDefault();
        
        const email = $('#resetEmail').val();
        const submitBtn = $(this).find('button[type="submit"]');
        
        // Show loading state
        submitBtn.prop('disabled', true).html('<i class="lni lni-spinner-arrow"></i> Sending...');

        $.ajax({
            type: 'POST',
            url: 'reset_password.php',
            data: { email: email },
            dataType: 'json',
            success: function(response) {
                // Close forgot password modal
                $('#forgotPasswordModal').fadeOut();
                
                // Show simple success notification
                showNotification(response.message, response.success ? 'success' : 'error');
                
                // Reset form
                $('#forgotPasswordForm')[0].reset();
                
                // For testing - log the token
                if (response.debug_token) {
                    console.log('Reset Token:', response.debug_token);
                }
            },
            error: function() {
                showNotification('An error occurred. Please try again.', 'error');
            },
            complete: function() {
                submitBtn.prop('disabled', false).html('Send Reset Link');
            }
        });
    });

    // Function to show notification
    function showNotification(message, type = 'success') {
        // Remove any existing notification
        $('.notification').remove();
        
        // Create new notification
        const notification = $(`
            <div class="notification ${type}">
                <div class="notification-content">
                    <i class="lni ${type === 'success' ? 'lni-checkmark-circle' : 'lni-cross-circle'}"></i>
                    <span>${message}</span>
                </div>
            </div>
        `);
        
        // Add to body
        $('body').append(notification);
        
        // Show with animation
        setTimeout(() => notification.addClass('show'), 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.removeClass('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Close modals when clicking outside
    $(window).on('click', function(e) {
        if ($(e.target).hasClass('modal')) {
            $(e.target).fadeOut();
        }
    });

    // Close modal when clicking X
    $('.close-modal').on('click', function() {
        $(this).closest('.modal').fadeOut();
    });

    // Show forgot password modal
    window.showForgotPasswordModal = function(event) {
        if (event) event.preventDefault();
        $('#forgotPasswordModal').fadeIn();
    };

    // Close forgot password modal
    window.closeForgotPasswordModal = function() {
        $('#forgotPasswordModal').fadeOut();
        $('#forgotPasswordForm')[0].reset();
    };
}); 