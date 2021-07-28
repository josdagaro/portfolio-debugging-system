let nitType = null;
let nit = null;
let simpleContributor = null;
let dateFrom = null;
let dateTo = null;
const SIMPLE_URL_FOR_SEARCHING = 'http://localhost:3000/simple/person/:NIT_TYPE/:NIT';

$("#loader").hide();

$('#searchButton').click(function () {
  nitType = $('#nitTypeDropdown').find(":selected").val();
  nit = $('input[name=nit]').val();
  simpleContributor = $('#simpleContributorDropdown').find(":selected").val();
  dateFrom = $('input[name=date-from]').val();
  dateTo = $('input[name=date-to]').val();

  if (nitType === "" || nit === "" || simpleContributor === "" || dateFrom === "" || dateTo === "") {
    alert('Por favor asegúrate de que todos los campos estén debidamente diligenciados. Todos son requeridos');
  } else {
    let simpleUrlForSearching = SIMPLE_URL_FOR_SEARCHING.replace(/\:NIT_TYPE/, nitType);
    dateFrom = fixDate(dateFrom);
    dateTo = fixDate(dateTo);
    simpleUrlForSearching = simpleUrlForSearching.replace(/\:NIT/, nit);
    console.log('Requesting:', simpleUrlForSearching);

    console.log('Búsqueda:', {
      nitType,
      nit,
      simpleContributor,
      dateFrom,
      dateTo,
    });

    $("#loader").show();
    $('#searchButton').attr('disabled', true);
    $('#confButton').attr('disabled', true);

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
      $("#loader").hide();
      $('#searchButton').attr('disabled', false);
      $('#confButton').attr('disabled', false);
      console.log('Success:', data);
    }).catch((error) => {
      $("#loader").hide();
      $('#searchButton').attr('disabled', false);
      $('#confButton').attr('disabled', false);
      console.error('Error:', error);
      alert('Simple: ups, ¡ocurrió un error!');
    });
  }
});

function fixDate(date) {
  let dateParts = date.split('/');
  return dateParts[1] + '/' + dateParts[0] + '/' + dateParts[2];
}
