document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: '#6c63ff'
            },
            shape: {
                type: 'circle'
            },
            opacity: {
                value: 0.5,
                random: false
            },
            size: {
                value: 3,
                random: true
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#6c63ff',
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 6,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'out',
                bounce: false
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'repulse'
                },
                onclick: {
                    enable: true,
                    mode: 'push'
                },
                resize: true
            }
        },
        retina_detect: true
    });

    // Modal functionality
    const featureCards = document.querySelectorAll('.feature-card');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-modal');

    featureCards.forEach(card => {
        card.addEventListener('click', () => {
            const modalId = card.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            modal.style.display = 'block';
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            modal.style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Add hover effect sound (optional)
    const hoverSound = new Audio('path/to/hover-sound.mp3'); // Add your sound file
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            hoverSound.currentTime = 0;
            hoverSound.play().catch(() => {}); // Catch and ignore autoplay errors
        });
    });

    // Tutorial Navigation Enhancement
    const tutorialSteps = document.querySelectorAll('.tutorial-step');
    const prevBtn = document.querySelector('.prev-step');
    const nextBtn = document.querySelector('.next-step');
    const stepCounter = document.querySelector('.step-counter');
    let currentStep = 1;
    const totalSteps = tutorialSteps.length;

    function updateTutorialStep() {
        tutorialSteps.forEach(step => {
            step.classList.remove('active');
            step.classList.remove('slide-left');
            step.classList.remove('slide-right');
        });

        const currentStepEl = document.querySelector(`[data-step="${currentStep}"]`);
        currentStepEl.classList.add('active');
        
        // Add animation direction
        if (currentStep > 1) currentStepEl.classList.add('slide-right');
        if (currentStep < totalSteps) currentStepEl.classList.add('slide-left');

        stepCounter.textContent = `Step ${currentStep} of ${totalSteps}`;
        prevBtn.disabled = currentStep === 1;
        nextBtn.disabled = currentStep === totalSteps;

        // Update progress indicator
        const progress = (currentStep - 1) / (totalSteps - 1) * 100;
        document.querySelector('.tutorial-progress-bar').style.width = `${progress}%`;
    }

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateTutorialStep();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            currentStep++;
            updateTutorialStep();
        }
    });

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        const tutorialModal = document.getElementById('tutorialModal');
        if (tutorialModal.style.display === 'block') {
            if (e.key === 'ArrowRight' && !nextBtn.disabled) {
                nextBtn.click();
            } else if (e.key === 'ArrowLeft' && !prevBtn.disabled) {
                prevBtn.click();
            }
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === '?') {
            document.querySelector('[data-modal="shortcutsModal"]').click();
        }
        // Add more keyboard shortcuts as needed
    });
}); 