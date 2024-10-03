let starttime;
let dropdown;
document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('calendar')) {
    var calendarEl = document.getElementById('calendar');

    const modal1 = new bootstrap.Modal(document.getElementById('modal1'));
    const modal2 = new bootstrap.Modal(document.getElementById('modal2'));
    const modal3 = new bootstrap.Modal(document.getElementById('modal3'));
    const exampleModal = new bootstrap.Modal(document.getElementById('exampleModal'));
    const modalDeploy = new bootstrap.Modal(document.getElementById('modalDeploy'));
    let currentModal = 1; // Track the currently visible modal

    // Retrieve the selected GeoLoc from the URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const selectedGeoLoc = urlParams.get('geoloc');

    var calendar = new FullCalendar.Calendar(calendarEl, {
      schedulerLicenseKey: LICENSE_KEY,
      timeZone: 'local',
      resourceAreaColumns: [
        {
          field: 'title',
          headerContent: 'Tail Number',
          render: function (resource) {
            return resource.title;
          }
        },
      ],
      resources: function (fetchInfo, successCallback, failureCallback) {
        callResources(fetchInfo, successCallback, failureCallback, selectedGeoLoc);
      },
      events: async function (fetchInfo, successCallback, failureCallback) {
        await callCalendar(fetchInfo, successCallback, failureCallback, selectedGeoLoc);
      },
      loading: function (isLoading) {
        const spinner = document.getElementById('loadingSpinner');
        if (isLoading) {
          spinner.classList.remove('visually-hidden');  // Show the spinner
        } else {
          spinner.classList.add('visually-hidden');  // Hide the spinner
        }
      },
      themeSystem: 'bootstrap5',
      initialView: 'dayGridMonth',
      editable: true,
      eventResourceEditable: true,
      droppable: true,
      multiMonthMaxColumns: 1,
      headerToolbar: {
        left: 'prev,next addEventButton myCustomButton2 today',
        center: 'title',
        right: 'multiMonthYear,dayGridMonth,dayGridWeek,dayGridDay,resourceTimelineMonth',
      },
      views: {
        resourceTimelineMonth: {
          buttonText: 'Tail Number'
        }
      },
      customButtons: {
        addEventButton: {
          text: 'Maintenance',
          click: function () {

            modal1.show(); // Start with the first modal
            currentModal = 1; // Set current modal to 1


            // Add event listener to the submit button
            document.getElementById('submitBtn').addEventListener('click', function (event) {
              let checkform = true;
              const forms = document.querySelectorAll('.needs-validation');
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

                // Example of how to get specific values from the form fields (assumes fields exist)
                const tailNum = document.getElementById('tailNumber').value;
                const locgeo = document.getElementById('location').value;
                const planeMds = document.getElementById('planeMds').value;
                const partMds = document.getElementById('partMds').value;
                const titleCal = document.getElementById('title').value;
                const dropdown = document.getElementById('tailNumberSelect');
                const selectedOption = dropdown.options[dropdown.selectedIndex];
                console.log(`the selected content ${selectedOption.textContent.trim()} & selected value ${selectedOption.value}`);

                // Example: Check which radio button is selected
                const selectedPlane = document.getElementById('inlineRadio1').checked;
                const selectedPart = document.getElementById('inlineRadio2').checked;

                // Example of handling the checkbox value
                const checkboxTail = document.getElementById('flexCheckDefault').checked;

                const tailNumber = selectedOption.textContent.trim();
                const resourceID = selectedOption.value;

                // Creating the outline
                const outline = {
                  ResourceID: resourceID,
                  TailNumber: tailNumber
                };

                // Further logic can go here if you want to send the data or perform additional actions
                console.log(`went through`);
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
                      const formData = new FormData(document.getElementById('form1'));
                      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                      console.log('Form Data:', Array.from(formData.entries()));

                      if (!checkboxTail) {
                        await submitForm2(outline);
                      } else {
                        console.log("in the form");

                        const response1 = await fetch("plane-data/", {
                          method: "POST",
                          body: formData,
                          headers: {
                            'X-CSRFToken': csrfToken
                          }
                        });

                        if (!response1.ok) {
                          throw new Error('Error submitting form 1');
                        }
                        console.log("submitted");

                        const response2 = await fetch("resource/", {
                          method: "POST",
                          body: JSON.stringify({
                            TailNumber: tailNum,
                            GeoLoc: locgeo,
                          }),
                          headers: {
                            'X-CSRFToken': csrfToken,
                            'Content-Type': 'application/json'
                          }
                        });

                        if (!response2.ok) {
                          throw new Error('Error submitting resource');
                        }

                        const data = await response2.json();
                        await submitForm2(data);

                      }


                    }

                    async function submitForm2(resourceData) {
                      let formData;
                      let router;
                      if (document.getElementById('planeTitle')) {
                        document.getElementById('planeTitle').value = titleCal;
                      }
                      if (document.getElementById('partTitle')) {
                        document.getElementById('partTitle').value = titleCal;
                      }
                      if (selectedPlane) {
                        router = "plane-maintenance/";
                        formData = new FormData(document.getElementById('planeForm'));
                      } else if (selectedPart) {
                        router = "part-maintenance/";
                        formData = new FormData(document.getElementById('partForm'));
                      }
                      console.log('Form Data:', Array.from(formData.entries()));
                      console.log('Router:', router);
                      try {
                        const response = await fetch(`${router}`, {
                          method: "POST",
                          body: formData,
                          headers: {
                            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                          }
                        });
                        if (!response.ok) {
                          const errorText = await response.text();
                          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                        }
                        const data = await response.json();
                        // Now submit form 3 
                        await submitForm3(data, resourceData);
                      } catch (error) {
                        console.error('Error submitting form 2:', error);
                      }
                    }

                    async function submitForm3(data, resourceData) {

                      if (selectedPlane) {
                        document.getElementById('PartMaintenanceID').value = "0";
                        document.getElementById('PlaneMaintenanceID').value = data.PlaneMaintenanceID;
                      } else if (selectedPart) {
                        document.getElementById('PartMaintenanceID').value = data.PartMaintenanceID;
                        document.getElementById('PlaneMaintenanceID').value = "0";
                      }
                      document.getElementById('calendarMDS').value = data.MDS;
                      document.getElementById('calTailNum').value = resourceData.TailNumber;
                      document.getElementById('calResID').value = resourceData.ResourceID;

                      const formData = new FormData(document.getElementById('form3'));

                      try {
                        const response = await fetch("calendar/", {
                          method: "POST",
                          body: formData,
                          headers: {
                            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                          }
                        });
                        const data = await response.json();
                        console.log('All forms submitted successfully');
                        calendar.refetchEvents();
                        window.location.reload();
                      } catch (error) {
                        console.error('Error submitting form 3:', error);
                      }
                    }
                    //end of if result isConfirmed

                  }
                });
              }
            });
          }
        },
        myCustomButton2: {
          text: 'Deployed',
          click: function () {
            modalDeploy.show();

            document.getElementById('deployButton').addEventListener('click', function (event) {
              let checkform = true;
              const forms = document.querySelectorAll('.deploy-needs-validation');
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
                      const formData = new FormData(document.getElementById('deployForm'));
                      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

                      console.log("in the form");

                      const response1 = await fetch(`deployed/`, {
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
                        calendar.refetchEvents();
                        window.location.reload();
                      }
                    }
                  }
                });
              }
            });
          }
        }
      },
      eventResizeStart: function (info) {
        starttime = info.event.start.toISOString().substring(0, 10);
      },
      eventResize: function (info) {
        Swal.fire({
          title: info.event.title + ' end is now ' + info.event.end.toISOString().substring(0, 10),
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          customClass: {
            title: 'swal-title' // Custom class for the title
          },
        }).then((result) => {
          if (result.isConfirmed) {
            resizeEvent(info);
            Swal.fire('Success', 'Event resized.', 'success');
          } else {
            info.revert();
          }
        });

      },
      eventDragStart: function (info) {
        starttime = info.event.start.toISOString().substring(0, 10);
      },
      eventDrop: function (info) {
        Swal.fire({
          title: info.event.title + ' was dropped on ' + info.event.start.toISOString().substring(0, 10),
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          customClass: {
            title: 'swal-title' // Custom class for the title
          },
        }).then((result) => {
          if (result.isConfirmed) {
            dropEvent(info);
            Swal.fire('Success', 'Event moved.', 'success');
          } else {
            info.revert();
          }
        });
      },
      eventClick: function (info) {
        if (info.event.extendedProps.CalendarID) {
          let event = info.event;

          document.getElementById('eventTitle').innerHTML = event.title;
          const maintenance = event.extendedProps.maintenance;
          let maintenanceDetails = `
          Start: ${event.start.toDateString()}<br>
          End: ${event.end.toDateString()}<br>
          Plane Serial Number: ${maintenance.PlaneSN}<br>
          MDS: ${maintenance.MDS}<br>
          Narrative: ${maintenance.Narrative}<br>
          Time Remaining: ${maintenance.TimeRemain}<br>
          Frequency: ${maintenance.Freq}<br>
          Type: ${maintenance.Type}<br>
          Justification: ${maintenance.JST}<br>
          Time Frame: ${maintenance.TFrame}
          `;

          if (event.extendedProps.PartMaintenanceID != 0) {
            maintenanceDetails += `
          <br>Equipment ID: ${maintenance.EQP_ID}
          <br>Part Serial Number: ${maintenance.PartSN}
          <br>Part Number: ${maintenance.PartNum}
          <br>Work Unit Code/ Logistics Control Number: ${maintenance.WUC_LCN}
          `;
          }

          document.getElementById('eventMaintenance').innerHTML = maintenanceDetails;

          // Show the modal
          exampleModal.show();


          // Handle edit button click
          const editButton = document.getElementById('editButton');
          editButton.onclick = function () {
            const maintenanceEdit = event.extendedProps.maintenance;
            document.getElementById('editInfo').classList.remove('visually-hidden');
            document.getElementById('mainInfo').classList.add('visually-hidden');
            document.getElementById('editButton').classList.add('visually-hidden');
            document.getElementById('subButton').classList.remove('visually-hidden');

            // Show the modal
            document.getElementById('editTitle').value = event.title;
            document.getElementById('editStart').value = event.start.toISOString().split('T')[0];
            document.getElementById('editEnd').value = event.end.toISOString().split('T')[0];
            document.getElementById('editNarr').value = maintenanceEdit.Narrative;
            document.getElementById('editTR').value = maintenanceEdit.TimeRemain;
            document.getElementById('editFreq').value = maintenanceEdit.Freq;
            document.getElementById('editType').value = maintenanceEdit.Type;
            document.getElementById('editTF').value = maintenanceEdit.TFrame;

            if (event.extendedProps.PartMaintenanceID != 0) {
              const container = document.getElementById('container');
              const newElement = `
          <div>
            <label for="editEQ" class="required form-label">Equipment ID</label>
            <input type="text" name="EQP_ID" id="editEQ" value="${maintenanceEdit.EQP_ID}" class="form-control" required>
          </div>
          <div>
            <label for="editPSN" class="required form-label">Part Serial Number</label>
            <input type="text" name="PartSN" id="editPSN" value="${maintenanceEdit.PartSN}" class="form-control" required>
          </div>
          <div>
            <label for="editPartNum" class="required form-label">Part Number</label>
            <input type="text" name="PartNum" id="editPartNum" value="${maintenanceEdit.PartNum}" class="form-control" required>
          </div>
          <div>
            <label for="editJust" class="required form-label">Justification</label>
            <input type="text" name="JST" id="editJust" value="${maintenanceEdit.JST}" class="form-control" required>
          </div>
          <div>
            <label for="editWUC" class="required form-label">Work Unit Code/Logistics Control Number</label>
            <input type="text" name="WUC_LCN" id="editWUC" value="${maintenanceEdit.WUC_LCN}" class="form-control" required>
          </div>
          `;
              container.insertAdjacentHTML('beforeend', newElement);
            }

            document.getElementById('closeButt').addEventListener('click', function () {
              document.getElementById('editInfo').classList.add('visually-hidden');
              document.getElementById('mainInfo').classList.remove('visually-hidden');
              document.getElementById('editButton').classList.remove('visually-hidden');
              document.getElementById('subButton').classList.add('visually-hidden');
            });
            document.getElementById('closeModal').addEventListener('click', function () {
              document.getElementById('editInfo').classList.add('visually-hidden');
              document.getElementById('mainInfo').classList.remove('visually-hidden');
              document.getElementById('editButton').classList.remove('visually-hidden');
              document.getElementById('subButton').classList.add('visually-hidden');
            });

            document.getElementById('subButton').addEventListener('click', function (event) {
              //valide
              let checkform = true;
              const valids = document.querySelectorAll('.edit-needs-validation');

              valids.forEach(valid => {
                // Check if the form is valid
                if (!valid.checkValidity()) {
                  event.preventDefault(); // Prevent default action if form is invalid
                  event.stopPropagation(); // Stop further event handling
                  console.log('Form is invalid');
                  checkform = false;
                  // Add the validation class to the form (for styling/validation messages)
                  valid.classList.add('was-validated');
                } else {
                  // Add the validation class to the form (for styling/validation messages)
                  valid.classList.remove('was-validated');
                }
              });

              if (!checkform) {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: "One or many of the input fields was left blank.",
                });
              } else {
                Swal.fire({
                  title: "Updating Data!",
                  text: "Are you sure you want to submit these changes?",
                  icon: "question",
                  showCancelButton: true,
                  confirmButtonText: "Yes",
                  cancelButtonText: "Cancel"
                }).then((result) => {
                  if (result.isConfirmed) {

                    submitEditForm1();

                    async function submitEditForm1() {
                      const formData = new FormData(document.getElementById('editCal'));
                      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

                      const response1 = await fetch(`calendar/${info.event.extendedProps.CalendarID}/`, {
                        method: "PATCH",
                        body: formData,
                        headers: {
                          'X-CSRFToken': csrfToken
                        }
                      });

                      if (!response1.ok) {
                        throw new Error('Error Updating Calendar Data!');
                      }
                      else {
                        await submitEditForm2();
                      }
                    }

                    async function submitEditForm2() {
                      let routepath;
                      let infoEvent = info.event.extendedProps.maintenance;
                      const formData = new FormData(document.getElementById('editMat'));
                      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

                      if (maintenanceEdit.EQP_ID !== undefined) {
                        routepath = `part-maintenance/${infoEvent.PlaneSN}/${infoEvent.MDS}/${infoEvent.EQP_ID}/${infoEvent.PartSN}/${infoEvent.PartNum}`
                      }
                      else {
                        routepath = `plane-maintenance/${infoEvent.PlaneSN}/${infoEvent.MDS}/${infoEvent.JST}/`
                      }

                      const response2 = await fetch(routepath, {
                        method: "PATCH",
                        body: formData,
                        headers: {
                          'X-CSRFToken': csrfToken
                        }
                      });

                      if (!response2.ok) {
                        throw new Error('Error Updating Calendar Data!');
                      }
                      else {
                        console.log('Forms Have Been Updated!');
                        calendar.refetchEvents();
                        window.location.reload();
                      }
                    }
                  }
                });
              }
            });
          }
        }
      },
      eventDidMount: function (info) {
        if (info.event) {
          let tooltipContent;
          if (info.event.extendedProps.CalendarID) {
            tooltipContent = `
          <div><strong>${info.event.extendedProps.TailNumber}</strong></div>
          <div>Title: ${info.event.title}</div>
          <div>Narrative: ${info.event.extendedProps.maintenance.Narrative}</div>
          <div>Type: ${info.event.extendedProps.maintenance.Type}</div>
          ${info.event.extendedProps.PlaneMaintenanceID == 0
                ? `<div>CatNum: ${info.event.extendedProps.maintenance.CatNum}</div>`
                : `<div>JST: ${info.event.extendedProps.maintenance.JST}</div>`
              }
            `;
          } else {
            tooltipContent = `
          <div><strong>${info.event.extendedProps.TailNumber}</strong></div>
          <div>Title: ${info.event.title}</div>`;
          }


          // Add the tooltip attributes to the event element
          $(info.el).attr('data-bs-toggle', 'tooltip');
          $(info.el).attr('data-bs-html', 'true');
          $(info.el).attr('title', tooltipContent);

          // Initialize Bootstrap tooltips
          var tooltip = new bootstrap.Tooltip(info.el, {
            placement: 'auto', // Auto placement of the tooltip
            container: 'body', // Append to body to avoid any overflow issues
            trigger: 'hover', // Show tooltip on hover
            html: true // Allow HTML content inside the tooltip
          });
        }
      },
    });

    // Event Listeners for Modal Toggle
    document.getElementById('toggleToModal2').addEventListener('click', function () {
      modal1.hide();
      modal2.show();
      currentModal = 2; // Update current modal
    });

    //goes back to the previous
    document.getElementById('toggleToModal1').addEventListener('click', function () {
      modal2.hide();
      modal1.show();
      currentModal = 1; // Update current modal
    });


    document.getElementById('toggleToModal3').addEventListener('click', function () {
      modal2.hide();
      modal3.show();
      currentModal = 3; // Update current modal
    });

    document.getElementById('toggleToModal23').addEventListener('click', function () {
      modal3.hide();
      modal2.show();
      currentModal = 2; // Update current modal
    });

    calendar.render();
  }
});

