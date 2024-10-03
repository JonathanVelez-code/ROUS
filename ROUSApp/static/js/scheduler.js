// Retrieve the selected GeoLoc from the URL parameter
const urlParams = new URLSearchParams(window.location.search);
const selectedGeoLoc = urlParams.get('geoloc');
window.onload = addEmptyTdBasedOnContent;


function addEmptyTdBasedOnContent() {
    // Select all tables within the container
    const tables = document.querySelectorAll('.table-container table');

    tables.forEach((table) => {
        // Loop through each row of the table
        table.querySelectorAll('tbody tr').forEach((row) => {
            const tds = row.querySelectorAll('td');
            const tdCount = tds.length;

            if (tdCount % 2 !== 0) {
                const emptyTd = document.createElement('td');
                emptyTd.classList.add('empty-td'); // Optional class for styling

                // Check the content of the last td to determine whether it's Plane or Part data
                const lastTd = tds[tdCount - 1];
                // If lastTd contains PlaneMaintenanceID (assuming that's how you determine plane data)
                if (lastTd.getAttribute('data-partMaintenanceID') !== "0") {
                    // If it's a Plane data, prepend the empty td
                    row.insertBefore(emptyTd, row.firstChild);
                }
                // If lastTd contains PartMaintenanceID (assuming that's how you determine part data)
                else if (lastTd.getAttribute('data-planeMaintenanceID') !== "0") {
                    // If it's a Part data, append the empty td
                    row.appendChild(emptyTd);
                }
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Select all the rows that can trigger the modal
    const rows = document.querySelectorAll('td[data-bs-toggle="modal"]');

    rows.forEach(row => {
        row.addEventListener('click', function () {
            // Get data from the clicked row
            const tailNumber = row.getAttribute('data-tailnumber');
            const resourceId = row.getAttribute('data-resourceid');
            const mds = row.getAttribute('data-mds');
            const planMId = row.getAttribute('data-planeMaintenanceID');
            const partMId = row.getAttribute('data-partMaintenanceID');

            // Set the values in the hidden inputs in the modal
            document.getElementById('tailNumberInput').value = tailNumber;
            document.getElementById('resourceIdInput').value = resourceId;
            document.getElementById('mdsInput').value = mds;
            document.getElementById('planMId').value = planMId;
            document.getElementById('partMId').value = partMId;

        });
    });
});


// Add event listener to the submit button
document.getElementById('calSubmit').addEventListener('click', function (event) {
    let checkform = true;
    const forms = document.querySelectorAll('.add-needs-validation');
    // Loop through all forms and validate each
    forms.forEach(form => {
        // Check if the form is valid
        if (!form.checkValidity()) {
            event.preventDefault(); // Prevent default action if form is invalid
            event.stopPropagation(); // Stop further event handling
            console.log('Form is invalid');
            checkform = false;
            // Add the validation class to the form (for styling/validation messages)
            form.classList.add('was-validated');
        } else {
            // Add the validation class to the form (for styling/validation messages)
            form.classList.remove('was-validated');
        }
    });


    if (!checkform) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: "One or many of the input fields was left blank.",
        });
    }
    else {
        Swal.fire({
            title: "Uploading Data!",
            text: "Are you sure you want to submit?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "Cancel"
        }).then((result) => {
            if (result.isConfirmed) {
                submitForm1();

                async function submitForm1() {
                    const formData = new FormData(document.getElementById('myForm'));
                    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

                    console.log("in the form");

                    const response1 = await fetch(`calendar/`, {
                        method: "POST",
                        body: formData,
                        headers: {
                            'X-CSRFToken': csrfToken
                        }
                    });

                    if (!response1.ok) {
                        throw new Error('Error submitting form 1');
                    }
                    else {
                        console.log("submitted");
                        window.location.href = `calendar?geoloc=${encodeURIComponent(selectedGeoLoc)}`;
                        // window.location.reload();
                    }
                }

            }
        });
    }
});