const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const start = source.indexOf('  // ===== SERVICE INPUT · SESSION-ONLY PROTOTYPE =====');
const end = source.indexOf('  // ===== SPOT PAY =====', start);
assert(start >= 0 && end > start);
const block = source.slice(start, end);

// Exercise the actual app handlers with a minimal DOM, without browser dependencies.
function harness() {
  const elements = new Map();
  const node = id => {
    if (!elements.has(id)) elements.set(id, {
      value: '', textContent: '', innerHTML: '', disabled: false, handlers: {},
      addEventListener(type, handler) { this.handlers[type] = handler; },
      querySelectorAll() { return []; }, focus() {},
    });
    return elements.get(id);
  };
  let state = {}, screen;
  const context = vm.createContext({
    structuredClone,
    document: { getElementById: node, querySelectorAll: () => [] },
    getTransactionResourceState: () => state,
    goTo: value => { screen = value; },
    showToast() {},
    escapeHTML: value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;'),
  });
  vm.runInContext(block + '\ninitServiceInputControls();', context);
  const run = code => vm.runInContext(code, context);
  const fire = (id, type = 'click', event = {}) => node(id).handlers[type]({ currentTarget: node(id), preventDefault() {}, ...event });
  const open = (key = 'scheduled:uo') => run(`openServiceInput(${JSON.stringify(key)}, 'Used Oil', 'Used Oil')`);
  const edit = (type, id = 'gal') => fire('service-unit-list', 'click', { target: { closest: selector => selector === `[data-service-${type}]` ? { dataset: { [type === 'amount' ? 'serviceAmount' : 'servicePrice']: id } } : null } });
  const radio = (id, value) => fire(id, 'change', { target: { value, matches: () => true } });
  const input = (id, value) => { node(id).value = value; fire(id, 'input', { target: node(id) }); };
  return { node, run, fire, open, edit, radio, input, state: () => state, switchStop: () => { state = {}; }, screen: () => screen };
}

// Minimal classList-backed stand-in for a swipeable card element.
function fakeSwipeCard(open = false) {
  const classes = new Set(open ? ['swipe-open'] : []);
  return {
    classList: {
      contains: c => classes.has(c),
      add: c => classes.add(c),
      remove: c => classes.delete(c),
      toggle: (c, v) => { const next = v === undefined ? !classes.has(c) : v; next ? classes.add(c) : classes.delete(c); return next; },
    },
    style: {},
    parentElement: { classList: { contains: c => c === 'service-unit-swipe' } },
    has: c => classes.has(c),
  };
}

test('quantity input is a finite, non-negative, bounded plain decimal and never executes code', () => {
  const { run } = harness();
  for (const [value, expected] of [['200', 200], ['.25', .25], ['20,5', 20.5], ['0', 0]]) {
    assert.equal(run(`readServiceNumber(${JSON.stringify(value)})`), expected);
  }
  for (const value of ['', '-1', '1-2', 'Infinity', '1e4', '2..4', '1;alert(1)', '1000000000', '2+', '1 2', '1+2', 'NaN', '1e3']) {
    assert.equal(run(`readServiceNumber(${JSON.stringify(value)})`), null);
  }
});

test('quantity save, cancel, reopen and per-stop isolation', () => {
  const h = harness();
  h.open(); h.edit('amount');
  h.input('service-amount-value', '200.5'); h.fire('service-amount-save');
  assert.equal(h.run('serviceInputDraft.units[0].quantity'), 200.5);
  assert.equal(h.state().serviceInputs, undefined);
  h.edit('amount'); h.input('service-amount-value', '999'); h.fire('service-amount-cancel');
  assert.equal(h.run('serviceInputDraft.units[0].quantity'), 200.5);
  h.fire('service-input-save'); h.open();
  assert.equal(h.run('serviceInputDraft.units[0].quantity'), 200.5);
  h.edit('amount'); h.input('service-amount-value', '400'); h.fire('service-amount-save'); h.fire('service-input-cancel');
  h.open(); assert.equal(h.run('serviceInputDraft.units[0].quantity'), 200.5);
  h.open('scheduled:ow'); assert.equal(h.run('serviceInputDraft.units[0].quantity'), 0);
  h.switchStop(); h.open(); assert.equal(h.run('serviceInputDraft.units[0].quantity'), 0);
});

test('invalid quantity does not commit; keypad types digits and decimal point', () => {
  const h = harness(); h.open(); h.edit('amount');
  h.input('service-amount-value', 'abc'); h.fire('service-amount-save');
  assert.equal(h.screen(), 'transaction-service-amount');
  assert(h.node('service-amount-error').textContent);
  const key = value => h.fire('service-amount-keypad', 'click', { target: { closest: () => ({ dataset: { amountKey: value } }) } });
  key('clear'); for (const value of ['2', '0', '5', '.', '5']) key(value);
  assert.equal(h.node('service-amount-value').value, '205.5');
  key('backspace'); key('backspace');
  assert.equal(h.node('service-amount-value').value, '205');
  key('clear');
  assert.equal(h.node('service-amount-value').value, '0');
});

test('UOM selection excludes existing units and prevents duplicate adds', () => {
  const h = harness(); h.open(); h.fire('service-add-uom');
  assert(!h.node('service-uom-options').innerHTML.includes('value="gal"'));
  assert.equal(h.node('service-uom-save').disabled, true);
  h.radio('service-uom-options', 'drum'); h.fire('service-uom-save'); h.fire('service-uom-save');
  assert.equal(h.run('serviceInputDraft.units.length'), 2);
  h.fire('service-add-uom'); h.radio('service-uom-options', 'tote'); h.fire('service-uom-cancel');
  assert.equal(h.run('serviceInputDraft.units.length'), 2);
  h.fire('service-add-uom'); h.radio('service-uom-options', 'tote'); h.fire('service-uom-save');
  assert.equal(h.node('service-add-uom').disabled, true);
});