async function callCalendar(fetchInfo, successCallback, failureCallback, selectedGeoLoc) {
  try {
    const [response1, response2] = await Promise.all([
      fetch(`calendar/geoloc/${encodeURIComponent(selectedGeoLoc)}/`),
      fetch(`deployed/geoloc/${encodeURIComponent(selectedGeoLoc)}/`)
    ]);

    const data1 = await response1.json();
    const additionalData = await response2.json();

    const events = data1.map(apiEvent => ({
      title: apiEvent.title,
      start: apiEvent.start,
      end: apiEvent.end,
      color: "#00B050",
      MDS: apiEvent.MDS,
      TailNumber: apiEvent.TailNumber,
      JulianDate: apiEvent.JulianDate,
      EHours: apiEvent.EHours,
      FHours: apiEvent.FHours,
      maintenance: apiEvent.maintenance,
      PartMaintenanceID: apiEvent.PartMaintenanceID,
      PlaneMaintenanceID: apiEvent.PlaneMaintenanceID,
      GeoLoc: apiEvent.GeoLoc,
      CalendarID: apiEvent.CalendarID,
      planeData: apiEvent.plane_data,
      resourceId: apiEvent.ResourceID,
    }));

    const additionalEvents = additionalData.map(apiEvent => ({
      title: apiEvent.title,
      start: apiEvent.start,
      end: apiEvent.end,
      color: "#6E638D",
      DeployedID: apiEvent.DeployedID,
      TailNumber: apiEvent.TailNumber,
      JulianDate: apiEvent.JulianDate,
      GeoLoc: apiEvent.GeoLoc,
    }));

    const allEvents = events.concat(additionalEvents);
    successCallback(allEvents);
  } catch (error) {
    failureCallback(error);
  }
}

