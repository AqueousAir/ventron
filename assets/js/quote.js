(function () {
  var QUOTE_KEY = 'ventron_quote_items';
  var QTY_KEY = 'ventron_quote_qty';

  var quoteList = document.getElementById('quoteList');
  var selectedCount = document.getElementById('selectedCount');
  var totalQty = document.getElementById('totalQty');
  var clearQuoteBtn = document.getElementById('clearQuoteBtn');
  var quoteForm = document.getElementById('quoteForm');
  var selectedProductsPayload = document.getElementById('selectedProductsPayload');

  function readJson(key, fallback) {
    try {
      var value = JSON.parse(localStorage.getItem(key) || '');
      return value || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function normalizeSelectedItems() {
    var raw = readJson(QUOTE_KEY, []);
    var names = [];

    raw.forEach(function (item) {
      if (typeof item === 'string' && item.trim()) {
        names.push(item.trim());
      } else if (item && typeof item.name === 'string' && item.name.trim()) {
        names.push(item.name.trim());
      }
    });

    var unique = [];
    names.forEach(function (name) {
      if (unique.indexOf(name) === -1) unique.push(name);
    });

    return unique;
  }

  function readQtyMap() {
    return readJson(QTY_KEY, {});
  }

  function buildQuoteItems() {
    var names = normalizeSelectedItems();
    var qtyMap = readQtyMap();

    return names.map(function (name) {
      var qty = Number(qtyMap[name]);
      return {
        name: name,
        qty: Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 1
      };
    });
  }

  function persistQuoteItems(items) {
    var names = items.map(function (item) { return item.name; });
    var qtyMap = {};

    items.forEach(function (item) {
      qtyMap[item.name] = item.qty;
    });

    writeJson(QUOTE_KEY, names);
    writeJson(QTY_KEY, qtyMap);
  }

  function renderEmptyState() {
    quoteList.innerHTML = '<div class="quote-empty">No products selected yet. Go to product pages and click "Add to Quote".</div>';
    selectedCount.textContent = '0';
    totalQty.textContent = '0';
    selectedProductsPayload.value = '[]';
  }

  function renderQuoteItems() {
    if (!quoteList) return;
    var items = buildQuoteItems();

    if (!items.length) {
      renderEmptyState();
      return;
    }

    quoteList.innerHTML = '';

    items.forEach(function (item, index) {
      var row = document.createElement('div');
      row.className = 'quote-item';
      row.innerHTML =
        '<div class="quote-item-top">' +
          '<p class="quote-item-name">' + item.name + '</p>' +
          '<button type="button" class="remove-btn" data-remove-index="' + index + '">Remove</button>' +
        '</div>' +
        '<div class="quote-item-controls">' +
          '<label for="qty-' + index + '">Qty</label>' +
          '<input id="qty-' + index + '" type="number" min="1" step="1" value="' + item.qty + '" data-qty-index="' + index + '" />' +
        '</div>';
      quoteList.appendChild(row);
    });

    selectedCount.textContent = String(items.length);

    var qtyTotal = items.reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);
    totalQty.textContent = String(qtyTotal);
    selectedProductsPayload.value = JSON.stringify(items);

    bindItemActions();
  }

  function bindItemActions() {
    var removeButtons = Array.prototype.slice.call(document.querySelectorAll('[data-remove-index]'));
    var qtyInputs = Array.prototype.slice.call(document.querySelectorAll('[data-qty-index]'));

    removeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var index = Number(button.getAttribute('data-remove-index'));
        var items = buildQuoteItems();
        if (!Number.isFinite(index)) return;
        items.splice(index, 1);
        persistQuoteItems(items);
        renderQuoteItems();
      });
    });

    qtyInputs.forEach(function (input) {
      input.addEventListener('change', function () {
        var index = Number(input.getAttribute('data-qty-index'));
        var nextQty = Math.max(1, parseInt(input.value, 10) || 1);
        var items = buildQuoteItems();
        if (!Number.isFinite(index) || !items[index]) return;
        items[index].qty = nextQty;
        persistQuoteItems(items);
        renderQuoteItems();
      });
    });
  }

  if (clearQuoteBtn) {
    clearQuoteBtn.addEventListener('click', function () {
      persistQuoteItems([]);
      renderQuoteItems();
    });
  }

  if (quoteForm) {
    quoteForm.addEventListener('submit', function (event) {
      event.preventDefault();

      var items = buildQuoteItems();
      var gsheet = window.VentronFormsGSheet;
      if (!items.length) {
        if (gsheet && typeof gsheet.showStatus === 'function') {
          gsheet.showStatus(quoteForm, 'error', 'Please add at least one product to quote before submitting.');
        } else {
          alert('Please add at least one product to quote before submitting.');
        }
        return;
      }

      if (!gsheet || typeof gsheet.submit !== 'function') {
        if (gsheet && typeof gsheet.showStatus === 'function') {
          gsheet.showStatus(quoteForm, 'error', 'Form integration is not loaded. Please try again.');
        } else {
          alert('Form integration is not loaded. Please try again.');
        }
        return;
      }

      var qtyTotal = items.reduce(function (sum, item) { return sum + item.qty; }, 0);

      gsheet.submit({
        form: quoteForm,
        tab: 'Quotes',
        extras: {
          formType: 'Quote',
          selectedProducts: JSON.stringify(items),
          productCount: String(items.length),
          totalQuantity: String(qtyTotal)
        }
      }).then(function (ok) {
        if (!ok) {
          gsheet.showStatus(quoteForm, 'error', 'Could not submit quote request. Please try again.');
          return;
        }
        gsheet.showStatus(quoteForm, 'success', 'Quote request submitted successfully.');
        quoteForm.reset();
        persistQuoteItems([]);
        renderQuoteItems();
      });
    });
  }

  renderQuoteItems();
})();
