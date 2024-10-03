(() => {
    const location = document.getElementById("location-input").value;
    // Add event listener to the button
    const submitButton = document.getElementById('location-submit')
    submitButton.addEventListener('click', () => {
        Swal.fire({
            title: "Submit Location",
            text: "Are you sure you want to submit this " + location + "?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "Cancel"
        }).then((result) => {
            if (result.isConfirmed) {
                submitButton.form.submit(); // Submit the form
            }
        });
    })
})()