function callResources(fetchInfo, successCallback, failureCallback, selectedGeoLoc) {
  // Fetch the tail numbers from the Plane data model
  fetch(`calendar/geoloc/${encodeURIComponent(selectedGeoLoc)}/`)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      //console.log(data);
      // Process the API response and transform it into FullCalendar event format
      var resources = data.map(function (apiEvent) {
        return {
          id: apiEvent.ResourceID,
          title: apiEvent.TailNumber,
        }
      });
      //console.log(resources);
      // Call the successCallback with the retrieved events
      successCallback(resources);
    })
    .catch(function (error) {
      // Call the failureCallback in case of error
      failureCallback(error);
    });
}



function dropEvent(info) {
  // Retrieve the updated event details
  var eventId = info.event.extendedProps.CalendarID;
  var newStart = info.event.start.toISOString().substring(0, 10);
  var newEnd = info.event.end.toISOString().substring(0, 10);

  fetch(`calendar/${eventId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      start: newStart,
      end: newEnd
    })
  })
    .then(function (response) {
      // Check if the update was successful
      if (response.ok) {
        console.log('Event updated in the database.');
      } else {
        console.error('Failed to update event in the database.');
      }
    })
    .catch(function (error) {
      console.error('Error updating event:', error);
    });

}

function resizeEvent(info) {
  // Retrieve the updated event details
  var eventId = info.event.extendedProps.CalendarID;
  var newStart = info.event.start.toISOString().substring(0, 10);
  var newEnd = info.event.end.toISOString().substring(0, 10);


  fetch(`calendar/${eventId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      start: newStart,
      end: newEnd
    })
  })
    .then(function (response) {
      // Check if the update was successful
      if (response.ok) {
        console.log('Event updated in the database.');
      } else {
        console.error('Failed to update event in the database.');
      }
    })
    .catch(function (error) {
      console.error('Error updating event:', error);
    });
}

