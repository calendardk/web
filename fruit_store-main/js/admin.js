let currentProducts = [];

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
});

// 1. Chức năng Toggle Sidebar
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("main-content");
  sidebar.classList.toggle("collapsed");
  mainContent.classList.toggle("expanded");
}

// 2. Load dữ liệu ra bảng
async function loadProducts() {
  try {
    if (currentProducts.length === 0) {
      const response = await fetch("products.json");
      const data = await response.json();
      currentProducts = data.products;
    }
    renderTable(currentProducts);
  } catch (error) {
    console.error("Lỗi load sản phẩm:", error);
  }
}

function renderTable(products) {
  const tbody = document.getElementById("product-table-body");
  tbody.innerHTML = "";

  products.forEach((p) => {
    const tr = document.createElement("tr");

    // Tạo badges cho tags
    let tagsHtml = "";
    if (p.tags) {
      if (p.tags.includes("flash-sale"))
        tagsHtml += '<span class="badge bg-red">Flash Sale</span> ';
      if (p.tags.includes("best-seller"))
        tagsHtml += '<span class="badge bg-orange">Best Seller</span>';
    }

    tr.innerHTML = `
            <td>${p.id}</td>
            <td><img src="${p.image}" class="img-preview"></td>
            <td>${p.name}</td>
            <td style="color: #d32f2f; font-weight: bold;">${
              p.newPrice || p.price
            }</td>
            <td>${p.category}</td>
            <td>${tagsHtml}</td>
            <td>
                <button onclick="openModal('edit', ${
                  p.id
                })" style="cursor:pointer; color: blue; border:none; background:none;"><i class="fas fa-edit"></i></button>
                <button onclick="deleteProduct(${
                  p.id
                })" style="cursor:pointer; color: red; border:none; background:none;"><i class="fas fa-trash"></i></button>
            </td>
        `;
    tbody.appendChild(tr);
  });
}

// 3. Xử lý Modal (Thêm/Sửa)
const modal = document.getElementById("productModal");

function openModal(mode, id = null) {
  modal.style.display = "block";
  const form = document.getElementById("productForm");

  if (mode === "add") {
    document.getElementById("modalTitle").innerText = "Thêm Sản Phẩm Mới";
    form.reset();
    document.getElementById("prodId").value = "";
  } else {
    document.getElementById("modalTitle").innerText = "Chỉnh Sửa Sản Phẩm";
    // Tìm sản phẩm để điền vào form
    const product = currentProducts.find((p) => p.id === id);
    if (product) {
      document.getElementById("prodId").value = product.id;
      document.getElementById("prodName").value = product.name;
      document.getElementById("prodCategory").value = product.category;
      document.getElementById("prodNewPrice").value =
        product.newPrice || product.price;
      document.getElementById("prodOldPrice").value = product.oldPrice || "";
      document.getElementById("prodImage").value = product.image;
      document.getElementById("prodOrigin").value = product.origin || "";

      // Check tags
      const tags = product.tags || [];
      document.getElementById("tagBest").checked = tags.includes("best-seller");
      document.getElementById("tagFlash").checked = tags.includes("flash-sale");
      document.getElementById("tagCut").checked = tags.includes("cut-fruit");
    }
  }
}

function closeModal() {
  modal.style.display = "none";
}

// Đóng modal khi click ra ngoài
window.onclick = function (event) {
  if (event.target == modal) {
    closeModal();
  }
};

// 4. Lưu sản phẩm (Giả lập)
function saveProduct(e) {
  e.preventDefault();

  const id = document.getElementById("prodId").value;
  const isEdit = id !== "";

  // Lấy tags
  let tags = [];
  if (document.getElementById("tagBest").checked) tags.push("best-seller");
  if (document.getElementById("tagFlash").checked) tags.push("flash-sale");
  if (document.getElementById("tagCut").checked) tags.push("cut-fruit");

  const newProduct = {
    id: isEdit ? parseInt(id) : Date.now(), // Nếu thêm mới thì tạo ID giả theo thời gian
    name: document.getElementById("prodName").value,
    category: document.getElementById("prodCategory").value,
    newPrice: document.getElementById("prodNewPrice").value,
    oldPrice: document.getElementById("prodOldPrice").value,
    image: document.getElementById("prodImage").value,
    origin: document.getElementById("prodOrigin").value,
    tags: tags,
  };

  if (isEdit) {
    // Cập nhật mảng
    const index = currentProducts.findIndex((p) => p.id == id);
    if (index !== -1) currentProducts[index] = newProduct;
    alert("Đã cập nhật sản phẩm thành công!");
  } else {
    // Thêm vào mảng
    currentProducts.unshift(newProduct); // Thêm lên đầu
    alert("Đã thêm sản phẩm mới!");
  }

  closeModal();
  renderTable(currentProducts);
}

function deleteProduct(id) {
  if (confirm("Đại ca có chắc muốn xóa món này không?")) {
    currentProducts = currentProducts.filter((p) => p.id !== id);
    renderTable(currentProducts);
  }
}
