const cartKey = 'cartItems';

function getCart() {
    const cartJson = localStorage.getItem(cartKey);

    if (!cartJson) {
        console.log('Корзина пустая или не найдена');
        return [];
    }

    try {
        return JSON.parse(cartJson);
    } catch (e) {
        console.error('Ошибка парсинга корзины:', e);
        return [];
    }
}

let cart = getCart();

function addToCart(productId, productName, price, quantity, imageSrc) {

    const existingProductIndex = cart.findIndex(item => item.id === productId);

    if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity += parseInt(quantity);
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: parseInt(quantity),
            imageSrc: imageSrc
        });
    }

    saveCart();
    alert(`Товар "${productName}" успешно добавлен в корзину`);
    renderCart();
}

function decreaseOrRemoveFromCart(productId) {
    const productIndex = cart.findIndex(item => item.id === productId);

    if (productIndex !== -1) {
        if (cart[productIndex].quantity > 1) {
            cart[productIndex].quantity -= 1;
        } else {
            cart.splice(productIndex, 1);
        }

        saveCart();
        renderCart();
    } else {
        console.warn(`Товар с id ${productId} не найден в корзине`);
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
}

function increaseQuantity(productId) {
    const productIndex = cart.findIndex(item => item.id === productId);

    if (productIndex !== -1) {
        cart[productIndex].quantity += 1;
        saveCart();
        renderCart();
    }
}

function saveCart() {
    localStorage.setItem(cartKey, JSON.stringify(cart));
}

function renderCart() {
    const cartContainer = document.querySelector('.pr-l-inner');
    cartContainer.innerHTML = '';
    let totalPrice = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<h3>Корзина пуста</h3>';
    } else {
        cart.forEach((item) => {
            const productHtml = `
                <div class="product" data-id="${item.id}">
                    <div class="left">
                        <img src="${item.imageSrc || 'assets/images/default.jpg'}" alt="${item.name}" width="100">
                        <div class="pr-text">
                            <h3>${item.name}</h3>
                            <h3>${item.price} ₽ × ${item.quantity}</h3>
                            <h3>Итого: ${item.price * item.quantity} ₽</h3>
                        </div>
                    </div>
                    <div class="product-actions">
                        <div class="quantity-controls">
                            <button class="quantity-btn decrease-btn" data-product-id="${item.id}" title="Убрать один товар">
                                ${item.quantity > 1 ? '−' : '🗑️'}
                            </button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn increase-btn" data-product-id="${item.id}" title="Добавить один товар">
                                +
                            </button>
                        </div>
                        <a href="#" data-product-id="${item.id}" class="remove-btn menu__list-link">Удалить все</a>
                    </div>
                </div><hr>
            `;

            cartContainer.insertAdjacentHTML('beforeend', productHtml);
            totalPrice += item.price * item.quantity;
        });
    }

    const totalPrElement = document.querySelector('.total-pr h3');
    if (totalPrElement) {
        totalPrElement.textContent = `Всего: ${totalPrice} ₽`;
    } else {
        console.error('Элемент .total-pr h3 не найден!');
    }

    const decreaseButtons = document.querySelectorAll('.decrease-btn');
    decreaseButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const productId = this.dataset.productId;
            decreaseOrRemoveFromCart(productId);
        });
    });

    const increaseButtons = document.querySelectorAll('.increase-btn');
    increaseButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const productId = this.dataset.productId;
            increaseQuantity(productId);
        });
    });

    const removeButtons = document.querySelectorAll('.remove-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const productId = this.dataset.productId;
            removeFromCart(productId);
        });
    });
}

// // Экспортируем функции для использования в других файлах
// window.cartFunctions = {
//     addToCart,
//     removeFromCart,
//     decreaseOrRemoveFromCart,
//     increaseQuantity,
//     renderCart,
//     getCart
// };

document.addEventListener('DOMContentLoaded', function () {
    const isCartPage = document.querySelector('.product-list') !== null;

    if (isCartPage) {
        renderCart();
    }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderCart);
} else {
    renderCart();
}