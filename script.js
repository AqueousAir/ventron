(() => {
  'use strict';

  const header = document.querySelector('#site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const closeMenu = () => {
    document.body.classList.remove('menu-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open navigation');
  };

  menuButton?.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });

  nav?.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  const syncHeader = () => header?.classList.toggle('scrolled', window.scrollY > 28);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  const revealItems = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -45px' });
    revealItems.forEach(item => revealObserver.observe(item));
  }

  const animateCounter = element => {
    if (element.dataset.counted) return;
    element.dataset.counted = 'true';
    const end = Number(element.dataset.counter || 0);
    if (reduceMotion) {
      element.textContent = end.toLocaleString('en-US');
      return;
    }
    const duration = 1750;
    const start = performance.now();
    const tick = now => {
      if (element.dataset.manual === 'true') return;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      element.textContent = Math.round(end * eased).toLocaleString('en-US');
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counters = document.querySelectorAll('[data-counter]');
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.55 });
    counters.forEach(counter => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }

  const trackedSections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-35% 0px -55%', threshold: 0 });
    trackedSections.forEach(section => sectionObserver.observe(section));
  }

  const processingVisual = document.querySelector('.processing-visual');
  const componentInputs = [...document.querySelectorAll('.component-input')];
  componentInputs.forEach(input => {
    input.addEventListener('change', () => {
      if (input.checked && processingVisual) processingVisual.setAttribute('data-active', input.value);
    });
  });

  const moduleRack = document.querySelector('.module-rack');
  const moduleGrid = document.querySelector('.module-grid');
  const moduleCards = [...document.querySelectorAll('.module-card')];
  const moduleTotal = document.querySelector('#module-total');
  const onlineModuleCount = document.querySelector('#online-module-count');
  const rackStatus = document.querySelector('#rack-status');
  const reliabilityNote = document.querySelector('.reliability-note');
  const reliabilityMessage = document.querySelector('#reliability-message');
  let moduleTotalFrame = 0;

  const animateModuleTotal = target => {
    if (!moduleTotal) return;
    moduleTotal.dataset.manual = 'true';
    cancelAnimationFrame(moduleTotalFrame);
    const startValue = Number(moduleTotal.textContent.replace(/[^0-9]/g, '')) || 0;
    const startTime = performance.now();
    const duration = 650;
    const update = now => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      moduleTotal.textContent = Math.round(startValue + (target - startValue) * eased).toLocaleString('en-US');
      if (progress < 1) moduleTotalFrame = requestAnimationFrame(update);
    };
    moduleTotalFrame = requestAnimationFrame(update);
  };

  const updateModuleRack = serviceCard => {
    const serviceMode = Boolean(serviceCard);
    const online = serviceMode ? 3 : 4;
    moduleCards.forEach(card => {
      const isolated = card === serviceCard;
      card.classList.toggle('service', isolated);
      card.setAttribute('aria-pressed', String(isolated));
      const state = card.querySelector('.module-state');
      const output = card.querySelector('.module-output');
      const action = card.querySelector('.module-action');
      if (state) state.innerHTML = `<i></i>${isolated ? 'SERVICE' : 'ONLINE'}`;
      if (output) output.textContent = isolated ? '0 L/d' : '1,500 L/d';
      if (action) action.innerHTML = `${isolated ? 'Click to restore module' : 'Click to isolate for service'} <b>↗</b>`;
    });
    if (onlineModuleCount) onlineModuleCount.textContent = String(online);
    if (rackStatus) rackStatus.textContent = `${online} / 4 MODULES ONLINE`;
    moduleRack?.classList.toggle('service-mode', serviceMode);
    reliabilityNote?.classList.toggle('service-mode', serviceMode);
    if (reliabilityMessage) {
      reliabilityMessage.textContent = serviceMode
        ? `Module ${serviceCard.dataset.module} isolated. Three modules remain online at a 4,500 L/day target.`
        : 'All four independent modules are producing water at full target capacity.';
    }
    animateModuleTotal(online * 1500);
  };

  moduleGrid?.addEventListener('click', event => {
    const card = event.target.closest('.module-card');
    if (!card || !moduleGrid.contains(card)) return;
    const restore = card.classList.contains('service');
    updateModuleRack(restore ? null : card);
  });

  const hydraulicSystem = document.querySelector('.hydraulic-system');
  const demandToggle = document.querySelector('#demand-toggle');
  let deliveryAnimation = 0;

  const animateDeliveryValue = (element, target, decimals = 0) => {
    if (!element) return;
    const start = Number(element.textContent) || 0;
    const startTime = performance.now();
    const duration = 800;
    const update = now => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = (start + (target - start) * eased).toFixed(decimals);
      if (progress < 1) deliveryAnimation = requestAnimationFrame(update);
    };
    deliveryAnimation = requestAnimationFrame(update);
  };

  demandToggle?.addEventListener('click', () => {
    const active = !hydraulicSystem?.classList.contains('demand-active');
    hydraulicSystem?.classList.toggle('demand-active', active);
    hydraulicSystem?.setAttribute('data-demand', active ? 'on' : 'off');
    demandToggle.setAttribute('aria-pressed', String(active));
    const label = demandToggle.querySelector('span b');
    const hint = demandToggle.querySelector('span small');
    const action = demandToggle.querySelector('strong');
    const status = document.querySelector('#hydraulic-status');
    const pumpStatus = document.querySelector('#pump-status');
    if (label) label.textContent = active ? 'Stop Water Demand' : 'Simulate Water Demand';
    if (hint) hint.textContent = active ? 'Return system to standby' : 'Start pressure delivery';
    if (action) action.textContent = active ? 'STOP  ■' : 'START  →';
    if (status) status.textContent = active ? 'PRESSURE DELIVERY ACTIVE' : 'SYSTEM STANDBY';
    if (pumpStatus) pumpStatus.textContent = active ? 'Running' : 'Standby';
    cancelAnimationFrame(deliveryAnimation);
    animateDeliveryValue(document.querySelector('#delivery-pressure'), active ? 3.5 : 0, 1);
    animateDeliveryValue(document.querySelector('#delivery-flow'), active ? 85 : 0);
    animateDeliveryValue(document.querySelector('#delivery-level'), active ? 68 : 72);
  });

  const applicationGrid = document.querySelector('.application-grid');
  const deploymentMap = document.querySelector('.deployment-map');
  const deploymentProfile = document.querySelector('.deployment-profile');

  applicationGrid?.addEventListener('click', event => {
    const card = event.target.closest('.application-card');
    if (!card || !applicationGrid.contains(card)) return;
    document.querySelectorAll('.application-card').forEach(item => item.classList.toggle('active', item === card));
    deploymentMap?.setAttribute('data-active', card.dataset.app || 'commercial');
    deploymentProfile?.classList.add('updating');
    window.setTimeout(() => {
      const fields = {
        '#profile-index': `PROFILE / ${card.dataset.index}`,
        '#profile-category': card.dataset.category,
        '#profile-title': card.dataset.title,
        '#profile-description': card.dataset.description,
        '#profile-mode': card.dataset.mode,
        '#profile-infrastructure': card.dataset.infrastructure,
        '#profile-requirement': card.dataset.requirement,
        '#profile-environment': card.dataset.environment
      };
      Object.entries(fields).forEach(([selector, value]) => {
        const element = document.querySelector(selector);
        if (element && value) element.textContent = value;
      });
      deploymentProfile?.classList.remove('updating');
    }, 140);
  });

  const systemBlueprint = document.querySelector('.system-blueprint');
  const capabilityControls = document.querySelector('.capability-controls');
  const capabilityDetail = document.querySelector('.capability-detail');

  capabilityControls?.addEventListener('click', event => {
    const button = event.target.closest('.capability-button');
    if (!button || !capabilityControls.contains(button)) return;
    document.querySelectorAll('.capability-button').forEach(item => item.classList.toggle('active', item === button));
    systemBlueprint?.setAttribute('data-active', button.dataset.feature || 'capacity');
    capabilityDetail?.classList.add('updating');
    window.setTimeout(() => {
      const fields = {
        '#capability-index': `SUBSYSTEM / ${button.dataset.index}`,
        '#capability-category': button.dataset.category,
        '#capability-title': button.dataset.title,
        '#capability-description': button.dataset.description,
        '#capability-metric': button.dataset.metric,
        '#capability-status': button.dataset.status
      };
      Object.entries(fields).forEach(([selector, value]) => {
        const element = document.querySelector(selector);
        if (element && value) element.textContent = value;
      });
      capabilityDetail?.classList.remove('updating');
    }, 140);
  });

  document.querySelectorAll('.intake-callout').forEach(callout => {
    callout.addEventListener('click', () => {
      const wasActive = callout.classList.contains('active');
      document.querySelectorAll('.intake-callout').forEach(item => item.classList.remove('active'));
      if (!wasActive) callout.classList.add('active');
    });
  });

  const orderForm = document.querySelector('#awg-order-form');
  if (orderForm) {
    const status = orderForm.querySelector('.form-status');
    const submitButton = orderForm.querySelector('button[type="submit"]');
    const successMessage = 'Thank you. Your VENTRON AWG order request has been received. Our team will review your location and project requirements and contact you shortly.';
    const errorMessage = 'We could not send the request automatically. Please try again shortly.';

    const setFormStatus = (message, type = '') => {
      if (!status) return;
      status.textContent = message;
      status.className = `form-status ${type}`.trim();
    };

    const formDataToObject = formData => {
      const data = {};
      formData.forEach((value, key) => {
        if (key.startsWith('_')) return;
        data[key] = value;
      });
      return data;
    };

    const buildSubmissionPayload = formData => {
      const fieldOrder = [
        'Full Name',
        'Company Name',
        'Email Address',
        'Phone / WhatsApp',
        'Country',
        'City / Project Location',
        'Type of Customer / Project',
        'Required Water Production Per Day',
        'Average Temperature Range',
        'Average Humidity Level',
        'Installation Environment',
        'Number of Machines Required',
        'Expected Purchase Timeline',
        'Additional Notes / Project Description'
      ];
      const data = formDataToObject(formData);
      const lines = [
        'New VENTRON AWG Order Request',
        '',
        'Customer Information',
        '--------------------'
      ];
      fieldOrder.forEach((field, index) => {
        if (index === 6) lines.push('', 'Project Information', '-------------------');
        lines.push(`${field}: ${data[field] || 'Not provided'}`);
      });
      return {
        subject: 'New VENTRON AWG Order Request',
        page: window.location.href,
        submittedAt: new Date().toISOString(),
        fields: data,
        emailBody: lines.join('\n')
      };
    };

    orderForm.addEventListener('submit', async event => {
      event.preventDefault();
      setFormStatus('');

      if (!orderForm.checkValidity()) {
        orderForm.reportValidity();
        setFormStatus('Please complete the required fields before submitting.', 'error');
        return;
      }

      const formData = new FormData(orderForm);
      if (formData.get('_honey')) return;
      const endpoint = (orderForm.dataset.endpoint || '').trim();
      if (!endpoint || endpoint.includes('PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE')) {
        setFormStatus('Google Apps Script endpoint is not connected yet. Paste the deployed Web App URL into the form data-endpoint attribute.', 'error');
        return;
      }
      const payload = buildSubmissionPayload(formData);

      orderForm.classList.add('is-loading');
      submitButton?.setAttribute('disabled', 'disabled');
      setFormStatus('Submitting your order request...', '');

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });

        orderForm.reset();
        setFormStatus(successMessage, 'success');
      } catch (error) {
        setFormStatus(errorMessage, 'error');
      } finally {
        orderForm.classList.remove('is-loading');
        submitButton?.removeAttribute('disabled');
      }
    });
  }

  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('pointermove', event => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${y * -5}deg) rotateY(${x * 7}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    const glow = document.querySelector('.cursor-glow');
    window.addEventListener('pointermove', event => {
      if (glow) glow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    }, { passive: true });
  }

  document.querySelectorAll('.brand img').forEach(image => {
    image.addEventListener('error', () => {
      image.style.display = 'none';
      image.nextElementSibling?.style.setProperty('display', 'block');
    });
  });
})();
