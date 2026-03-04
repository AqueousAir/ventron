(function () {
  // Replace this with your deployed Google Apps Script Web App URL.
  // You can also set window.VENTRON_GSHEET_ENDPOINT before this script loads.
  var ENDPOINT = window.VENTRON_GSHEET_ENDPOINT || 'https://script.google.com/macros/s/AKfycby8bNQU29PPn-vB-OWveTY6cqLV6p6OMZTJV_mXAA-5GKYz1EGsncN7eIVFJD3sb63YUg/exec';

  function isConfigured() {
    return Boolean(ENDPOINT) && ENDPOINT.indexOf('PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') === -1;
  }

  function setSubmittingState(form, isSubmitting) {
    var submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return null;
    if (isSubmitting) {
      submitBtn.dataset.originalLabel = submitBtn.textContent || '';
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;
    } else {
      submitBtn.textContent = submitBtn.dataset.originalLabel || submitBtn.textContent;
      submitBtn.disabled = false;
    }
    return submitBtn;
  }

  function getStatusNode(form) {
    var node = form.querySelector('.form-status');
    if (node) return node;

    node = document.createElement('p');
    node.className = 'form-status';
    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn && submitBtn.parentNode) {
      submitBtn.parentNode.insertBefore(node, submitBtn.nextSibling);
    } else {
      form.appendChild(node);
    }
    return node;
  }

  function showStatus(form, type, message) {
    if (!form) return;
    var node = getStatusNode(form);
    node.classList.remove('is-success', 'is-error');
    node.classList.add(type === 'success' ? 'is-success' : 'is-error');
    node.textContent = message || '';
  }

  function buildPayload(form, tab, extras) {
    var payload = {};
    var raw = new FormData(form);
    raw.forEach(function (value, key) {
      payload[key] = value == null ? '' : String(value);
    });

    payload.tab = tab;
    payload.submittedAt = new Date().toISOString();
    payload.sourcePage = window.location.pathname.split('/').pop() || 'index.html';

    if (extras) {
      Object.keys(extras).forEach(function (key) {
        payload[key] = extras[key] == null ? '' : String(extras[key]);
      });
    }

    return payload;
  }

  function toUrlEncoded(payload) {
    var params = new URLSearchParams();
    Object.keys(payload).forEach(function (key) {
      params.append(key, payload[key]);
    });
    return params.toString();
  }

  function submitToSheet(options) {
    if (!options || !options.form || !options.tab) {
      return Promise.resolve(false);
    }

    if (!isConfigured()) {
      showStatus(options.form, 'error', 'Google Sheets endpoint is not configured yet.');
      return Promise.resolve(false);
    }

    var form = options.form;
    var payload = buildPayload(form, options.tab, options.extras);
    var body = toUrlEncoded(payload);
    setSubmittingState(form, true);

    return fetch(ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: body
    })
      .then(function () {
        return true;
      })
      .catch(function () {
        return false;
      })
      .finally(function () {
        setSubmittingState(form, false);
      });
  }

  function bindContactForm() {
    var contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    if (contactForm.dataset.gsheetBound === 'true') return;

    contactForm.dataset.gsheetBound = 'true';
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();

      submitToSheet({
        form: contactForm,
        tab: 'Contact',
        extras: { formType: 'Contact' }
      }).then(function (ok) {
        if (!ok) {
          showStatus(contactForm, 'error', 'Could not submit form. Please try again.');
          return;
        }
        showStatus(contactForm, 'success', 'Message sent successfully. Our team will contact you soon.');
        contactForm.reset();
      });
    });
  }

  window.VentronFormsGSheet = {
    isConfigured: isConfigured,
    submit: submitToSheet,
    showStatus: showStatus
  };

  bindContactForm();
})();
