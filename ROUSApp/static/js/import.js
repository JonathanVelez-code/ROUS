console.log('loaded');
let base = 'http://127.0.0.1:8000/';

// remove loading screen
document.getElementById('loading-screen').style.display = 'none';

// goes through excel sheet and converts data to objects
async function importExcel() {
  var file = document.getElementById('excel_file');
  var data = await readXlsxFile(file.files[0]);
  var columnNames = data[0];

  var objects = data.slice(1).map(row => {
    var object = {};
    columnNames.forEach((column, index) => {
      object[column] = row[index];
    });
    return object;
  });
  return objects;
}

async function postExcel() {
  //put up loading screen while getting data
  document.getElementById('loading-screen').style.display = 'flex';
  try {
    const importObjects = await importExcel();

    // Make a get request for location and if it doesn't return anything, make the location with a post request
    let newGeoLoc = true;
    const response = await fetch(base + 'loc/');
    const data = await response.json();

    // Iterate over the data and see if GeoLoc already exists
    data.forEach(item => {
      if (importObjects[0].GeoLoc == item.GeoLoc) {
        newGeoLoc = false;
        return;
      }
    });

    // If GeoLoc doesn't exist, POST new GeoLoc
    if (newGeoLoc) {
      await fetch(base + 'loc/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ GeoLoc: importObjects[0].GeoLoc })
      });
    }

    // Get Each Object that needs to be imported
    for (const obj of importObjects) {
      // Post Plane Data
      const planeResponse = await fetch(base + 'plane-data/' + obj.PlaneSN + '/' + obj.MDS + '/');
      if (!planeResponse.ok) {
        await fetch(base + 'plane-data/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            PlaneSN: obj.PlaneSN,
            GeoLoc: obj.GeoLoc,
            MDS: obj.MDS,
            TailNumber: obj.TailNumber
          })
        });

        if (planeResponse.ok) {
          console.log('Plane Data POST request succeeded');
        } else {
          console.error('Plane Data POST request failed');
        }
      }

      // POST resource
      try {
        const rResponse = await fetch(base + 'resource/' + obj.TailNumber + '/' + obj.GeoLoc + '/');
        const rData = await rResponse.json();

        if (rResponse.ok) {
          const startD = new Date(obj.start);
          const start = startD.getFullYear() + '-' + (startD.getMonth() + 1) + '-' + startD.getDate();
          const endD = new Date(obj.end);
          const end = endD.getFullYear() + '-' + (endD.getMonth() + 1) + '-' + endD.getDate();

          if (obj.Maintenance.toUpperCase() === 'PART') {
            const partResponse = await fetch(base + 'part-maintenance/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                PlaneSN: obj.PlaneSN,
                MDS: obj.MDS,
                EQP_ID: obj.EQP_ID,
                PartSN: obj.PartSN,
                PartNum: obj.PartSN,
                Narrative: obj.Narrative,
                WUC_LCN: obj.WUC_LCN,
                CatNum: obj.CatNum,
                CrntTime: obj.CrntTime,
                TimeRemain: obj.TimeRemain,
                DueTime: obj.DueTime,
                Freq: obj.Freq,
                Type: obj.Type,
                JST: obj.JST,
                TFrame: obj.TFrame,
                E_F: obj.E_F,
                title: obj.title
              })
            });
            const partData = await partResponse.json();
            const id = partData.PartMaintenanceID;
            const calendarResponse = await fetch(base + 'calendar/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                PartMaintenanceID: id,
                PlaneMaintenanceID: '0',
                GeoLoc: obj.GeoLoc,
                FHours: obj.FHours,
                EHours: obj.EHours,
                title: obj.title,
                MDS: obj.MDS,
                JulianDate: obj.JulianDate,
                end: end,
                start: start,
                TailNumber: obj.TailNumber,
                ResourceID: rData.ResourceID
              })
            });
            if (calendarResponse.ok) {
              console.log('Second POST request succeeded');
            } else {
              console.error('Second POST request failed');
            }
          } else if (obj.Maintenance.toUpperCase() === 'PLANE') {
            const planeMaintenanceResponse = await fetch(base + 'plane-maintenance/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                PlaneSN: obj.PlaneSN,
                MDS: obj.MDS,
                Narrative: obj.Narrative,
                CrntTime: obj.CrntTime,
                TimeRemain: obj.TimeRemain,
                DueTime: obj.DueTime,
                Freq: obj.Freq,
                Type: obj.Type,
                JST: obj.JST,
                TFrame: obj.TFrame,
                E_F: obj.E_F,
                title: obj.title
              })
            });
            const planeMaintenanceData = await planeMaintenanceResponse.json();
            const id = planeMaintenanceData.PlaneMaintenanceID;
            const calendarResponse = await fetch(base + 'calendar/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                PartMaintenanceID: '0',
                PlaneMaintenanceID: id,
                GeoLoc: obj.GeoLoc,
                FHours: obj.FHours,
                EHours: obj.EHours,
                title: obj.title,
                MDS: obj.MDS,
                JulianDate: obj.JulianDate,
                end: end,
                start: start,
                TailNumber: obj.TailNumber,
                ResourceID: rData.ResourceID
              })
            });
            if (calendarResponse.ok) {
              console.log('Second POST request succeeded');
            } else {
              console.error('Second POST request failed');
            }
          }
        } else {
          const resourceResponse = await fetch(base + 'resource/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              TailNumber: obj.TailNumber,
              GeoLoc: obj.GeoLoc,
            })
          });
          if (resourceResponse.ok) {
            const resourceData = await resourceResponse.json();
            const resourceId = resourceData.ResourceID;

            const startD = new Date(obj.start);
            const start = startD.getFullYear() + '-' + (startD.getMonth() + 1) + '-' + startD.getDate();
            const endD = new Date(obj.end);
            const end = endD.getFullYear() + '-' + (endD.getMonth() + 1) + '-' + endD.getDate();
            const dueD = new Date();
            const due = dueD.getFullYear() + '-' + (dueD.getMonth() + 1) + '-' + dueD.getDate();

            if (obj.Maintenance.toUpperCase() === 'PART') {
              const partResponse = await fetch(base + 'part-maintenance/', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  PlaneSN: obj.PlaneSN,
                  MDS: obj.MDS,
                  EQP_ID: obj.EQP_ID,
                  PartSN: obj.PartSN,
                  PartNum: obj.PartSN,
                  Narrative: obj.Narrative,
                  WUC_LCN: obj.WUC_LCN,
                  CatNum: obj.CatNum,
                  CrntTime: obj.CrntTime,
                  TimeRemain: obj.TimeRemain,
                  DueTime: obj.DueTime,
                  Freq: obj.Freq,
                  Type: obj.Type,
                  JST: obj.JST,
                  TFrame: obj.TFrame,
                  E_F: obj.E_F,
                  title: obj.title
                })
              });
              const partData = await partResponse.json();
              const id = partData.PartMaintenanceID;
              const calendarResponse = await fetch(base + 'calendar/', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  PartMaintenanceID: id,
                  PlaneMaintenanceID: '0',
                  GeoLoc: obj.GeoLoc,
                  FHours: obj.FHours,
                  EHours: obj.EHours,
                  title: obj.title,
                  MDS: obj.MDS,
                  JulianDate: obj.JulianDate,
                  end: end,
                  start: start,
                  TailNumber: obj.TailNumber,
                  ResourceID: resourceId
                })
              });
              if (calendarResponse.ok) {
                console.log('Second POST request succeeded');
              } else {
                console.error('Second POST request failed');
              }
            } else if (obj.Maintenance.toUpperCase() === 'PLANE') {
              const planeMaintenanceResponse = await fetch(base + 'plane-maintenance/', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  PlaneSN: obj.PlaneSN,
                  MDS: obj.MDS,
                  Narrative: obj.Narrative,
                  CrntTime: obj.CrntTime,
                  TimeRemain: obj.TimeRemain,
                  DueTime: obj.DueTime,
                  Freq: obj.Freq,
                  Type: obj.Type,
                  JST: obj.JST,
                  TFrame: obj.TFrame,
                  E_F: obj.E_F,
                  title: obj.title
                })
              });
              const planeMaintenanceData = await planeMaintenanceResponse.json();
              const id = planeMaintenanceData.PlaneMaintenanceID;
              const calendarResponse = await fetch(base + 'calendar/', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  PartMaintenanceID: '0',
                  PlaneMaintenanceID: id,
                  GeoLoc: obj.GeoLoc,
                  FHours: obj.FHours,
                  EHours: obj.EHours,
                  title: obj.title,
                  MDS: obj.MDS,
                  JulianDate: obj.JulianDate,
                  end: end,
                  start: start,
                  TailNumber: obj.TailNumber,
                  ResourceID: resourceId
                })
              });
              if (calendarResponse.ok) {
                console.log('Second POST request succeeded');
              } else {
                console.error('Second POST request failed');
              }
            }
          } else {
            throw new Error('resource Data POST request failed');
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
  // remove loading screen
  document.getElementById('loading-screen').style.display = 'none';
}