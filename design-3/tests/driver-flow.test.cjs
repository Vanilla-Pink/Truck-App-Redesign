const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

test('Driver phase includes summary, conditional checklist, inline signature and Customer handoff', () => {
  for (const screen of ['transaction-driver', 'transaction-driver-check', 'transaction-customer']) {
    assert(html.includes(`data-screen="${screen}"`), `Missing screen: ${screen}`);
  }
  assert(html.includes('id="driver-print"'));
  assert(html.includes('id="driver-signature-canvas"'));
  assert(!html.includes('data-screen="transaction-driver-signature"'));
  assert(!source.includes("goTo('transaction-driver-signature')"));
  assert(html.includes('name="driver-quality"'));
  assert(html.includes('name="driver-halogen"'));
  assert(html.includes('name="driver-chlor"'));
});

test('Halogen checks depend on collected quantity and failed screens activate notes', () => {
  assert.match(source, /some\(unit => Number\(unit\.quantity\) > 0\)/);
  assert.match(source, /notes\.disabled = !failed/);
  assert.match(source, /driverCheckDraft\.halogen === 'fail' && !driverCheckDraft\.chlor/);
});

test('wizard can skip Spot Pay and Driver advances to Customer only when complete', () => {
  assert.match(source, /goTo\('transaction-driver'\)/);
  assert.match(source, /No payment required · Spot Pay skipped/);
  assert.match(source, /goTo\('transaction-customer'\)/);
  assert.match(source, /Driver signature is required/);
});
