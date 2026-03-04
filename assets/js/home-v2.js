(function () {
  // Counter animation
  var counters = Array.prototype.slice.call(document.querySelectorAll('.countup[data-target]'));

  function animateCounter(el) {
    var target = Number(el.getAttribute('data-target')) || 0;
    var start = 0;
    var duration = 1300;
    var startTime = null;

    function tick(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var value = Math.floor(start + (target - start) * progress);
      el.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window && counters.length) {
    var counterObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.55 });

    counters.forEach(function (counter) {
      counterObserver.observe(counter);
    });
  } else {
    counters.forEach(animateCounter);
  }

  // Sector tabs
  var tabButtons = Array.prototype.slice.call(document.querySelectorAll('#sectorTabs [data-sector]'));
  var tabPanels = Array.prototype.slice.call(document.querySelectorAll('[data-sector-panel]'));

  tabButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var key = button.getAttribute('data-sector');
      tabButtons.forEach(function (btn) { btn.classList.remove('active'); });
      tabPanels.forEach(function (panel) { panel.classList.remove('active'); });
      button.classList.add('active');
      var activePanel = document.querySelector('[data-sector-panel="' + key + '"]');
      if (activePanel) activePanel.classList.add('active');
    });
  });

  // Region interaction
  var regionData = {
    mea: {
      title: 'Middle East & Africa',
      body: 'Distribution and project support focused on grid resilience, hybrid infrastructure, and water-security programs.',
      bullets: [
        'Regional distributor enablement',
        'Hybrid C&I deployments',
        'Water-energy integrated solutions'
      ]
    },
    asia: {
      title: 'Asia Pacific',
      body: 'High-growth market programs for distributed generation, commercial storage, and utility-scale execution support.',
      bullets: [
        'Utility and C&I growth projects',
        'Technical onboarding for EPC partners',
        'Regional stock and deployment planning'
      ]
    },
    latam: {
      title: 'Latin America',
      body: 'Hybrid infrastructure focus across remote operations, community power, and resilience-driven deployments.',
      bullets: [
        'Off-grid and telecom energy kits',
        'Agriculture and mining support',
        'Localized distributor account enablement'
      ]
    },
    europe: {
      title: 'Europe',
      body: 'Performance-driven energy solutions for commercial sites and advanced compliance-sensitive applications.',
      bullets: [
        'Quality and standards alignment',
        'Commercial storage applications',
        'Technical partnership development'
      ]
    }
  };

  var regionButtons = Array.prototype.slice.call(document.querySelectorAll('#regionButtons [data-region]'));
  var mapPins = Array.prototype.slice.call(document.querySelectorAll('.map-pin[data-region]'));
  var regionTitle = document.getElementById('regionTitle');
  var regionBody = document.getElementById('regionBody');
  var regionList = document.getElementById('regionList');

  function setRegion(key) {
    var data = regionData[key];
    if (!data || !regionTitle || !regionBody || !regionList) return;

    regionButtons.forEach(function (button) {
      button.classList.toggle('active', button.getAttribute('data-region') === key);
    });
    mapPins.forEach(function (pin) {
      pin.classList.toggle('active', pin.getAttribute('data-region') === key);
    });

    regionTitle.textContent = data.title;
    regionBody.textContent = data.body;
    regionList.innerHTML = '';

    data.bullets.forEach(function (bullet) {
      var li = document.createElement('li');
      li.textContent = bullet;
      regionList.appendChild(li);
    });
  }

  regionButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      setRegion(button.getAttribute('data-region'));
    });
  });

  mapPins.forEach(function (pin) {
    pin.addEventListener('click', function () {
      setRegion(pin.getAttribute('data-region'));
    });
  });

  // Case carousel
  var caseTrack = document.getElementById('caseTrack');
  var caseCarousel = document.getElementById('caseCarousel');
  var caseDots = document.getElementById('caseDots');

  if (caseTrack && caseCarousel && caseDots) {
    var cards = Array.prototype.slice.call(caseTrack.children);
    var currentIndex = 0;

    function goTo(index) {
      if (!cards.length) return;
      currentIndex = (index + cards.length) % cards.length;
      caseTrack.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
      Array.prototype.slice.call(caseDots.querySelectorAll('button')).forEach(function (dot, i) {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    cards.forEach(function (_, idx) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Go to case ' + (idx + 1));
      dot.addEventListener('click', function () { goTo(idx); });
      caseDots.appendChild(dot);
    });

    var prev = caseCarousel.querySelector('.case-nav.prev');
    var next = caseCarousel.querySelector('.case-nav.next');
    if (prev) prev.addEventListener('click', function () { goTo(currentIndex - 1); });
    if (next) next.addEventListener('click', function () { goTo(currentIndex + 1); });

    goTo(0);
  }
})();
