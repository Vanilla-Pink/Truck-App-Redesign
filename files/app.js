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
    // Build tab bar for the active screen
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
    { id: 'checklist', label: 'Safety', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
  ];

  const activeTabMap = {
    routes: 'routes', datepicker: 'routes', create: 'routes',
    inbox: 'routes', message: 'routes', 'message-ack': 'routes',
    checklist: 'checklist'
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
          if (t.dataset.tab === 'checklist') goTo('checklist');
          else if (t.dataset.tab === 'routes') goTo('routes');
          else showToast(`"${t.querySelector('span').textContent}" tab — demo only`);
        });
      });
    });
  }

  // ===== CALENDAR =====
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
    document.getElementById('popup-emergency').classList.add('show');
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
  document.querySelectorAll('.map-pin').forEach(pin => {
    pin.addEventListener('click', () => {
      // For demo, just bring up the loc-card briefly
      const card = document.getElementById('loc-card');
      if (card) {
        card.style.transform = 'translateY(0)';
      }
    });
  });

  // ===== INIT =====
  buildCalendar();
  buildTabBar();
})();
