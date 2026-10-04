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
    screens.forEach(screen => screen.classList.toggle('active', screen.dataset.screen === screenId));
    sideNavButtons.forEach(b => b.classList.toggle('active', b.dataset.go === screenId));
    if (screenId === 'stops') renderStopList();
    if (screenId === 'stop-detail') {
      const content = document.getElementById('stop-detail-content');
      if (!content || !content.innerHTML.trim()) renderStopDetail(0);
    }
    if (screenId === 'tanks') renderTanksScreen();
    if (screenId === 'transaction-services') renderTransactionServices();
    if (screenId === 'transaction-payment') renderSpotPaySummary();
    if (screenId === 'transaction-collect') renderSpotPayCollect();
    if (screenId === 'transaction-card-payment') renderSpotCardPayment();
    if (screenId === 'transaction-driver') renderDriverScreen();
    if (screenId === 'transaction-driver-check') renderDriverCheckScreen();
    if (screenId === 'transaction-customer') renderCustomerScreen();
    if (screenId === 'transaction-customer-disclaimer') renderCustomerDisclaimerScreen();
    if (screenId === 'transaction-receipt-contact') renderReceiptContactScreen();
    if (screenId === 'transaction-review') renderReviewScreen();
    if (screenId === 'transaction-notes') renderTransactionNotesScreen();
    if (screenId === 'transaction-files') renderTransactionFilesScreen();
    if (screenId === 'transaction-service-picker') renderServiceCatalog();
    if (screenId === 'transaction-component-picker') renderComponentCatalog();
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

  // Completed wizard steps in the transaction header jump back to that step.
  document.addEventListener('click', e => {
    const step = e.target.closest('.txn-icon-steps [data-step-target]');
    if (step && !step.disabled) goTo(step.dataset.stepTarget, 'back');
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
        const sheet = document.getElementById('sheet-datepicker');
        if (sheet) {
          sheet.classList.remove('show');
          sheet.setAttribute('aria-hidden', 'true');
        }
        showToast('Date selected: ' + d + ' April');
      });
      grid.appendChild(day);
    }
  }

  // ===== POPUPS =====
  document.querySelectorAll('[data-popup]').forEach(btn => {
    btn.addEventListener('click', () => {
      const popup = document.getElementById(btn.dataset.popup);
      if (popup) {
        popup.classList.add('show');
        popup.setAttribute('aria-hidden', 'false');
      }
    });
  });

  document.querySelectorAll('.popup-overlay').forEach(overlay => {
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
    goTo('routes');
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
    showToast('Routes updated');
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
  const transactionResources = new Map();
  let pendingTransactionFile = null;
  let editingTransactionFileIndex = null;
  let fileSourceContext = 'transaction';
  let transactionResourceReturnScreen = 'transaction-services';
  let activeDriverChecklistId = '';
  let driverCheckDraft = null;
  let pendingCatalogService = '';
  let pendingCatalogComponent = '';
  let editingTankId = null;
  let nextTankId = 7;
  // Alternative tank-card proposals are preserved below for comparison, but hidden
  // while the selected design is evaluated with realistic list data.
  const SHOW_TANK_CARD_PROPOSALS = false;
  let tankDraft = {};
  let activeTankSetting = null;

  function escapeHTML(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function transactionResourceKey() {
    const stop = currentRoute?.stops[currentStopIndex] || ROUTES[0].stops[0];
    return `${currentRoute?.id || 'route-1'}:${stop?.id || 1}`;
  }

  function getTransactionResourceState() {
    const stop = currentRoute?.stops[currentStopIndex] || ROUTES[0].stops[0];
    const key = transactionResourceKey();
    if (!transactionResources.has(key)) {
      transactionResources.set(key, {
        note: stop?.companyCode === 'AutoZ44' ? '' : 'Confirm all paperwork with the store manager before leaving the location.',
        addedServices: [],
        files: [
          { name: 'Service authorization.pdf', meta: 'PDF · 248 KB', description: 'Customer authorization for the scheduled service.' },
          { name: 'Tank area.jpg', meta: 'JPG · 1.8 MB', description: 'Condition of the tank area before service.' },
          { name: 'Work order 7823.pdf', meta: 'PDF · 516 KB', description: 'Approved work order for today’s visit.' },
          { name: 'Manager signature.jpg', meta: 'JPG · 642 KB', description: 'Store manager signature from arrival.' },
          { name: 'Oil tank label.jpg', meta: 'JPG · 1.2 MB', description: 'Tank identification label and capacity.' },
          { name: 'Customer request.pdf', meta: 'PDF · 194 KB', description: 'Service request received from the customer.' },
          { name: 'Site access instructions.docx', meta: 'DOCX · 86 KB', description: 'Instructions for entering the service area.' },
          { name: 'Previous service.xlsx', meta: 'XLSX · 72 KB', description: 'Previous quantities and service history.' },
        ],
      });
    }
    return transactionResources.get(key);
  }

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
        { id: 4, code: 'T0036BC4', name: 'Used Oil Tank #4', capacity: 600, level: 330, shape: 'Cylindrical', dimensions: '46 (W) × 84 (L) × 46 (H)', orientation: 'Horizontal', location: 'North wall', underground: 'No', fitting: '2.0 in', labeled: 'Yes', temperature: '21 °C', createdBy: 'Jose Ramirez (3302)', notes: 'No access restrictions.', sensor: 'SN-4381', verified: true },
        { id: 5, code: 'T0042DE8', name: 'Used Oil Tank #5', capacity: 275, level: 95, shape: 'Tote 275', dimensions: 'Standard · Tote 275', orientation: 'Vertical', location: 'Inside', underground: 'No', fitting: '2.0 in', labeled: 'Yes', temperature: '20 °C', createdBy: 'Marcus Lee (4821)', notes: 'Keep aisle clear before service.', sensor: null, verified: false },
        { id: 6, code: 'T0058AF1', name: 'Used Oil Tank #6', capacity: 330, level: 300, shape: 'Oblong 330', dimensions: 'Standard · Oblong 330', orientation: 'Horizontal', location: 'South wall', underground: 'No', fitting: '1.5 in', labeled: 'No', temperature: '23 °C', createdBy: 'Ana Perez (2140)', notes: 'Label replacement requested.', sensor: 'SN-7724', verified: true }
      ];
    }
    return stop.tanks;
  }

  const STATUS_LABEL  = { completed: 'Completed', current: 'In progress', pending: 'Pending' };
  const SERVICE_LABEL = { ow: 'OW', uo: 'UO', ua: 'UA', osf: 'OSF' };
  const SERVICE_NAME  = { ow: 'Oily Water', uo: 'Used Oil', ua: 'Under Agreement', osf: 'On-Site Fueling' };
  const SERVICE_CATALOG = [
    'Analytical Services Non Vac Service',
    'Analytical Services ZLF',
    'Burner Fuel',
    'Consulting',
    'Container & Universal Waste Disposal',
    'Containerized Waste',
    'Containers',
    'Containers - (Final) Pickup',
    'Containers - Setup',
    'Containers - Wheel Weights',
    'Containers Zero Landfill',
    'Degreaser Items',
    'Empty/Recyclable Container',
    'Empty/Recyclable Container Rebate',
    'Filter Crusher',
    'Fuel Surcharge Flat Rate',
    'Used Oil Service',
    'Liquid Waste',
    'Metal',
  ];
  const USED_OIL_COMPONENTS = [
    '3rd Party Used Oil',
    '3rd Party Used Oil Truck Charge',
    'DIY Used Oil',
    'Drum Charge for Pumping Used Oil From Drum',
    'Emergency Response',
    'Off Route/Under Minimum Fee',
    'Service Charge for Used Oil',
    'Truck Charge for Used Oil Service',
  ];
  const DEFAULT_SERVICE_COMPONENTS = [
    'Standard service',
    'Additional labor',
    'Equipment charge',
    'Material or disposal charge',
    'Off route fee',
    'Emergency response',
  ];

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
    document.getElementById('detail-header-right').innerHTML = '';

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
        <div class="stop-detail-codes">${stop.companyCode} · ${stop.locationCode}</div>
        <h2 class="stop-detail-name">${stop.name}</h2>
        <div class="stop-detail-services-row">
          <span class="stop-detail-services-label">Services</span>
          <div class="stop-detail-pills">
            <span class="stop-pill sp">SP</span>
            <span class="stop-pill sc">SC</span>
          </div>
          ${pastDueBadge}
        </div>
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
    document.getElementById('btn-attach').onclick = () => openFileSourcePicker('stop');

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
    document.getElementById('btn-start-txn').onclick = () => goTo('transaction-services');
  }

  // ===== TRANSACTION NOTES & ATTACHMENTS =====
  function fileExtension(filename) {
    const parts = String(filename).split('.');
    return parts.length > 1 ? parts.pop().slice(0, 4).toUpperCase() : 'FILE';
  }

  function formatFileSize(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return 'File';
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function renderTransactionFiles() {
    const state = getTransactionResourceState();
    const list = document.getElementById('txn-file-list');
    const count = document.getElementById('txn-file-count');
    if (!list || !count) return;

    count.textContent = state.files.length;
    const attachmentBadge = document.querySelector('.txn-attachment-badge');
    if (attachmentBadge) attachmentBadge.textContent = state.files.length;

    if (!state.files.length) {
      list.innerHTML = '<div class="txn-file-empty">No files have been uploaded yet.</div>';
      return;
    }

    list.innerHTML = state.files.map((file, index) => {
      const extension = fileExtension(file.name);
      const isMedia = ['JPG', 'JPEG', 'PNG', 'HEIC', 'GIF', 'MP4', 'MOV'].includes(extension);
      return `
        <button class="txn-file-card" data-file-index="${index}">
          <span class="txn-file-preview ${isMedia ? 'media' : 'document'}">
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${isMedia ? '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>' : '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'}</svg>
            <small>${escapeHTML(extension)}</small>
          </span>
          <span class="txn-file-copy">
            <small class="txn-file-label">Filename</small>
            <strong>${escapeHTML(file.name)}</strong>
            <small class="txn-file-label description-label">Description</small>
            <span class="txn-file-description${file.description ? '' : ' empty'}">${escapeHTML(file.description || 'No description added')}</span>
            <small class="txn-file-uploaded">${escapeHTML(file.meta)} · Uploaded for this transaction</small>
          </span>
        </button>`;
    }).join('');
  }

  function transactionResourceContextHTML() {
    const stop = currentRoute?.stops[currentStopIndex] || ROUTES[0].stops[0];
    return `<span>${escapeHTML(stop.companyCode)} · ${escapeHTML(stop.locationCode)}</span><strong>${escapeHTML(stop.name)}</strong>`;
  }

  function renderTransactionNotesScreen() {
    document.querySelector('.screen[data-screen="transaction-notes"] .resource-back-btn').dataset.go = transactionResourceReturnScreen;
    document.getElementById('txn-notes-context').innerHTML = transactionResourceContextHTML();
    showTransactionNoteState(false);
    document.querySelector('.screen[data-screen="transaction-notes"] .screen-body').scrollTop = 0;
  }

  function showTransactionNoteState(editing) {
    const state = getTransactionResourceState();
    const hasNote = Boolean(state.note.trim());
    const existing = document.getElementById('txn-note-existing');
    const empty = document.getElementById('txn-note-empty');
    const editor = document.getElementById('txn-note-editor');
    const actions = document.getElementById('txn-note-actions');

    existing.hidden = editing || !hasNote;
    empty.hidden = editing || hasNote;
    editor.hidden = !editing;
    actions.hidden = !editing;

    if (hasNote) document.getElementById('txn-note-readonly-text').textContent = state.note;
    if (editing) {
      const noteInput = document.getElementById('txn-note-input');
      noteInput.value = state.note;
      setTimeout(() => noteInput.focus(), 120);
    }
  }

  function renderTransactionFilesScreen() {
    document.querySelector('.screen[data-screen="transaction-files"] .resource-back-btn').dataset.go = transactionResourceReturnScreen;
    document.getElementById('txn-files-context').innerHTML = transactionResourceContextHTML();
    renderTransactionFiles();
    document.querySelector('.screen[data-screen="transaction-files"] .screen-body').scrollTop = 0;
  }

  function closeTransactionFileDetails() {
    pendingTransactionFile = null;
    editingTransactionFileIndex = null;
    goTo('transaction-files');
  }

  function openTransactionFileDetails(file, index = null) {
    const isNewFile = index === null;
    pendingTransactionFile = isNewFile ? file : null;
    editingTransactionFileIndex = index;
    document.getElementById('txn-file-details-title').textContent = isNewFile ? 'Add file' : 'File details';
    document.getElementById('txn-file-details-icon').textContent = fileExtension(file.name);
    document.getElementById('txn-file-details-name').textContent = file.name;
    document.getElementById('txn-file-details-meta').textContent = file.meta;
    document.getElementById('txn-file-details-description').value = file.description || '';
    document.getElementById('txn-save-file-details').textContent = isNewFile ? 'Save file' : 'Save changes';
    goTo('transaction-file-details');
    setTimeout(() => document.getElementById('txn-file-details-description').focus(), 180);
  }

  function openFileSourcePicker(context = 'transaction') {
    fileSourceContext = context;
    const picker = document.getElementById('popup-file-source');
    picker.classList.add('show');
    picker.setAttribute('aria-hidden', 'false');
  }

  function closeFileSourcePicker() {
    const picker = document.getElementById('popup-file-source');
    picker.classList.remove('show');
    picker.setAttribute('aria-hidden', 'true');
  }

  function initTransactionResourceControls() {
    const noteInput = document.getElementById('txn-note-input');
    const fileInputs = [
      document.getElementById('txn-camera-input'),
      document.getElementById('txn-media-input'),
      document.getElementById('txn-document-input'),
    ];

    document.getElementById('txn-save-note')?.addEventListener('click', () => {
      getTransactionResourceState().note = noteInput.value.trim();
      showToast('Transaction note saved');
      showTransactionNoteState(false);
    });
    document.getElementById('txn-add-note')?.addEventListener('click', () => showTransactionNoteState(true));
    document.getElementById('txn-edit-note')?.addEventListener('click', () => showTransactionNoteState(true));
    document.getElementById('txn-cancel-note-edit')?.addEventListener('click', () => showTransactionNoteState(false));

    document.getElementById('txn-upload-trigger')?.addEventListener('click', () => {
      openFileSourcePicker('transaction');
    });
    document.getElementById('txn-source-camera')?.addEventListener('click', () => fileInputs[0].click());
    document.getElementById('txn-source-media')?.addEventListener('click', () => fileInputs[1].click());
    document.getElementById('txn-source-file')?.addEventListener('click', () => fileInputs[2].click());

    fileInputs.forEach(input => input?.addEventListener('change', () => {
      const selectedFile = input.files?.[0];
      if (!selectedFile) return;
      closeFileSourcePicker();
      if (fileSourceContext === 'transaction') {
        openTransactionFileDetails({
          name: selectedFile.name,
          meta: `${fileExtension(selectedFile.name)} · ${formatFileSize(selectedFile.size)}`,
          description: '',
        });
      } else {
        showToast(`${selectedFile.name} attached to this stop`);
      }
      input.value = '';
    }));

    document.getElementById('txn-file-list')?.addEventListener('click', event => {
      const row = event.target.closest('[data-file-index]');
      if (!row) return;
      const index = Number(row.dataset.fileIndex);
      const file = getTransactionResourceState().files[index];
      if (!file) return;
      openTransactionFileDetails(file, index);
    });

    document.getElementById('txn-file-details-back')?.addEventListener('click', closeTransactionFileDetails);
    document.getElementById('txn-cancel-file-details')?.addEventListener('click', closeTransactionFileDetails);
    document.getElementById('txn-save-file-details')?.addEventListener('click', () => {
      const description = document.getElementById('txn-file-details-description').value.trim();
      const state = getTransactionResourceState();
      if (editingTransactionFileIndex === null) {
        if (!pendingTransactionFile) return;
        state.files.push({ ...pendingTransactionFile, description });
      } else if (state.files[editingTransactionFileIndex]) {
        state.files[editingTransactionFileIndex].description = description;
      }
      renderTransactionFiles();
      const wasNewFile = editingTransactionFileIndex === null;
      closeTransactionFileDetails();
      showToast(wasNewFile ? 'File added to transaction' : 'File details saved');
    });
  }

  // ===== ADD ANOTHER SERVICE =====
  function componentsForService(serviceName) {
    return serviceName.includes('Used Oil') ? USED_OIL_COMPONENTS : DEFAULT_SERVICE_COMPONENTS;
  }

  function catalogCategory(name) {
    if (/analytical|consulting/i.test(name)) return 'Analysis & consulting';
    if (/container|waste|metal/i.test(name)) return 'Containers & waste';
    if (/oil|fuel/i.test(name)) return 'Oil & fuel';
    return 'Equipment & supplies';
  }

  function renderServiceCatalog() {
    const list = document.getElementById('txn-service-catalog');
    const query = document.getElementById('txn-service-search').value.trim().toLowerCase();
    const matches = SERVICE_CATALOG.map((name, index) => ({ name, index }))
      .filter(service => service.name.toLowerCase().includes(query));
    document.getElementById('txn-catalog-count').textContent = `${matches.length} available`;
    const groups = ['Oil & fuel', 'Containers & waste', 'Analysis & consulting', 'Equipment & supplies'];
    list.innerHTML = matches.length ? groups.map(group => {
      const entries = matches.filter(service => catalogCategory(service.name) === group);
      if (!entries.length) return '';
      return `<section class="catalog-group"><h3 class="catalog-group-title">${escapeHTML(group)}</h3><div class="catalog-group-rows">${entries.map(({ name, index }) => `
        <button class="catalog-row" data-catalog-service="${index}">
          <span class="catalog-row-name">${escapeHTML(name)}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
        </button>`).join('')}</div></section>`;
    }).join('') : '<div class="catalog-empty"><strong>No services found</strong>Try a different name or clear your search.</div>';
    document.querySelector('.screen[data-screen="transaction-service-picker"] .screen-body').scrollTop = 0;
  }

  function updateComponentSelection() {
    document.getElementById('txn-component-save').disabled = !pendingCatalogComponent;
    document.querySelector('#txn-component-save span').textContent = 'Add service';
    document.getElementById('txn-component-summary').textContent = pendingCatalogComponent ? '1 component selected for this visit' : 'Select one component to continue';
  }

  function renderComponentCatalog(resetScroll = true) {
    if (!pendingCatalogService) {
      goTo('transaction-service-picker');
      return;
    }
    document.getElementById('txn-selected-service-name').innerHTML = `<div><small>Selected service</small><strong>${escapeHTML(pendingCatalogService)}</strong></div>`;
    const components = componentsForService(pendingCatalogService);
    const body = document.querySelector('.screen[data-screen="transaction-component-picker"] .screen-body');
    const previousScroll = body.scrollTop;
    document.getElementById('txn-component-catalog').innerHTML = components.map((component, index) => {
      const selected = pendingCatalogComponent === component;
      return `
        <label class="catalog-row component-row${selected ? ' selected' : ''}">
          <span class="catalog-row-name">${escapeHTML(component)}</span>
          <input type="radio" name="txn-service-component" value="${index}" data-component-index="${index}"${selected ? ' checked' : ''}>
        </label>`;
    }).join('');
    updateComponentSelection();
    body.scrollTop = resetScroll ? 0 : previousScroll;
  }

  function initServiceCatalogControls() {
    document.getElementById('txn-service-search').addEventListener('input', renderServiceCatalog);
    document.getElementById('txn-service-picker-back')?.addEventListener('click', () => {
      pendingCatalogService = '';
      pendingCatalogComponent = '';
      goTo('transaction-services');
    });
    document.getElementById('txn-component-picker-back')?.addEventListener('click', () => goTo('transaction-service-picker'));

    document.getElementById('txn-service-catalog')?.addEventListener('click', event => {
      const row = event.target.closest('[data-catalog-service]');
      if (!row) return;
      const service = SERVICE_CATALOG[Number(row.dataset.catalogService)];
      if (pendingCatalogService !== service) pendingCatalogComponent = '';
      pendingCatalogService = service;
      goTo('transaction-component-picker');
    });

    document.getElementById('txn-component-catalog')?.addEventListener('change', event => {
      const input = event.target.closest('input[data-component-index]');
      if (!input || !input.checked) return;
      const component = componentsForService(pendingCatalogService)[Number(input.dataset.componentIndex)];
      if (!component) return;
      pendingCatalogComponent = component;
      document.querySelectorAll('#txn-component-catalog .component-row').forEach(row => {
        row.classList.toggle('selected', row.querySelector('input').checked);
      });
      updateComponentSelection();
    });

    document.getElementById('txn-component-save')?.addEventListener('click', () => {
      if (!pendingCatalogService || !pendingCatalogComponent) return;
      const resourceState = getTransactionResourceState();
      if (!resourceState.addedServices) resourceState.addedServices = [];
      resourceState.addedServices.push({
        name: pendingCatalogService,
        components: [pendingCatalogComponent],
      });
      const addedName = pendingCatalogService;
      pendingCatalogService = '';
      pendingCatalogComponent = '';
      goTo('transaction-services');
      showToast(`${addedName} added`);
    });
  }

  // ===== SERVICE INPUT · SESSION-ONLY PROTOTYPE =====
  const SERVICE_UOMS = [
    { id: 'gal', name: 'Gallon', abbr: 'GAL' },
    { id: 'drum', name: 'Drum', abbr: 'DRUM' },
    { id: 'tote', name: 'Tote', abbr: 'TOTE' },
  ];
  const SERVICE_PRICE_MODES = { pay: 'Pay', charge: 'Charge', none: 'No Charge' };
  // Sample reasons and contract terms; replace with the contract API when connected.
  const SERVICE_PRICE_REASONS = ['Low volume', 'Wet oil', 'No payment required', 'Contaminated material', 'Contract adjustment', 'Other'];
  let serviceInputDraft = null;
  let serviceInputContract = null;
  let serviceActiveUnit = null;
  let servicePriceDraft = null;
  let servicePendingUom = '';
  let servicePendingReason = '';

  function serviceContractFor(key) {
    const configured = getTransactionResourceState().serviceContracts?.[key];
    if (configured) return structuredClone(configured);
    return {
      demo: true,
      units: SERVICE_UOMS.map(unit => ({
        ...unit,
        allowedModes: key === 'scheduled:ow' && unit.id === 'gal' ? ['charge', 'none'] : ['pay', 'charge', 'none'],
        mode: unit.id !== 'gal' ? 'none' : key === 'scheduled:uo' ? 'pay' : key === 'scheduled:ow' ? 'charge' : 'none',
        rate: unit.id !== 'gal' ? 0 : key === 'scheduled:uo' ? 0.25 : key === 'scheduled:ow' ? 1 : 0,
      })),
    };
  }

  function newServiceUnit(id, addedByUser = false) {
    const terms = serviceInputContract.units.find(unit => unit.id === id);
    return { id, quantity: 0, mode: terms.mode, rate: terms.rate, reason: '', notes: '', addedByUser };
  }

  function openServiceInput(key, name, component) {
    const saved = getTransactionResourceState().serviceInputs?.[key];
    serviceInputContract = serviceContractFor(key);
    serviceInputDraft = saved ? structuredClone(saved) : { key, name, component, units: [newServiceUnit(serviceInputContract.units[0].id)] };
    showServiceInput();
  }

  function serviceUnitTerms(id) {
    return serviceInputContract.units.find(unit => unit.id === id);
  }

  function servicePriceLabel(unit) {
    if (unit.mode === 'none') return 'No charge';
    return `${SERVICE_PRICE_MODES[unit.mode]} $${Number(unit.rate).toFixed(3)}/${serviceUnitTerms(unit.id).abbr}`;
  }

  // Swipe-to-delete gesture for rows wrapped in .service-unit-swipe (UOM cards, receipt emails and phones).
  // A tap that only closes an open row must not also trigger the row's action.
  function initSwipeToDelete(listId) {
    const list = document.getElementById(listId);
    if (!list) return () => false;
    const SWIPE_OPEN_X = -84;
    let swipeState = null;
    let suppressNextClick = false;
    const closeOtherSwipes = except => {
      list.querySelectorAll('[data-swipe-card].swipe-open').forEach(card => {
        if (card !== except) card.classList.remove('swipe-open');
      });
    };
    list.addEventListener('pointerdown', event => {
      const card = event.target.closest('[data-swipe-card]');
      if (!card || !card.parentElement.classList.contains('service-unit-swipe')) return;
      swipeState = { card, startX: event.clientX, startY: event.clientY, baseX: card.classList.contains('swipe-open') ? SWIPE_OPEN_X : 0, dragging: false, pointerId: event.pointerId };
    });
    list.addEventListener('pointermove', event => {
      if (!swipeState || swipeState.pointerId !== event.pointerId) return;
      const dx = event.clientX - swipeState.startX;
      const dy = event.clientY - swipeState.startY;
      if (!swipeState.dragging) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
        swipeState.dragging = true;
        swipeState.card.classList.add('swiping');
        swipeState.card.setPointerCapture?.(event.pointerId);
      }
      event.preventDefault();
      const x = Math.min(0, Math.max(SWIPE_OPEN_X, swipeState.baseX + dx));
      swipeState.card.style.transform = `translateX(${x}px)`;
    });
    const endSwipe = event => {
      if (!swipeState || swipeState.pointerId !== event.pointerId) return;
      const { card, dragging, baseX, startX } = swipeState;
      card.classList.remove('swiping');
      card.style.transform = '';
      if (dragging) {
        const finalX = Math.min(0, Math.max(SWIPE_OPEN_X, baseX + (event.clientX - startX)));
        const open = finalX <= SWIPE_OPEN_X / 2;
        card.classList.toggle('swipe-open', open);
        closeOtherSwipes(open ? card : null);
      } else if (card.classList.contains('swipe-open')) {
        card.classList.remove('swipe-open');
        suppressNextClick = true;
      }
      swipeState = null;
    };
    list.addEventListener('pointerup', endSwipe);
    list.addEventListener('pointercancel', endSwipe);
    // The list's own click handler calls this first and ignores the click when it returns true.
    return () => {
      const suppressed = suppressNextClick;
      suppressNextClick = false;
      return suppressed;
    };
  }

  function showServiceInput() {
    goTo('transaction-service-input');
    document.getElementById('service-input-context').innerHTML = `<div><span>Service</span><strong>${escapeHTML(serviceInputDraft.name)}</strong></div><div><span>Component</span><strong>${escapeHTML(serviceInputDraft.component)}</strong></div>`;
    document.getElementById('service-unit-count').textContent = `${serviceInputDraft.units.length} ${serviceInputDraft.units.length === 1 ? 'unit' : 'units'}`;
    document.getElementById('service-unit-list').innerHTML = serviceInputDraft.units.map(unit => {
      const terms = serviceUnitTerms(unit.id);
      const card = `<article class="service-unit-card" data-swipe-card>
        <button class="service-quantity-row" data-service-amount="${escapeHTML(unit.id)}" aria-label="Edit ${escapeHTML(terms.name)} quantity: ${unit.quantity}">
          <span><strong>${escapeHTML(terms.name)}</strong><small>Quantity collected</small></span><span class="service-quantity-number">${unit.quantity}<small>${escapeHTML(terms.abbr)}</small></span><span class="service-row-chevron" aria-hidden="true">›</span>
        </button>
        <button class="service-unit-price" data-service-price="${escapeHTML(unit.id)}"><span><small>Price per unit</small><strong>${escapeHTML(servicePriceLabel(unit))}</strong>${unit.reason ? `<small>${escapeHTML(unit.reason)}</small>` : ''}</span><span class="service-row-chevron" aria-hidden="true">›</span></button>
      </article>`;
      if (!unit.addedByUser) return card;
      return `<div class="service-unit-swipe">
        <button class="service-unit-delete" data-service-remove="${escapeHTML(unit.id)}" aria-label="Delete ${escapeHTML(terms.name)}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          <span>Delete</span>
        </button>
        ${card}
      </div>`;
    }).join('');
    document.getElementById('service-add-uom').disabled = serviceInputDraft.units.length >= serviceInputContract.units.length;
  }

  // Plain non-negative decimal only, never executable code.
  function readServiceNumber(value) {
    const text = String(value).trim().replace(',', '.');
    return /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text) && Number(text) <= 999999999 ? Number(text) : null;
  }

  function serviceRadioOption(group, value, title, checked) {
    return `<label class="catalog-row component-row${checked ? ' selected' : ''}"><span class="catalog-row-name">${escapeHTML(title)}</span><input type="radio" name="${group}" value="${escapeHTML(value)}"${checked ? ' checked' : ''}></label>`;
  }

  function syncServiceRadioRows(container) {
    container.querySelectorAll('.component-row').forEach(row => row.classList.toggle('selected', row.querySelector('input').checked));
  }

  function showServicePrice() {
    goTo('transaction-service-price');
    const terms = serviceUnitTerms(serviceActiveUnit);
    document.getElementById('service-price-context').innerHTML = `<div><small>${escapeHTML(serviceInputDraft.name)}</small><strong>${escapeHTML(serviceInputDraft.component)}</strong></div><span>${escapeHTML(terms.abbr)}</span>`;
    document.getElementById('service-price-modes').innerHTML = Object.entries(SERVICE_PRICE_MODES).map(([mode, label]) => `<label><input type="radio" name="service-price-mode" value="${mode}"${servicePriceDraft.mode === mode ? ' checked' : ''}${terms.allowedModes.includes(mode) ? '' : ' disabled'}><span>${label}</span></label>`).join('');
    document.getElementById('service-contract-help').textContent = `${serviceInputContract.demo ? 'Sample contract. ' : ''}${terms.allowedModes.length < 3 ? 'Unavailable pricing types are disabled by the contract.' : 'Select one pricing type for this unit.'}`;
    document.getElementById('service-price-unit').textContent = terms.name.toLowerCase();
    document.getElementById('service-price-abbr').textContent = `/ ${terms.abbr}`;
    document.getElementById('service-price-rate').value = servicePriceDraft.mode === 'none' ? '0' : servicePriceDraft.rawRate;
    document.getElementById('service-price-rate').disabled = servicePriceDraft.mode === 'none';
    document.getElementById('service-reason-value').textContent = servicePriceDraft.reason || 'Choose a reason';
    document.getElementById('service-price-notes').value = servicePriceDraft.notes;
    document.getElementById('service-price-error').textContent = '';
  }

  function initServiceInputControls() {
    const on = (id, event, handler) => document.getElementById(id).addEventListener(event, handler);
    on('service-input-cancel', 'click', () => { serviceInputDraft = null; goTo('transaction-services'); });
    on('service-input-save', 'click', () => {
      if (!serviceInputDraft) return;
      const state = getTransactionResourceState();
      state.serviceInputs ||= {};
      state.serviceInputs[serviceInputDraft.key] = structuredClone(serviceInputDraft);
      serviceInputDraft = null;
      goTo('transaction-services');
      showToast('Service details saved');
    });
    // Swipe-to-delete for manually-added UOM cards, mirroring native mobile list gestures.
    const consumeSwipeClick = initSwipeToDelete('service-unit-list');
    on('service-unit-list', 'click', event => {
      if (consumeSwipeClick()) { event.preventDefault(); return; }
      const remove = event.target.closest('[data-service-remove]');
      if (remove) {
        const terms = serviceUnitTerms(remove.dataset.serviceRemove);
        serviceInputDraft.units = serviceInputDraft.units.filter(unit => unit.id !== remove.dataset.serviceRemove);
        showServiceInput();
        showToast(`${terms.name} removed`);
        return;
      }
      const amount = event.target.closest('[data-service-amount]');
      const price = event.target.closest('[data-service-price]');
      if (!amount && !price) return;
      serviceActiveUnit = amount ? amount.dataset.serviceAmount : price.dataset.servicePrice;
      const unit = serviceInputDraft.units.find(item => item.id === serviceActiveUnit);
      if (amount) {
        goTo('transaction-service-amount');
        document.getElementById('service-amount-component').textContent = serviceInputDraft.component;
        document.getElementById('service-amount-unit').textContent = serviceUnitTerms(unit.id).name;
        document.getElementById('service-amount-value').value = unit.quantity;
        document.getElementById('service-amount-error').textContent = '';
      } else {
        servicePriceDraft = { ...unit, rawRate: String(unit.rate) };
        showServicePrice();
      }
    });
    on('service-add-uom', 'click', () => {
      servicePendingUom = '';
      const available = serviceInputContract.units.filter(unit => !serviceInputDraft.units.some(item => item.id === unit.id));
      document.getElementById('service-uom-options').innerHTML = available.map(unit => serviceRadioOption('service-uom', unit.id, unit.name, false)).join('');
      document.getElementById('service-uom-save').disabled = true;
      goTo('transaction-service-uom');
    });
    on('service-uom-options', 'change', event => {
      if (!event.target.matches('input[type="radio"]')) return;
      servicePendingUom = event.target.value;
      syncServiceRadioRows(event.currentTarget);
      document.getElementById('service-uom-save').disabled = false;
    });
    on('service-uom-cancel', 'click', showServiceInput);
    on('service-uom-save', 'click', () => {
      if (!servicePendingUom || !serviceUnitTerms(servicePendingUom) || serviceInputDraft.units.some(unit => unit.id === servicePendingUom)) return;
      serviceInputDraft.units.push(newServiceUnit(servicePendingUom, true));
      servicePendingUom = '';
      showServiceInput();
    });
    on('service-amount-cancel', 'click', showServiceInput);
    on('service-amount-save', 'click', () => {
      const value = readServiceNumber(document.getElementById('service-amount-value').value);
      if (value === null) {
        document.getElementById('service-amount-error').textContent = 'Enter a valid amount between 0 and 999,999,999.';
        document.getElementById('service-amount-value').focus();
        return;
      }
      serviceInputDraft.units.find(unit => unit.id === serviceActiveUnit).quantity = value;
      showServiceInput();
    });
    on('service-amount-value', 'input', () => { document.getElementById('service-amount-error').textContent = ''; });
    on('service-amount-keypad', 'click', event => {
      const key = event.target.closest('[data-amount-key]')?.dataset.amountKey;
      if (!key) return;
      const input = document.getElementById('service-amount-value');
      document.getElementById('service-amount-error').textContent = '';
      if (key === 'clear') input.value = '0';
      else if (key === 'backspace') input.value = input.value.slice(0, -1) || '0';
      else if (key === '.') { if (!input.value.includes('.')) input.value += input.value ? '.' : '0.'; }
      else input.value = input.value === '0' ? key : input.value + key;
    });
    on('service-price-cancel', 'click', () => { servicePriceDraft = null; showServiceInput(); });
    on('service-price-modes', 'change', event => {
      const mode = event.target.value;
      if (!serviceUnitTerms(serviceActiveUnit).allowedModes.includes(mode)) return;
      servicePriceDraft.mode = mode;
      showServicePrice();
    });
    on('service-price-rate', 'input', event => {
      servicePriceDraft.rawRate = event.target.value;
      document.getElementById('service-price-error').textContent = '';
    });
    on('service-price-notes', 'input', event => { servicePriceDraft.notes = event.target.value; });
    on('service-price-save', 'click', () => {
      const terms = serviceUnitTerms(serviceActiveUnit);
      if (!terms.allowedModes.includes(servicePriceDraft.mode)) return;
      const rate = servicePriceDraft.mode === 'none' ? 0 : readServiceNumber(servicePriceDraft.rawRate);
      if (rate === null) {
        document.getElementById('service-price-error').textContent = 'Enter a valid price using numbers and decimals only.';
        document.getElementById('service-price-rate').focus();
        return;
      }
      const unit = serviceInputDraft.units.find(item => item.id === serviceActiveUnit);
      Object.assign(unit, { mode: servicePriceDraft.mode, rate, reason: servicePriceDraft.reason, notes: servicePriceDraft.notes.trim() });
      servicePriceDraft = null;
      showServiceInput();
    });
    on('service-reason-open', 'click', () => {
      servicePendingReason = servicePriceDraft.reason;
      document.getElementById('service-reason-options').innerHTML = ['', ...SERVICE_PRICE_REASONS].map(reason => serviceRadioOption('service-reason', reason, reason || 'No reason', reason === servicePendingReason)).join('');
      goTo('transaction-service-reason');
    });
    on('service-reason-options', 'change', event => {
      if (!event.target.matches('input[type="radio"]')) return;
      servicePendingReason = event.target.value;
      syncServiceRadioRows(event.currentTarget);
    });
    on('service-reason-cancel', 'click', showServicePrice);
    on('service-reason-save', 'click', () => { servicePriceDraft.reason = servicePendingReason; showServicePrice(); });
  }

  function serviceInputStatus(state, key) {
    const saved = state.serviceInputs?.[key];
    return saved ? saved.units.some(unit => unit.quantity > 0) ? 'Recorded' : 'Saved' : 'Not started';
  }

  // ===== SPOT PAY =====
  let spotPaymentMethod = 'check';
  let spotCheckNumberDraft = '';

  function formatCurrency(value) {
    return `$${Number(value || 0).toFixed(2)}`;
  }

  function spotPayTotals(subtotal, method) {
    const safeSubtotal = Math.round(Number(subtotal || 0) * 100) / 100;
    const fee = method === 'card' && safeSubtotal > 500 ? Math.round(safeSubtotal * 3) / 100 : 0;
    return { subtotal: safeSubtotal, fee, total: Math.round((safeSubtotal + fee) * 100) / 100 };
  }

  function spotPayLineItems() {
    const state = getTransactionResourceState();
    const savedInputs = Object.values(state.serviceInputs || {});
    const lines = savedInputs.flatMap(service => (service.units || [])
      .filter(unit => unit.mode === 'charge' && Number(unit.quantity) > 0 && Number(unit.rate) > 0)
      .map(unit => ({
        name: service.component || service.name,
        quantity: Number(unit.quantity),
        unit: String(unit.id || '').toUpperCase(),
        rate: Number(unit.rate),
        amount: Number(unit.quantity) * Number(unit.rate),
      })));

    // The current prototype starts with the same sample charge shown in the source flow.
    if (!savedInputs.length) return [{ name: 'Oily Water', quantity: 200, unit: 'GAL', rate: 1, amount: 200 }];
    return lines;
  }

  function spotPaySubtotal() {
    return spotPayLineItems().reduce((sum, line) => sum + line.amount, 0);
  }

  function spotPaymentMethodLabel(method) {
    return ({ check: 'Check', card: 'Credit card', invoice: 'Invoice' })[method] || 'Payment';
  }

  function setTransactionExitPopupOpen(open) {
    const popup = document.getElementById('popup-transaction-exit');
    popup.classList.toggle('show', open);
    popup.setAttribute('aria-hidden', String(!open));
  }

  function initTransactionExitControls() {
    document.getElementById('txn-exit-btn')?.addEventListener('click', () => setTransactionExitPopupOpen(true));
    document.getElementById('spot-pay-exit')?.addEventListener('click', () => setTransactionExitPopupOpen(true));
    document.getElementById('driver-exit')?.addEventListener('click', () => setTransactionExitPopupOpen(true));
    document.getElementById('customer-exit')?.addEventListener('click', () => setTransactionExitPopupOpen(true));
    document.getElementById('txn-continue-editing')?.addEventListener('click', () => setTransactionExitPopupOpen(false));
    document.getElementById('txn-confirm-save')?.addEventListener('click', () => {
      setTransactionExitPopupOpen(false);
      showToast('Draft saved to Tasks');
      goTo('stop-detail');
    });
    document.getElementById('txn-discard')?.addEventListener('click', () => {
      setTransactionExitPopupOpen(false);
      showToast('Transaction discarded');
      goTo('stop-detail');
    });
  }

  function renderSpotPaySummary() {
    const stop = currentRoute?.stops[currentStopIndex] || ROUTES[0].stops[0];
    const state = getTransactionResourceState();
    const subtotal = spotPaySubtotal();
    const transactionNumber = `TX-${String(stop.companyCode).toUpperCase()}-${String(stop.id).padStart(4, '0')}`;
    document.getElementById('spot-pay-stop-number').textContent = `Stop #${currentStopIndex + 1}`;
    document.getElementById('spot-pay-location-card').innerHTML = `
      <div class="txn-location-copy">
        <div class="txn-location-code">${escapeHTML(stop.companyCode)} · ${escapeHTML(stop.locationCode)}</div>
        <h2>${escapeHTML(stop.name)}</h2>
      </div>
      <div class="txn-location-actions">
        <button id="spot-pay-notes-btn" aria-label="Transaction notes">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z"/><path d="M16 3v5h5"/></svg>
        </button>
        <button id="spot-pay-attachments-btn" aria-label="Transaction attachments">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          <span class="txn-attachment-badge">${state.files.length}</span>
        </button>
      </div>`;
    document.getElementById('spot-transaction-number').textContent = transactionNumber;
    document.getElementById('spot-pay-notes-btn').onclick = () => {
      transactionResourceReturnScreen = 'transaction-payment';
      goTo('transaction-notes');
    };
    document.getElementById('spot-pay-attachments-btn').onclick = () => {
      transactionResourceReturnScreen = 'transaction-payment';
      goTo('transaction-files');
    };
    document.getElementById('spot-copy-transaction').onclick = () => {
      navigator.clipboard?.writeText(transactionNumber).catch(() => {});
      showToast('Transaction ID copied');
    };
    document.getElementById('spot-pay-collect-amount').textContent = formatCurrency(state.payment?.total ?? subtotal);
    document.getElementById('spot-pay-collect-status').textContent = state.payment
      ? `Collected · ${spotPaymentMethodLabel(state.payment.method)}`
      : `${spotPayLineItems().length} ${spotPayLineItems().length === 1 ? 'service' : 'services'} to collect`;
    document.getElementById('spot-pay-collect').classList.toggle('complete', Boolean(state.payment));
    document.querySelector('.screen[data-screen="transaction-payment"] .screen-body').scrollTop = 0;
  }

  function renderSpotPayBreakdown() {
    const lines = spotPayLineItems();
    const totals = spotPayTotals(spotPaySubtotal(), spotPaymentMethod);
    document.getElementById('spot-breakdown-lines').innerHTML = lines.length
      ? lines.map(line => `<div class="spot-breakdown-line"><span><strong>${escapeHTML(line.name)}</strong><small>Charge ${line.quantity} ${escapeHTML(line.unit)} × ${formatCurrency(line.rate)}</small></span><strong>${formatCurrency(line.amount)}</strong></div>`).join('')
      : '<div class="spot-breakdown-empty">No collect charges were recorded in Services.</div>';
    document.getElementById('spot-payment-totals').innerHTML = `${totals.fee ? `
      <div><span>Subtotal<small>Total before fees</small></span><strong>${formatCurrency(totals.subtotal)}</strong></div>
      <div><span>Credit card fee<small>3% for totals over $500</small></span><strong>${formatCurrency(totals.fee)}</strong></div>` : ''}
      <div class="total"><span>Total to collect<small>Final amount due</small></span><strong>${formatCurrency(totals.total)}</strong></div>`;
  }

  function renderSpotPaymentMethod() {
    const content = document.getElementById('spot-method-content');
    const totals = spotPayTotals(spotPaySubtotal(), spotPaymentMethod);
    renderSpotPayBreakdown();
    if (spotPaymentMethod === 'check') {
      content.innerHTML = `<label class="spot-method-field" for="spot-check-number"><span>Check number</span><input id="spot-check-number" type="text" inputmode="numeric" autocomplete="off" placeholder="Enter check number" value="${escapeHTML(spotCheckNumberDraft)}"></label><p class="service-field-error" id="spot-check-error" role="alert"></p>`;
      return;
    }
    if (spotPaymentMethod === 'card') {
      content.innerHTML = `<button class="spot-card-payment-row" id="spot-open-card"><span><strong>Pay with credit card</strong><small>${totals.fee ? 'Includes a 3% service fee' : 'No service fee at this amount'}</small></span><span>${formatCurrency(totals.total)} <b aria-hidden="true">›</b></span></button><p class="spot-method-note">Charge the customer card to continue. A 3% fee applies only when the subtotal is over $500.</p>`;
      return;
    }
    content.innerHTML = '<div class="spot-invoice-note"><strong>Invoice this charge</strong><p>The customer will be invoiced for the total shown above. No payment details are required now.</p></div>';
  }

  function renderSpotPayCollect() {
    const savedMethod = getTransactionResourceState().payment?.method;
    if (savedMethod) spotPaymentMethod = savedMethod;
    document.querySelectorAll('input[name="spot-payment-method"]').forEach(input => { input.checked = input.value === spotPaymentMethod; });
    renderSpotPaymentMethod();
    document.querySelector('.screen[data-screen="transaction-collect"] .screen-body').scrollTop = 0;
  }

  function completeSpotPay(method, reference = '') {
    const state = getTransactionResourceState();
    state.payment = { method, reference, ...spotPayTotals(spotPaySubtotal(), method) };
    spotPaymentMethod = method;
    goTo('transaction-payment', 'back');
    showToast(`${spotPaymentMethodLabel(method)} payment recorded`);
  }

  function renderSpotCardPayment() {
    document.getElementById('spot-card-total').textContent = formatCurrency(spotPayTotals(spotPaySubtotal(), 'card').total);
    document.getElementById('spot-card-error').textContent = '';
    document.querySelector('.screen[data-screen="transaction-card-payment"] .screen-body').scrollTop = 0;
  }

  function initSpotPayControls() {
    document.getElementById('spot-pay-back')?.addEventListener('click', () => goTo('transaction-services', 'back'));
    document.getElementById('spot-pay-collect')?.addEventListener('click', () => goTo('transaction-collect'));
    document.getElementById('spot-pay-next')?.addEventListener('click', () => {
      if (!getTransactionResourceState().payment) {
        showToast('Complete the collection before continuing');
        return;
      }
      goTo('transaction-driver');
    });
    document.getElementById('spot-collect-back')?.addEventListener('click', () => goTo('transaction-payment', 'back'));
    document.getElementById('spot-payment-methods')?.addEventListener('change', event => {
      if (!event.target.matches('input[name="spot-payment-method"]')) return;
      spotPaymentMethod = event.target.value;
      renderSpotPaymentMethod();
    });
    document.getElementById('spot-method-content')?.addEventListener('input', event => {
      if (event.target.id === 'spot-check-number') {
        spotCheckNumberDraft = event.target.value.replace(/\D/g, '').slice(0, 20);
        event.target.value = spotCheckNumberDraft;
        document.getElementById('spot-check-error').textContent = '';
      }
    });
    document.getElementById('spot-method-content')?.addEventListener('click', event => {
      if (event.target.closest('#spot-open-card')) goTo('transaction-card-payment');
    });
    document.getElementById('spot-collect-done')?.addEventListener('click', () => {
      if (spotPaySubtotal() <= 0) {
        showToast('No collect amount is available');
        return;
      }
      if (spotPaymentMethod === 'card') {
        goTo('transaction-card-payment');
        return;
      }
      if (spotPaymentMethod === 'check' && !spotCheckNumberDraft) {
        document.getElementById('spot-check-error').textContent = 'Enter the check number to continue.';
        document.getElementById('spot-check-number')?.focus();
        return;
      }
      completeSpotPay(spotPaymentMethod, spotPaymentMethod === 'check' ? spotCheckNumberDraft : 'Invoice');
    });
    document.getElementById('spot-card-back')?.addEventListener('click', () => goTo('transaction-collect', 'back'));
    document.getElementById('spot-card-save')?.addEventListener('click', () => {
      const number = document.getElementById('spot-card-number').value.replace(/\D/g, '');
      const expiry = document.getElementById('spot-card-expiry').value.trim();
      const cvv = document.getElementById('spot-card-cvv').value.replace(/\D/g, '');
      if (number.length < 12 || !/^\d{2}\/\d{2}$/.test(expiry) || !/^\d{3,4}$/.test(cvv)) {
        document.getElementById('spot-card-error').textContent = 'Enter a valid card number, expiration date, and security code.';
        return;
      }
      completeSpotPay('card', `•••• ${number.slice(-4)}`);
    });
    document.getElementById('spot-card-number')?.addEventListener('input', event => {
      const digits = event.target.value.replace(/\D/g, '').slice(0, 16);
      event.target.value = digits.replace(/(.{4})/g, '$1 ').trim();
      document.getElementById('spot-card-error').textContent = '';
    });
    document.getElementById('spot-card-expiry')?.addEventListener('input', event => {
      const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
      event.target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
      document.getElementById('spot-card-error').textContent = '';
    });
    document.getElementById('spot-card-cvv')?.addEventListener('input', event => {
      event.target.value = event.target.value.replace(/\D/g, '').slice(0, 4);
      document.getElementById('spot-card-error').textContent = '';
    });
  }

  // ===== TRANSACTION WIZARD · DRIVER =====
  function transactionNumberForStop(stop) {
    return `TX-${String(stop.companyCode).toUpperCase()}-${String(stop.id).padStart(4, '0')}`;
  }

  function getDriverState() {
    const transaction = getTransactionResourceState();
    transaction.driver ||= { checklists: {}, signature: '', printed: false };
    return transaction.driver;
  }

  function transactionNeedsSpotPay() {
    return spotPaySubtotal() > 0;
  }

  function driverChecklistDefinitions() {
    const state = getTransactionResourceState();
    const inputs = Object.entries(state.serviceInputs || {});
    if (!inputs.length) return [];

    const definitions = new Map();
    inputs.forEach(([key, service]) => {
      if (!(service.units || []).some(unit => Number(unit.quantity) > 0)) return;
      const searchable = `${key} ${service.name || ''} ${service.component || ''}`.toLowerCase();
      if (key === 'scheduled:uo' || searchable.includes('used oil')) {
        definitions.set('used-oil', { id: 'used-oil', title: 'Used Oil', kind: 'used-oil' });
      } else if (key === 'scheduled:ow' || searchable.includes('oily water')) {
        definitions.set('oily-water', { id: 'oily-water', title: 'Oily Water', kind: 'standard' });
      }
    });
    return [...definitions.values()];
  }

  function driverChecklistIsComplete(definition, answer) {
    if (!answer?.halogen) return false;
    if (definition.kind !== 'used-oil') return true;
    if (!answer.quality) return false;
    return answer.halogen !== 'fail' || Boolean(answer.chlor);
  }

  function renderTransactionProgress(prefix) {
    document.getElementById(`${prefix}-stop-number`).textContent = `Stop #${currentStopIndex + 1}`;
    const spotSkipped = !transactionNeedsSpotPay();
    const spotStep = document.getElementById(`${prefix}-spot-step`);
    spotStep.classList.toggle('completed', !spotSkipped);
    spotStep.classList.toggle('skipped', spotSkipped);
    spotStep.disabled = spotSkipped;
    return spotSkipped;
  }

  // Location card, transaction ID and Spot Pay progress shared by the Driver and Customer steps.
  function renderTransactionContext(prefix, returnScreen) {
    const stop = currentRoute?.stops[currentStopIndex] || ROUTES[0].stops[0];
    const transaction = getTransactionResourceState();
    const transactionNumber = transactionNumberForStop(stop);
    const spotSkipped = renderTransactionProgress(prefix);

    document.getElementById(`${prefix}-location-card`).innerHTML = `
      <div class="txn-location-copy">
        <div class="txn-location-code">${escapeHTML(stop.companyCode)} · ${escapeHTML(stop.locationCode)}</div>
        <h2>${escapeHTML(stop.name)}</h2>
      </div>
      <div class="txn-location-actions">
        <button id="${prefix}-notes-btn" aria-label="Transaction notes">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z"/><path d="M16 3v5h5"/></svg>
        </button>
        <button id="${prefix}-attachments-btn" aria-label="Transaction attachments">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          <span class="txn-attachment-badge">${transaction.files.length}</span>
        </button>
      </div>`;
    document.getElementById(`${prefix}-transaction-number`).textContent = transactionNumber;

    document.getElementById(`${prefix}-notes-btn`).onclick = () => {
      transactionResourceReturnScreen = returnScreen;
      goTo('transaction-notes');
    };
    document.getElementById(`${prefix}-attachments-btn`).onclick = () => {
      transactionResourceReturnScreen = returnScreen;
      goTo('transaction-files');
    };
    document.getElementById(`${prefix}-copy-transaction`).onclick = () => {
      navigator.clipboard?.writeText(transactionNumber).catch(() => {});
      showToast('Transaction ID copied');
    };
    return { stop, spotSkipped };
  }

  function driverChecklistSummary(definition, answer, complete) {
    if (!complete) return 'Required before continuing';
    const label = value => value.charAt(0).toUpperCase() + value.slice(1);
    const parts = [];
    if (definition.kind === 'used-oil') parts.push(`${label(answer.quality)} quality`);
    parts.push(`Screen ${label(answer.halogen)}`);
    if (answer.halogen === 'fail' && answer.chlor) parts.push(`Chlor ${label(answer.chlor)}`);
    return parts.join(' · ');
  }

  function renderDriverScreen() {
    const driver = getDriverState();
    const checklists = driverChecklistDefinitions();
    const spotSkipped = !transactionNeedsSpotPay();
    document.getElementById('driver-progress').setAttribute('aria-label', `Transaction progress, step 3 of 5, Driver. Spot Pay ${spotSkipped ? 'not required' : 'completed'}`);

    renderTransactionContext('driver', 'transaction-driver');

    const completedChecks = checklists.filter(definition => driverChecklistIsComplete(definition, driver.checklists[definition.id])).length;
    document.getElementById('driver-check-count').textContent = checklists.length ? `(${completedChecks} of ${checklists.length} done)` : '';
    document.getElementById('driver-checklist-list').innerHTML = checklists.length
      ? `<div class="txn-row-group">${checklists.map(definition => {
        const answer = driver.checklists[definition.id];
        const complete = driverChecklistIsComplete(definition, answer);
        const failed = complete && (answer.halogen === 'fail' && answer.chlor !== 'pass');
        const result = !complete ? 'Not started' : failed ? 'Failed' : 'Passed';
        return `<button class="txn-row${complete ? ' complete' : ''}${failed ? ' failed' : ''}" data-driver-check="${definition.id}">
          <span class="txn-row-icon" aria-hidden="true">${complete ? '✓' : '!'}</span>
          <span><strong>${escapeHTML(definition.title)}</strong><small>${escapeHTML(driverChecklistSummary(definition, answer, complete))}</small></span>
          <span class="txn-row-state">${result}</span>
          <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>`;
      }).join('')}</div>`
      : '<div class="driver-checklist-empty"><strong>No Halogen checks required</strong><span>No eligible component has a collected quantity greater than zero.</span></div>';

    document.getElementById('driver-signature-status').textContent = driver.signature ? 'Signed' : 'Not signed';
    document.getElementById('driver-signature-canvas').closest('.txn-signature-card').classList.toggle('complete', Boolean(driver.signature));
    document.getElementById('driver-print-status').textContent = driver.printed ? 'Receipt sent to printer' : 'Send a copy to the truck printer';
    renderDriverSignaturePad();

    document.querySelectorAll('[data-driver-check]').forEach(button => {
      button.onclick = () => {
        activeDriverChecklistId = button.dataset.driverCheck;
        goTo('transaction-driver-check');
      };
    });
    document.querySelector('.screen[data-screen="transaction-driver"] .screen-body').scrollTop = 0;
  }

  function syncDriverCheckScreen() {
    const definition = driverChecklistDefinitions().find(item => item.id === activeDriverChecklistId);
    if (!definition || !driverCheckDraft) return;
    document.querySelectorAll('input[name="driver-quality"]').forEach(input => { input.checked = input.value === driverCheckDraft.quality; });
    document.querySelectorAll('input[name="driver-halogen"]').forEach(input => { input.checked = input.value === driverCheckDraft.halogen; });
    document.querySelectorAll('input[name="driver-chlor"]').forEach(input => {
      input.checked = input.value === driverCheckDraft.chlor;
      input.disabled = driverCheckDraft.halogen !== 'fail';
    });
    document.querySelectorAll('.txn-form-card .service-price-segments').forEach(syncServiceRadioRows);

    const failed = driverCheckDraft.halogen === 'fail';
    const notes = document.getElementById('driver-check-notes');
    notes.disabled = !failed;
    notes.value = driverCheckDraft.notes || '';
    document.getElementById('driver-notes-card').classList.toggle('enabled', failed);
    document.getElementById('driver-notes-help').textContent = failed ? 'Add context about the failed screen' : 'Available when the Halogen screen fails';
    document.getElementById('driver-chlor-section').classList.toggle('enabled', definition.kind === 'used-oil' && failed);
  }

  function renderDriverCheckScreen() {
    const definition = driverChecklistDefinitions().find(item => item.id === activeDriverChecklistId);
    if (!definition) {
      goTo('transaction-driver');
      return;
    }
    const saved = getDriverState().checklists[definition.id] || {};
    driverCheckDraft = { quality: '', halogen: '', chlor: '', notes: '', ...saved };
    document.getElementById('driver-check-context').innerHTML = `<span>Component</span><strong>${escapeHTML(definition.title)}</strong>`;
    document.getElementById('driver-quality-section').hidden = definition.kind !== 'used-oil';
    document.getElementById('driver-chlor-section').hidden = definition.kind !== 'used-oil';
    document.getElementById('driver-check-error').textContent = '';
    syncDriverCheckScreen();
    document.querySelector('.screen[data-screen="transaction-driver-check"] .screen-body').scrollTop = 0;
  }

  function renderDriverSignaturePad() {
    paintSignaturePad('driver-signature-canvas', getDriverState().signature);
  }

  // Shared by the Driver and Customer sign-off cards.
  function paintSignaturePad(canvasId, savedSignature) {
    const canvas = document.getElementById(canvasId);
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const context = canvas.getContext('2d');
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.lineWidth = 2.4;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#111827';
    if (typeof savedSignature === 'string' && savedSignature.startsWith('data:')) {
      const image = new Image();
      image.onload = () => context.drawImage(image, 0, 0, width, height);
      image.src = savedSignature;
    }
  }

  // ===== TRANSACTION WIZARD · CUSTOMER =====
  let receiptDraft = null;

  function getCustomerState() {
    const transaction = getTransactionResourceState();
    transaction.customer ||= {
      name: '',
      signature: '',
      printed: false,
      receiptSkipped: false,
      receipt: { contactName: 'Jared Southworth', emails: ['jared@oilchng.com'], phones: ['(770) 617-2625'], emailCopy: false, smsCopy: false },
    };
    return transaction.customer;
  }

  function nameInitials(name) {
    return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('');
  }

  function syncCustomerSigner() {
    const initials = nameInitials(getCustomerState().name);
    const avatar = document.getElementById('customer-signer-avatar');
    avatar.classList.toggle('neutral', !initials);
    avatar.innerHTML = initials || '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';
  }

  function renderCustomerScreen() {
    const customer = getCustomerState();
    const { spotSkipped } = renderTransactionContext('customer', 'transaction-customer');
    document.getElementById('customer-progress').setAttribute('aria-label', `Transaction progress, step 4 of 5, Customer. Spot Pay ${spotSkipped ? 'not required' : 'completed'}`);

    document.getElementById('customer-name').value = customer.name;
    syncCustomerSigner();
    document.getElementById('customer-signature-status').textContent = customer.signature ? 'Signed' : 'Not signed';
    document.getElementById('customer-signature-canvas').closest('.txn-signature-card').classList.toggle('complete', Boolean(customer.signature));
    document.getElementById('customer-print-status').textContent = customer.printed ? 'Receipt sent to printer' : 'Send a copy to the truck printer';
    paintSignaturePad('customer-signature-canvas', customer.signature);
    document.querySelector('.screen[data-screen="transaction-customer"] .screen-body').scrollTop = 0;
  }

  function renderCustomerDisclaimerScreen() {
    document.querySelector('.screen[data-screen="transaction-customer-disclaimer"] .screen-body').scrollTop = 0;
  }

  const RECEIPT_CHANNELS = {
    email: {
      list: 'emails',
      icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
      normalize: value => value.trim().toLowerCase(),
      isValid: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      error: 'Enter a valid email address.',
    },
    phone: {
      list: 'phones',
      icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/></svg>',
      normalize: value => value.trim(),
      isValid: value => value.length > 0,
      error: '',
    },
  };

  function renderReceiptList(channel) {
    const config = RECEIPT_CHANNELS[channel];
    const values = receiptDraft[config.list];
    // Same swipe-to-delete row as manually-added UOM cards in Services.
    document.getElementById(`receipt-${channel}-list`).innerHTML = values.map((value, index) => `
      <div class="service-unit-swipe txn-contact-swipe">
        <button class="service-unit-delete" data-receipt-remove="${channel}" data-index="${index}" aria-label="Delete ${escapeHTML(value)}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          <span>Delete</span>
        </button>
        <div class="txn-contact-item" data-swipe-card>
          <span class="txn-contact-icon" aria-hidden="true">${config.icon}</span>
          <button class="txn-contact-value" data-receipt-edit="${channel}" data-index="${index}" aria-label="Edit ${escapeHTML(value)}">${escapeHTML(value)}</button>
        </div>
      </div>`).join('');
  }

  function renderReceiptContactScreen() {
    receiptDraft ||= structuredClone(getCustomerState().receipt);
    document.getElementById('receipt-contact-name').value = receiptDraft.contactName;
    document.getElementById('receipt-email-copy').checked = receiptDraft.emailCopy;
    document.getElementById('receipt-sms-copy').checked = receiptDraft.smsCopy;
    ['email', 'phone'].forEach(channel => {
      document.getElementById(`receipt-${channel}-input`).value = '';
      document.getElementById(`receipt-${channel}-error`).textContent = '';
      renderReceiptList(channel);
    });
    document.querySelector('.screen[data-screen="transaction-receipt-contact"] .screen-body').scrollTop = 0;
  }

  // Returns false when the typed value is invalid; an empty field is not an error.
  function addReceiptValue(channel) {
    const config = RECEIPT_CHANNELS[channel];
    const input = document.getElementById(`receipt-${channel}-input`);
    const error = document.getElementById(`receipt-${channel}-error`);
    const value = config.normalize(input.value);
    if (!value) return true;
    if (!config.isValid(value)) {
      error.textContent = config.error;
      return false;
    }
    if (!receiptDraft[config.list].includes(value)) receiptDraft[config.list].push(value);
    input.value = '';
    error.textContent = '';
    renderReceiptList(channel);
    return true;
  }

  function finishReceiptContact(skipped) {
    const customer = getCustomerState();
    customer.receipt = receiptDraft;
    customer.receiptSkipped = skipped;
    receiptDraft = null;
    goTo('transaction-review');
  }

  function setPopupOpen(id, open) {
    const popup = document.getElementById(id);
    popup.classList.toggle('show', open);
    popup.setAttribute('aria-hidden', String(!open));
  }

  // ===== TRANSACTION WIZARD · REVIEW =====
  function getReviewState() {
    const transaction = getTransactionResourceState();
    transaction.review ||= { submitted: false, printed: false };
    return transaction.review;
  }

  // Same wording as the source app: "20 Drum - No charge | 600 Gallon - Charge $1.000/GAL".
  function reviewUnitLabel(unit) {
    const uom = SERVICE_UOMS.find(item => item.id === unit.id);
    const price = unit.mode === 'none' ? 'No charge' : `${SERVICE_PRICE_MODES[unit.mode]} $${Number(unit.rate).toFixed(3)}/${uom.abbr}`;
    return `${unit.quantity} ${uom.name} - ${price}`;
  }

  function renderReviewScreen() {
    const review = getReviewState();
    const { spotSkipped } = renderTransactionContext('review', 'transaction-review');
    document.getElementById('review-progress').setAttribute('aria-label', `Transaction progress, step 5 of 5, Review. Spot Pay ${spotSkipped ? 'not required' : 'completed'}`);

    const services = Object.values(getTransactionResourceState().serviceInputs || {})
      .map(service => ({ ...service, units: service.units.filter(unit => Number(unit.quantity) > 0) }))
      .filter(service => service.units.length);
    document.getElementById('review-service-list').innerHTML = services.map(service => `
      <section class="review-service">
        <div class="spot-section-label">${escapeHTML(service.name)}</div>
        <div class="txn-row-group">
          <div class="txn-row complete">
            <span class="txn-row-icon" aria-hidden="true">✓</span>
            <span><strong>${escapeHTML(service.component || service.name)}</strong><small>${escapeHTML(service.units.map(reviewUnitLabel).join(' | '))}</small></span>
          </div>
        </div>
      </section>`).join('');

    document.getElementById('review-exit').disabled = review.submitted;
    document.getElementById('review-back').hidden = review.submitted;
    document.getElementById('review-submit').hidden = review.submitted;
    document.getElementById('review-done').hidden = !review.submitted;
    document.getElementById('review-action-bar').classList.toggle('single-action', review.submitted);
    document.getElementById('review-complete-actions').hidden = !review.submitted;
    document.getElementById('review-print-status').textContent = review.printed ? 'Receipt sent to printer' : 'Send a copy to the truck printer';
    document.querySelector('.screen[data-screen="transaction-review"] .screen-body').scrollTop = 0;
  }

  function initReviewControls() {
    document.getElementById('review-submit')?.addEventListener('click', () => {
      setPopupOpen('popup-review-saving', true);
      // Stands in for the server request until the API is connected.
      setTimeout(() => {
        getReviewState().submitted = true;
        renderReviewScreen();
        setPopupOpen('popup-review-saving', false);
        setPopupOpen('popup-review-sent', true);
      }, 1600);
    });
    document.getElementById('review-sent-ok')?.addEventListener('click', () => setPopupOpen('popup-review-sent', false));
    document.getElementById('review-send-receipt')?.addEventListener('click', () => {
      receiptDraft = null;
      goTo('transaction-receipt-contact');
    });
    document.getElementById('review-restart-bt')?.addEventListener('click', () => showToast('Bluetooth restarted'));
    document.getElementById('review-print')?.addEventListener('click', () => {
      getReviewState().printed = true;
      document.getElementById('review-print-status').textContent = 'Receipt sent to printer';
      showToast('Receipt sent to truck printer');
    });
    document.getElementById('review-done')?.addEventListener('click', () => goTo('stop-detail'));
  }

  function initCustomerControls() {
    document.getElementById('customer-back')?.addEventListener('click', () => goTo('transaction-driver', 'back'));
    document.getElementById('review-back')?.addEventListener('click', () => goTo('transaction-customer', 'back'));
    document.getElementById('review-exit')?.addEventListener('click', () => setTransactionExitPopupOpen(true));
    document.getElementById('review-delete')?.addEventListener('click', () => setPopupOpen('popup-review-delete', true));
    document.getElementById('review-delete-confirm')?.addEventListener('click', () => {
      setPopupOpen('popup-review-delete', false);
      transactionResources.delete(transactionResourceKey());
      showToast('Transaction deleted');
      goTo('stop-detail');
    });
    document.getElementById('customer-disclaimer-row')?.addEventListener('click', () => goTo('transaction-customer-disclaimer'));
    document.getElementById('customer-disclaimer-back')?.addEventListener('click', () => goTo('transaction-customer', 'back'));
    document.getElementById('customer-name')?.addEventListener('input', event => {
      getCustomerState().name = event.target.value;
      syncCustomerSigner();
    });
    document.getElementById('customer-print')?.addEventListener('click', () => {
      getCustomerState().printed = true;
      document.getElementById('customer-print-status').textContent = 'Receipt sent to printer';
      showToast('Receipt sent to truck printer');
    });
    initSignaturePad({
      canvasId: 'customer-signature-canvas',
      clearId: 'customer-signature-clear',
      statusId: 'customer-signature-status',
      onChange: signature => { getCustomerState().signature = signature; },
    });
    document.getElementById('customer-next')?.addEventListener('click', () => {
      const customer = getCustomerState();
      if (!customer.name.trim()) {
        showToast('Enter the customer name');
        document.getElementById('customer-name').focus();
        return;
      }
      if (!customer.signature) {
        showToast('Customer signature is required');
        return;
      }
      setPopupOpen('popup-electronic-receipt', true);
    });
    document.getElementById('electronic-receipt-ok')?.addEventListener('click', () => {
      setPopupOpen('popup-electronic-receipt', false);
      receiptDraft = null;
      goTo('transaction-receipt-contact');
    });

    document.getElementById('receipt-contact-name')?.addEventListener('input', event => { receiptDraft.contactName = event.target.value; });
    document.getElementById('receipt-email-copy')?.addEventListener('change', event => { receiptDraft.emailCopy = event.target.checked; });
    document.getElementById('receipt-sms-copy')?.addEventListener('change', event => { receiptDraft.smsCopy = event.target.checked; });
    ['email', 'phone'].forEach(channel => {
      const input = document.getElementById(`receipt-${channel}-input`);
      document.getElementById(`receipt-${channel}-add`)?.addEventListener('click', () => addReceiptValue(channel));
      input?.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
          event.preventDefault();
          addReceiptValue(channel);
        }
      });
      input?.addEventListener('input', () => { document.getElementById(`receipt-${channel}-error`).textContent = ''; });
    });
    const consumeSwipeClick = {
      email: initSwipeToDelete('receipt-email-list'),
      phone: initSwipeToDelete('receipt-phone-list'),
    };
    document.querySelector('.screen[data-screen="transaction-receipt-contact"]')?.addEventListener('click', event => {
      const swipeList = event.target.closest('.txn-contact-list');
      if (swipeList && consumeSwipeClick[swipeList.id.split('-')[1]]()) return;
      const edit = event.target.closest('[data-receipt-edit]');
      const remove = event.target.closest('[data-receipt-remove]');
      const target = edit || remove;
      if (!target) return;
      const channel = target.dataset.receiptEdit || target.dataset.receiptRemove;
      const list = receiptDraft[RECEIPT_CHANNELS[channel].list];
      const [value] = list.splice(Number(target.dataset.index), 1);
      if (edit) {
        const input = document.getElementById(`receipt-${channel}-input`);
        input.value = value;
        input.focus();
      }
      renderReceiptList(channel);
    });
    document.getElementById('receipt-confirm')?.addEventListener('click', () => {
      // A value still typed in a field counts, so the driver does not lose it by tapping Confirm.
      if (!addReceiptValue('email') || !addReceiptValue('phone')) return;
      receiptDraft.contactName = receiptDraft.contactName.trim();
      if (!receiptDraft.contactName || !receiptDraft.emails.length) {
        setPopupOpen('popup-receipt-missing', true);
        return;
      }
      finishReceiptContact(false);
    });
    document.getElementById('receipt-missing-continue')?.addEventListener('click', () => {
      setPopupOpen('popup-receipt-missing', false);
      finishReceiptContact(true);
    });
  }

  function initDriverControls() {
    document.getElementById('driver-back')?.addEventListener('click', () => goTo(transactionNeedsSpotPay() ? 'transaction-payment' : 'transaction-services', 'back'));
    document.getElementById('driver-print')?.addEventListener('click', () => {
      getDriverState().printed = true;
      renderDriverScreen();
      showToast('Receipt sent to truck printer');
    });
    document.getElementById('driver-next')?.addEventListener('click', () => {
      const driver = getDriverState();
      const incomplete = driverChecklistDefinitions().some(definition => !driverChecklistIsComplete(definition, driver.checklists[definition.id]));
      if (incomplete) {
        showToast('Complete the required Halogen checks');
        return;
      }
      if (!driver.signature) {
        showToast('Driver signature is required');
        return;
      }
      goTo('transaction-customer');
    });

    document.querySelector('.screen[data-screen="transaction-driver-check"]')?.addEventListener('change', event => {
      if (!driverCheckDraft) return;
      if (event.target.name === 'driver-quality') driverCheckDraft.quality = event.target.value;
      if (event.target.name === 'driver-halogen') {
        driverCheckDraft.halogen = event.target.value;
        if (event.target.value !== 'fail') {
          driverCheckDraft.chlor = '';
          driverCheckDraft.notes = '';
        }
      }
      if (event.target.name === 'driver-chlor') driverCheckDraft.chlor = event.target.value;
      document.getElementById('driver-check-error').textContent = '';
      syncDriverCheckScreen();
    });
    document.getElementById('driver-check-notes')?.addEventListener('input', event => {
      if (driverCheckDraft) driverCheckDraft.notes = event.target.value;
    });
    document.getElementById('driver-check-cancel')?.addEventListener('click', () => {
      driverCheckDraft = null;
      goTo('transaction-driver', 'back');
    });
    document.getElementById('driver-check-save')?.addEventListener('click', () => {
      const definition = driverChecklistDefinitions().find(item => item.id === activeDriverChecklistId);
      if (!definition || !driverCheckDraft) return;
      if (!driverCheckDraft.halogen) {
        document.getElementById('driver-check-error').textContent = 'Select the Halogen screen result.';
        return;
      }
      if (definition.kind === 'used-oil' && !driverCheckDraft.quality) {
        document.getElementById('driver-check-error').textContent = 'Select the used oil quality.';
        return;
      }
      if (definition.kind === 'used-oil' && driverCheckDraft.halogen === 'fail' && !driverCheckDraft.chlor) {
        document.getElementById('driver-check-error').textContent = 'Select the Chlor-D-Tect follow-up result.';
        return;
      }
      getDriverState().checklists[definition.id] = structuredClone(driverCheckDraft);
      driverCheckDraft = null;
      goTo('transaction-driver', 'back');
      showToast('Halogen checklist saved');
    });

    initSignaturePad({
      canvasId: 'driver-signature-canvas',
      clearId: 'driver-signature-clear',
      statusId: 'driver-signature-status',
      onChange: signature => { getDriverState().signature = signature; },
    });
  }

  function initSignaturePad({ canvasId, clearId, statusId, onChange }) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const card = canvas.closest('.txn-signature-card');
    const setSigned = signed => {
      document.getElementById(statusId).textContent = signed ? 'Signed' : 'Not signed';
      card.classList.toggle('complete', signed);
    };
    let drawing = false;
    const signaturePoint = event => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    canvas.addEventListener('pointerdown', event => {
      drawing = true;
      canvas.setPointerCapture?.(event.pointerId);
      const point = signaturePoint(event);
      const context = canvas.getContext('2d');
      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(point.x + .1, point.y + .1);
      context.stroke();
    });
    canvas.addEventListener('pointermove', event => {
      if (!drawing) return;
      event.preventDefault();
      const point = signaturePoint(event);
      const context = canvas.getContext('2d');
      context.lineTo(point.x, point.y);
      context.stroke();
    });
    const endSignature = () => {
      if (!drawing) return;
      drawing = false;
      onChange(canvas.toDataURL('image/png'));
      setSigned(true);
    };
    canvas.addEventListener('pointerup', endSignature);
    canvas.addEventListener('pointercancel', endSignature);
    document.getElementById(clearId)?.addEventListener('click', () => {
      canvas.getContext('2d').clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      onChange('');
      setSigned(false);
    });
  }

  // ===== TRANSACTION WIZARD · SERVICES =====
  function renderTransactionServices() {
    const stop = currentRoute?.stops[currentStopIndex] || ROUTES[0].stops[0];
    if (!stop) return;
    const resourceState = getTransactionResourceState();

    document.getElementById('txn-stop-number').textContent = `Stop #${currentStopIndex + 1}`;
    document.getElementById('txn-location-card').innerHTML = `
      <div class="txn-location-copy">
        <div class="txn-location-code">${stop.companyCode} · ${stop.locationCode}</div>
        <h2>${stop.name}</h2>
      </div>
      <div class="txn-location-actions">
        <button id="txn-notes-btn" aria-label="Transaction notes">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z"/><path d="M16 3v5h5"/></svg>
        </button>
        <button id="txn-attachments-btn" aria-label="Transaction attachments">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          <span class="txn-attachment-badge">${resourceState.files.length}</span>
        </button>
      </div>
    `;

    const addedServices = resourceState.addedServices || [];
    const totalServices = stop.services.length + addedServices.length;
    const scheduledServiceCards = stop.services.map(service => `
      <button class="txn-service-card" data-txn-service="${service}">
        <span class="txn-service-icon">${SERVICE_LABEL[service]}</span>
        <span class="txn-service-copy">
          <strong>${SERVICE_NAME[service]}</strong>
          <small>Contract #${service.toUpperCase()}-2026-${stop.companyCode}</small>
        </span>
        <span class="txn-service-tail">
          <span class="txn-service-state">${serviceInputStatus(resourceState, `scheduled:${service}`)}</span>
          <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </span>
      </button>
    `).join('');
    const addedServiceCards = addedServices.map((service, index) => `
      <button class="txn-service-card added-service" data-added-service="${index}">
        <span class="txn-service-icon">NEW</span>
        <span class="txn-service-copy">
          <strong>${escapeHTML(service.name)}</strong>
          <small>${service.components.length} ${service.components.length === 1 ? 'component' : 'components'} · ${escapeHTML(service.components.join(', '))}</small>
        </span>
        <span class="txn-service-tail">
          <span class="txn-service-state">${serviceInputStatus(resourceState, `added:${index}`)}</span>
          <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </span>
      </button>
    `).join('');

    document.getElementById('txn-service-count').textContent = `(${totalServices} ${totalServices === 1 ? 'service' : 'services'})`;
    document.getElementById('txn-service-list').innerHTML = scheduledServiceCards + addedServiceCards;

    document.querySelectorAll('[data-txn-service]').forEach(card => {
      card.onclick = () => openServiceInput(`scheduled:${card.dataset.txnService}`, SERVICE_NAME[card.dataset.txnService], SERVICE_NAME[card.dataset.txnService]);
    });
    document.querySelectorAll('[data-added-service]').forEach(card => {
      card.onclick = () => {
        const index = Number(card.dataset.addedService);
        openServiceInput(`added:${index}`, addedServices[index].name, addedServices[index].components[0]);
      };
    });

    const openServiceCatalog = () => {
      pendingCatalogService = '';
      pendingCatalogComponent = '';
      document.getElementById('txn-service-search').value = '';
      goTo('transaction-service-picker');
    };
    document.getElementById('txn-add-service').onclick = openServiceCatalog;
    document.getElementById('txn-add-service-top').onclick = openServiceCatalog;
    document.getElementById('txn-notes-btn').onclick = () => {
      transactionResourceReturnScreen = 'transaction-services';
      goTo('transaction-notes');
    };
    document.getElementById('txn-attachments-btn').onclick = () => {
      transactionResourceReturnScreen = 'transaction-services';
      goTo('transaction-files');
    };
    document.getElementById('txn-next-btn').onclick = () => {
      if (transactionNeedsSpotPay()) {
        goTo('transaction-payment');
        return;
      }
      goTo('transaction-driver');
      showToast('No payment required · Spot Pay skipped');
    };

    document.querySelector('.screen[data-screen="transaction-services"] .screen-body').scrollTop = 0;
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
      // Proposal 2 — currently disabled.
      if (SHOW_TANK_CARD_PROPOSALS && tankIndex === 1) {
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
      // Proposal 3 — currently disabled.
      if (SHOW_TANK_CARD_PROPOSALS && tankIndex === 2) {
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
      // Proposal 4 — currently disabled.
      if (SHOW_TANK_CARD_PROPOSALS && tankIndex === 3) {
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
      return `<article class="tank-detail-card tank-detail-card-selected ${tank.verified ? 'is-verified' : ''}" data-tank-id="${tank.id}">
        <div class="tank-alt-header">
          <div><span class="tank-alt-kicker">${tank.code}</span><h3>${tank.name}</h3></div>
          <div class="tank-selected-head-actions">
            <button class="tank-alt-verify-switch ${tank.verified ? 'verified' : ''}" aria-pressed="${tank.verified}"><span class="tank-switch"><i></i></span><span class="tank-switch-label">${tank.verified ? 'Verified' : 'Verify'}</span></button>
          </div>
        </div>
        <div class="tank-selected-body">
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
            <button class="tank-edit-btn tank-selected-edit" aria-label="Edit ${tank.name}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>Edit tank</button>
          </div>
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
        card.classList.add('dragging');
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
  initTransactionResourceControls();
  initTransactionExitControls();
  initServiceCatalogControls();
  initServiceInputControls();
  initSpotPayControls();
  initDriverControls();
  initCustomerControls();
  initReviewControls();
})();
