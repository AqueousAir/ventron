(function () {
  var form = document.getElementById('distributorForm');

  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var gsheet = window.VentronFormsGSheet;
    if (!gsheet || typeof gsheet.submit !== 'function') {
      if (gsheet && typeof gsheet.showStatus === 'function') {
        gsheet.showStatus(form, 'error', 'Form integration is not loaded. Please try again.');
      } else {
        alert('Form integration is not loaded. Please try again.');
      }
      return;
    }

    gsheet.submit({
      form: form,
      tab: 'Distributor',
      extras: { formType: 'Distributor' }
    }).then(function (ok) {
      if (!ok) {
        gsheet.showStatus(form, 'error', 'Could not submit distributor application. Please try again.');
        return;
      }
      gsheet.showStatus(form, 'success', 'Distributor application submitted successfully.');
      form.reset();
    });
  });
})();