test('only manually-added UOMs can be removed; the pre-loaded unit never can', () => {
  const h = harness(); h.open();
  assert(!h.node('service-unit-list').innerHTML.includes('data-service-remove'));
  h.fire('service-add-uom'); h.radio('service-uom-options', 'drum'); h.fire('service-uom-save');
  assert.equal(h.run('serviceInputDraft.units.length'), 2);
  assert(!h.node('service-unit-list').innerHTML.includes('data-service-remove="gal"'));
  assert(h.node('service-unit-list').innerHTML.includes('data-service-remove="drum"'));
  const remove = id => h.fire('service-unit-list', 'click', { target: { closest: selector => selector === '[data-service-remove]' ? { dataset: { serviceRemove: id } } : null } });
  remove('drum');
  assert.equal(h.run('serviceInputDraft.units.length'), 1);
  assert.equal(h.run('serviceInputDraft.units[0].id'), 'gal');
  assert(!h.node('service-unit-list').innerHTML.includes('data-service-remove'));
});

test('swiping a UOM card opens delete, and a tap while open closes it instead of triggering the row', () => {
  const h = harness(); h.open();
  h.fire('service-add-uom'); h.radio('service-uom-options', 'drum'); h.fire('service-uom-save');

  const card = fakeSwipeCard();
  const target = { closest: selector => selector === '[data-swipe-card]' ? card : null };
  h.fire('service-unit-list', 'pointerdown', { target, clientX: 0, clientY: 0, pointerId: 1 });
  h.fire('service-unit-list', 'pointermove', { clientX: -60, clientY: 0, pointerId: 1 });
  h.fire('service-unit-list', 'pointerup', { clientX: -60, clientY: 0, pointerId: 1 });
  assert(card.has('swipe-open'));

  h.fire('service-unit-list', 'pointerdown', { target, clientX: 5, clientY: 5, pointerId: 2 });
  h.fire('service-unit-list', 'pointerup', { clientX: 5, clientY: 5, pointerId: 2 });
  assert(!card.has('swipe-open'));

  const screenBefore = h.screen();
  h.edit('amount', 'gal');
  assert.equal(h.screen(), screenBefore);
  h.edit('amount', 'gal');
  assert.equal(h.screen(), 'transaction-service-amount');
});

test('price modes honor sample contract restrictions and No Charge saves zero', () => {
  const h = harness(); h.open('scheduled:ow'); h.edit('price');
  assert.match(h.node('service-price-modes').innerHTML, /value="pay" disabled/);
  h.radio('service-price-modes', 'pay'); assert.equal(h.run('servicePriceDraft.mode'), 'charge');
  h.input('service-price-rate', '-5'); h.fire('service-price-save');
  assert.equal(h.screen(), 'transaction-service-price');
  assert(h.node('service-price-error').textContent);
  h.input('service-price-rate', '.75'); h.radio('service-price-modes', 'none');
  assert.equal(h.node('service-price-rate').disabled, true);
  h.fire('service-price-save');
  assert.equal(h.run('serviceInputDraft.units[0].rate'), 0);
  assert.equal(h.run('serviceInputDraft.units[0].mode'), 'none');
});

test('reason and notes survive navigation; cancel discards only the current edit', () => {
  const h = harness(); h.open(); h.edit('price');
  h.input('service-price-rate', '.35'); h.input('service-price-notes', 'Customer approved');
  h.fire('service-reason-open'); h.radio('service-reason-options', 'Wet oil'); h.fire('service-reason-cancel');
  assert.equal(h.run('servicePriceDraft.reason'), '');
  assert.equal(h.node('service-price-notes').value, 'Customer approved');
  h.fire('service-reason-open'); h.radio('service-reason-options', 'Low volume'); h.fire('service-reason-save');
  h.fire('service-price-save');
  assert.equal(h.run('serviceInputDraft.units[0].reason'), 'Low volume');
  assert.equal(h.run('serviceInputDraft.units[0].rate'), .35);
  h.edit('price'); h.input('service-price-rate', '10'); h.fire('service-price-cancel');
  assert.equal(h.run('serviceInputDraft.units[0].rate'), .35);
  h.fire('service-input-save'); h.open();
  assert.equal(h.run('serviceInputDraft.units[0].notes'), 'Customer approved');
});

test('added services save independently, statuses reflect recorded quantities', () => {
  const h = harness(); h.open('added:0'); h.edit('amount');
  h.input('service-amount-value', '25'); h.fire('service-amount-save'); h.fire('service-input-save');
  assert.equal(h.run('serviceInputStatus(getTransactionResourceState(), "added:0")'), 'Recorded');
  h.open('added:1'); assert.equal(h.run('serviceInputDraft.units[0].quantity'), 0);
  h.fire('service-input-save');
  assert.equal(h.run('serviceInputStatus(getTransactionResourceState(), "added:1")'), 'Saved');
  assert.equal(h.run('serviceInputStatus(getTransactionResourceState(), "scheduled:ow")'), 'Not started');
});

test('all static service editor targets exist exactly once', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  const references = [...block.matchAll(/(?:getElementById|\bon)\('([^']+)'/g)].map(match => match[1]);
  for (const id of references) assert(ids.includes(id), `Missing element: ${id}`);
  const destinations = [...block.matchAll(/goTo\('([^']+)'/g)].map(match => match[1]);
  for (const screen of destinations) assert(html.includes(`data-screen="${screen}"`), `Missing screen: ${screen}`);
});
