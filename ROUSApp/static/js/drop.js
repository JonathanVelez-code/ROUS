import { config } from './config.js';

document.addEventListener('DOMContentLoaded', function () {
    const submitBtn = document.getElementById('submit-btn');
    const locationSelect = document.getElementById('location-select');
    let selectedGeoLoc = null;

    // Fetch locations from your API
    fetch(config.baseUrl + 'loc/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Loop through the data and create an option for each location
            data.forEach(location => {
                const option = document.createElement('option');
                option.value = location.GeoLoc; // Use GeoLoc as the value
                option.textContent = location.GeoLoc; // Display GeoLoc as the option text
                locationSelect.appendChild(option);
            });

            // Add an event listener to store the selected GeoLoc
            locationSelect.addEventListener('change', function () {
                selectedGeoLoc = this.value; // Store the selected GeoLoc
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    // Handle the submit button click
    submitBtn.addEventListener('click', function () {
        if (selectedGeoLoc) {
            // Save selected GeoLoc (implement saveSelectedGeoLoc function if needed)
            saveSelectedGeoLoc(selectedGeoLoc);

            // Redirect to the calendar page based on the selected GeoLoc
            window.location.href = `calendar.html?geoloc=${encodeURIComponent(selectedGeoLoc)}`;
        } else {
            alert('Please select a location first.');
        }
    });
});

function saveSelectedGeoLoc(geoLoc) {
    console.log('Selected GeoLoc saved:', geoLoc);
    // Optionally save to localStorage or sessionStorage if needed
}