document.addEventListener('DOMContentLoaded', function () {
  // Attach event listeners for collapsible buttons
  var collapsibleButtons = document.getElementsByClassName('collapsible');
  for (var i = 0; i < collapsibleButtons.length; i++) {
    collapsibleButtons[i].addEventListener('click', function () {
      this.classList.toggle('active');
      var content = this.parentNode.nextElementSibling;
      if (content.style.display === 'block') {
        content.style.display = 'none';
      } else {
        content.style.display = 'block';
      }
    });
  }
});

document.getElementById('flexCheckDefault').addEventListener('change', function () {
  const isChecked = this.checked;
  const inputs = document.querySelectorAll('#planeSerialNumber, #mds, #tailNumber');
  const select = document.getElementById('tailNumberSelect');

  inputs.forEach(input => {
    input.disabled = !isChecked;
  });

  select.disabled = isChecked;
});

const planeRadio = document.getElementById('inlineRadio1');
const partRadio = document.getElementById('inlineRadio2');
const planeForm = document.getElementById('planeForm');
const partForm = document.getElementById('partForm');


// Add event listeners to the radio buttons
planeRadio.addEventListener('change', function () {
  if (planeRadio.checked) {
    planeForm.classList.remove('visually-hidden');
    planeForm.classList.add('needs-validation');
    partForm.classList.add('visually-hidden');
    partForm.classList.remove('needs-validation');
  }
});

