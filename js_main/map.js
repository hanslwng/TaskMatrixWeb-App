let map;
let marker;
let selectedLocation;

// Initialize the map
function initMap() {
    map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add click event to map
    map.on('click', function(e) {
        if (marker) {
            map.removeLayer(marker);
        }
        marker = L.marker(e.latlng).addTo(map);
        selectedLocation = e.latlng;
    });
}

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    loadSavedEvents();

    // Add event button handler
    document.getElementById('addEventBtn').addEventListener('click', function(e) {
        e.preventDefault();
        if (!selectedLocation) {
            alert('Please select a location on the map first');
            return;
        }
        document.getElementById('addEventModal').style.display = 'block';
    });

    // Save event button handler
    document.getElementById('saveEventBtn').addEventListener('click', function(e) {
        e.preventDefault();
        saveEvent();
    });

    // Event form submit handler
    document.getElementById('eventForm').addEventListener('submit', function(e) {
        e.preventDefault();
    });
});

// Close modal function
function closeEventModal() {
    document.getElementById('addEventModal').style.display = 'none';
}

// Save event function
function saveEvent() {
    const eventType = document.getElementById('eventType').value;
    const eventName = document.getElementById('eventName').value;
    const eventDate = document.getElementById('eventDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const eventDescription = document.getElementById('eventDescription').value;
    const eventReminder = document.getElementById('eventReminder').value;
    
    if (!eventName || !eventDate || !startTime || !endTime) {
        alert('Please fill in all required fields');
        return;
    }

    const event = {
        type: eventType,
        name: eventName,
        date: eventDate,
        startTime: startTime,
        endTime: endTime,
        description: eventDescription,
        reminder: eventReminder,
        location: {
            lat: selectedLocation.lat,
            lng: selectedLocation.lng
        },
        timestamp: new Date().toISOString()
    };

    // Get existing events or initialize empty array
    let savedEvents = JSON.parse(localStorage.getItem('savedEvents') || '[]');
    savedEvents.push(event);
    
    // Save to localStorage
    localStorage.setItem('savedEvents', JSON.stringify(savedEvents));

    // Add to location list
    addEventToList(event);

    // Close modal and reset form
    closeEventModal();
    document.getElementById('eventForm').reset();

    // Keep the marker on the map
    const eventMarker = L.marker([event.location.lat, event.location.lng]).addTo(map);
    
    // Add popup to marker
    eventMarker.bindPopup(`
        <strong>${event.name}</strong><br>
        Date: ${event.date}<br>
        Time: ${event.startTime} - ${event.endTime}
    `);
}

// Add event to the location list
function addEventToList(event) {
    const locationItems = document.querySelector('.location-items');
    const eventElement = document.createElement('div');
    eventElement.className = 'location-item';
    eventElement.setAttribute('data-type', event.type);
    
    const dateObj = new Date(event.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });

    eventElement.innerHTML = `
        <h4>${event.name}</h4>
        <p>${event.description}</p>
        <div class="event-details">
            <span class="event-date">${formattedDate}</span>
            <span class="event-time">${event.startTime} - ${event.endTime}</span>
        </div>
        <small>Lat: ${event.location.lat.toFixed(4)}, Lng: ${event.location.lng.toFixed(4)}</small>
    `;
    
    locationItems.appendChild(eventElement);
}

// Load saved events when page loads
function loadSavedEvents() {
    const savedEvents = JSON.parse(localStorage.getItem('savedEvents') || '[]');
    savedEvents.forEach(event => {
        addEventToList(event);
        L.marker([event.location.lat, event.location.lng]).addTo(map);
    });
}

// Add current location button functionality
document.getElementById('currentLocationBtn').addEventListener('click', function() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            map.setView([lat, lng], 13);
            if (marker) {
                map.removeLayer(marker);
            }
            marker = L.marker([lat, lng]).addTo(map);
            selectedLocation = { lat, lng };
        });
    } else {
        alert("Geolocation is not supported by your browser");
    }
});

// Load saved events when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadSavedEvents();
});

// Add this function to handle reminders
function checkReminders() {
    const savedEvents = JSON.parse(localStorage.getItem('savedEvents') || '[]');
    const now = new Date();

    savedEvents.forEach(event => {
        if (event.reminder === 'none') return;

        const eventDateTime = new Date(`${event.date} ${event.startTime}`);
        const reminderTime = new Date(eventDateTime - event.reminder * 60000);

        if (now >= reminderTime && !event.notified) {
            // Show notification
            if ("Notification" in window) {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        new Notification(event.name, {
                            body: `Event starting in ${event.reminder} minutes at ${event.startTime}`,
                            icon: '/path/to/notification-icon.png'
                        });
                    }
                });
            }
            
            // Mark as notified
            event.notified = true;
            localStorage.setItem('savedEvents', JSON.stringify(savedEvents));
        }
    });
}

// Check for reminders every minute
setInterval(checkReminders, 60000); 