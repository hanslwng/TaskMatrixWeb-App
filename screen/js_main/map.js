let map, marker, watchId;
let is3DMode = false;

// Initialize map
function initMap() {
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([0, 0], 2);

    // Add detailed satellite imagery layer
    const satelliteLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    // Add terrain layer
    const terrainLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    // Add custom controls
    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

    // Initialize marker with custom icon
    marker = L.marker([0, 0], {
        icon: L.divIcon({
            className: 'custom-marker',
            html: '<span class="material-icons-sharp location-pin">person_pin_circle</span>',
            iconSize: [40, 40],
            iconAnchor: [20, 40]
        })
    }).addTo(map);

    // Add pulse animation to marker
    const pulseIcon = L.divIcon({
        className: 'custom-marker-pulse',
        html: '<span class="pulse-ring"></span>',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    const pulseMarker = L.marker([0, 0], {
        icon: pulseIcon
    }).addTo(map);

    // Start tracking location
    startTracking();

    // Event listeners for control buttons
    document.getElementById('toggle3DBtn').addEventListener('click', () => {
        is3DMode = !is3DMode;
        if (is3DMode) {
            map.setView(marker.getLatLng(), 18, {
                animate: true,
                duration: 1
            });
            // Switch to terrain layer for 3D effect
            satelliteLayer.remove();
            terrainLayer.addTo(map);
            document.getElementById('toggle3DBtn').classList.add('active');
        } else {
            map.setView(marker.getLatLng(), 16, {
                animate: true,
                duration: 1
            });
            // Switch back to satellite layer
            terrainLayer.remove();
            satelliteLayer.addTo(map);
            document.getElementById('toggle3DBtn').classList.remove('active');
        }
    });

    document.getElementById('currentLocationBtn').addEventListener('click', () => {
        if (marker) {
            map.flyTo(marker.getLatLng(), 18, {
                animate: true,
                duration: 1.5
            });
            // Add tracking animation
            document.getElementById('currentLocationBtn').classList.add('tracking');
            setTimeout(() => {
                document.getElementById('currentLocationBtn').classList.remove('tracking');
            }, 2000);
        }
    });

    document.getElementById('compassBtn').addEventListener('click', () => {
        map.setBearing(0);
        map.setView(marker.getLatLng(), map.getZoom(), {
            animate: true,
            duration: 1
        });
        // Add rotation animation
        document.getElementById('compassBtn').classList.add('rotating');
        setTimeout(() => {
            document.getElementById('compassBtn').classList.remove('rotating');
        }, 1000);
    });

    return { map, marker, pulseMarker };
}

// Track user's location
function startTracking() {
    if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
            updateLocation,
            handleLocationError,
            {
                enableHighAccuracy: true,
                maximumAge: 30000,
                timeout: 27000
            }
        );
    } else {
        handleLocationError({ message: "Geolocation is not supported by your browser" });
    }
}

// Update location on map
function updateLocation(position) {
    const { latitude, longitude, altitude, accuracy, heading, speed } = position.coords;
    
    // Update marker and map view
    const latlng = [latitude, longitude];
    marker.setLatLng(latlng);
    
    // Update pulse marker position
    if (window.pulseMarker) {
        window.pulseMarker.setLatLng(latlng);
    }

    // Smooth map movement
    if (!map.getBounds().contains(latlng)) {
        map.flyTo(latlng, map.getZoom(), {
            animate: true,
            duration: 1
        });
    }

    // Update info display with enhanced information
    document.getElementById('latitude').textContent = `Lat: ${latitude.toFixed(6)}`;
    document.getElementById('longitude').textContent = `Long: ${longitude.toFixed(6)}`;
    
    if (altitude) {
        document.getElementById('altitude').textContent = 
            `Altitude: ${Math.round(altitude)}m (±${Math.round(position.coords.altitudeAccuracy || 0)}m)`;
    }

    // Add speed and heading if available
    if (speed) {
        const speedKmh = (speed * 3.6).toFixed(1); // Convert m/s to km/h
        document.getElementById('altitude').textContent += ` • ${speedKmh} km/h`;
    }

    if (heading) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(heading / 45) % 8;
        document.getElementById('altitude').textContent += ` • ${directions[index]}`;
    }

    // Update location info
    reverseGeocode(latitude, longitude);
    getWeatherInfo(latitude, longitude);
}

// Reverse geocoding
async function reverseGeocode(lat, lon) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
        const data = await response.json();
        document.getElementById('locationAddress').textContent = data.display_name;
    } catch (error) {
        console.error('Geocoding error:', error);
    }
}