partRadio.addEventListener('change', function () {
  if (partRadio.checked) {
    partForm.classList.remove('visually-hidden');
    partForm.classList.add('needs-validation');
    planeForm.classList.add('visually-hidden');
    planeForm.classList.remove('needs-validation');
  }
});

// Initialize with Plane form visible and Part form hidden
document.addEventListener('DOMContentLoaded', function () {
  planeForm.classList.remove('visually-hidden');
  planeForm.classList.add('needs-validation');
  partForm.classList.add('visually-hidden');
  partForm.classList.remove('needs-validation');
});

function updateData(successCallback, failureCallback, selectedGeoLoc) {
  fetch(`calendar/geoloc/${encodeURIComponent(selectedGeoLoc)}/`)
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
          var updatePromise = fetch(`calendar/planemaintenance/${obj.PlaneMaintenanceID}/`)
            .then(response => response.json())
            .then(data => {
              var newDueTime = data.DueTime + data.Freq;
              var newTimeRemain = data.Freq;

              return fetch(`calendar/planemaintenance/${obj.PlaneMaintenanceID}/`, {
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
                return fetch(`calendar/${obj.CalendarID}/`, {
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
          var updatePromise = fetch(`calendar/partmaintenance/${obj.PartMaintenanceID}/`)
            .then(response => response.json())
            .then(data => {
              var newDueTime = data.DueTime + data.Freq;
              var newTimeRemain = data.Freq;

              return fetch(`calendar/partmaintenance/${obj.PartMaintenanceID}/`, {
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
                return fetch(`calendar/${obj.CalendarID}/`, {
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