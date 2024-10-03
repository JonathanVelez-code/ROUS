// Retrieve the selected GeoLoc from the URL parameter
const urlParams = new URLSearchParams(window.location.search);
const selectedGeoLoc = urlParams.get('geoloc');

document.addEventListener('DOMContentLoaded', function () {
    // Select all the rows that can trigger the modal
    const rows = document.querySelectorAll('td[data-bs-toggle="modal"]');

    rows.forEach(row => {
        row.addEventListener('click', function () {
            // Get data from the clicked row
            const PartNumber = row.getAttribute('data-PartNumber');
            const Names = row.getAttribute('data-Name');
            const Quantity = row.getAttribute('data-Quantity');
            const Location = row.getAttribute('data-Location');
            const Supplier = row.getAttribute('data-Supplier');
            const id = row.getAttribute('data-Id');


            // Set the values in the hidden inputs in the modal
            document.getElementById('name').value = Names;
            document.getElementById('part_number').value = PartNumber;
            document.getElementById('Quantity').value = Quantity;
            document.getElementById('Location').value = Location;
            document.getElementById('Supplier').value = Supplier;
            document.getElementById('id').value = id;

        });
    });
});

// Add event listener to the submit button
document.getElementById('calSubmit').addEventListener('click', function (event) {
    let checkform = true;
    const forms = document.querySelectorAll('.add-needs-validation');
    const id = document.getElementById('id').value
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

                    const response1 = await fetch(`inventory/${id}/`, {
                        method: "Patch",
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
                        window.location.reload();
                    }
                }

            }
        });
    }
});