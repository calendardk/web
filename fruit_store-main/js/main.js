/**
 * Clean Fruits - Main JavaScript (Optimized)
 * Tối ưu performance và giảm lag
 */

let allProducts = [];
let cartCount = 0;
let currentCategory = "all";

// Debounce helper function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Lazy loading images
function setupLazyLoading() {
  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
            observer.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin: "50px",
    }
  );

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

/**
 * Tính phần trăm giảm giá
 */
function calculateDiscount(oldPrice, newPrice) {
  if (!oldPrice || !newPrice) return null;

  const oldPriceNum = parseFloat(oldPrice.replace(/[^0-9]/g, ""));
  const newPriceNum = parseFloat(newPrice.replace(/[^0-9]/g, ""));

  if (oldPriceNum <= newPriceNum) return null;

  const discountPercent = Math.round(
    ((oldPriceNum - newPriceNum) / oldPriceNum) * 100
  );
  return `-${discountPercent}%`;
}

/**
 * Khởi tạo ứng dụng
 */
async function initApp() {
  try {
    const response = await fetch("products.json");
    if (!response.ok) throw new Error("Không thể tải dữ liệu sản phẩm.");

    const data = await response.json();

    // Tự động tính discount cho các sản phẩm
    allProducts = data.products.map((product) => {
      if (product.newPrice && product.oldPrice && !product.discount) {
        product.discount = calculateDiscount(
          product.oldPrice,
          product.newPrice
        );
      }
      return product;
    });

    // Render các section ban đầu
    renderSection(allProducts, "flash-sale", "flash-sale-list");
    renderSection(allProducts, "best-seller", "best-seller-list");
    renderSection(allProducts, "gift", "gift-list");
    renderSection(allProducts, "cut-fruit", "cut-fruit-list");

    // Khởi tạo category filter
    initCategoryFilter();

    // Setup lazy loading sau khi render
    setupLazyLoading();

    console.log("Dữ liệu đã được tải và hiển thị thành công.");
  } catch (error) {
    console.error("Lỗi khởi tạo:", error);
  }
}

/**
 * Khởi tạo chức năng lọc theo category
 */
