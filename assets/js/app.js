// app.js - инициализация
document.addEventListener('DOMContentLoaded', function () {
    // Проверяем, есть ли функции корзины
    if (window.cartFunctions) {
        window.cartFunctions.init();
    }

    // Добавляем обработчики для кнопок в магазине
    const addToCartButtons = document.querySelectorAll('[data-id]');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            const image = this.getAttribute('data-image');

            window.cartFunctions.addToCart(id, name, price, 1, image);
        });
    });
});