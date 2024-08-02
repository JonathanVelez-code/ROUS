//import { passgeoloc } from './main.js'

let base = 'http://127.0.0.1:8000/';
const urlParams = new URLSearchParams(window.location.search);
const selectedGeoLoc = urlParams.get('geoloc');

// waits until page has loaded to make changes
window.onload = () => {
    loadTable(selectedGeoLoc);
}

async function loadTable(selectedGeoLoc) {
    //put up loading screen while getting data
    document.getElementById('loading-screen').style.display = 'flex';
    // gets all planes from current GeoLoc
    const tailNums = await getTailNums(selectedGeoLoc);

    // create map for their respective maintenances
    var planeMap = new Map();
    var partMap = new Map();

    // gets all maintenances and adds them to their respective map with key = TailNumber and value = array of maintenance objects
    for (let plane of tailNums) {
        let planeM = await getPlaneMaintenances(plane.TailNumber);
        let partM = await getPartMaintenances(plane.TailNumber);
        planeMap.set(plane.TailNumber, planeM);
        partMap.set(plane.TailNumber, partM);
    }

    // adds all TailNumbers as Table Heads
    loadTableHead(tailNums);
    // adds all Maintenances for their respective TailNumber
    loadTableData(planeMap, partMap, tailNums);
    // remove loading screen
    document.getElementById('loading-screen').style.display = 'none';
}

// add Tail Numbers as table heads and Part/Plane as table sub heads for each plane
function loadTableHead(tailNums) {
    // get table headings from doc
    const tableHead = document.getElementById('TailNumbers');
    const tableSubHead = document.getElementById('Plane_Part');
    // creates strings to be inserted for the tableHead and tableSubHead innerHTML
    let headHtml = '';
    let subHeadHtml = '';

    // create headings for each plane and add to future innerHTML strings
    for (let plane of tailNums) {
        headHtml += '<th colspan="2" class="PlaneHead">' + plane.TailNumber + '</th>';
        subHeadHtml += '<th class="PlaneHead">Plane</th><th class="PlaneHead">Part</th>';
    }

    // add in all headings
    tableHead.innerHTML = headHtml;
    tableSubHead.innerHTML = subHeadHtml;
}

// uses GET api call to get all planes from selected GeoLoc
async function getTailNums(selectedGeoLoc) {
    return fetch(base + 'resource/geoloc/' + encodeURIComponent(selectedGeoLoc) + '/')
        .then(response => response.json())
        .then(data => {
            return data;
        })
        .catch(error => console.warn(error));
}

// add plane/part maintenance to the table data under their designated plane
async function loadTableData(planeMap, partMap, tailNums) {
    // get table body from doc
    const tableBody = document.getElementById('Maintenances');
    // creates string to be inserted for the tableBody innerHTML
    let bodyHtml = '';

    // find largest length of the value arrays
    let length = 0;
    for (let plane of tailNums) {
        if (length < planeMap.get(plane.TailNumber).length) {
            length = planeMap.get(plane.TailNumber).length;
        }
        else if (length < partMap.get(plane.TailNumber).length) {
            length = partMap.get(plane.TailNumber).length;
        }
    }

    // create table of size length
    for (let i = 0; i < length; i++) {
        // create table row
        bodyHtml += '<tr>'
        for (let plane of tailNums) {
            // if able to access planeMaintenance, add planeMaintenance to table with id = PlaneMaintenanceID
            try {
                // get planeMaintenance for easy access
                var maint = planeMap.get(plane.TailNumber)[i];
                bodyHtml += '<td class="MaintenanceData" onclick="getClickedTableCell(this)" data-tail="' + plane.TailNumber + '" data-resource="' + plane.ResourceID + '" data-type="plane" data-maintenance="' + maint.PlaneMaintenanceID + '">Current Time: ' + maint.CrntTime + '<br>';
                bodyHtml += 'Time Remaining:' + maint.TimeRemain + '<br>';
                bodyHtml += 'Due Time:' + maint.DueTime + '<br>';
                bodyHtml += 'Frequency:' + maint.Freq + '<br>';
                bodyHtml += 'Type:' + maint.Type + '<br>';
                bodyHtml += 'Justification:' + maint.JST + '<br>';
                bodyHtml += 'Time Frame:' + maint.TFrame + '<br>';
                bodyHtml += 'Engine(E)/Flight(F):' + maint.E_F + '<br>';
                bodyHtml += '</td>'
            }
            // if no planeMaintenance to access add blank row
            catch {
                bodyHtml += '<td class="MaintenanceData"></td>'
            }
            // if able to access partMaintenance, add partMaintenance to table with id = PartMaintenanceID
            try {
                // get partMaintenance for easy access
                var maint = partMap.get(plane.TailNumber)[i];
                bodyHtml += '<td class="MaintenanceData" onclick="getClickedTableCell(this)" data-tail="' + plane.TailNumber + '" data-resource="' + plane.ResourceID + '" data-type="part" data-maintenance="' + maint.PartMaintenanceID + '">Current Time: ' + maint.CrntTime + '<br>';
                bodyHtml += 'Equipment ID:' + maint.EQP_ID + '<br>';
                bodyHtml += 'Part Serial Number:' + maint.PartSN + '<br>';
                bodyHtml += 'Part Number:' + maint.PartNum + '<br>';
                bodyHtml += 'WUC/LCN:' + maint.WUC_LCN + '<br>';
                bodyHtml += 'Category Number:' + maint.CatNum + '<br>';
                bodyHtml += 'Time Remaining:' + maint.TimeRemain + '<br>';
                bodyHtml += 'Due Time:' + maint.DueTime + '<br>';
                bodyHtml += 'Frequency:' + maint.Freq + '<br>';
                bodyHtml += 'Type:' + maint.Type + '<br>';
                bodyHtml += 'Justification:' + maint.JST + '<br>';
                bodyHtml += 'Time Frame:' + maint.TFrame + '<br>';
                bodyHtml += 'Engine(E)/Flight(F):' + maint.E_F + '<br>';
                bodyHtml += '</td>'
            }
            // if no partMaintenance to access add blank row
            catch {
                bodyHtml += '<td class="MaintenanceData"></td>'
            }
        }
        // end table row
        bodyHtml += '</tr>'
    }

    tableBody.innerHTML = bodyHtml;
}

