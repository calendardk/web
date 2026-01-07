/**
 * Cart Manager - Quản lý giỏ hàng cho toàn bộ website
 * File này cần được include trong TẤT CẢ các trang HTML
 */

// Cart Manager Object
const CartManager = {
  // Khởi tạo giỏ hàng
  init: function () {
    this.updateCartUI();
    console.log("Cart Manager initialized");
  },

  // Lấy giỏ hàng từ localStorage
  getCart: function () {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
  },

  // Lấy tổng số sản phẩm trong giỏ
  getCartCount: function () {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  },

  // Thêm sản phẩm vào giỏ
  addToCart: function (productId, productName, price, image) {
    // --- ĐOẠN CODE KIỂM TRA ĐĂNG NHẬP (ĐÃ SỬA) ---
    // 1. Kiểm tra xem người dùng đã đăng nhập chưa
    const user = localStorage.getItem("user");

    if (!user) {
      // 2. Hiện bảng hỏi: OK (Đồng ý) hoặc Cancel (Hủy)
      // confirm trả về true nếu ấn OK, false nếu ấn Cancel
      const wantToLogin = confirm(
        "Bạn cần đăng nhập tài khoản để mua hàng.\nNhấn OK để đi đăng nhập, hoặc nhấn Cancel (Hủy) để tiếp tục xem."
      );

      if (wantToLogin) {
        // 3. Nếu khách bấm OK -> Chuyển sang trang đăng nhập
        window.location.href = "auth.html";
      }

      // 4. Nếu khách bấm Cancel (hoặc bấm OK xong chuyển trang) -> Code dừng tại đây
      // Không thực hiện thêm sản phẩm vào giỏ
      return null;
    }
    // ------------------------------------------

    let cart = this.getCart();

    // Validate input
    if (!productId || !productName) {
      console.error("Invalid product data:", {
        productId,
        productName,
        price,
        image,
      });
      this.showNotification("Có lỗi xảy ra khi thêm sản phẩm", "error");
      return cart;
    }

    // Ensure price and image have default values
    const safePrice = price || "0₫";
    const safeImage = image || "img/placeholder.jpg";

    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingItem = cart.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
      console.log("Updated existing item:", existingItem);
    } else {
      const newItem = {
        id: productId,
        name: productName,
        price: safePrice,
        image: safeImage,
        quantity: 1,
      };
      cart.push(newItem);
      console.log("Added new item:", newItem);
    }

    // Lưu vào localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // Cập nhật UI
    this.updateCartUI();

    // Hiển thị thông báo
    this.showNotification(`Đã thêm "${productName}" vào giỏ hàng!`);

    return cart;
  },

  // Xóa sản phẩm khỏi giỏ
  removeFromCart: function (productId) {
    let cart = this.getCart();
    cart = cart.filter((item) => item.id !== productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    this.updateCartUI();
  },

  // Cập nhật số lượng sản phẩm
  updateQuantity: function (productId, quantity) {
    let cart = this.getCart();
    const item = cart.find((item) => item.id === productId);

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        localStorage.setItem("cart", JSON.stringify(cart));
        this.updateCartUI();
      }
    }
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: function () {
    localStorage.removeItem("cart");
    this.updateCartUI();
  },

  // Cập nhật UI hiển thị số lượng giỏ hàng
  updateCartUI: function () {
    const count = this.getCartCount();
    const cartElements = document.querySelectorAll("#cart-count, .cart-count");

    cartElements.forEach((element) => {
      element.textContent = `Giỏ hàng (${count})`;
    });
  },

  // Hiển thị thông báo
  showNotification: function (message, type = "success") {
    let notif = document.getElementById("cart-notification");

    if (!notif) {
      notif = document.createElement("div");
      notif.id = "cart-notification";
      notif.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                background: ${type === "success" ? "#4CAF50" : "#f44336"};
                color: white;
                padding: 16px 24px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 9999;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                max-width: 300px;
            `;
      document.body.appendChild(notif);
    }

    notif.textContent = message;
    notif.style.background = type === "success" ? "#4CAF50" : "#f44336";

    // Slide in
    requestAnimationFrame(() => {
      notif.style.transform = "translateX(0)";
    });

    // Slide out sau 2.5s
    setTimeout(() => {
      notif.style.transform = "translateX(400px)";
    }, 2500);
  },

  // Lấy tổng giá trị giỏ hàng
  getCartTotal: function () {
    const cart = this.getCart();
    return cart.reduce((total, item) => {
      const priceStr = item.price || "0₫";
      const price = parseFloat(priceStr.toString().replace(/[^0-9]/g, ""));
      return total + price * item.quantity;
    }, 0);
  },
};

// Khởi tạo khi DOM loaded
document.addEventListener("DOMContentLoaded", function () {
  CartManager.init();
});

// Global function để thêm vào giỏ hàng (để tương thích với code cũ)
function addToCart(
  productId,
  productName,
  price = "0₫",
  image = "img/placeholder.jpg"
) {
  // Log để debug
  console.log("addToCart called with:", {
    productId,
    productName,
    price,
    image,
  });

  // Nếu chỉ truyền 2 tham số, thử tìm sản phẩm để lấy đầy đủ thông tin
  if (!price || price === "0₫" || !image || image === "img/placeholder.jpg") {
    // Thử tìm trong allProducts nếu có
    if (typeof allProducts !== "undefined" && allProducts.length > 0) {
      const product = allProducts.find((p) => p.id === productId);
      if (product) {
        price = product.newPrice || product.price || "0₫";
        image = product.image || "img/placeholder.jpg";
        console.log("Found product data:", { price, image });
      }
    }
  }

  CartManager.addToCart(productId, productName, price, image);
}
