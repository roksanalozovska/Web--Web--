const BASE_URL = 'https://dummyjson.com/products';

const categoriesListEl = document.getElementById('categories-list');
const productsGridEl = document.getElementById('products-grid');
const seeAllBtn = document.getElementById('see-all-btn');
const statusMessageEl = document.getElementById('status-message');
const currentViewEl = document.getElementById('current-view');

const detailsEl = document.getElementById('product-details');
const detailsBodyEl = document.getElementById('details-body');
const closeDetailsBtn = document.getElementById('close-details');

// отримання всіх товарів
async function fetchProducts() {
    showStatus('Завантаження всіх товарів...');
    try {
        const res = await fetch(`${BASE_URL}?limit=0`);
        if (!res.ok) {
            throw new Error(`Помилка HTTP: ${res.status}`);
        }
        const data = await res.json();

        renderProducts(data.products);
        currentViewEl.textContent = `Усі товари (${data.products.length})`;
        hideStatus();
    } catch (error) {
        console.error(error);
        showStatus('Не вдалося завантажити товари.');
    }
}

// отримання одного товару за ID
async function fetchProductById(id) {
    try {
        const res = await fetch(`${BASE_URL}/${id}`);
        if (!res.ok) {
            throw new Error(`Помилка HTTP: ${res.status}`);
        }
        const product = await res.json();

        detailsBodyEl.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}" class="details-img">
            <span class="product-category">${product.category} • ${product.brand || 'Без бренду'}</span>
            <h2 style="margin: 6px 0 10px;">${product.title}</h2>
            <p style="color: #475569; margin-bottom: 14px;">${product.description}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="product-price">$${product.price}</span>
                <span>На складі: <strong>${product.stock} шт.</strong> | Рейтинг: <strong>${product.rating}</strong></span>
            </div>
        `;
        detailsEl.classList.remove('hidden');
    } catch (error) {
        console.error(error);
    }
}

// отримання списку категорій
async function fetchCategories() {
    try {
        const res = await fetch(`${BASE_URL}/categories`);
        if (!res.ok) {
            throw new Error(`Помилка HTTP: ${res.status}`);
        }
        const categories = await res.json();

        renderCategories(categories);
    } catch (error) {
        console.error(error);
        categoriesListEl.innerHTML = '<li>Помилка завантаження категорій</li>';
    }
}

// отримання товарів певної категорії
async function fetchProductsByCategory(slug, name) {
    showStatus(`Завантаження категорії "${name}"...`);
    try {
        const res = await fetch(`${BASE_URL}/category/${slug}`);
        if (!res.ok) {
            throw new Error(`Помилка HTTP: ${res.status}`);
        }
        const data = await res.json();

        renderProducts(data.products);
        currentViewEl.textContent = `${name} (${data.products.length})`;
        hideStatus();
    } catch (error) {
        console.error(error);
        showStatus('Не вдалося завантажити товари цієї категорії.');
    }
}

// виведення списку категорій у DOM
function renderCategories(categories) {
    categoriesListEl.innerHTML = '';

    categories.forEach((category) => {
        const slug = typeof category === 'string' ? category : category.slug;
        const name = typeof category === 'string' ? category : category.name;

        const li = document.createElement('li');
        li.className = 'category-item';
        li.textContent = name;

        li.addEventListener('click', () => {
            setActiveCategory(li);
            fetchProductsByCategory(slug, name);
        });

        categoriesListEl.appendChild(li);
    });
}

// виведення карток товарів у DOM
function renderProducts(products) {
    productsGridEl.innerHTML = '';

    products.forEach((product) => {
        const card = document.createElement('article');
        card.className = 'product-card';

        card.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}" class="product-image" loading="lazy">
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">$${product.price}</span>
                    <span class="product-rating">★ ${product.rating}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            fetchProductById(product.id);
        });

        productsGridEl.appendChild(card);
    });
}

// підсвічування активної категорії або кнопки See all
function setActiveCategory(activeElement) {
    document.querySelectorAll('.category-item').forEach((item) => {
        item.classList.remove('active');
    });
    seeAllBtn.classList.remove('active');

    if (activeElement) {
        activeElement.classList.add('active');
    } else {
        seeAllBtn.classList.add('active');
    }
}

function showStatus(text) {
    statusMessageEl.textContent = text;
    statusMessageEl.classList.remove('hidden');
}

function hideStatus() {
    statusMessageEl.classList.add('hidden');
}

// обробник кнопки See all products
seeAllBtn.addEventListener('click', () => {
    setActiveCategory(null);
    fetchProducts();
});

// закриття вікна з деталями товару
closeDetailsBtn.addEventListener('click', () => {
    detailsEl.classList.add('hidden');
});

detailsEl.addEventListener('click', (event) => {
    if (event.target === detailsEl) {
        detailsEl.classList.add('hidden');
    }
});

// запуск при завантаженні сторінки
fetchCategories();
fetchProducts();