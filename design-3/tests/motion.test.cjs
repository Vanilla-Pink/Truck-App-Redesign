const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');
const app = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');

test('the mobile prototype only transitions between screens and has no hover states', () => {
  const transitions = [...css.matchAll(/\btransition(?:-[a-z-]+)?\s*:/g)];
  assert.equal(transitions.length, 1);
  assert.match(css, /\.screen\s*\{[\s\S]*?transition:\s*opacity 0\.3s ease, transform 0\.3s ease;/);
  assert.doesNotMatch(css, /\banimation(?:-[a-z-]+)?\s*:|@keyframes\b/);
  assert.doesNotMatch(css, /:hover\b/);
  assert.doesNotMatch(app, /screen-enter-|screen-exit-|screenMotion/);
  assert.doesNotMatch(app, /requestAnimationFrame|classList\.add\(['"]spinning['"]\)/);
});
