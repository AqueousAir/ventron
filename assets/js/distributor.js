(function () {
  var STORAGE_KEY = 'ventron_distributor_applications';
  var form = document.getElementById('distributorForm');

  function readHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (error) {
      return [];
    }
  }

  function saveHistory(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var formData = new FormData(form);
    var payload = {
      id: 'D-' + Date.now(),
      submittedAt: new Date().toISOString(),
      fullName: formData.get('fullName') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      company: formData.get('company') || '',
      website: formData.get('website') || '',
      location: formData.get('location') || '',
      businessType: formData.get('businessType') || '',
      productInterest: formData.get('productInterest') || '',
      volume: formData.get('volume') || '',
      markets: formData.get('markets') || '',
      requirements: formData.get('requirements') || ''
    };

    var history = readHistory();
    history.unshift(payload);
    saveHistory(history);

    alert('Distributor application submitted. Reference: ' + payload.id + '.');
    form.reset();
  });
})();
