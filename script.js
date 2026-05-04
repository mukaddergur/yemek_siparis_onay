let foods = [];
const cart = [];
const CATEGORY_LABELS = {
  ana_yemek: "Ana Yemekler",
  icecek: "Icecekler",
  tatli: "Tatlilar"
};
const CATEGORY_ORDER = ["ana_yemek", "icecek", "tatli"];
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80";
let activeCategory = "ana_yemek";
let activeFoodId = null;
let isCategorySelectionStep = true;

const foodListEl = document.getElementById("foodList");
const cartListEl = document.getElementById("cartList");
const cartTotalEl = document.getElementById("cartTotal");
const aiSuggestionBtn = document.getElementById("aiSuggestionBtn");
const aiSuggestionResult = document.getElementById("aiSuggestionResult");
const checkoutBtn = document.getElementById("checkoutBtn");
const orderConfirmationEl = document.getElementById("orderConfirmation");
const reviewForm = document.getElementById("reviewForm");
const foodSelectEl = document.getElementById("foodSelect");
const reviewsListEl = document.getElementById("reviewsList");

function renderFoods() {
  const groupedFoods = CATEGORY_ORDER.map((category) => ({
    category,
    items: foods.filter((food) => (food.category || "ana_yemek") === category)
  }));
  const firstNonEmptyCategory = groupedFoods.find((group) => group.items.length > 0)?.category || "ana_yemek";
  if (!groupedFoods.some((group) => group.category === activeCategory && group.items.length > 0)) {
    activeCategory = firstNonEmptyCategory;
  }

  const activeGroup = groupedFoods.find((group) => group.category === activeCategory) || {
    category: firstNonEmptyCategory,
    items: []
  };
  const activeFood = activeGroup.items.find((food) => food.id === activeFoodId);

  if (isCategorySelectionStep) {
    foodListEl.innerHTML = `
      <section class="category-entry-panel">
        <h3 class="menu-category-title">Once bir kategori secin</h3>
        <p class="category-entry-subtitle">Ana Yemekler, Icecekler veya Tatlilar arasindan secim yaparak devam edin.</p>
        <div class="category-entry-grid">
          ${groupedFoods
            .map(
              (group) => `
                <button class="category-card category-entry-card" onclick="goToCategory('${group.category}')">
                  <span class="category-card-title">${CATEGORY_LABELS[group.category] || "Diger Urunler"}</span>
                  <span class="category-card-count">${group.items.length} urun</span>
                </button>
              `
            )
            .join("")}
        </div>
      </section>
    `;
    return;
  }

  foodListEl.innerHTML = `
    <div class="menu-hub">
      <div class="category-cards">
        <button class="btn btn-accent category-home-btn" onclick="backToCategorySelection()">
          <span class="category-home-icon">←</span>
          <span>Kategori Secimine Don</span>
        </button>
        ${groupedFoods
          .map(
            (group) => `
            <button class="category-card ${group.category === activeCategory ? "is-active" : ""}" onclick="setActiveCategory('${group.category}')">
              <span class="category-card-title">${CATEGORY_LABELS[group.category] || "Diger Urunler"}</span>
              <span class="category-card-count">${group.items.length} urun</span>
            </button>
          `
          )
          .join("")}
      </div>

      <section class="selected-category-panel">
        ${
          activeFood
            ? `
              <button class="btn btn-accent detail-back-btn" onclick="closeFoodDetail()">Kategoriye Don</button>
              <article class="food-detail-card">
                <img src="${activeFood.image}" alt="${activeFood.name}" class="food-detail-image" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'">
                <div class="food-detail-content">
                  <h3 class="food-detail-title">${activeFood.name}</h3>
                  <p class="food-detail-desc">${activeFood.description}</p>
                  <div class="food-detail-stats">
                    <p><strong>Fiyat:</strong> ${activeFood.price} TL</p>
                    <p><strong>Tahmini Begeni:</strong> %${Math.min(99, Math.max(60, activeFood.popularity || 75))}</p>
                    <p><strong>Kategori:</strong> ${CATEGORY_LABELS[activeGroup.category] || "Diger Urunler"}</p>
                  </div>
                  <button class="btn btn-primary" onclick="addToCart(${activeFood.id})">Sepete Ekle</button>
                </div>
              </article>
            `
            : `
              <h3 class="menu-category-title">${CATEGORY_LABELS[activeGroup.category] || "Diger Urunler"}</h3>
              <div class="food-grid">
                ${activeGroup.items
                  .map(
                    (food) => `
                    <article class="food-card">
                      <img src="${food.image}" alt="${food.name}" class="food-image" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'">
                      <div class="food-content">
                        <h4 class="food-title">${food.name}</h4>
                        <p class="food-desc">${food.description}</p>
                        <div class="food-footer">
                          <span class="food-price">${food.price} TL</span>
                          <div class="food-actions">
                            <button class="btn btn-secondary" onclick="openFoodDetail(${food.id})">Incele</button>
                            <button class="btn btn-primary" onclick="addToCart(${food.id})">Sepete Ekle</button>
                          </div>
                        </div>
                      </div>
                    </article>
                  `
                  )
                  .join("")}
              </div>
            `
        }
      </section>
    </div>
  `;
}

function setActiveCategory(category) {
  activeCategory = category;
  activeFoodId = null;
  renderFoods();
}

