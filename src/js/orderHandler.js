const TOKEN = import.meta.env.VITE_TEST_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TEST_CHAT_ID;

document.getElementById('submit-order').addEventListener('click', function (e) {
  e.preventDefault(); // Предотвращаем переход по ссылке

  // if (!name || !phone || !totalPrice) {
  //   alert('Будь ласкаво, заповніть всі поля!');
  //   return; // Если не все поля заполнены, выходим из функции
  // }
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
