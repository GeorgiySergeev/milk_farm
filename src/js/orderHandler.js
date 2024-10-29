const TOKEN = import.meta.env.VITE_PROD_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_PROD_CHAT_ID;

document.getElementById('submit-order').addEventListener('click', function (e) {
  e.preventDefault(); // Предотвращаем переход по ссылке

  // Собираем товары и их количество
  const products = [];
  document.querySelectorAll('.cart-single-item').forEach((item) => {
    const productName = item.querySelector('.product-name').textContent;
    const productQuantity = item.querySelector('.quantity').value;
    const productTotalPrice = item.querySelector('.product-total-price').textContent;

    products.push({
      name: productName,
      quantity: productQuantity,
      totalPrice: productTotalPrice,
    });
  });

  const formData = new FormData(document.getElementById('order-form'));
  const name = formData.get('name');
  const phone = formData.get('phone');

  const totalPrice = document.getElementById('total-price').textContent;

  const filtredProducts = products.filter((product) => product.quantity > 0);

  if (!filtredProducts.length) {
    alert('В корзине нет товаров!');
    return;
  }
  if (!name || !phone || !totalPrice) {
    alert('Будь ласкаво, заповніть всі поля!');
    return; // Если не все поля заполнены, выходим из функции
  }

  // Формируем текст для отправки в Telegram
  let message = `Новый заказ:
  Имя: ${name}\nТелефон: ${phone}\nОбщая сумма: ${totalPrice} грн\n\n`;

  filtredProducts.forEach((product) => {
    message += `Товар: ${product.name}\nКількість: ${product.quantity}\nСума: ${product.totalPrice} грн\n\n`;
  });

  console.log(message);

  // Отправка в Telegram

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
        alert('Заказ успешно отправлен!');
      } else {
        alert('Ошибка при отправке заказа.');
        console.error(data);
      }
    })
    .catch((error) => {
      alert('Произошла ошибка.');
      console.error(error);
    });
});

// ======

document.addEventListener('DOMContentLoaded', function () {
  // Функция для обновления общей цены
  function updateTotalPrice(item) {
    const priceElement = item.querySelector('.product-price');
    const quantityElement = item.querySelector('.quantity');
    const totalPriceElement = item.querySelector('.product-total-price');

    const price = parseFloat(priceElement.textContent);
    const quantity = parseInt(quantityElement.value);

    const totalPrice = price * quantity;
    totalPriceElement.textContent = totalPrice.toFixed(2); // Обновляем общую цену
  }

  // Обработчик для увеличения количества
  document.querySelectorAll('.quantity-up').forEach((button) => {
    button.addEventListener('click', function () {
      const item = this.closest('.cart-single-item');
      const quantityElement = item.querySelector('.quantity');
      let quantity = parseInt(quantityElement.value);

      quantity++; // Увеличиваем количество
      quantityElement.value = quantity;

      updateTotalPrice(item); // Обновляем общую цену
    });
  });

  // Обработчик для уменьшения количества
  document.querySelectorAll('.quantity-down').forEach((button) => {
    button.addEventListener('click', function () {
      const item = this.closest('.cart-single-item');
      const quantityElement = item.querySelector('.quantity');
      let quantity = parseInt(quantityElement.value);

      if (quantity > 0) {
        quantity--; // Уменьшаем количество
        quantityElement.value = quantity;

        updateTotalPrice(item); // Обновляем общую цену
      }
    });
  });
  // Функция для обновления общей суммы заказа
  function updateTotalOrderPrice() {
    let total = 0;
    // Находим все элементы с классом product-total-price
    document.querySelectorAll('.product-total-price').forEach((item) => {
      total += parseFloat(item.textContent); // Суммируем значения
    });

    // Обновляем общую сумму заказа
    const totalPriceElement = document.querySelectorAll('.total-price');
    totalPriceElement.forEach((item) => {
      item.textContent = total.toFixed(2);
    });
  }

  // Подключаем к событиям увеличения/уменьшения количества
  document.querySelectorAll('.quantity-up').forEach((button) => {
    button.addEventListener('click', function () {
      const item = this.closest('.cart-single-item');
      updateTotalPrice(item); // Обновляем цену для товара
      updateTotalOrderPrice(); // Обновляем общую сумму
    });
  });

  document.querySelectorAll('.quantity-down').forEach((button) => {
    button.addEventListener('click', function () {
      const item = this.closest('.cart-single-item');
      updateTotalPrice(item); // Обновляем цену для товара
      updateTotalOrderPrice(); // Обновляем общую сумму
    });
  });

  // Вызываем при загрузке страницы для начального значения
  updateTotalOrderPrice();
});
