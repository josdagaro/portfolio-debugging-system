let nitType = null;
let nit = null;
let simpleContributor = null;
let dateFrom = null;
let dateTo = null;
const SIMPLE_URL_FOR_SEARCHING = 'http://3.92.19.201/simple/person/:NIT_TYPE/:NIT';
const SOI_URL_FOR_SEARCHING = 'http://3.92.19.201/soi/person/:NIT_TYPE/:NIT';
const URL_FOR_DOWNLOADED_FILES = 'http://3.92.19.201/files';

$("#loader").hide();

$('#searchButton').click(function () {
  nitType = $('#nitTypeDropdown').find(":selected").val();
  nit = $('input[name=nit]').val();
  simpleContributor = $('#simpleContributorDropdown').find(":selected").val();
  dateFrom = $('input[name=date-from]').val();
  dateTo = $('input[name=date-to]').val();
  soiYear = $('input[name=soi-year]').val();
  soiContributor = $('#soiContributorDropdown').find(":selected").val();

  if (nitType === "" || nit === "" || simpleContributor === "" || dateFrom === "" || dateTo === "" || !soiYear || soiContributor === "") {
    alert('Por favor asegúrate de que todos los campos estén debidamente diligenciados. Todos son requeridos');
  } else {
    let simpleUrlForSearching = SIMPLE_URL_FOR_SEARCHING.replace(/\:NIT_TYPE/, nitType);
    let soiUrlForSearching = SOI_URL_FOR_SEARCHING.replace(/\:NIT_TYPE/, nitType);
    dateFrom = fixDate(dateFrom);
    dateTo = fixDate(dateTo);
    simpleUrlForSearching = simpleUrlForSearching.replace(/\:NIT/, nit);
    console.log('Requesting:', simpleUrlForSearching);
    soiUrlForSearching = soiUrlForSearching.replace(/\:NIT/, nit);

    console.log('Búsqueda Simple:', {
      nitType,
      nit,
      simpleContributor,
      dateFrom,
      dateTo,
    });

    console.log('Búsqueda SOI:', {
      nitType,
      nit,
      soiContributor,
      soiYear,
    });

    $("#loader").show();
    $('#searchButton').attr('disabled', true);
    $('#confButton').attr('disabled', true);

    Promise.all([
      fetch(simpleUrlForSearching, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          search: {
            dates: {
              from: dateFrom,
              to: dateTo,
            }
          },
          contributor: simpleContributor,
        })
      }).then((response) => {
        console.log('Waiting response');
        return response.json();
      }).then(data => {
        console.log('Simple Success:', data);
        return data;
      }).catch((error) => {
        console.error('Simple Error:', error);
        return error;
      }), fetch(soiUrlForSearching, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          search: {
            dates: {
              year: soiYear
            }
          },
          contributor: soiContributor,
        })
      }).then((response) => {
        console.log('Waiting response');
        return response.json();
      }).then(data => {
        console.log('SOI Success:', data);
        return data;
      }).catch((error) => {
        console.error('SOI Error:', error);
        return error;
      })]
    ).then(values => {
      console.log('All promises values:', values);
      $("#loader").hide();
      $('#searchButton').attr('disabled', false);
      $('#confButton').attr('disabled', false);
      let simpleResultIsValid = values[0].hasOwnProperty('message') && values[0].message === 'OK' && values[0].hasOwnProperty('data') && values[0].data.hasOwnProperty('pdfs') && values[0].data.pdfs.length > 0;
      let soiResultIsValid = values[1].hasOwnProperty('message') && values[1].message === 'OK' && values[1].hasOwnProperty('data') && values[1].data.hasOwnProperty('pdfs') && values[1].data.pdfs.length > 0;

      if (simpleResultIsValid || soiResultIsValid) {
        window.open(URL_FOR_DOWNLOADED_FILES, '_blank').focus();
      } else {
        alert('No se encontró el usuario para las fechas/año seleccionado en ninguna de las plataformas');
      }
    });
  }
});

function fixDate(date) {
  let dateParts = date.split('/');
  return dateParts[1] + '/' + dateParts[0] + '/' + dateParts[2];
}
