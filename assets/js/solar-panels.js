(function () {
  var QUOTE_KEY = 'ventron_quote_items';

  var searchInput = document.getElementById('panelSearch');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('#useCaseFilters button[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.catalog-card'));
  var quoteCount = document.getElementById('quoteCount');
  var catalogNote = document.getElementById('catalogNote');
  var activeFilter = 'all';

  function readQuote() {
    try {
      return JSON.parse(localStorage.getItem(QUOTE_KEY) || '[]');
    } catch (error) {
      return [];
    }
  }

  function saveQuote(items) {
    localStorage.setItem(QUOTE_KEY, JSON.stringify(items));
    renderQuoteCount();
  }

  function renderQuoteCount() {
    var items = readQuote();
    if (quoteCount) {
      quoteCount.textContent = String(items.length);
    }
  }

  function addItemToQuote(name, button) {
    var items = readQuote();
    if (items.indexOf(name) === -1) {
      items.push(name);
      saveQuote(items);
    }

    if (button) {
      button.textContent = 'Added to Quote';
      button.classList.add('added');
    }
  }

  function syncButtonState() {
    var items = readQuote();
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.add-quote-btn'));

    buttons.forEach(function (button) {
      var name = button.getAttribute('data-product');
      if (items.indexOf(name) !== -1) {
        button.textContent = 'Added to Quote';
        button.classList.add('added');
      }
    });
  }

  function applyFilters() {
    var q = (searchInput && searchInput.value ? searchInput.value : '').toLowerCase().trim();
    var visibleCount = 0;

    cards.forEach(function (card) {
      var useCase = card.getAttribute('data-use-case') || '';
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var matchFilter = activeFilter === 'all' || activeFilter === useCase;
      var matchSearch = !q || haystack.indexOf(q) !== -1;
      var show = matchFilter && matchSearch;

      card.classList.toggle('hidden', !show);
      if (show) visibleCount += 1;
    });

    if (catalogNote) {
      catalogNote.textContent = 'Showing ' + visibleCount + ' product' + (visibleCount === 1 ? '' : 's') + '.';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var next = button.getAttribute('data-filter') || 'all';
      activeFilter = next;

      filterButtons.forEach(function (btn) {
        btn.classList.remove('active');
      });
      button.classList.add('active');
      applyFilters();
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('.add-quote-btn')).forEach(function (button) {
    button.addEventListener('click', function () {
      var name = button.getAttribute('data-product');
      if (!name) return;
      addItemToQuote(name, button);
    });
  });

  renderQuoteCount();
  syncButtonState();
  applyFilters();
})();
