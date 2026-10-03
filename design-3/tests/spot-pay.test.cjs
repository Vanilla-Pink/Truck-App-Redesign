const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

function totals(subtotal, method) {
  const match = source.match(/  function spotPayTotals\(subtotal, method\) \{[\s\S]*?\n  \}/);
  assert(match, 'spotPayTotals must exist');
  const context = vm.createContext({ result: null });
  vm.runInContext(`${match[0]}\nresult = spotPayTotals(${subtotal}, ${JSON.stringify(method)});`, context);
  return context.result;
}

test('Spot Pay preserves the $500 credit-card fee threshold', () => {
  assert.deepEqual({ ...totals(500, 'card') }, { subtotal: 500, fee: 0, total: 500 });
  assert.deepEqual({ ...totals(501, 'card') }, { subtotal: 501, fee: 15.03, total: 516.03 });
  assert.deepEqual({ ...totals(600, 'card') }, { subtotal: 600, fee: 18, total: 618 });
  assert.deepEqual({ ...totals(600, 'check') }, { subtotal: 600, fee: 0, total: 600 });
  assert.deepEqual({ ...totals(600, 'invoice') }, { subtotal: 600, fee: 0, total: 600 });
});

test('Spot Pay screens and payment methods are present in the transaction flow', () => {
  for (const screen of ['transaction-payment', 'transaction-collect', 'transaction-card-payment']) {
    assert(html.includes(`data-screen="${screen}"`), `Missing screen: ${screen}`);
  }
  for (const method of ['check', 'card', 'invoice']) {
    assert(html.includes(`value="${method}"`), `Missing payment method: ${method}`);
  }
  assert.match(source, /getElementById\('txn-next-btn'\)\.onclick = \(\) => \{[\s\S]*?transactionNeedsSpotPay\(\)[\s\S]*?goTo\('transaction-payment'\)/);
  assert.match(source, /completeSpotPay\('card'/);
});

test('Spot Pay keeps transaction resources and separates the transaction number', () => {
  assert(html.includes('id="spot-transaction-number"'));
  assert(html.includes('id="spot-copy-transaction"'));
  assert.match(source, /id="spot-pay-notes-btn"/);
  assert.match(source, /id="spot-pay-attachments-btn"/);
  assert.match(source, /transactionResourceReturnScreen = 'transaction-payment'/);
});
