const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

test('Customer phase includes disclaimer, inline name and signature, print and receipt contact', () => {
  for (const screen of ['transaction-customer', 'transaction-customer-disclaimer', 'transaction-receipt-contact', 'transaction-review']) {
    assert(html.includes(`data-screen="${screen}"`), `Missing screen: ${screen}`);
  }
  assert(html.includes('id="customer-name"'));
  assert(html.includes('id="customer-signature-canvas"'));
  assert(html.includes('id="customer-print"'));
  assert(!html.includes('transaction-customer-signature'), 'Customer signature stays inline like the Driver step');
});

test('Driver and Customer share the sign-off components', () => {
  assert.match(source, /initSignaturePad\(\{\s*canvasId: 'driver-signature-canvas'/);
  assert.match(source, /initSignaturePad\(\{\s*canvasId: 'customer-signature-canvas'/);
  assert.match(source, /renderTransactionContext\('driver'/);
  assert.match(source, /renderTransactionContext\('customer'/);
  assert.equal((html.match(/class="txn-signature-card"/g) || []).length, 2);
});

test('Customer requires name and signature, and missing receipt info uses the shared blocking dialog', () => {
  assert.match(source, /Enter the customer name/);
  assert.match(source, /Customer signature is required/);
  assert.match(source, /setPopupOpen\('popup-electronic-receipt', true\)/);
  assert.match(source, /goTo\('transaction-receipt-contact'\)/);
  const match = html.match(/<div class="popup-overlay" id="popup-receipt-missing"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
  assert(match, 'Missing receipt dialog must use the centered popup overlay');
  assert.match(match[0], /class="popup caution"/);
  assert.match(match[0], /class="confirm-actions"/);
  assert.match(source, /!receiptDraft\.contactName \|\| !receiptDraft\.emails\.length/);
  assert.match(source, /goTo\('transaction-review'\)/);
});

test('Customer screens keep the original copy and receipt lists reuse the Services swipe-to-delete', () => {
  for (const copy of [
    'Please confirm with customer that the receipt contact name and email address are correct',
    'Transaction receipt contact information',
    'Enter new email address below. When finished press done.',
    'Receipt will be sent to below emails',
    'Tap an email to edit, or swipe to delete',
    'Enter new phone # below. When finished press done.',
    'Receipt will be sent to below phone #',
    'Tap a phone # to edit, or swipe to delete',
    'You have not entered a valid contact name and email for this transaction.',
    'Please let customer sign',
  ]) assert(html.includes(copy), `Missing original copy: ${copy}`);
  assert.match(source, /initSwipeToDelete\('service-unit-list'\)/);
  assert.match(source, /initSwipeToDelete\('receipt-email-list'\)/);
  assert.match(source, /initSwipeToDelete\('receipt-phone-list'\)/);
});

test('Review lists recorded services, submits behind a blocking popup and then shows the source actions', () => {
  assert(html.includes('data-screen="transaction-review"'));
  for (const copy of ['Wait for the transaction to be saved', 'Transaction was successfully sent.', 'You may now print receipts.', 'Send E Receipt', 'Restart BT']) {
    assert(html.includes(copy), `Missing original copy: ${copy}`);
  }
  assert.match(html, /id="review-submit"[^>]*>[\s\S]*?Submit<\/button>/);
  assert.match(html, /id="review-done"[^>]*hidden/);
  assert.match(source, /renderTransactionContext\('review'/);
  assert.match(source, /Number\(unit\.quantity\) > 0/);
  assert.match(source, /setPopupOpen\('popup-review-saving', true\)/);
  assert.match(source, /setPopupOpen\('popup-review-sent', true\)/);
  assert.match(source, /getElementById\('review-done'\)\?\.addEventListener\('click', \(\) => goTo\('stop-detail'\)\)/);
  assert.match(source, /getElementById\('review-exit'\)\.disabled = review\.submitted/);
});

test('Review header has a delete action that confirms before removing the transaction', () => {
  assert.match(html, /id="review-delete"[^>]*aria-label="Delete transaction"/);
  const match = html.match(/<div class="popup-overlay" id="popup-review-delete"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
  assert(match, 'Delete must confirm with the shared popup');
  assert.match(match[0], /class="popup-btn danger" id="review-delete-confirm"/);
  assert.match(source, /transactionResources\.delete\(transactionResourceKey\(\)\)/);
});
