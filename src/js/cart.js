import Notiflix from 'notiflix';
const TOKEN = import.meta.env.VITE_TEST_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TEST_CHAT_ID;

document.addEventListener('DOMContentLoaded', function () {
  const submitBtnEl = document.getElementById('submit-order');
  const cart = [];

  // add to cart list
  function addToCart(productName, quantity, pricePerUnit, unit, quantityPerUnit) {
    const totalPrice = (pricePerUnit * quantity * quantityPerUnit).toFixed(2);
    const item = { name: productName, quantity, unit, price: totalPrice };
    cart.push(item);
    renderCart();
  }

  // render c cart
  function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.querySelectorAll('.total-price');
    cartItemsContainer.innerHTML = '';

    let totalPrice = 0;

    cart.forEach((item, index) => {
      totalPrice += parseFloat(item.price);
      const cartItem = document.createElement('li');
      cartItem.classList.add(
        'cart-item',
        'list-group-item',
        'd-flex',
        'justify-content-between',
        'lh-sm',
      );

      cartItem.innerHTML = `
        <div class="item-wrapper">
          <h6 class="my-0">${item.name}</h6>
          <small class="fs-6 text-body-secondary m-auto">${item.quantity} ${item.unit}</small>
        </div>
        <span class="fs-6 text-body-secondary m-auto">${item.price} грн</span>
        <button class="remove-item btn-close ms-auto my-auto" data-index="${index}"></button>
      `;

      cartItemsContainer.appendChild(cartItem);
    });

    totalPriceElement.forEach((item) => {
      item.textContent = `${totalPrice.toFixed(2)} грн`;
    });
  }

  // Обработчик добавления товара в корзину
  document.querySelectorAll('.cart-single-item').forEach((item) => {
    const productName = item.querySelector('.card-title').textContent;
    const pricePerUnit = parseFloat(item.getAttribute('data-price'));
    const unit = item.getAttribute('data-unit');
    const quantityPerUnit = parseFloat(item.getAttribute('data-quantity'));

    item.querySelector('.add-to-cart').addEventListener('click', () => {
      const quantityInput = item.querySelector('.quantity');
      const quantity = Number(quantityInput.value);

      if (quantity > 0) {
        addToCart(productName, quantity, pricePerUnit, unit, quantityPerUnit);
        Notiflix.Notify.info(`${productName} додано до кошика.`, {
          position: 'center-center',
        });
        quantityInput.value = ''; // очистить поле количества после добавления в корзину
      } else {
        Notiflix.Notify.info('Введіть кількість або вагу товара');
      }
    });
  });

  // Отправка заказа
  submitBtnEl.addEventListener('click', (event) => {
    event.preventDefault();

    const formData = new FormData(document.getElementById('order-form'));
    const orderData = Object.fromEntries(formData);
    orderData.cart = cart;
    const totalPrice = cart.reduce((acc, item) => acc + parseFloat(item.price), 0).toFixed(2);
    orderData.totalPrice = totalPrice;

    if (!cart.length) {
      Notiflix.Notify.failure('В корзині немає товарів!');
      return;
    }

    if (!orderData.name || !orderData.phone) {
      Notiflix.Notify.failure('Будь ласка, заповніть форму замовлення!');
      return;
    }

    let message = `Нове замовлення.
    \nИм'я: ${orderData.name}\nТелефон: ${orderData.phone}\nЗагальна сума замовлення: ${orderData.totalPrice} грн\n\n`;

    // add the order
    orderData.cart.forEach((product) => {
      message += `Товар: ${product.name}\nКількість: ${product.quantity}\nЦіна: ${product.price} грн\n\n `;
    });
    message += `${window.location.origin}\n`;

    const botToken = TOKEN;
    const chatId = CHAT_ID;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) {
          Notiflix.Notify.success('Ваше замовлення відправлено!');

          cart.length = 0;
          renderCart();
          document.getElementById('order-form').reset();
        } else {
          Notiflix.Notify.failure('Помилка відправлення');
        }
      })
      .catch((error) => {
        Notiflix.Notify.failure(
          'Упс, сталася помилка при відправленні замовлення. Повторіть спробу пізніше.',
        );

        console.error(error);
      });
  });

  // delete from cart
  document.getElementById('cart-items').addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-item')) {
      const index = event.target.getAttribute('data-index');
      Notiflix.Notify.info(`${cart[index].name} видалено з кошика.`, {
        position: 'center-center',
      });
      cart.splice(index, 1);
      renderCart();
    }
  });
});
