const cartKey = 'cartItems';

function sendOrderConfirmation(customerName, customerEmail, orderItems, totalAmount) {
    const formattedOrderItems = orderItems.map(item => ({
        name: item.name,
        units: item.quantity, 
        price: (item.price * item.quantity).toLocaleString('ru-RU')
    }));
    
    const templateParams = {
        name : customerName,
        email: customerEmail,
        order_id: getRandomInt(1000, 9999),
        order_items: formattedOrderItems,
        total_amount: totalAmount
    };

    return emailjs.send(
        "service_rzi1swt", 
        "template_hsu0d6h", 
        templateParams,
        "af2ibSbbNpSgYIngm"
    );
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkoutOrder(event) {
    event.preventDefault();
    
    const customerName = document.getElementById('customerName').value.trim();
    const customerEmail = document.getElementById('customerEmail').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    
    if (!customerName || !customerEmail || !customerPhone) {
        alert('Пожалуйста, заполните все поля формы!');
        return;
    }
    
    if (cart.length === 0) {
        alert('Ваша корзина пуста!');
        return;
    }
    
    if (!confirm('Подтвердить оформление заказа?')) {
        return;
    }
    
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    sendOrderConfirmation(customerName, customerEmail, cart, totalAmount)
    .then(response => {
    
        // Проверка успешного ответа
        if (response.status === 200) {
            alert('🎉 Заказ успешно оформлен! Подтверждение отправлено на вашу почту.');
            
            clearCart();
            event.target.reset();
            
        } else {
            alert('Возникли проблемы с отправкой подтверждения.');
        }
    })
    .catch(error => {
            console.error('Ошибка отправки письма:', error);
            alert('Произошла ошибка при отправке подтверждения. Пожалуйста, свяжитесь с нами напрямую.');
        });

}

function clearCart() {
    cart = [];
    saveCart();
    renderCart();
}

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

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
        checkoutBtn.textContent = cart.length === 0 
            ? 'Корзина пуста' 
            : `Оформить заказ (${totalPrice} ₽)`;
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

document.addEventListener('DOMContentLoaded', function () {
    const isCartPage = document.querySelector('.product-list') !== null;

    if (isCartPage) {
        renderCart();
        
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', checkoutOrder);
        }
    }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderCart);
} else {
    renderCart();
}