// uses GET api call to get all plane maintenances from selected plane
async function getPlaneMaintenances(TailNumber) {
    return fetch(base + 'plane-data/' + TailNumber + '/')
        .then(response => response.json())
        .then(pdata => {
            return fetch(base + 'plane-maintenance/' + pdata.PlaneSN + '/' + pdata.MDS + '/')
                .then(response => response.json())
                .then(data => {
                    return data;
                })
                .catch(error => console.warn(error));
        })
        .catch(error => console.warn(error));
}

// uses GET api call to get all part maintenances from selected plane
async function getPartMaintenances(TailNumber) {
    return fetch(base + 'plane-data/' + TailNumber + '/')
        .then(response => response.json())
        .then(pdata => {
            return fetch(base + 'part-maintenance/' + pdata.PlaneSN + '/' + pdata.MDS + '/')
                .then(response => response.json())
                .then(data => {
                    return data;
                })
                .catch(error => console.warn(error));
        })
        .catch(error => console.warn(error));
}

// pops up with calendar event creation when maintenance is clicked on
function createEvent(cellData) {

    // exits out of the create event.
    cancelout.onclick = function () {
        modal.style.display = 'none';
        // Clear the input fields
        var inputFields = document.querySelectorAll('#createModal input[type="text"]');
        inputFields.forEach(function (input) {
            input.value = '';
        });

    };


    // Show the modal  when clicked on.
    var modal = document.getElementById('createModal');
    modal.style.display = 'block';

    // set the values when saved.
    var save = document.getElementById('buttonSaveC');
    save.onclick = function () {
        var eventTitle = document.getElementById('titleInput').value;
        var eventStart = document.getElementById('startInput').value;
        var eventEnd = document.getElementById('endInput').value;
        var eventJulian = document.getElementById('julianInput').value;
        var eventEHours = document.getElementById('engineHoursInput').value;
        var eventFHours = document.getElementById('flightHoursInput').value;

        //grabs all the ids above.
        const idsList = ['titleInput', 'startInput', 'endInput', 'julianInput', 'engineHoursInput', 'flightHoursInput'];

        //
        let idCheckInput = false;

        for (const ids of idsList) {
            const input = document.getElementById(ids);
            const value = input.value.trim();
            if (value === "") {
                // If the input is empty, add the red border
                input.style.borderColor = "red";
                idCheckInput = true;
            } else {
                // If the input is not empty, remove the red border
                input.style.borderColor = ""; // This will reset the border color to the default or remove it completely
            }
        }

        if (idCheckInput) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "One or many of the input fields was left blank.",
            });

        }
        else {
            // Use Swal to confirm before submitting
            Swal.fire({
                title: "Uploading Data!",
                text: "Are you sure you want to submit?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Yes",
                cancelButtonText: "Cancel"
            }).then((result) => {
                if (result.isConfirmed) {
                    if (cellData.MaintenanceType == 'plane') {
                        fetch(base + 'plane-data/' + cellData.TailNumber + '/')
                            .then(response => response.json())
                            .then(pdata => {
                                fetch(baseUrl + 'calendar/', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        PartMaintenanceID: cellData.MaintenanceID,
                                        PlaneMaintenanceID: '0',
                                        GeoLoc: selectedGeoLoc,
                                        FHours: eventFHours,
                                        EHours: eventEHours,
                                        title: eventTitle,
                                        MDS: pdata.MDS,
                                        JulianDate: eventJulian,
                                        end: eventEnd,
                                        start: eventStart,
                                        TailNumber: cellData.TailNumber,
                                        ResourceID: cellData.ResourceID
                                    })
                                });
                            })
                            .catch(error => console.warn(error));
                    }
                    else if (cellData.MaintenanceType == 'part') {
                        fetch(base + 'plane-data/' + cellData.TailNumber + '/')
                            .then(response => response.json())
                            .then(pdata => {
                                fetch(baseUrl + 'calendar/', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        PartMaintenanceID: '0',
                                        PlaneMaintenanceID: cellData.MaintenanceID,
                                        GeoLoc: selectedGeoLoc,
                                        FHours: eventFHours,
                                        EHours: eventEHours,
                                        title: eventTitle,
                                        MDS: pdata.MDS,
                                        JulianDate: eventJulian,
                                        end: eventEnd,
                                        start: eventStart,
                                        TailNumber: cellData.TailNumber,
                                        ResourceID: cellData.ResourceID
                                    })
                                });
                            })
                            .catch(error => console.warn(error));
                    }
                }
            });
        }
        if (!idCheckInput) {
            modal.style.display = 'none';

            // Clear the input fields
            var inputFields = document.querySelectorAll('#createModal input[type="text"]');
            inputFields.forEach(function (input) {
                input.value = '';
            });
        }
    }

}

function getClickedTableCell(div) {
    let cellData = {
        TailNumber: div.getAttribute("data-tail"),
        MaintenanceType: div.getAttribute("data-type"),
        MaintenanceID: div.getAttribute("data-maintenance"),
        ResourceID: div.getAttribute("data-resource")
    };

    createEvent(cellData);
}