function goToCategory(category) {
  activeCategory = category;
  activeFoodId = null;
  isCategorySelectionStep = false;
  renderFoods();
}

function backToCategorySelection() {
  activeFoodId = null;
  isCategorySelectionStep = true;
  renderFoods();
}

function openFoodDetail(foodId) {
  activeFoodId = foodId;
  renderFoods();
}

function closeFoodDetail() {
  activeFoodId = null;
  renderFoods();
}

function renderFoodSelect() {
  const groupedOptions = CATEGORY_ORDER.map((category) => {
    const items = foods.filter((food) => (food.category || "ana_yemek") === category);
    if (!items.length) {
      return "";
    }
    return `
      <optgroup label="${CATEGORY_LABELS[category] || "Diger Urunler"}">
        ${items.map((food) => `<option value="${food.id}">${food.name}</option>`).join("")}
      </optgroup>
    `;
  }).join("");

  foodSelectEl.innerHTML = groupedOptions;
}

function addToCart(foodId) {
  const selectedFood = foods.find((food) => food.id === foodId);
  if (!selectedFood) {
    return;
  }
  cart.push(selectedFood);
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  if (cart.length === 0) {
    cartListEl.innerHTML = "<li class='cart-item'>Sepetiniz su an bos.</li>";
  } else {
    cartListEl.innerHTML = cart
      .map(
        (item, index) => `
        <li class="cart-item">
          <span>${item.name}</span>
          <div>
            <strong>${item.price} TL</strong>
            <button class="btn btn-accent" onclick="removeFromCart(${index})">Sil</button>
          </div>
        </li>
      `
      )
      .join("");
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  cartTotalEl.textContent = `${total} TL`;
}

async function getAiSuggestion() {
  try {
    const response = await fetch("/api/suggestion");
    if (!response.ok) {
      throw new Error("Oneri alinamadi.");
    }
    const suggestion = await response.json();
    aiSuggestionResult.textContent = `Bugunun onerisi: ${suggestion.name} (${suggestion.price} TL)`;
  } catch (error) {
    aiSuggestionResult.textContent = "Su an oneride hata var, lutfen tekrar deneyin.";
  }
}

async function checkoutOrder() {
  if (cart.length === 0) {
    orderConfirmationEl.classList.remove("hidden");
    orderConfirmationEl.textContent = "Siparis vermek icin once sepete urun eklemelisiniz.";
    return;
  }

  const itemMap = new Map();
  for (const item of cart) {
    const existing = itemMap.get(item.id);
    itemMap.set(item.id, (existing || 0) + 1);
  }

  const payloadItems = [...itemMap.entries()].map(([foodId, quantity]) => ({
    foodId,
    quantity
  }));

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: payloadItems,
        orderNote: "Web uzerinden olusturuldu."
      })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Siparis hatasi");
    }

    orderConfirmationEl.classList.remove("hidden");
    orderConfirmationEl.textContent = `Siparisiniz onaylandi. Siparis No: #${data.orderId} - Toplam: ${data.totalAmount} TL`;
    cart.length = 0;
    renderCart();
  } catch (error) {
    orderConfirmationEl.classList.remove("hidden");
    orderConfirmationEl.textContent = "Siparis olusturulamadi. Lutfen tekrar deneyin.";
  }
}

function renderReviews(reviews) {
  if (reviews.length === 0) {
    reviewsListEl.innerHTML = "<p>Henuz yorum yok. Ilk yorumu siz birakin.</p>";
    return;
  }

  reviewsListEl.innerHTML = reviews
    .map(
      (review) => `
      <article class="review-item">
        <div class="review-meta">
          <span><strong>${review.foodName}</strong></span>
          <span>${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)} (${review.rating}/5)</span>
        </div>
        <p>${review.comment}</p>
      </article>
    `
    )
    .join("");
}

async function loadFoods() {
  const response = await fetch("/api/foods");
  if (!response.ok) {
    throw new Error("Yemekler yuklenemedi.");
  }
  foods = await response.json();
}

async function loadReviews() {
  const response = await fetch("/api/reviews");
  if (!response.ok) {
    throw new Error("Yorumlar yuklenemedi.");
  }
  const reviewData = await response.json();
  renderReviews(reviewData);
}

reviewForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const foodId = Number(foodSelectEl.value);
  const rating = Number(document.getElementById("rating").value);
  const comment = document.getElementById("comment").value.trim();
  const targetFood = foods.find((food) => food.id === foodId);

  if (!targetFood || rating < 1 || rating > 5 || !comment) {
    return;
  }

  try {
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        foodId: targetFood.id,
        rating,
        comment
      })
    });

    if (!response.ok) {
      throw new Error("Yorum gonderilemedi.");
    }

    reviewForm.reset();
    await loadReviews();
  } catch (error) {
    alert("Yorum kaydedilemedi. Lutfen tekrar deneyin.");
  }
});

aiSuggestionBtn.addEventListener("click", getAiSuggestion);
checkoutBtn.addEventListener("click", checkoutOrder);

async function initializePage() {
  try {
    await loadFoods();
    renderFoods();
    renderFoodSelect();
    renderCart();
    await loadReviews();
  } catch (error) {
    foodListEl.innerHTML = "<p>Veriler yuklenirken bir hata olustu.</p>";
  }
}

initializePage();
