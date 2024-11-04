import * as bootstrap from 'bootstrap';
import Inputmask from 'inputmask';
// Import our custom CSS
import '../scss/styles.scss';
import './cart.js';

const phoneInput = document.querySelector('input[type="tel"]');
const mask = new Inputmask('+380 (99) 999 99 99');
mask.mask(phoneInput);

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  });
});
