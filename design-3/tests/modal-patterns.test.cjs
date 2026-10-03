const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const app = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');

test('leaving a transaction uses the shared blocking-dialog pattern', () => {
  const match = html.match(/<div class="popup-overlay" id="popup-transaction-exit"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
  assert(match, 'Transaction exit dialog must use a centered popup overlay');

  const dialog = match[0];
  assert.match(dialog, /class="popup caution"/);
  assert.match(dialog, /class="popup-icon caution-icon"/);
  assert.match(dialog, /class="confirm-actions"/);
  assert.match(dialog, /id="txn-continue-editing"/);
  assert.match(dialog, /id="txn-confirm-save"/);
  assert.match(dialog, /id="txn-discard"/);
  assert.doesNotMatch(dialog, /transaction-exit-popup|txn-exit-actions|txn-discard-link|sheet-handle/);
});

test('file-source choices use the shared contextual bottom sheet', () => {
  const match = html.match(/<div class="sheet-overlay" id="popup-file-source"[\s\S]*?<\/div>\s*<\/div>/);
  assert(match, 'File source choices must use a bottom sheet');

  const sheet = match[0];
  assert.match(sheet, /class="sheet"/);
  assert.match(sheet, /class="sheet-handle"/);
  assert.match(sheet, /class="sheet-header"/);
  assert.match(sheet, /id="txn-source-camera"/);
  assert.match(sheet, /id="txn-source-media"/);
  assert.match(sheet, /id="txn-source-file"/);
  assert.doesNotMatch(sheet, /file-source-popup|popup-overlay/);
  assert.match(app, /getElementById\('btn-attach'\)\.onclick = \(\) => openFileSourcePicker\('stop'\)/);
  assert.match(app, /openFileSourcePicker\('transaction'\)/);
});

test('transaction header has one exit action and keeps progression in the bottom Next button', () => {
  assert.match(html, /id="txn-exit-btn"/);
  assert.match(html, /id="txn-next-btn"/);
  assert.doesNotMatch(html, /id="txn-save-exit"|class="txn-save-exit"/);
  assert.doesNotMatch(app, /getElementById\('txn-save-exit'\)/);
});
