import { config } from './config.js';

// Define the successCallback and failureCallback functions
function successCallback() {
    console.log('Data update successful.');
    // You can add any other logic or actions you want to perform on success.
}

function failureCallback(error) {
    console.error('Data update failed:', error);
    // You can add any other logic or actions you want to perform on failure.
}

// Get the 'geoloc' parameter from URL
const urlParams = new URLSearchParams(window.location.search);
const TheGeoLoc = urlParams.get('geoloc');

// Call the updateData function with the appropriate arguments
updateData(successCallback, failureCallback, TheGeoLoc);


function updateData(successCallback, failureCallback, selectedGeoLoc) {
    fetch(config.baseUrl + 'calendar/geoloc/' + encodeURIComponent(selectedGeoLoc) + '/')
        .then(response => response.json())
        .then(data => {
            // Get today's date
            var today = new Date();
            // Filter the objects with end date prior to today's date and completed equal to false
            var filteredObjects = data.filter(obj => new Date(obj.end) < today && obj.Completed === false);
            //console.log(filteredObjects);
            // Array to store all the update promises
            var updatePromises = [];

            filteredObjects.forEach(obj => {
                // Update the time for each filtered object
                if (obj.PlaneMaintenanceID > 0) {
                    var updatePromise = fetch(config.baseUrl + 'calendar/planemaintenance/' + obj.PlaneMaintenanceID + '/')
                        .then(response => response.json())
                        .then(data => {
                            var newDueTime = data.DueTime + data.Freq;
                            var newTimeRemain = data.Freq;

                            return fetch(config.baseUrl + 'calendar/planemaintenance/' + obj.PlaneMaintenanceID + '/', {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    DueTime: newDueTime,
                                    TimeRemain: newTimeRemain,
                                })
                            });
                        })
                        .then(response => {
                            if (response.ok) {
                                console.log('Object with PlaneMaintenanceID ' + obj.PlaneMaintenanceID + ' updated successfully.');
                                return fetch(config.baseUrl + 'calendar/' + obj.CalendarID + '/', {
                                    method: 'PATCH',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        Completed: true
                                    })
                                });
                            } else {
                                console.error('Failed to update object with PlaneMaintenanceID ' + obj.PlaneMaintenanceID + '.');
                                throw new Error('Failed to update object with PlaneMaintenanceID ' + obj.PlaneMaintenanceID + '.');
                            }
                        })
                        .then(response => {
                            if (response.ok) {
                                console.log('Object with CalendarID ' + obj.CalendarID + ' updated successfully.');
                            } else {
                                console.error('Failed to update object with CalendarID ' + obj.CalendarID + '.');
                                throw new Error('Failed to update object with CalendarID ' + obj.CalendarID + '.');
                            }
                        })
                        .catch(error => {
                            console.error('An error occurred while updating object:', error);
                            throw error;
                        });

                    updatePromises.push(updatePromise);
                } else if (obj.PartMaintenanceID > 0) {
                    var updatePromise = fetch(config.baseUrl + 'calendar/partmaintenance/' + obj.PartMaintenanceID + '/')
                        .then(response => response.json())
                        .then(data => {
                            var newDueTime = data.DueTime + data.Freq;
                            var newTimeRemain = data.Freq;

                            return fetch(config.baseUrl + 'calendar/partmaintenance/' + obj.PartMaintenanceID + '/', {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    DueTime: newDueTime,
                                    TimeRemain: newTimeRemain
                                })
                            });
                        })
                        .then(response => {
                            if (response.ok) {
                                console.log('Object with PartMaintenanceID ' + obj.PartMaintenanceID + ' updated successfully.');
                                return fetch(config.baseUrl + 'calendar/' + obj.CalendarID + '/', {
                                    method: 'PATCH',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        Completed: true
                                    })
                                });
                            } else {
                                console.error('Failed to update object with PartMaintenanceID ' + obj.PartMaintenanceID + '.');
                                throw new Error('Failed to update object with PartMaintenanceID ' + obj.PartMaintenanceID + '.');
                            }
                        })
                        .then(response => {
                            if (response.ok) {
                                console.log('Object with CalendarID ' + obj.CalendarID + ' updated successfully.');
                            } else {
                                console.error('Failed to update object with CalendarID ' + obj.CalendarID + '.');
                                throw new Error('Failed to update object with CalendarID ' + obj.CalendarID + '.');
                            }
                        })
                        .catch(error => {
                            console.error('An error occurred while updating object:', error);
                            throw error;
                        });

                    updatePromises.push(updatePromise);
                }
            });

            // Wait for all the update promises to resolve
            return Promise.all(updatePromises);
        })
        .then(() => {
            successCallback();
        })
        .catch(error => {
            console.error('An error occurred while fetching the objects:', error);
            failureCallback(error);
        });
}