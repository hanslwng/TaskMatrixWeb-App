function handlePhoneScreenEffect() {
    const phoneScreen = document.querySelector('.phone-screen');
    if (!phoneScreen) return;

    phoneScreen.addEventListener('mousemove', (e) => {
        const rect = phoneScreen.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        phoneScreen.style.setProperty('--mouse-x', `${x}%`);
        phoneScreen.style.setProperty('--mouse-y', `${y}%`);
    });

    phoneScreen.addEventListener('mouseleave', () => {
        phoneScreen.style.setProperty('--mouse-x', '50%');
        phoneScreen.style.setProperty('--mouse-y', '50%');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    handlePhoneScreenEffect();
});