// Get weather information
async function getWeatherInfo(lat, lon) {
    const API_KEY = 'your_openweathermap_api_key'; // Get from OpenWeatherMap
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
        const data = await response.json();
        
        document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
        document.getElementById('weatherDesc').textContent = data.weather[0].description;
    } catch (error) {
        console.error('Weather error:', error);
    }
}

// Handle location errors
function handleLocationError(error) {
    console.error('Location error:', error);
    document.getElementById('locationAddress').textContent = 'Unable to get location';
}

// Add these styles to your CSS
const styles = `
.custom-marker .location-pin {
    color: #2a91ec;
    font-size: 40px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.custom-marker-pulse .pulse-ring {
    display: block;
    width: 40px;
    height: 40px;
    background-color: rgba(42, 145, 236, 0.3);
    border-radius: 50%;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(0.5);
        opacity: 1;
    }
    100% {
        transform: scale(2);
        opacity: 0;
    }
}

.map-btn.tracking {
    animation: tracking 2s infinite;
}

.map-btn.rotating {
    animation: rotate 1s ease-out;
}

@keyframes tracking {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

@keyframes rotate {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
}
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', initMap);

// Update the modal handling code
document.addEventListener('DOMContentLoaded', function() {
    const locationInfoBtn = document.getElementById('locationInfoBtn');
    const locationInfoModal = document.getElementById('locationInfoModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');

    locationInfoBtn.addEventListener('click', function() {
        locationInfoModal.style.display = 'flex';
        // Use setTimeout to ensure display: flex is applied before adding active class
        setTimeout(() => {
            locationInfoModal.classList.add('active');
        }, 10);
    });

    function closeModal() {
        locationInfoModal.classList.remove('active');
        // Wait for animation to complete before hiding
        setTimeout(() => {
            locationInfoModal.style.display = 'none';
        }, 300);
    }

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    window.addEventListener('click', function(e) {
        if (e.target === locationInfoModal) {
            closeModal();
        }
    });

    // Add escape key support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && locationInfoModal.classList.contains('active')) {
            closeModal();
        }
    });
});

// Add this to your existing JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('locationSearch');
    const searchResults = document.getElementById('searchResults');
    const clearSearchBtn = document.getElementById('clearSearch');
    let searchTimeout;

    // Search functionality
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value;
        clearSearchBtn.style.display = query ? 'block' : 'none';

        if (query.length < 3) {
            searchResults.style.display = 'none';
            return;
        }

        // Clear previous timeout
        clearTimeout(searchTimeout);

        // Set new timeout to prevent too many API calls
        searchTimeout = setTimeout(() => {
            searchLocation(query);
        }, 500);
    });

    // Clear search
    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        searchResults.style.display = 'none';
        clearSearchBtn.style.display = 'none';
    });

    // Search function using Nominatim
    async function searchLocation(query) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
            );
            const data = await response.json();
            
            if (data.length > 0) {
                displaySearchResults(data);
            } else {
                searchResults.innerHTML = `
                    <div class="search-result-item">
                        <span class="material-icons-sharp">info</span>
                        <div class="location-details">
                            <div class="location-name">No results found</div>
                        </div>
                    </div>
                `;
                searchResults.style.display = 'block';
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    // Display search results
    function displaySearchResults(results) {
        searchResults.innerHTML = results.map(result => `
            <div class="search-result-item" data-lat="${result.lat}" data-lon="${result.lon}">
                <span class="material-icons-sharp location-icon">location_on</span>
                <div class="location-details">
                    <div class="location-name">${result.display_name.split(',')[0]}</div>
                    <div class="location-address">${result.display_name}</div>
                </div>
            </div>
        `).join('');
        
        searchResults.style.display = 'block';

        // Add click handlers to results
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', function() {
                const lat = parseFloat(this.dataset.lat);
                const lon = parseFloat(this.dataset.lon);
                
                // Fly to location
                map.flyTo([lat, lon], 16, {
                    duration: 1.5
                });

                // Add a marker
                const searchMarker = L.marker([lat, lon], {
                    icon: L.divIcon({
                        className: 'search-marker',
                        html: '<span class="material-icons-sharp">place</span>',
                        iconSize: [32, 32],
                        iconAnchor: [16, 32]
                    })
                }).addTo(map);

                // Remove marker after 5 seconds
                setTimeout(() => {
                    map.removeLayer(searchMarker);
                }, 5000);

                // Clear search
                searchInput.value = '';
                searchResults.style.display = 'none';
                clearSearchBtn.style.display = 'none';
            });
        });
    }

    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-container')) {
            searchResults.style.display = 'none';
        }
    });
}); 