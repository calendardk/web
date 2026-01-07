/**
 * Cart Page JavaScript - FIXED VERSION
 * Handles cart display, quantity updates, and checkout
 */

// Global variables
let discountAmount = 0;
let shippingFee = 0;
const FREE_SHIPPING_THRESHOLD = 500000; // Miễn phí ship từ 500k

/**
 * Initialize cart page
 */
function initCartPage() {
    renderCartItems();
    updateCartSummary();
    console.log('Cart page initialized');
}

/**
 * Render all cart items
 */
function renderCartItems() {
    const cart = CartManager.getCart();
    const container = document.getElementById('cart-items-container');
    const totalItemsElement = document.getElementById('total-items');

    console.log('Current cart:', cart);

    if (!container) return;

    // Update total items count
    if (totalItemsElement) {
        totalItemsElement.textContent = CartManager.getCartCount();
    }

    // Check if cart is empty
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Giỏ hàng trống</h3>
                <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                <a href="index.html" class="btn-continue">
                    <i class="fas fa-shopping-bag"></i> Khám phá sản phẩm
                </a>
            </div>
        `;
        return;
    }

    // Render cart items
    container.innerHTML = cart.map(item => createCartItemHTML(item)).join('');
}

/**
 * Create HTML for a cart item
 */
function createCartItemHTML(item) {
    // Safely extract price
    const priceStr = item.price || '0';
    const price = parseInt(priceStr.toString().replace(/\D/g, '') || '0');
    const subtotal = price * item.quantity;

    console.log(`Item: ${item.name}, Price: ${price}, Qty: ${item.quantity}, Subtotal: ${subtotal}`);

    return `
        <div class="cart-item" data-id="${item.id}">
            <div class="item-image">
                <img src="${item.image || 'img/placeholder.jpg'}" alt="${item.name}">
            </div>
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-price">
                    ${formatPrice(price)}₫ × ${item.quantity} = <strong>${formatPrice(subtotal)}₫</strong>
                </div>
                <div class="item-actions">
                    <div class="quantity-control">
                        <button onclick="decreaseQuantity(${item.id})" ${item.quantity <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                        <button onclick="increaseQuantity(${item.id})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="btn-remove" onclick="removeItem(${item.id})">
                        <i class="fas fa-trash-alt"></i> Xóa
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Increase item quantity
 */
function increaseQuantity(productId) {
    console.log('Increasing quantity for product:', productId);
    
    const cart = CartManager.getCart();
    const item = cart.find(i => i.id === productId);
    
    if (item) {
        // Update quantity
        CartManager.updateQuantity(productId, item.quantity + 1);
        
        // Re-render everything
        renderCartItems();
        updateCartSummary();
        
        CartManager.showNotification(`Đã tăng số lượng "${item.name}"`);
    }
}

/**
 * Decrease item quantity
 */
function decreaseQuantity(productId) {
    console.log('Decreasing quantity for product:', productId);
    
    const cart = CartManager.getCart();
    const item = cart.find(i => i.id === productId);
    
    if (item && item.quantity > 1) {
        // Update quantity
        CartManager.updateQuantity(productId, item.quantity - 1);
        
        // Re-render everything
        renderCartItems();
        updateCartSummary();
        
        CartManager.showNotification(`Đã giảm số lượng "${item.name}"`);
    }
}

/**
 * Remove item from cart
 */
function removeItem(productId) {
    const cart = CartManager.getCart();
    const item = cart.find(i => i.id === productId);
    
    if (item) {
        if (confirm(`Bạn có chắc muốn xóa "${item.name}" khỏi giỏ hàng?`)) {
            CartManager.removeFromCart(productId);
            
            // Re-render everything
            renderCartItems();
            updateCartSummary();
            
            CartManager.showNotification(`Đã xóa "${item.name}" khỏi giỏ hàng`, 'success');
        }
    }
}

/**
 * Confirm and clear entire cart
 */
function confirmClearCart() {
    const cart = CartManager.getCart();
    
    if (cart.length === 0) {
        CartManager.showNotification('Giỏ hàng đã trống', 'error');
        return;
    }

    if (confirm('Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
        CartManager.clearCart();
        discountAmount = 0;
        renderCartItems();
        updateCartSummary();
        clearPromoInput();
        CartManager.showNotification('Đã xóa tất cả sản phẩm', 'success');
    }
}

/**
 * Update cart summary (prices, totals, etc.)
 */
function updateCartSummary() {
    const cart = CartManager.getCart();
    
    console.log('Updating summary for cart:', cart);
    
    // Calculate subtotal from scratch
    let subtotal = 0;
    cart.forEach(item => {
        const priceStr = item.price || '0';
        const price = parseInt(priceStr.toString().replace(/\D/g, '') || '0');
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;
        console.log(`  ${item.name}: ${price} × ${item.quantity} = ${itemTotal}`);
    });

    console.log('Calculated subtotal:', subtotal);

    // Calculate shipping fee
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        shippingFee = 0;
    } else if (subtotal > 0) {
        shippingFee = 30000;
    } else {
        shippingFee = 0;
    }

    console.log('Shipping fee:', shippingFee);

    // Calculate total
    const total = subtotal + shippingFee - discountAmount;
    console.log('Final total:', total);

    // Update UI elements
    updateElement('subtotal', formatPrice(subtotal) + '₫');
    
    if (shippingFee === 0 && subtotal > 0) {
        updateElement('shipping-fee', '<span style="color: #4caf50; font-weight: 600;">Miễn phí</span>', true);
    } else {
        updateElement('shipping-fee', formatPrice(shippingFee) + '₫');
    }
    
    if (discountAmount > 0) {
        updateElement('discount', `<span style="color: #4caf50; font-weight: 600;">-${formatPrice(discountAmount)}₫</span>`, true);
    } else {
        updateElement('discount', '0₫');
    }
    
    updateElement('total', formatPrice(total) + '₫');

    // Show free shipping message if applicable
    if (subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD) {
        const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
        console.log(`Need ${remaining} more for free shipping`);
    }
}

/**
 * Helper function to update element content
 */
function updateElement(id, content, isHTML = false) {
    const element = document.getElementById(id);
    if (element) {
        if (isHTML) {
            element.innerHTML = content;
        } else {
            element.textContent = content;
        }
    }
}

/**
 * Apply promo code
 */
function applyPromoCode() {
    const promoInput = document.getElementById('promo-input');
    if (!promoInput) return;

    const promoCode = promoInput.value.trim().toUpperCase();

    if (!promoCode) {
        CartManager.showNotification('Vui lòng nhập mã giảm giá', 'error');
        return;
    }

    const cart = CartManager.getCart();
    if (cart.length === 0) {
        CartManager.showNotification('Giỏ hàng trống', 'error');
        return;
    }

    // Promo codes database (demo)
    const promoCodes = {
        'ELDEN10': { type: 'percent', value: 10, description: 'Giảm 10%' },
        'ELDEN50K': { type: 'fixed', value: 50000, description: 'Giảm 50,000₫' },
        'FREESHIP': { type: 'shipping', value: 0, description: 'Miễn phí vận chuyển' },
        'WELCOME': { type: 'percent', value: 15, description: 'Giảm 15%' }
    };

    const promo = promoCodes[promoCode];

    if (!promo) {
        CartManager.showNotification('Mã giảm giá không hợp lệ', 'error');
        return;
    }

    // Calculate discount
    let subtotal = 0;
    cart.forEach(item => {
        const priceStr = item.price || '0';
        const price = parseInt(priceStr.toString().replace(/\D/g, '') || '0');
        subtotal += price * item.quantity;
    });

    if (promo.type === 'percent') {
        discountAmount = Math.floor(subtotal * promo.value / 100);
    } else if (promo.type === 'fixed') {
        discountAmount = Math.min(promo.value, subtotal); // Don't exceed subtotal
    } else if (promo.type === 'shipping') {
        shippingFee = 0;
        discountAmount = 30000; // Original shipping fee
    }

    updateCartSummary();
    CartManager.showNotification(`Áp dụng mã "${promoCode}" thành công! ${promo.description}`, 'success');
    promoInput.value = '';
}

/**
 * Clear promo input
 */
function clearPromoInput() {
    const promoInput = document.getElementById('promo-input');
    if (promoInput) {
        promoInput.value = '';
    }
}

/**
 * Proceed to checkout
 */
function checkout() {
    const cart = CartManager.getCart();

    if (cart.length === 0) {
        CartManager.showNotification('Giỏ hàng trống. Vui lòng thêm sản phẩm!', 'error');
        return;
    }

    // Calculate final values
    let subtotal = 0;
    cart.forEach(item => {
        const priceStr = item.price || '0';
        const price = parseInt(priceStr.toString().replace(/\D/g, '') || '0');
        subtotal += price * item.quantity;
    });

    const total = subtotal + shippingFee - discountAmount;

    // Prepare order data
    const orderData = {
        items: cart,
        subtotal: subtotal,
        shippingFee: shippingFee,
        discount: discountAmount,
        total: total,
        date: new Date().toISOString()
    };

    console.log('Order data:', orderData);

    // Confirm checkout
    if (confirm(`Xác nhận đơn hàng với tổng tiền: ${formatPrice(total)}₫?`)) {
        CartManager.showNotification('Đơn hàng đã được tạo thành công!', 'success');
        
        // Simulate redirect to order confirmation page
        setTimeout(() => {
            alert('Cảm ơn bạn đã mua hàng!\n(Demo - thực tế sẽ chuyển đến trang thanh toán)');
            // Uncomment to actually redirect:
            // window.location.href = 'checkout.html';
        }, 1500);
    }
}

/**
 * Format price with thousands separator
 */
function formatPrice(price) {
    if (!price || isNaN(price)) return '0';
    return Math.floor(price).toLocaleString('vi-VN');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initCartPage);