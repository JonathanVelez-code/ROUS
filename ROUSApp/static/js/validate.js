(() => {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation');

    // General case: Loop over them and prevent submission if invalid
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                document.getElementById('validation-alert').style.display = 'block';
            } else {
                document.getElementById('validation-alert').style.display = 'none';
            }

            form.classList.add('was-validated');
        }, false);
    });



    // Custom logic for your specific page with the SweetAlert for the "location-submit" button
    const submitButton = document.getElementById('location-submit');
    const locationInput = document.getElementById('location-input');
    const form = document.querySelector('.needs-validation');

    if (submitButton) {
        submitButton.addEventListener('click', event => {
            event.preventDefault(); // Prevent default button action

            // Check if the specific form is valid
            if (!form.checkValidity()) {
                document.getElementById('validation-alert').style.display = 'block'; // Show validation alert
                form.classList.add('was-validated'); // Add Bootstrap validation styles
            } else {
                document.getElementById('validation-alert').style.display = 'none'; // Hide validation alert
                const location = locationInput.value; // Get the location input value

                // Trigger SweetAlert confirmation
                Swal.fire({
                    title: "Submit Location",
                    text: "Are you sure you want to submit this location: " + location + "?",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Yes",
                    cancelButtonText: "Cancel"
                }).then((result) => {
                    if (result.isConfirmed) {
                        form.submit(); // Submit the form if confirmed
                    }
                });
            }
        });
    }
})();
