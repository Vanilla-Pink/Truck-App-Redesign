// =====================================================
// ROUTEAPP — INTERACTIONS
// =====================================================

(function () {
  'use strict';

  // ===== THEME =====
  const themeButtons = document.querySelectorAll('[data-theme]');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      themeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (theme === 'auto') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    });
  });

  // ===== SUN GLARE / GLOVE MODE =====
  const gloveBtn = document.getElementById('glove-mode');
  gloveBtn.addEventListener('click', () => {
    document.body.classList.toggle('glove-mode');
    gloveBtn.classList.toggle('active');
    const active = gloveBtn.classList.contains('active');
    gloveBtn.setAttribute('aria-pressed', active);
    gloveBtn.textContent = active ? '✓ Sun glare on' : '☀ Sun glare test';
  });

  // ===== NAVIGATION =====
  const screens = document.querySelectorAll('.screen');
  const navButtons = document.querySelectorAll('[data-go]');
  const sideNavButtons = document.querySelectorAll('.nav-list button[data-go]');

  function goTo(screenId) {
    screens.forEach(s => s.classList.toggle('active', s.dataset.screen === screenId));
    sideNavButtons.forEach(b => b.classList.toggle('active', b.dataset.go === screenId));
    if (screenId === 'stops') renderStopList();
    if (screenId === 'stop-detail') {
      const content = document.getElementById('stop-detail-content');
      if (!content || !content.innerHTML.trim()) renderStopDetail(0);
    }
    if (screenId === 'tanks') renderTanksScreen();
    buildTabBar();
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', e => {
      const target = btn.dataset.go;
      if (target) {
        e.stopPropagation();
        goTo(target);
      }
    });
  });

  // ===== TAB BAR =====
  const TABS = [
    { id: 'routes', label: 'Routes', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>' },
    { id: 'stops', label: 'Stops', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' },
    { id: 'search', label: 'Search', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' },
    { id: 'transactions', label: 'Tasks', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' },
    { id: 'profile', label: 'Profile', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
  ];

  const activeTabMap = {
    routes: 'routes', datepicker: 'routes', create: 'routes',
    inbox: 'routes', message: 'routes', 'message-ack': 'routes',
    profile: 'profile', checklist: 'profile',
    stops: 'stops', 'stop-detail': 'stops', tanks: 'stops', 'tank-form': 'stops',
  };

  function buildTabBar() {
    // Build tab bar inside every screen so that switching screens always shows it correctly
    document.querySelectorAll('.screen').forEach(screen => {
      const tabBar = screen.querySelector('.tab-bar');
      if (!tabBar) return;
      const screenId = screen.dataset.screen;
      const activeTab = activeTabMap[screenId] || 'routes';
      tabBar.innerHTML = TABS.map(t => `
        <button class="tab-item ${t.id === activeTab ? 'active' : ''}" data-tab="${t.id}">
          ${t.icon}
          <span>${t.label}</span>
        </button>
      `).join('');
      tabBar.querySelectorAll('.tab-item').forEach(t => {
        t.addEventListener('click', () => {
          if (t.dataset.tab === 'profile') goTo('profile');
          else if (t.dataset.tab === 'routes') goTo('routes');
          else if (t.dataset.tab === 'stops') { currentRoute = null; goTo('stops'); }
          else showToast(`"${t.querySelector('span').textContent}" tab — demo only`);
        });
      });
    });
  }

  // ===== CALENDAR =====
  const routeDateNav = document.querySelector('.screen[data-screen="routes"] .date-nav');
  let selectedRouteDate = new Date(2026, 5, 20, 12);

  function renderRouteDate() {
    if (!routeDateNav) return;
    const label = routeDateNav.querySelector('.date-pill strong');
    if (!label) return;
    label.textContent = new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'long'
    }).format(selectedRouteDate);
  }

  if (routeDateNav) {
    const dateArrows = routeDateNav.querySelectorAll('.day-arrow');
    dateArrows.forEach((arrow, index) => {
      arrow.addEventListener('click', () => {
        const direction = index === 0 ? -1 : 1;
        selectedRouteDate.setDate(selectedRouteDate.getDate() + direction);
        renderRouteDate();
      });
    });
    renderRouteDate();
  }

  function buildCalendar() {
    const grid = document.getElementById('cal-grid');
    if (!grid) return;
    grid.innerHTML = '';
    // April 2026: starts Wednesday
    const startOffset = 2; // Mon=0; April 1 2026 = Wed
    const daysInMonth = 30;
    const today = 30;
    const hasRoutes = [3, 7, 14, 21, 28, 30];

    for (let i = 0; i < startOffset; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day empty';
      grid.appendChild(empty);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const day = document.createElement('button');
      day.className = 'cal-day';
      day.textContent = d;
      if (hasRoutes.includes(d)) day.classList.add('has-routes');
      if (d === today) day.classList.add('today', 'selected');
      day.addEventListener('click', () => {
        grid.querySelectorAll('.cal-day').forEach(c => c.classList.remove('selected'));
        day.classList.add('selected');
        setTimeout(() => {
          const sheet = document.getElementById('sheet-datepicker');
          if (sheet) {
            sheet.classList.remove('show');
            sheet.setAttribute('aria-hidden', 'true');
          }
          showToast('Date selected: ' + d + ' April');
        }, 180);
      });
      grid.appendChild(day);
    }
  }

  // ===== POPUPS =====
  document.querySelectorAll('[data-popup]').forEach(btn => {
    btn.addEventListener('click', () => {
      const popup = document.getElementById(btn.dataset.popup);
      if (popup) popup.classList.add('show');
    });
  });

  document.querySelectorAll('.popup-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('show');
    });
    overlay.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => overlay.classList.remove('show'));
    });
  });

  // ===== BOTTOM SHEETS =====
  document.querySelectorAll('[data-sheet]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const sheet = document.getElementById('sheet-' + btn.dataset.sheet);
      if (sheet) {
        sheet.classList.add('show');
        sheet.setAttribute('aria-hidden', 'false');
      }
    });
  });
  document.querySelectorAll('.sheet-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        overlay.classList.remove('show');
        overlay.setAttribute('aria-hidden', 'true');
      }
    });
    overlay.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.classList.remove('show');
        overlay.setAttribute('aria-hidden', 'true');
      });
    });
  });

  // Specific popup triggers
  document.getElementById('alert-btn')?.addEventListener('click', () => {
    const sheet = document.getElementById('popup-emergency');
    sheet.classList.add('show');
    sheet.setAttribute('aria-hidden', 'false');
  });
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    const sheet = document.getElementById('sheet-logout');
    sheet.classList.add('show');
    sheet.setAttribute('aria-hidden', 'false');
  });
  document.getElementById('call-btn')?.addEventListener('click', () => {
    document.getElementById('popup-call').classList.add('show');
  });
  document.getElementById('nav-btn')?.addEventListener('click', () => {
    document.getElementById('popup-navigation').classList.add('show');
  });

  // ===== ACKNOWLEDGE BUTTON =====
  const ackBtn = document.getElementById('ack-toggle');
  if (ackBtn) {
    ackBtn.addEventListener('click', () => {
      const isAck = ackBtn.classList.toggle('acknowledged');
      ackBtn.setAttribute('aria-pressed', isAck);
      if (isAck) {
        showToast('Message acknowledged');
        const ackBlock = document.getElementById('ack-block');
        ackBlock.style.background = 'var(--green-50)';
        ackBlock.style.borderColor = 'color-mix(in srgb, var(--green-500) 30%, transparent)';
        ackBlock.querySelector('.ack-info').style.color = 'var(--green-600)';
      }
    });
  }

  // ===== SAVE / CHECKLIST INTERACTIONS =====
  document.getElementById('save-btn')?.addEventListener('click', () => {
    const input = document.getElementById('route-name-input');
    if (!input.value.trim()) {
      showToast('Please enter a route name');
      input.focus();
      return;
    }
    if (input.value.toLowerCase() === 'mon') {
      document.getElementById('popup-error').classList.add('show');
      return;
    }
    showToast('Route saved');
    setTimeout(() => goTo('routes'), 800);
  });
  document.getElementById('big-save-btn')?.addEventListener('click', () => {
    document.getElementById('save-btn').click();
  });

  // ===== CHECKLIST YN =====
  document.querySelectorAll('.check-item[data-check]').forEach(item => {
    const yes = item.querySelector('.yn-btn.yes');
    const no = item.querySelector('.yn-btn.no');
    yes?.addEventListener('click', () => {
      yes.classList.add('selected');
      no.classList.remove('selected');
      item.classList.add('completed');
      item.classList.remove('flagged');
      updateChecklistProgress();
    });
    no?.addEventListener('click', () => {
      no.classList.add('selected');
      yes.classList.remove('selected');
      item.classList.add('flagged');
      item.classList.remove('completed');
      updateChecklistProgress();
    });
  });

  function updateChecklistProgress() {
    const items = document.querySelectorAll('.check-item[data-check]');
    const done = document.querySelectorAll('.check-item[data-check].completed, .check-item[data-check].flagged').length;
    const pct = (done / items.length) * 100;
    const fill = document.getElementById('cp-fill');
    const count = document.getElementById('cp-count');
    if (fill) fill.style.width = pct + '%';
    if (count) count.textContent = done;
  }

  // ===== REFRESH BUTTON =====
  document.getElementById('refresh-btn')?.addEventListener('click', () => {
    const btn = document.getElementById('refresh-btn');
    btn.classList.add('spinning');
    setTimeout(() => {
      btn.classList.remove('spinning');
      showToast('Routes updated');
    }, 800);
  });

  // ===== TOAST =====
  let toastTimeout;
  function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  // ===== MAP PIN INTERACTIONS =====
  // Category icons (shop = wrench, trailer = container, both = truck)
  const CATEGORY = {
    shop:    { label: 'Shop',           icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>' },
    trailer: { label: 'Trailer',        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="1"/><path d="M6 6v12M10 6v12M14 6v12M18 6v12"/></svg>' },
    both:    { label: 'Shop + trailer', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>' },
  };
  const pinType = el => ['shop', 'trailer', 'both'].find(t => el.classList.contains(t));

  document.querySelectorAll('.map-pin').forEach(pin => {
    const type = pinType(pin);
    if (type) pin.innerHTML = `<span class="pin-ico">${CATEGORY[type].icon}</span>`;
    pin.addEventListener('click', () => {
      // Reflect the tapped pin's category in the location detail chip
      const chip = document.querySelector('#sheet-location .type-chip');
      if (chip && type) {
        chip.className = `type-chip ${type}`;
        chip.innerHTML = `${CATEGORY[type].icon}${CATEGORY[type].label}`;
      }
      // Open the location detail as a bottom sheet (same behavior as the calendar)
      const sheet = document.getElementById('sheet-location');
      if (sheet) {
        sheet.classList.add('show');
        sheet.setAttribute('aria-hidden', 'false');
      }
    });
  });

  // ===== ROUTES & STOPS DATA =====
  const ROUTES = [
    {
      id: 'route-1',
      name: 'Monday Route',
      color: 'var(--green-500)',
      stops: [
        { id: 1, companyCode: 'Tir823',  locationCode: '#81', name: 'Tire Kingdom - 4151',      address: '450 State Rd 7, Royal Palm Beach, FL 33411',       gallonsC: 275, gallonsTL: 0,   gallonsPct: 0,   services: ['ow','uo','ua','osf'], status: 'completed' },
        { id: 2, companyCode: 'AutoZ44', locationCode: '#12', name: 'AutoZone - 7823',           address: '1201 N Flamingo Rd, Pembroke Pines, FL 33028',     gallonsC: 310, gallonsTL: 40,  gallonsPct: 13,  services: ['ow','uo'],            status: 'current'   },
        { id: 3, companyCode: 'Hd901',   locationCode: '#03', name: 'Home Depot Auto - 9021',   address: '5751 Okeechobee Blvd, West Palm Beach, FL 33417',  gallonsC: 180, gallonsTL: 180, gallonsPct: 100, services: ['ow','uo','ua','osf'],  status: 'pending',  pastDue: true  },
        { id: 4, companyCode: 'Npa512',  locationCode: '#07', name: 'NAPA Auto Parts - 2278',   address: '6350 W Indiantown Rd, Jupiter, FL 33458',          gallonsC: 220, gallonsTL: 80,  gallonsPct: 36,  services: ['ow','ua'],            status: 'pending'   },
        { id: 5, companyCode: 'Orl201',  locationCode: '#15', name: "O'Reilly Auto - 3401",     address: '2300 S Congress Ave, Boynton Beach, FL 33426',     gallonsC: 150, gallonsTL: 150, gallonsPct: 100, services: ['uo','ua','osf'],      status: 'pending'   },
      ]
    },
    {
      id: 'route-2',
      name: 'Tuesday Route',
      color: 'var(--amber-500)',
      stops: [
        { id: 1, companyCode: 'Midas09', locationCode: '#04', name: 'Midas Auto - 1188',        address: '3201 Forest Hill Blvd, Lake Worth, FL 33461',      gallonsC: 400, gallonsTL: 120, gallonsPct: 30,  services: ['ow','uo','ua'],       status: 'pending',  pastDue: true  },
        { id: 2, companyCode: 'Pep720',  locationCode: '#22', name: 'Pep Boys - 5544',          address: '4800 N Federal Hwy, Pompano Beach, FL 33064',      gallonsC: 260, gallonsTL: 60,  gallonsPct: 23,  services: ['osf','uo'],           status: 'pending'   },
        { id: 3, companyCode: 'Jiff35',  locationCode: '#09', name: 'Jiffy Lube - 8830',        address: '9100 Glades Rd, Boca Raton, FL 33434',             gallonsC: 190, gallonsTL: 190, gallonsPct: 100, services: ['ow','osf'],           status: 'pending'   },
      ]
    },
    {
      id: 'route-3',
      name: 'Wednesday Route',
      color: 'var(--brand-500)',
      stops: [
        { id: 1, companyCode: 'Tir823',  locationCode: '#22', name: 'Tire Kingdom - 2891',      address: '1000 S Pine Island Rd, Plantation, FL 33324',      gallonsC: 300, gallonsTL: 0,   gallonsPct: 0,   services: ['ow','uo','ua','osf'], status: 'pending'   },
        { id: 2, companyCode: 'Sears41', locationCode: '#08', name: 'Sears Auto Center - 7712', address: '8000 W Broward Blvd, Plantation, FL 33324',        gallonsC: 225, gallonsTL: 225, gallonsPct: 100, services: ['uo','osf'],           status: 'pending'   },
        { id: 3, companyCode: 'Frs55',   locationCode: '#17', name: 'Firestone Complete - 4490',address: '1700 N University Dr, Coral Springs, FL 33071',    gallonsC: 350, gallonsTL: 100, gallonsPct: 29,  services: ['ow','ua'],            status: 'pending',  pastDue: true  },
        { id: 4, companyCode: 'Midas09', locationCode: '#11', name: 'Midas Auto - 3302',        address: '2900 N Oakland Park Blvd, Oakland Park, FL 33334', gallonsC: 175, gallonsTL: 175, gallonsPct: 100, services: ['ow','uo','ua','osf'], status: 'pending'   },
        { id: 5, companyCode: 'Npa512',  locationCode: '#19', name: 'NAPA Auto Parts - 6614',   address: '5500 Sunrise Blvd, Fort Lauderdale, FL 33313',     gallonsC: 280, gallonsTL: 80,  gallonsPct: 29,  services: ['uo','osf'],           status: 'pending'   },
        { id: 6, companyCode: 'AutoZ44', locationCode: '#31', name: 'AutoZone - 8891',          address: '1400 E Sunrise Blvd, Fort Lauderdale, FL 33304',   gallonsC: 320, gallonsTL: 0,   gallonsPct: 0,   services: ['ow','ua','osf'],      status: 'pending'   },
        { id: 7, companyCode: 'Orl201',  locationCode: '#27', name: "O'Reilly Auto - 9900",     address: '7200 W Commercial Blvd, Tamarac, FL 33319',        gallonsC: 210, gallonsTL: 50,  gallonsPct: 24,  services: ['uo','ua'],            status: 'pending'   },
        { id: 8, companyCode: 'Pep720',  locationCode: '#05', name: 'Pep Boys - 1120',          address: '3500 W Hillsboro Blvd, Deerfield Beach, FL 33442', gallonsC: 390, gallonsTL: 160, gallonsPct: 41,  services: ['ow','uo','ua','osf'], status: 'pending'   },
      ]
    },
  ];

  let currentRoute = ROUTES[0];
  let currentStopIndex = 0;
  let editingTankId = null;
  let nextTankId = 5;
  let tankDraft = {};
  let activeTankSetting = null;

  const TANK_SETTING_OPTIONS = {
    shape: { title: 'Tank shape', help: 'Choose the shape or standard tank model.', values: ['Custom', 'Cylindrical', 'Rectangular', 'Square', 'Drum', 'Drum55', 'Tote', 'Tote 275', 'Tote 330', 'Oblong 275', 'Oblong 330'] },
    fitting: { title: 'Fitting size', help: 'Choose the connection size used by this tank.', values: ['1.0 in', '1.5 in', '2.0 in', '3.0 in', '4.0 in'] },
    orientation: { title: 'Orientation', help: 'Choose how the tank is installed.', values: ['Horizontal', 'Vertical'] },
    ground: { title: 'Ground level', help: 'Choose whether the tank is installed above or below ground.', values: ['Above ground', 'Underground'] },
    location: { title: 'Tank location', help: 'Choose the tank position at this location.', values: ['Inside', 'Outside', 'Service bay', 'Behind service bay', 'North wall', 'South wall'] }
  };

  const TANK_SIZE_FIELDS = {
    Custom: ['Width', 'Length', 'Height'],
    Cylindrical: ['Diameter', 'Length'],
    Rectangular: ['Width', 'Length', 'Height'],
    Square: ['Side', 'Height'],
    Drum: ['Diameter', 'Height']
  };

  function tanksForStop(stop) {
    if (!stop.tanks) {
      stop.tanks = [
        { id: 1, code: 'T0008CB6', name: 'Used Oil Tank #1', capacity: 1000, level: stop.gallonsC, shape: 'Custom', dimensions: '0 (W) × 0 (L) × 0 (H)', orientation: 'Horizontal', location: 'Outside', underground: 'Yes', fitting: '2.0 in', labeled: 'No', temperature: '0 °C', createdBy: 'Charles Hall Jr. (3001)', notes: '—', sensor: null, verified: false },
        { id: 2, code: 'T0014FD2', name: 'Used Oil Tank #2', capacity: 750, level: 485, shape: 'Cylindrical', dimensions: '48 (W) × 96 (L) × 48 (H)', orientation: 'Horizontal', location: 'Behind service bay', underground: 'No', fitting: '2.0 in', labeled: 'Yes', temperature: '22 °C', createdBy: 'Marcus Lee (4821)', notes: 'Access from rear gate.', sensor: 'SN-2048', verified: true },
        { id: 3, code: 'T0021AE9', name: 'Used Oil Tank #3', capacity: 500, level: 210, shape: 'Rectangular', dimensions: '42 (W) × 72 (L) × 46 (H)', orientation: 'Vertical', location: 'Service bay 2', underground: 'No', fitting: '1.5 in', labeled: 'Yes', temperature: '19 °C', createdBy: 'Ana Perez (2140)', notes: 'Inspect fitting before pickup.', sensor: null, verified: false },
        { id: 4, code: 'T0036BC4', name: 'Used Oil Tank #4', capacity: 600, level: 330, shape: 'Cylindrical', dimensions: '46 (W) × 84 (L) × 46 (H)', orientation: 'Horizontal', location: 'North wall', underground: 'No', fitting: '2.0 in', labeled: 'Yes', temperature: '21 °C', createdBy: 'Jose Ramirez (3302)', notes: 'No access restrictions.', sensor: 'SN-4381', verified: true }
      ];
    }
    return stop.tanks;
  }

  const STATUS_LABEL  = { completed: 'Completed', current: 'In progress', pending: 'Pending' };
  const SERVICE_LABEL = { ow: 'OW', uo: 'UO', ua: 'UA', osf: 'OSF' };
  const SERVICE_NAME  = { ow: 'Oily Water', uo: 'Used Oil', ua: 'Under Agreement', osf: 'On-Site Fueling' };

  function buildRouteList() {
    const list = document.getElementById('route-list');
    if (!list) return;
    // The route that should be worked next = first one not fully completed.
    const activeId = (ROUTES.find(r => r.stops.some(s => s.status !== 'completed')) || {}).id;
    list.innerHTML = ROUTES.map(route => {
      const done  = route.stops.filter(s => s.status === 'completed').length;
      const total = route.stops.length;
      const pct   = (done / total) * 100;
      const isActive = route.id === activeId;
      const accent = isActive ? 'var(--brand-500)' : 'var(--text-tertiary)';
      return `
        <li class="route-card${isActive ? ' is-active' : ''}" data-route-id="${route.id}">
          <div class="route-icon" style="--accent: ${accent}">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>
          </div>
          <div class="route-meta">
            <h3>${route.name}</h3>
            <div class="route-progress">
              <div class="progress-bar"><div class="progress-fill" style="background: ${accent}; width: ${pct}%"></div></div>
              <span class="progress-label"><strong>${done}</strong> / ${total} stops</span>
            </div>
          </div>
          <svg class="chev" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </li>`;
    }).join('');

    list.querySelectorAll('.route-card').forEach(card => {
      card.addEventListener('click', () => {
        currentRoute = ROUTES.find(r => r.id === card.dataset.routeId);
        goTo('stops');
      });
    });

    // Header summary counts
    const routesEl = document.getElementById('summary-routes');
    const stopsEl  = document.getElementById('summary-stops');
    if (routesEl) routesEl.textContent = ROUTES.length;
    if (stopsEl)  stopsEl.textContent  = ROUTES.reduce((sum, r) => sum + r.stops.length, 0);
  }

  function updateStopsHeader() {
    const fill    = document.querySelector('.stops-pf');
    const count   = document.getElementById('stops-done-count');
    const totalEl = document.getElementById('stops-total-count');
    const nameEl  = document.getElementById('stops-route-name');

    if (currentRoute === null) {
      const allDone  = ROUTES.reduce((sum, r) => sum + r.stops.filter(s => s.status === 'completed').length, 0);
      const allTotal = ROUTES.reduce((sum, r) => sum + r.stops.length, 0);
      if (fill)    fill.style.width = ((allDone / allTotal) * 100) + '%';
      if (count)   count.textContent = allDone;
      if (totalEl) totalEl.textContent = allTotal;
      if (nameEl)  nameEl.innerHTML = `<strong>All</strong> Routes`;
    } else {
      const done  = currentRoute.stops.filter(s => s.status === 'completed').length;
      const total = currentRoute.stops.length;
      if (fill)    fill.style.width = ((done / total) * 100) + '%';
      if (count)   count.textContent = done;
      if (totalEl) totalEl.textContent = total;
      if (nameEl) {
        const [first, ...rest] = currentRoute.name.split(' ');
        nameEl.innerHTML = `<strong>${first}</strong> ${rest.join(' ')}`;
      }
    }
  }

  function stopCardHTML(stop, routeId, index) {
    const numContent = stop.status === 'completed'
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>`
      : (index + 1);
    const pastDueChip = stop.pastDue ? `<span class="past-due-chip">Past Due</span>` : '';
    const chips = stop.services.map(s => `<span class="service-chip ${s}">${SERVICE_LABEL[s]}</span>`).join('');
    return `
      <button class="stop-card ${stop.status}${stop.pastDue ? ' past-due' : ''}"
              data-stop-index="${index}" data-route-id="${routeId}" draggable="true">
        <div class="stop-num-badge">${numContent}</div>
        <div class="stop-meta">
          <div class="stop-codes">${stop.companyCode} · ${stop.locationCode}</div>
          <div class="stop-name">${stop.name}</div>
          <div class="stop-address">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="stop-row-icon"><path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${stop.address}
          </div>
          <div class="stop-tags">
            <span class="stop-gal-row">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="stop-row-icon"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
              C: ${stop.gallonsC} · TL: ${stop.gallonsTL} gal
            </span>
          </div>
          <div class="stop-service-chips">${pastDueChip}${chips}</div>
        </div>
        <svg class="chev" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>`;
  }

  function renderStopList() {
    const list = document.getElementById('stop-list');
    if (!list) return;
    updateStopsHeader();

    if (currentRoute === null) {
      list.innerHTML = ROUTES.map(route => {
        const done = route.stops.filter(s => s.status === 'completed').length;
        return `
          <li class="route-section-item" data-route-id="${route.id}">
            <div class="route-section-header">
              <span class="rs-dot" style="background: ${route.color}"></span>
              <span class="rs-name">${route.name}</span>
              <span class="rs-count">${done} / ${route.stops.length}</span>
            </div>
            <ul class="stop-list-inner">
              ${route.stops.map((stop, i) => `<li>${stopCardHTML(stop, route.id, i)}</li>`).join('')}
            </ul>
          </li>`;
      }).join('');
    } else {
      list.innerHTML = currentRoute.stops.map((stop, i) =>
        `<li>${stopCardHTML(stop, currentRoute.id, i)}</li>`
      ).join('');
    }

    list.querySelectorAll('.stop-card').forEach(card => {
      card.addEventListener('click', () => {
        currentRoute = ROUTES.find(r => r.id === card.dataset.routeId);
        renderStopDetail(parseInt(card.dataset.stopIndex));
        goTo('stop-detail');
      });
    });

    initDragDrop();
  }

  function renderStopDetail(stopIndex) {
    const stop = currentRoute.stops[stopIndex];
    if (!stop) return;
    currentStopIndex = stopIndex;

    document.getElementById('detail-title').textContent = `Stop #${stopIndex + 1}`;
    document.getElementById('detail-header-right').innerHTML = stop.pastDue ? `<span class="past-due-chip">Past Due</span>` : '';

    const chips      = stop.services.map(s => `<span class="service-chip ${s}">${SERVICE_LABEL[s]}</span>`).join('');
    const pastDueBadge = stop.pastDue ? `<span class="past-due-chip">Past Due</span>` : '';
    const fillPct    = Math.min(100, Math.round((stop.gallonsC / 1000) * 100));
    const contracts  = stop.services.map(s => `
      <button class="service-contract-card" data-service="${s}">
        <div class="sc-chip service-chip ${s}">${SERVICE_LABEL[s]}</div>
        <div class="sc-info">
          <strong>${SERVICE_NAME[s]}</strong>
          <span>Contract #${s.toUpperCase()}-2026-${stop.companyCode}</span>
        </div>
        <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>`).join('');

    document.getElementById('stop-detail-head').innerHTML = `

      <!-- Identity -->
      <div class="detail-identity">
        <div class="stop-detail-codes-row">
          <div class="stop-detail-codes">${stop.companyCode} · ${stop.locationCode}</div>
          <div class="stop-detail-pills">
            <span class="stop-pill sc">SC</span>
            <span class="stop-pill sp">SP</span>
          </div>
        </div>
        <h2 class="stop-detail-name">${stop.name}</h2>
      </div>

      <!-- 3 action buttons -->
      <div class="action-grid">
        <button class="action-btn" id="btn-invoices">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2V2z"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>
          <span>Pay Invoices</span>
        </button>
        <button class="action-btn" id="btn-gps">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8" stroke-opacity="0.35"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
          <span>Capture GPS</span>
        </button>
        <button class="action-btn" id="btn-start-txn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <span>Start TXN</span>
        </button>
      </div>

      <!-- Tabs: Info / Services -->
      <div class="detail-tabs" role="tablist">
        <button class="detail-tab active" data-tab="info" role="tab">Info</button>
        <button class="detail-tab" data-tab="services" role="tab">Services</button>
      </div>
    `;

    document.getElementById('stop-detail-content').innerHTML = `

      <!-- Info pane -->
      <div class="detail-pane" data-pane="info">

      <!-- Location Info -->
      <div class="detail-section">
        <div class="detail-section-title">Location Info</div>
        <div class="detail-info-card">
          <button class="dinfo-row" id="btn-address">
            <div class="dinfo-label">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Address
            </div>
            <div class="dinfo-value">${stop.address}</div>
            <svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <button class="dinfo-row" id="btn-contact">
            <div class="dinfo-label">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Contact
            </div>
            <div class="dinfo-value ${stop.contact ? '' : 'muted'}">${stop.contact || 'Not available'}</div>
            ${stop.contact ? `<svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>` : ''}
          </button>
          <div class="dinfo-row static">
            <div class="dinfo-label">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Hours
            </div>
            <div class="dinfo-value">Mon–Fri · 7:00 AM – 5:00 PM</div>
          </div>
        </div>
      </div>

      <!-- Tanks -->
      <div class="detail-section">
        <div class="detail-section-title">Tanks</div>
        <button class="tank-card" id="tank-card">
          <div class="tank-stats-row">
            <div class="tank-stat"><span class="ts-label">Capacity</span><span class="ts-value">1,000 gal</span></div>
            <div class="tank-stat"><span class="ts-label">C (Current)</span><span class="ts-value">${stop.gallonsC} gal</span></div>
            <div class="tank-stat"><span class="ts-label">TL (Target)</span><span class="ts-value">${stop.gallonsTL} gal</span></div>
          </div>
          <div class="tank-viz">
            <div class="tank-bar-wrap">
              <div class="tank-bar-fill" style="width: ${fillPct}%"></div>
            </div>
            <div class="tank-bar-labels">
              <span>0 gal</span>
              <span class="tank-pct-label">${fillPct}% full</span>
              <span>1,000 gal</span>
            </div>
          </div>
          <div class="tank-verify-row">
            <span class="tank-status-badge unverified" id="tank-status-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Not verified
            </span>
            <span class="tank-details-link">
              View details
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </span>
          </div>
        </button>
      </div>

      <!-- Location Files -->
      <div class="detail-section">
        <div class="detail-section-title">Location Files</div>
        <div class="files-zone">
          <button class="files-add-btn" id="btn-attach">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            Attach file
          </button>
          <p class="files-hint">Photos, documents, delivery receipts</p>
        </div>
      </div>

      <!-- More Information -->
      <div class="detail-section">
        <button class="more-info-row" id="btn-more-info">
          <div class="detail-section-title" style="margin:0">More Information</div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      </div><!-- /Info pane -->

      <!-- Services pane -->
      <div class="detail-pane" data-pane="services" hidden>

      <!-- Scheduled Services -->
      <div class="detail-section">
        <div class="detail-section-title">Scheduled Services</div>
        <div class="service-contracts">${contracts}</div>
      </div>

      </div><!-- /Services pane -->

    `;

    // GPS
    document.getElementById('btn-gps').onclick = () => {
      document.getElementById('gps-popup-address').textContent = stop.address;
      document.getElementById('popup-gps').classList.add('show');
    };
    document.getElementById('confirm-gps-btn').onclick = () => {
      document.getElementById('popup-gps').classList.remove('show');
      const btn = document.getElementById('btn-gps');
      btn.classList.add('captured');
      btn.querySelector('span').textContent = 'GPS Captured';
      showToast('GPS location captured');
    };

    // Pay Invoices
    document.getElementById('btn-invoices').onclick = () => {
      const sheet = document.getElementById('sheet-invoices');
      sheet.classList.add('show');
      sheet.setAttribute('aria-hidden', 'false');
    };

    // Address → navigation popup
    document.getElementById('btn-address').onclick = () => {
      document.getElementById('popup-navigation').classList.add('show');
    };

    // Contact → call popup
    document.getElementById('btn-contact').onclick = () => {
      if (stop.contact) document.getElementById('popup-call').classList.add('show');
    };

    // Tanks card
    document.getElementById('tank-card').onclick = () => goTo('tanks');

    // Attach
    document.getElementById('btn-attach').onclick = () => showToast('File picker — demo only');

    // More Information
    document.getElementById('btn-more-info').onclick = () => showToast('More Information — coming soon');

    // Scheduled service contracts
    document.querySelectorAll('.service-contract-card').forEach(card => {
      card.onclick = () => showToast(`${SERVICE_NAME[card.dataset.service]} · Transactions coming soon`);
    });

    // Info / Services tabs
    document.querySelectorAll('.detail-tab').forEach(tab => {
      tab.onclick = () => {
        document.querySelectorAll('.detail-tab').forEach(t => t.classList.toggle('active', t === tab));
        document.querySelectorAll('.detail-pane').forEach(p => {
          p.hidden = p.dataset.pane !== tab.dataset.tab;
        });
      };
    });

    // Reset scroll position when opening a stop
    document.querySelector('.screen[data-screen="stop-detail"] .screen-body').scrollTop = 0;

    // Start TXN
    document.getElementById('btn-start-txn').onclick = () => showToast('Starting transaction...');
  }

  function renderTanksScreen() {
    const stop = currentRoute?.stops[currentStopIndex] || ROUTES[0].stops[0];
    if (!stop) return;
    const tanks = tanksForStop(stop);
    const totalCapacity = tanks.reduce((sum, tank) => sum + tank.capacity, 0);
    const totalLevel = tanks.reduce((sum, tank) => sum + tank.level, 0);
    const verifiedCount = tanks.filter(tank => tank.verified).length;
    const utilization = totalCapacity ? Math.round(totalLevel / totalCapacity * 100) : 0;

    document.getElementById('tanks-location-summary').innerHTML = `
      <section class="tank-location-card">
        <div class="tank-location-top"><div><span>${stop.companyCode} · ${stop.locationCode}</span><h2>${stop.name}</h2></div></div>
        <div class="tank-summary-grid">
          <div><strong>${tanks.length}</strong><span>Tanks</span></div>
          <div><strong>${totalCapacity.toLocaleString()}</strong><span>Total gal</span></div>
          <div><strong>${utilization}%</strong><span>Current</span></div>
          <div><strong>${verifiedCount}/${tanks.length}</strong><span>Verified</span></div>
        </div>
        <button class="location-verify-btn ${verifiedCount === tanks.length ? 'verified' : ''}" id="location-verify-btn">
          <span><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12l5 5L20 7"/></svg>Location tanks verified</span>
          <span class="location-switch"><i></i></span>
        </button>
      </section>
      <button class="tank-messages-btn" id="tank-messages-btn"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg><span>View location messages</span><span class="message-count">2</span></button>`;
    document.getElementById('tank-count').textContent = `${tanks.length} ${tanks.length === 1 ? 'tank' : 'tanks'}`;
    document.getElementById('tank-list-full').innerHTML = tanks.map((tank, tankIndex) => {
      const pct = Math.min(100, Math.round(tank.level / tank.capacity * 100));
      if (tankIndex === 1) {
        return `<article class="tank-detail-card tank-detail-card-alt ${tank.verified ? 'is-verified' : ''}" data-tank-id="${tank.id}">
          <div class="tank-alt-header">
            <div><span class="tank-alt-kicker">USED OIL · ${tank.code}</span><h3>${tank.name}</h3></div>
            <button class="tank-alt-verify-switch ${tank.verified ? 'verified' : ''}" aria-pressed="${tank.verified}">
              <span class="tank-switch"><i></i></span><span class="tank-switch-label">${tank.verified ? 'Verified' : 'Verify'}</span>
            </button>
          </div>
          <dl class="tank-alt-fields">
            <div><dt>Capacity</dt><dd>${tank.capacity.toLocaleString()} gal</dd></div>
            <div class="span-two"><dt>Current level</dt><dd>${tank.level.toLocaleString()} gal · ${pct}%</dd></div>
            <div><dt>Shape</dt><dd>${tank.shape}</dd></div>
            <div class="span-two"><dt>Dimensions (in)</dt><dd>${tank.dimensions}</dd></div>
            <div><dt>Orientation</dt><dd>${tank.orientation}</dd></div>
            <div><dt>Location</dt><dd>${tank.location}</dd></div>
            <div><dt>Underground?</dt><dd>${tank.underground}</dd></div>
            <div><dt>Fitting</dt><dd>${tank.fitting}</dd></div>
            <div><dt>Labeled?</dt><dd>${tank.labeled}</dd></div>
            <div><dt>Temperature</dt><dd>${tank.temperature}</dd></div>
            <div class="span-all"><dt>Created by</dt><dd>${tank.createdBy}</dd></div>
            <div class="span-all"><dt>Notes</dt><dd>${tank.notes}</dd></div>
          </dl>
          <div class="tank-alt-actions">
            <button class="tank-sensor-btn ${tank.sensor ? 'assigned' : ''}"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12.55a11 11 0 0 1 14.08 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>${tank.sensor || 'Assign sensor'}</button>
            <button class="tank-edit-btn tank-alt-edit" aria-label="Edit ${tank.name}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>Edit tank</button>
          </div>
        </article>`;
      }
      if (tankIndex === 2) {
        const fields = [
          ['Shape', tank.shape], ['Dimensions (in)', tank.dimensions],
          ['Orientation', tank.orientation], ['Location', tank.location],
          ['Underground?', tank.underground], ['Fitting', tank.fitting],
          ['Labeled?', tank.labeled], ['Temperature', tank.temperature],
          ['Created by', tank.createdBy], ['Notes', tank.notes]
        ];
        return `<article class="tank-detail-card tank-detail-card-v3 ${tank.verified ? 'is-verified' : ''}" data-tank-id="${tank.id}">
          <div class="tank-v3-head">
            <div class="tank-v3-number">#3</div>
            <div class="tank-v3-title"><span>${tank.code}</span><h3>${tank.name}</h3></div>
            <button class="tank-edit-btn" aria-label="Edit ${tank.name}"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></button>
          </div>
          <div class="tank-v3-metrics">
            <div><span>Capacity</span><strong>${tank.capacity.toLocaleString()}</strong><small>gal</small></div>
            <div><span>Level</span><strong>${tank.level.toLocaleString()}</strong><small>gal · ${pct}%</small></div>
          </div>
          <div class="tank-v3-fields">${fields.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('')}</div>
          <div class="tank-v3-footer">
            <button class="tank-sensor-btn ${tank.sensor ? 'assigned' : ''}"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12.55a11 11 0 0 1 14.08 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>${tank.sensor || 'Assign sensor'}</button>
            <button class="tank-verified-btn ${tank.verified ? 'verified' : ''}" aria-pressed="${tank.verified}">${tank.verified ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg> Verified' : '<span class="verify-ring"></span> Verify'}</button>
          </div>
        </article>`;
      }
      if (tankIndex === 3) {
        const fields = [
          ['Shape', tank.shape], ['Dimensions', `${tank.dimensions} in`],
          ['Orientation', tank.orientation], ['Location', tank.location],
          ['Underground', tank.underground], ['Fitting', tank.fitting],
          ['Labeled', tank.labeled], ['Temperature', tank.temperature],
          ['Created by', tank.createdBy], ['Notes', tank.notes]
        ];
        return `<article class="tank-detail-card tank-detail-card-minimal ${tank.verified ? 'is-verified' : ''}" data-tank-id="${tank.id}">
          <div class="tank-min-head">
            <div><span>${tank.code}</span><h3>${tank.name}</h3></div>
            <button class="tank-edit-btn" aria-label="Edit ${tank.name}"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></button>
          </div>
          <div class="tank-min-levels">
            <div><span>Capacity</span><strong>${tank.capacity.toLocaleString()} <small>gal</small></strong></div>
            <div><span>Current level</span><strong>${tank.level.toLocaleString()} <small>gal · ${pct}%</small></strong></div>
          </div>
          <dl class="tank-min-fields">${fields.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>
          <div class="tank-min-actions">
            <button class="tank-sensor-btn ${tank.sensor ? 'assigned' : ''}"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12.55a11 11 0 0 1 14.08 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>${tank.sensor || 'Assign sensor'}</button>
            <button class="tank-verified-btn ${tank.verified ? 'verified' : ''}" aria-pressed="${tank.verified}">${tank.verified ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg> Verified' : '<span class="verify-ring"></span> Verify'}</button>
          </div>
        </article>`;
      }
      return `<article class="tank-detail-card ${tank.verified ? 'is-verified' : ''}" data-tank-id="${tank.id}">
        <div class="tank-card-heading"><div class="tank-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 7h14v10H5z"/><path d="M8 7V4h8v3M8 17v3M16 17v3"/></svg></div><div><span>${tank.code} · USED OIL</span><h3>${tank.name}</h3></div><button class="tank-edit-btn" aria-label="Edit ${tank.name}"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></button></div>
        <div class="tank-measure-row"><div><span>Current level</span><strong>${tank.level.toLocaleString()} <small>gal</small></strong></div><div><span>Capacity</span><strong>${tank.capacity.toLocaleString()} <small>gal</small></strong></div></div>
        <div class="tank-level-track"><div style="width:${pct}%"></div></div>
        <div class="tank-level-meta"><span>${pct}% full</span></div>
        <dl class="tank-spec-grid">
          <div><dt>Shape</dt><dd>${tank.shape}</dd></div><div><dt>Dimensions (in)</dt><dd>${tank.dimensions}</dd></div>
          <div><dt>Orientation</dt><dd>${tank.orientation}</dd></div><div><dt>Location</dt><dd>${tank.location}</dd></div>
          <div><dt>Underground?</dt><dd>${tank.underground}</dd></div><div><dt>Fitting</dt><dd>${tank.fitting}</dd></div>
          <div><dt>Labeled?</dt><dd>${tank.labeled}</dd></div><div><dt>Temperature</dt><dd>${tank.temperature}</dd></div>
          <div class="wide"><dt>Created by</dt><dd>${tank.createdBy}</dd></div><div class="wide"><dt>Notes</dt><dd>${tank.notes}</dd></div>
        </dl>
        <div class="tank-primary-actions">
          <button class="tank-sensor-btn ${tank.sensor ? 'assigned' : ''}"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12.55a11 11 0 0 1 14.08 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>${tank.sensor ? `Sensor ${tank.sensor}` : 'Assign sensor'}</button>
          <button class="tank-verified-btn ${tank.verified ? 'verified' : ''}" aria-pressed="${tank.verified}">${tank.verified ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg> Verified' : '<span class="verify-ring"></span> Verify'}</button>
        </div>
      </article>`;
    }).join('');

    document.getElementById('location-verify-btn').onclick = () => {
      const markVerified = !tanks.every(tank => tank.verified);
      tanks.forEach(tank => { tank.verified = markVerified; });
      renderTanksScreen();
      showToast(markVerified ? 'All location tanks verified' : 'Location verification removed');
    };
    document.getElementById('tank-messages-btn').onclick = () => goTo('inbox');
    document.querySelectorAll('.tank-edit-btn').forEach(btn => btn.onclick = () => openTankForm(Number(btn.closest('[data-tank-id]').dataset.tankId)));
    document.querySelectorAll('.tank-sensor-btn').forEach(btn => btn.onclick = () => {
      const tank = tanks.find(item => item.id === Number(btn.closest('[data-tank-id]').dataset.tankId));
      tank.sensor = tank.sensor ? null : `SN-${Math.floor(1000 + Math.random() * 8999)}`;
      renderTanksScreen();
      showToast(tank.sensor ? 'Sensor assigned' : 'Sensor unassigned');
    });
    document.querySelectorAll('.tank-verified-btn, .tank-alt-verify-switch').forEach(btn => btn.onclick = () => {
      const tank = tanks.find(item => item.id === Number(btn.closest('[data-tank-id]').dataset.tankId));
      tank.verified = !tank.verified;
      renderTanksScreen();
      showToast(tank.verified ? `${tank.name} verified` : 'Verification removed');
    });
  }

  function openTankForm(tankId = null) {
    const stop = currentRoute?.stops[currentStopIndex] || ROUTES[0].stops[0];
    const tank = tankId === null ? null : tanksForStop(stop).find(item => item.id === tankId);
    editingTankId = tankId;
    tankDraft = {
      shape: tank?.shape || 'Custom',
      dimensions: tank?.dimensions || 'Not specified',
      fitting: tank?.fitting || 'Not specified',
      orientation: tank?.orientation || 'Not specified',
      ground: tank?.underground === 'Yes' ? 'Underground' : 'Above ground',
      location: tank?.location || 'Not specified',
      labeled: tank?.labeled === 'Yes',
      notes: tank?.notes === '—' ? '' : (tank?.notes || '')
    };
    document.getElementById('tank-form-title').textContent = tank ? 'Edit tank' : 'Add tank';
    document.getElementById('tank-form-heading').textContent = tank ? tank.name : 'New used oil tank';
    document.getElementById('tank-name-input').value = tank?.name || '';
    document.getElementById('tank-capacity-input').value = tank?.capacity || '';
    syncTankFormSettings();
    goTo('tank-form');
  }

  function syncTankFormSettings() {
    ['shape', 'dimensions', 'fitting', 'orientation', 'ground', 'location'].forEach(key => {
      document.getElementById(`tank-setting-${key}`).textContent = tankDraft[key];
    });
    document.getElementById('tank-setting-notes').textContent = tankDraft.notes || 'No notes';
    const labeled = document.getElementById('tank-labeled-switch');
    labeled.classList.toggle('active', tankDraft.labeled);
    labeled.setAttribute('aria-pressed', tankDraft.labeled);
  }

  function openTankOptions(setting) {
    const config = TANK_SETTING_OPTIONS[setting];
    if (!config) return;
    activeTankSetting = setting;
    document.getElementById('tank-options-title').textContent = config.title;
    document.getElementById('tank-options-help').textContent = config.help;
    document.getElementById('tank-option-list').innerHTML = config.values.map(value => `
      <button class="tank-option-row ${tankDraft[setting] === value ? 'selected' : ''}" data-value="${value}">
        <span>${value}</span><span class="tank-option-check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></span>
      </button>`).join('');
    document.querySelectorAll('.tank-option-row').forEach(row => row.onclick = () => {
      tankDraft[setting] = row.dataset.value;
      if (setting === 'shape') tankDraft.dimensions = 'Not specified';
      syncTankFormSettings();
      goTo('tank-form');
    });
    goTo('tank-options');
  }

  function openTankSize() {
    document.getElementById('tank-size-shape').textContent = tankDraft.shape;
    const labels = TANK_SIZE_FIELDS[tankDraft.shape] || [];
    const currentValues = tankDraft.dimensions.match(/\d+(?:\.\d+)?/g) || [];
    document.getElementById('tank-size-fields').innerHTML = labels.length
      ? labels.map((label, index) => `<label class="field"><span class="field-label">${label}</span><div class="field-input tank-number-input"><input type="number" min="0" inputmode="decimal" data-size-field="${label}" value="${currentValues[index] || ''}" placeholder="0"><span>in</span></div></label>`).join('')
      : `<div class="tank-standard-size"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 7h14v10H5z"/><path d="M8 7V4h8v3M8 17v3M16 17v3"/></svg><div><strong>Standard dimensions</strong><span>${tankDraft.shape} uses the predefined dimensions for this model. No manual measurements are required.</span></div></div>`;
    goTo('tank-size');
  }

  function saveTank() {
    const stop = currentRoute?.stops[currentStopIndex] || ROUTES[0].stops[0];
    const tanks = tanksForStop(stop);
    const name = document.getElementById('tank-name-input').value.trim();
    const capacity = Number(document.getElementById('tank-capacity-input').value);
    if (!name || capacity <= 0) {
      showToast('Check the tank name and gallon values');
      return;
    }
    const changes = { name, capacity, shape: tankDraft.shape, dimensions: tankDraft.dimensions, orientation: tankDraft.orientation, location: tankDraft.location, underground: tankDraft.ground === 'Underground' ? 'Yes' : 'No', fitting: tankDraft.fitting, labeled: tankDraft.labeled ? 'Yes' : 'No', notes: tankDraft.notes || '—' };
    if (editingTankId === null) tanks.push({ id: nextTankId++, code: `T${String(Math.floor(Math.random() * 0xffffff)).toUpperCase().padStart(7, '0').slice(0, 7)}`, level: 0, temperature: 'Not recorded', createdBy: 'Marcus Lee (4821)', sensor: null, verified: false, ...changes });
    else Object.assign(tanks.find(item => item.id === editingTankId), changes);
    goTo('tanks');
    showToast(editingTankId === null ? 'Tank added' : 'Tank updated');
  }

  document.getElementById('tank-add-btn')?.addEventListener('click', () => openTankForm());
  document.getElementById('tank-save-btn')?.addEventListener('click', saveTank);
  document.getElementById('tank-save-cta')?.addEventListener('click', saveTank);
  document.querySelectorAll('[data-tank-setting]').forEach(row => row.addEventListener('click', () => {
    const setting = row.dataset.tankSetting;
    if (setting === 'dimensions') openTankSize();
    else if (setting === 'notes') {
      const stop = currentRoute?.stops[currentStopIndex] || ROUTES[0].stops[0];
      const tank = tanksForStop(stop).find(item => item.id === editingTankId);
      document.getElementById('tank-note-input').value = tankDraft.notes;
      document.getElementById('tank-note-context-name').textContent = tank?.name || document.getElementById('tank-name-input').value || 'New used oil tank';
      document.getElementById('tank-note-context-code').textContent = tank?.code || 'New tank';
      updateTankNoteCount();
      goTo('tank-note');
    } else openTankOptions(setting);
  }));
  document.getElementById('tank-options-back')?.addEventListener('click', () => goTo('tank-form'));
  document.getElementById('tank-labeled-switch')?.addEventListener('click', () => {
    tankDraft.labeled = !tankDraft.labeled;
    syncTankFormSettings();
  });
  document.getElementById('tank-size-done')?.addEventListener('click', () => {
    const inputs = [...document.querySelectorAll('[data-size-field]')];
    tankDraft.dimensions = inputs.length
      ? inputs.map(input => `${input.value || 0} (${input.dataset.sizeField.charAt(0)})`).join(' × ')
      : `Standard · ${tankDraft.shape}`;
    syncTankFormSettings();
    goTo('tank-form');
  });
  document.getElementById('tank-note-done')?.addEventListener('click', () => {
    tankDraft.notes = document.getElementById('tank-note-input').value.trim();
    syncTankFormSettings();
    goTo('tank-form');
  });
  function updateTankNoteCount() {
    const input = document.getElementById('tank-note-input');
    const count = document.getElementById('tank-note-count');
    if (input && count) count.textContent = input.value.length;
  }
  document.getElementById('tank-note-input')?.addEventListener('input', updateTankNoteCount);
  document.getElementById('tank-note-clear')?.addEventListener('click', () => {
    const input = document.getElementById('tank-note-input');
    input.value = '';
    input.focus();
    updateTankNoteCount();
  });

  // ===== DRAG & DROP =====
  function initDragDrop() {
    let src = null; // { routeId, index }

    document.querySelectorAll('.stop-card').forEach(card => {

      card.addEventListener('dragstart', e => {
        src = { routeId: card.dataset.routeId, index: parseInt(card.dataset.stopIndex) };
        requestAnimationFrame(() => card.classList.add('dragging'));
        e.dataTransfer.effectAllowed = 'move';
      });

      card.addEventListener('dragend', () => {
        document.querySelectorAll('.dragging, .drop-above, .drop-below')
          .forEach(el => el.classList.remove('dragging', 'drop-above', 'drop-below'));
        src = null;
      });

      card.addEventListener('dragover', e => {
        e.preventDefault();
        if (!src) return;
        const isSelf = card.dataset.routeId === src.routeId &&
                       parseInt(card.dataset.stopIndex) === src.index;
        if (isSelf) return;
        const mid = card.getBoundingClientRect().top + card.getBoundingClientRect().height / 2;
        document.querySelectorAll('.drop-above, .drop-below')
          .forEach(el => el.classList.remove('drop-above', 'drop-below'));
        card.classList.add(e.clientY < mid ? 'drop-above' : 'drop-below');
      });

      card.addEventListener('dragleave', e => {
        if (!card.contains(e.relatedTarget)) card.classList.remove('drop-above', 'drop-below');
      });

      card.addEventListener('drop', e => {
        e.preventDefault();
        if (!src) return;
        const dropAbove = card.classList.contains('drop-above');
        card.classList.remove('drop-above', 'drop-below');

        const dstRouteId = card.dataset.routeId;
        const dstIndex   = parseInt(card.dataset.stopIndex);
        const srcRoute   = ROUTES.find(r => r.id === src.routeId);
        const dstRoute   = ROUTES.find(r => r.id === dstRouteId);

        const [moved] = srcRoute.stops.splice(src.index, 1);

        let insertAt = dstIndex;
        if (srcRoute === dstRoute && src.index < dstIndex) insertAt--;
        if (!dropAbove) insertAt++;
        dstRoute.stops.splice(Math.max(0, insertAt), 0, moved);

        src = null;
        buildRouteList();
        renderStopList();
      });
    });

    // Section areas as drop targets (move to end of a different route)
    document.querySelectorAll('.route-section-item').forEach(section => {
      section.addEventListener('dragover', e => {
        if (e.target.closest('.stop-card')) return;
        e.preventDefault();
        section.classList.add('drop-section');
      });
      section.addEventListener('dragleave', e => {
        if (!section.contains(e.relatedTarget)) section.classList.remove('drop-section');
      });
      section.addEventListener('drop', e => {
        if (e.target.closest('.stop-card')) return;
        e.preventDefault();
        section.classList.remove('drop-section');
        if (!src) return;

        const dstRouteId = section.dataset.routeId;
        const srcRoute   = ROUTES.find(r => r.id === src.routeId);
        const dstRoute   = ROUTES.find(r => r.id === dstRouteId);
        if (!srcRoute || !dstRoute || srcRoute === dstRoute) return;

        const [moved] = srcRoute.stops.splice(src.index, 1);
        dstRoute.stops.push(moved);

        src = null;
        buildRouteList();
        renderStopList();
      });
    });
  }

  // ===== INIT =====
  buildCalendar();
  buildTabBar();
  buildRouteList();
})();