function initCategoryFilter() {
  const categoryCards = document.querySelectorAll(".category-card");

  if (categoryCards.length === 0) return;

  // Debounced filter function
  const debouncedFilter = debounce((category) => {
    filterProductsByCategory(category);
  }, 150);

  categoryCards.forEach((card) => {
    card.addEventListener("click", function () {
      // Bỏ active khỏi tất cả
      categoryCards.forEach((c) => c.classList.remove("active"));

      // Thêm active vào card được chọn
      this.classList.add("active");

      // Lấy category
      const category = this.dataset.category;
      currentCategory = category;

      // Lọc với debounce
      debouncedFilter(category);
    });
  });

  // Thêm hiệu ứng ripple - tối ưu hơn
  categoryCards.forEach((card) => {
    card.addEventListener("click", function (e) {
      // Xóa ripple cũ nếu có
      const oldRipple = this.querySelector(".ripple-effect");
      if (oldRipple) oldRipple.remove();

      const ripple = document.createElement("span");
      ripple.className = "ripple-effect";
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                animation: ripple 0.6s ease-out;
            `;

      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

/**
 * Lọc và hiển thị sản phẩm theo category
 */
function filterProductsByCategory(category) {
  // Tìm hoặc tạo container
  let filteredSection = document.getElementById("filtered-products-section");

  if (!filteredSection) {
    const categorySection = document.querySelector(".category-section");
    const newSection = document.createElement("div");
    newSection.id = "filtered-products-section";
    newSection.className = "section-wrapper";
    newSection.innerHTML = `
            <div class="section-title">
                <h2 id="filtered-category-title">Sản Phẩm</h2>
            </div>
            <div class="slider-wrapper">
                <button class="slider-btn prev" onclick="scrollSlider('filtered-products-list', -1)">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="product-grid slider-container" id="filtered-products-list"></div>
                <button class="slider-btn next" onclick="scrollSlider('filtered-products-list', 1)">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            <div class="view-all-wrapper">
                <a href="all-products.html" class="btn-view-all" id="view-all-category">Xem tất cả</a>
            </div>
        `;

    if (categorySection && categorySection.parentElement) {
      const parentContainer = categorySection.parentElement;
      parentContainer.parentNode.insertBefore(
        newSection,
        parentContainer.nextSibling
      );
    }

    filteredSection = newSection;
  }

  // Cập nhật tiêu đề
  const titleElement = document.getElementById("filtered-category-title");
  const categoryNames = {
    "dang-mua": "Trái Cây Đang Mùa",
    cherry: "Cherry Nhập Khẩu",
    nho: "Nho Nhập Khẩu",
    tao: "Táo Nhập Khẩu",
    kiwi: "Kiwi",
    "viet-nam": "Trái Cây Việt Nam",
    "cat-san": "Trái Cây Cắt Sẵn",
    "do-uong": "Đồ Uống",
    "gift-card": "Gift Card",
  };

  if (titleElement) {
    titleElement.textContent = categoryNames[category] || "Tất Cả Sản Phẩm";
  }

  // Lọc sản phẩm
  const filteredProducts = allProducts.filter((p) => p.category === category);
  const filteredContainer = document.getElementById("filtered-products-list");

  if (filteredProducts.length === 0) {
    filteredContainer.innerHTML = `
            <p style="padding: 40px; text-align: center; color: #999; grid-column: 1/-1;">
                Chưa có sản phẩm trong danh mục này
            </p>
        `;
    return;
  }

  // Render sản phẩm
  filteredContainer.innerHTML = filteredProducts
    .map((p) => createProductCard(p))
    .join("");

  // Setup lazy loading cho ảnh mới
  setupLazyLoading();

  // Smooth scroll
  requestAnimationFrame(() => {
    filteredSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

/**
 * Tạo HTML cho product card - tái sử dụng code
 */
function createProductCard(product) {
  const hasSale = product.newPrice && product.oldPrice;
  const isGift = product.tags && product.tags.includes("gift");
  const isCutFruit = product.tags && product.tags.includes("cut-fruit");
  const isBestSeller = product.tags && product.tags.includes("best-seller");

  let priceHTML = "";
  if (hasSale) {
    priceHTML = `
            <span class="new-price">${product.newPrice}</span>
            <span class="old-price">${product.oldPrice}</span>
            ${
              product.discount
                ? `<span class="discount-badge">${product.discount}</span>`
                : ""
            }
        `;
  } else {
    priceHTML = `<span class="new-price">${
      product.price || product.newPrice
    }</span>`;
    if (isGift) {
      priceHTML += `<span class="gift-badge">🎁 GIFT</span>`;
    } else if (isCutFruit) {
      priceHTML += `<span class="fresh-badge">🌿 FRESH</span>`;
    } else if (isBestSeller) {
      priceHTML += `<span class="bestseller-badge">⭐ HOT</span>`;
    }
  }

  // Determine card class
  let cardClass = "";
  if (isGift) {
    cardClass = "gift-card";
  } else if (isCutFruit) {
    cardClass = "cut-fruit-card";
  } else if (isBestSeller) {
    cardClass = "best-seller-card";
  }

  // [MỚI] Tạo link
  const detailLink = `product-detail.html?id=${product.id}`;

  return `
        <div class="product-card ${cardClass}">
            <div class="product-img">
                <a href="${detailLink}">
                    <img src="${product.image}" alt="${product.name}">
                </a>
            </div>
            <div class="product-info">
                <div class="product-name">
                    <a href="${detailLink}" style="text-decoration: none; color: inherit;">
                        ${product.name}
                    </a>
                </div>
                <div class="product-price">
                    ${priceHTML}
                </div>
                <button class="btn-add-cart" onclick="addToCart(${product.id})">
                    ${
                      isGift
                        ? "🎁 "
                        : isCutFruit
                        ? "🥗 "
                        : isBestSeller
                        ? "⭐ "
                        : ""
                    }Thêm vào giỏ
                </button>
            </div>
        </div>
    `;
}

/**
 * Hiển thị sản phẩm vào từng khu vực
 */
function renderSection(products, tag, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const filteredItems = products
    .filter((p) => p.tags && p.tags.includes(tag))
    .slice(0, 10);

  if (filteredItems.length === 0) {
    container.innerHTML = `<p style="padding: 20px;">Đang cập nhật sản phẩm...</p>`;
    return;
  }

  container.innerHTML = filteredItems.map((p) => createProductCard(p)).join("");
}

/**
 * Logic điều khiển slider - Tối ưu
 */
const sliderEdgeState = {};

function scrollSlider(containerId, direction) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const card = container.querySelector(".product-card");
  if (!card) return;

  const gap = 20;
  const cardWidth = card.offsetWidth + gap;
  const maxScroll = container.scrollWidth - container.clientWidth;

  if (!sliderEdgeState[containerId]) {
    sliderEdgeState[containerId] = {
      atEnd: false,
      atStart: true,
    };
  }

  const state = sliderEdgeState[containerId];

  if (state.atEnd && direction === 1) {
    container.scrollTo({ left: 0, behavior: "smooth" });
    state.atEnd = false;
    state.atStart = true;
    return;
  }

  if (state.atStart && direction === -1) {
    container.scrollTo({ left: maxScroll, behavior: "smooth" });
    state.atStart = false;
    state.atEnd = true;
    return;
  }

  // Sử dụng requestAnimationFrame cho smooth scroll
  requestAnimationFrame(() => {
    container.scrollBy({
      left: direction * cardWidth,
      behavior: "smooth",
    });
  });

  // Check position sau khi scroll
  setTimeout(() => {
    const current = container.scrollLeft;
    state.atStart = current <= 10; // Thêm tolerance
    state.atEnd = current >= maxScroll - cardWidth - 10;
  }, 350);
}

/**
 * Thêm vào giỏ hàng
 */
/**
 * Add product to cart - Sử dụng CartManager
 */
function addToCart(productId, productName) {
  // Tìm sản phẩm để lấy ĐẦY ĐỦ thông tin
  const product = allProducts.find((p) => p.id === productId);

  if (!product) {
    console.error("Product not found:", productId);
    return;
  }

  // Lấy giá và ảnh từ product
  const price = product.newPrice || product.price || "0₫";
  const image = product.image || "img/placeholder.jpg";

  // Gọi CartManager với ĐẦY ĐỦ 4 tham số
  if (typeof CartManager !== "undefined") {
    CartManager.addToCart(productId, product.name, price, image);
  }
}

/**
 * Hiển thị notification (thay thế alert)
 */
// function showNotification(message) {
//     // Tạo hoặc lấy notification container
//     let notif = document.getElementById('cart-notification');

//     if (!notif) {
//         notif = document.createElement('div');
//         notif.id = 'cart-notification';
//         notif.style.cssText = `
//             position: fixed;
//             top: 80px;
//             right: 20px;
//             background: #4CAF50;
//             color: white;
//             padding: 16px 24px;
//             border-radius: 8px;
//             box-shadow: 0 4px 12px rgba(0,0,0,0.15);
//             z-index: 9999;
//             transform: translateX(400px);
//             transition: transform 0.3s ease;
//             max-width: 300px;
//         `;
//         document.body.appendChild(notif);
//     }

//     notif.textContent = message;

//     // Slide in
//     requestAnimationFrame(() => {
//         notif.style.transform = 'translateX(0)';
//     });

//     // Slide out sau 2.5s
//     setTimeout(() => {
//         notif.style.transform = 'translateX(400px)';
//     }, 2500);
// }

/**
 * Cập nhật giao diện giỏ hàng
 */
function updateCartUI() {
  const cartElement = document.querySelector(
    ".header-actions .item:last-child div"
  );
  if (cartElement) {
    cartElement.innerText = `Giỏ hàng (${cartCount})`;
  }
}
/* ==============================================
   LIVE SEARCH FUNCTION (Tìm kiếm hiển thị ngay)
   ============================================== */
document.addEventListener("DOMContentLoaded", () => {
  setupLiveSearch();
});

function setupLiveSearch() {
  const searchBox = document.querySelector(".search-box");
  const input = searchBox.querySelector("input");

  // 1. Tạo khung chứa kết quả (nếu chưa có)
  let resultsContainer = document.querySelector(".search-results");
  if (!resultsContainer) {
    resultsContainer = document.createElement("div");
    resultsContainer.className = "search-results";
    searchBox.appendChild(resultsContainer);
  }

  // 2. Bắt sự kiện khi gõ phím
  input.addEventListener("input", function (e) {
    const keyword = e.target.value.toLowerCase().trim();

    // Nếu xóa hết chữ thì ẩn bảng
    if (keyword.length < 1) {
      resultsContainer.classList.remove("active");
      return;
    }

    // Lọc sản phẩm từ mảng allProducts (đã load ở initApp)
    const matches = allProducts.filter((p) =>
      p.name.toLowerCase().includes(keyword)
    );

    // 3. Hiển thị kết quả
    if (matches.length > 0) {
      resultsContainer.innerHTML = matches
        .map(
          (p) => `
                <a href="product-detail.html?id=${p.id}" class="search-item">
                    <img src="${p.image}" alt="${p.name}">
                    <div class="search-item-info">
                        <span class="search-item-name">${p.name}</span>
                        <span class="search-item-price">${
                          p.newPrice || p.price
                        }</span>
                    </div>
                </a>
            `
        )
        .join("");
      resultsContainer.classList.add("active");
    } else {
      resultsContainer.innerHTML = `<div class="search-item" style="justify-content:center; color:#999;">Không tìm thấy sản phẩm</div>`;
      resultsContainer.classList.add("active");
    }
  });

  // 4. Ẩn bảng khi click ra ngoài
  document.addEventListener("click", function (e) {
    if (!searchBox.contains(e.target)) {
      resultsContainer.classList.remove("active");
    }
  });
}
