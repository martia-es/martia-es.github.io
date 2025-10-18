import { initPageInteractions } from './script.js';

// Wait for DOM readiness in case this script is moved to the head in the future.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPageInteractions, { once: true });
} else {
  initPageInteractions();
}
