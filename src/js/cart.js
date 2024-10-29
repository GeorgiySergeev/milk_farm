const TOKEN = import.meta.env.VITE_TEST_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TEST_CHAT_ID;

document.addEventListener('DOMContentLoaded', function () {
  const submitBtnEl = document.getElementById('submit-order');
  const cart = []; // массив для хранения товаров в корзине

  // Функция добавления товара в корзину
  function addToCart(productName, quantity, pricePerUnit, unit, quantityPerUnit) {
    const totalPrice = (pricePerUnit * quantity * quantityPerUnit).toFixed(2);
    const item = { name: productName, quantity, unit, price: totalPrice };
    cart.push(item);
    renderCart();
  }

  // Функция отображения корзины
  function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.querySelectorAll('.total-price');
    cartItemsContainer.innerHTML = ''; // Очищаем контейнер корзины

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
        quantityInput.value = ''; // очистить поле количества после добавления в корзину
      } else {
        alert('Введите количество больше нуля');
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
      alert('В корзині немає товарів!');
      return; // Если корзина пуста, выходим из функции
    }

    if (!orderData.name || !orderData.phone) {
      alert('Будь ласка, заповніть форму замовлення!');
      return; // Если не все поля заполнены, выходим из функции
    }

    let message = `Замовлення з сайту https://ferma.blummax.com:
    \nИм'я: ${orderData.name}\nТелефон: ${orderData.phone}\nЗагальна сума замовлення: ${orderData.totalPrice} грн\n\n`;

    // добавляем корзину в данные заказа
    orderData.cart.forEach((product) => {
      message += `Товар: ${product.name}\nКількість: ${product.quantity}\nЦіна: ${product.price} грн\n\n `;
    });
    // message += `${window.location.origin}\n`;

    console.log(message);
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
          alert('Ваше замовлення відправлено!');
          cart.length = 0; // очищаем корзину
          renderCart();
          document.getElementById('order-form').reset(); // очищаем форму
        } else {
          alert('Помилка при відправленні замовлення.');
        }
      })
      .catch((error) => {
        alert('Упс, сталася помилка при відправленні замовлення. Повторіть спробування пізніше.');
        console.error(error);
      });
  });

  // Удаление из корзины
  document.getElementById('cart-items').addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-item')) {
      const index = event.target.getAttribute('data-index');
      cart.splice(index, 1);
      renderCart();
    }
  });
});
