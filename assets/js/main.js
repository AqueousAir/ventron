(function () {
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');
  var body = document.body;

  function closeMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
  }

  function openMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    body.classList.add('menu-open');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = navMenu.classList.contains('open');
      if (isOpen) closeMenu();
      else openMenu();
    });

    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target) return;
      if (!navMenu.contains(target) && !navToggle.contains(target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });
  }

  // Prevent scroll-jump for placeholder links.
  document.querySelectorAll('a[href="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
    });
  });

  // Active menu item based on current page or hash.
  var menuLinks = Array.prototype.slice.call(document.querySelectorAll('#navMenu a[href]'));
  var currentPath = window.location.pathname.split('/').pop() || 'index.html';
  var currentHash = window.location.hash;

  menuLinks.forEach(function (link) {
    var href = link.getAttribute('href') || '';
    var hrefPath = href.split('#')[0];
    var hrefHash = href.indexOf('#') >= 0 ? '#' + href.split('#')[1] : '';

    var pathMatches = hrefPath && hrefPath === currentPath;
    var hashMatchesOnHome = currentPath === 'index.html' && hrefHash && hrefHash === currentHash;
    var isHomeDefault = (currentPath === 'index.html' && !currentHash && href === '#home');

    if (pathMatches || hashMatchesOnHome || isHomeDefault) {
      link.classList.add('is-active');
    }
  });

  var slides = Array.from(document.querySelectorAll('.slide'));
  var slideIndex = 0;

  if (slides.length > 1) {
    setInterval(function () {
      slides[slideIndex].classList.remove('active');
      slideIndex = (slideIndex + 1) % slides.length;
      slides[slideIndex].classList.add('active');
    }, 4200);
  }

})();
