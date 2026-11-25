// Завантаження списку товарів із localStorage або файлу products.json
async function loadProductsData() {
    let saved = localStorage.getItem("electro_products");
    if (saved) {
        return JSON.parse(saved);
    }

    const response = await fetch("products.json");
    const data = await response.json();
    localStorage.setItem("electro_products", JSON.stringify(data));
    return data;
}

// Збереження оновленого масиву товарів у localStorage
function saveProductsData(products) {
    localStorage.setItem("electro_products", JSON.stringify(products));
}

// КОНТРОЛЬ ДОСТУПУ ТА НАВІГАЦІЯ
// Перевірка прав доступу користувача до закритих сторінок
function checkAccess() {
    let role = localStorage.getItem("electro_user_role"); // "user", "admin" або null

    // Обмеження доступу до каталогу та сторінки товару для неавторизованих користувачів
    if (document.getElementById("catalog-container") || document.getElementById("product-detail-container")) {
        if (!role) {
            alert("Перегляд каталогу доступний лише зареєстрованим користувачам! Будь ласка, увійдіть або зареєструйтеся.");
            window.location.href = "auth.html";
            return false;
        }
    }

    // Відображення форми входу або робочої панелі в розділі адміністратора
    if (document.getElementById("admin-products-body")) {
        let loginBox = document.getElementById("admin-login-box");
        let panelContent = document.getElementById("admin-panel-content");

        if (role === "admin") {
            loginBox.style.display = "none";
            panelContent.style.display = "flex";
            return true;
        } else {
            loginBox.style.display = "block";
            panelContent.style.display = "none";
            return false;
        }
    }

    return true;
}

// Оновлення кнопки входу або виходу у верхньому меню
function updateAuthMenu() {
    const navAuth = document.querySelector(".nav-auth");
    if (!navAuth) return;

    const role = localStorage.getItem("electro_user_role");

    if (role === "user" || role === "admin") {
        navAuth.innerHTML = '<a href="index.html" onclick="logoutUser(); return false;">Вийти</a>';
    } else {
        navAuth.innerHTML = '<a href="auth.html">Вхід / Реєстрація</a>';
    }
}

// Вихід користувача з системи та очищення даних у localStorage
function logoutUser() {
    localStorage.removeItem("electro_user_role");
    window.location.href = "index.html";
}

// Перемикання між формами входу та реєстрації
function switchAuthMode(mode) {
    let loginBlock = document.getElementById("login-block");
    let registerBlock = document.getElementById("register-block");
    if (!loginBlock || !registerBlock) return;

    if (mode === "register") {
        loginBlock.style.display = "none";
        registerBlock.style.display = "block";
    } else {
        loginBlock.style.display = "block";
        registerBlock.style.display = "none";
    }
}

// СЛАЙДЕР НА ГОЛОВНІЙ СТОРІНЦІ

var slideIndex = 1;

function plusSlide() {
    showSlides(slideIndex += 1);
}

function minusSlide() {
    showSlides(slideIndex -= 1);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

// Відображення слайдів
function showSlides(n) {
    let slides = document.getElementsByClassName("item");
    let dots = document.getElementsByClassName("slider-dots_item");
    if (slides.length === 0) return;

    if (n > slides.length) { slideIndex = 1; }
    if (n < 1) { slideIndex = slides.length; }

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
}

// ВАЛІДАЦІЯ АВТОРИЗАЦІЇ ТА РЕЄСТРАЦІЇ

// Перевірка форми входу покупця
function validateLogin() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (email == "") {
        alert("Поле Email має бути заповнене");
        return false;
    }
    if (!email.match(emailRegex)) {
        alert("Будь ласка, введіть коректну адресу електронної пошти");
        return false;
    }
    if (password == "") {
        alert("Поле Пароль має бути заповнене");
        return false;
    }

    localStorage.setItem("electro_user_role", "user");
    alert("Вхід до каталогу магазину ElectroMarket виконано успішно!");
    window.location.href = "catalog.html";
    return false;
}

// Перевірка форми реєстрації нового покупця
function validateRegister() {
    let name = document.getElementById("reg_name").value;
    let email = document.getElementById("reg_email").value;
    let phone = document.getElementById("reg_phone").value;
    let password1 = document.getElementById("reg_password1").value;
    let password2 = document.getElementById("reg_password2").value;
    let emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (name == "") {
        alert("Поле Ім'я та прізвище має бути заповнене");
        return false;
    }
    if (email == "") {
        alert("Поле Email має бути заповнене");
        return false;
    }
    if (!email.match(emailRegex)) {
        alert("Будь ласка, введіть коректну адресу електронної пошти");
        return false;
    }
    if (phone == "") {
        alert("Поле Номер телефону має бути заповнене");
        return false;
    }
    if (password1 == "") {
        alert("Поле Пароль має бути заповнене");
        return false;
    }
    if (password1 != password2) {
        alert("Паролі не співпадають!");
        return false;
    }

    localStorage.setItem("electro_user_role", "user");
    alert("Реєстрація покупця в магазині ElectroMarket успішна!");
    window.location.href = "catalog.html";
    return false;
}

// Перевірка облікових даних адміністратора
function validateAdminLogin() {
    let email = document.getElementById("admin-login-email").value;
    let password = document.getElementById("admin-login-password").value;
    let emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (email == "") {
        alert("Введіть Email адміністратора!");
        return false;
    }
    if (!email.match(emailRegex)) {
        alert("Будь ласка, введіть коректну адресу електронної пошти");
        return false;
    }
    if (password == "") {
        alert("Введіть пароль адміністратора!");
        return false;
    }
    if (email !== "admin@electro.ua" || password !== "admin123") {
        alert("Невірний логін або пароль адміністратора. Перевірте введені дані.");
        return false;
    }

    localStorage.setItem("electro_user_role", "admin");
    alert("Вхід до адмінпанелі ElectroMarket виконано успішно!");
    location.reload();
    return false;
}

// КАТАЛОГ ТОВАРІВ ТА КОШИК

// Клас моделі окремого товару
class Product {
    constructor(item) {
        this.id = item.id;
        this.name = item.name;
        this.category = item.category;
        this.manufacturer = item.manufacturer;
        this.price = item.price;
        this.amount = item.amount;
        this.image = item.image;
        this.specs = item.specs;
        this.description = item.description;
    }

    addToBasket() {
        console.log(`Product with name ${this.name} has been added to the basket`);
    }
}

// Клас кошика покупця з підрахунком суми та часу додавання
class Basket {
    constructor() {
        this.products = [];
    }

    add(product) {
        let now = new Date();
        let timeString = now.toLocaleTimeString();

        this.products.push({
            product: { ...product },
            addedTime: timeString
        });

        product.addToBasket();
        this.renderBasket();
    }

    renderBasket() {
        let basketList = document.getElementById("basket-list");
        let basketCount = document.getElementById("basket-count");
        let basketTotal = document.getElementById("basket-total-sum");
        if (!basketList) return;

        basketList.innerHTML = "";
        let totalSum = 0;

        if (this.products.length === 0) {
            basketList.innerHTML = "<p style='color:#64748b; text-align:center; padding:15px 0;'>Кошик порожній.</p>";
            basketCount.innerHTML = "0";
            basketTotal.innerHTML = "0 грн";
            return;
        }

        for (let i = 0; i < this.products.length; i++) {
            let item = this.products[i];
            totalSum += Number(item.product.price);
            basketList.innerHTML += `
                <div class="basket-item">
                    <div>
                        <strong>${i + 1}. ${item.product.name}</strong><br>
                        <small>${item.product.price} грн</small>
                    </div>
                    <div class="basket-time">Додано: ${item.addedTime}</div>
                </div>
            `;
        }

        basketCount.innerHTML = this.products.length;
        basketTotal.innerHTML = totalSum + " грн";
    }
}

// Клас керування каталогом, пошуком та фільтрацією товарів
class Store {
    constructor() {
        this.products = [];
        this.basket = new Basket();
    }

    fillStoreWithProducts(data) {
        this.products = [];
        for (let i = 0; i < data.length; i++) {
            this.products.push(new Product(data[i]));
        }
        this.populateManufacturers();
        this.renderStore();
    }

    // Заповнення списку виробників у фільтрі на сторінці каталогу
    populateManufacturers() {
        let select = document.getElementById("filter-manufacturer");
        if (!select) return;

        let brands = [];
        for (let i = 0; i < this.products.length; i++) {
            if (!brands.includes(this.products[i].manufacturer)) {
                brands.push(this.products[i].manufacturer);
            }
        }

        select.innerHTML = '<option value="all">Усі виробники</option>';
        for (let i = 0; i < brands.length; i++) {
            select.innerHTML += `<option value="${brands[i]}">${brands[i]}</option>`;
        }
    }

    // Додавання товару в кошик зі зменшенням залишку на складі
    addProductToBasket(id) {
        let selectedProduct = this.products.find(p => p.id === id);
        if (!selectedProduct) return;

        if (selectedProduct.amount > 0) {
            selectedProduct.amount -= 1;
            this.basket.add(selectedProduct);
            saveProductsData(this.products);
            this.renderStore();
        } else {
            alert(`Товар «${selectedProduct.name}» закінчився на складі!`);
        }
    }

    // Відображення карток товарів з урахуванням пошуку та вибраних фільтрів
    renderStore() {
        let catalogContainer = document.getElementById("catalog-container");
        if (!catalogContainer) return;

        let searchText = document.getElementById("search-input").value.toLowerCase();
        let selectedCategory = document.getElementById("filter-category").value;
        let selectedBrand = document.getElementById("filter-manufacturer").value;

        catalogContainer.innerHTML = "";
        let foundCount = 0;

        for (let i = 0; i < this.products.length; i++) {
            let p = this.products[i];

            let matchesSearch = p.name.toLowerCase().includes(searchText);
            let matchesCat = (selectedCategory === "all" || p.category === selectedCategory);
            let matchesBrand = (selectedBrand === "all" || p.manufacturer === selectedBrand);

            if (matchesSearch && matchesCat && matchesBrand) {
                foundCount++;
                let disabledAttr = p.amount === 0 ? "disabled" : "";
                let btnText = p.amount === 0 ? "Немає в наявності" : "Додати у кошик";

                catalogContainer.innerHTML += `
                    <div class="product-card">
                        <div>
                            <span class="badge">${p.category}</span>
                            <img src="${p.image}" alt="${p.name}">
                            <h3>${p.name}</h3>
                            <p class="product-meta">Виробник: <strong>${p.manufacturer}</strong></p>
                            <p class="product-meta">В наявності: <strong>${p.amount} шт.</strong></p>
                            <div class="product-price">${p.price} грн</div>
                        </div>
                        <div class="card-actions">
                            <a href="product.html?id=${p.id}" class="btn btn-amber">Детальніше</a>
                            <button class="btn" onclick="store.addProductToBasket(${p.id})" ${disabledAttr}>${btnText}</button>
                        </div>
                    </div>
                `;
            }
        }

        if (foundCount === 0) {
            catalogContainer.innerHTML = "<p>За вашим запитом товарів не знайдено.</p>";
        }
    }
}

const store = new Store();

// ДЕТАЛЬНА ІНФОРМАЦІЯ ПРО ТОВАР

// Виведення характеристик вибраного товару
async function renderProductDetail() {
    let container = document.getElementById("product-detail-container");
    if (!container) return;

    let params = new URLSearchParams(window.location.search);
    let id = Number(params.get("id")) || 1;
    let products = await loadProductsData();
    let item = products.find(p => p.id === id) || products[0];

    container.innerHTML = `
        <div class="product-detail-box">
            <img src="${item.image}" alt="${item.name}" class="detail-img">
            <div class="detail-info">
                <span class="badge">${item.category}</span>
                <h2>${item.name}</h2>
                <p style="font-size:15px; color:#334155;">${item.description}</p>
                <table class="specs-table">
                    <tr><td>Артикул товару:</td><td>EL-00${item.id}</td></tr>
                    <tr><td>Виробник:</td><td>${item.manufacturer}</td></tr>
                    <tr><td>Категорія:</td><td>${item.category}</td></tr>
                    <tr><td>Технічні характеристики:</td><td>${item.specs}</td></tr>
                    <tr><td>Залишок на складі:</td><td>${item.amount} шт.</td></tr>
                </table>
                <div class="product-price" style="font-size:24px; margin-bottom:18px;">Ціна: ${item.price} грн</div>
                <a href="catalog.html" class="btn">← Повернутися до каталогу</a>
            </div>
        </div>
    `;
}

// ІНТЕРФЕЙС АДМІНІСТРАТОРА

// Формування таблиці товарів у панелі адміністратора
async function renderAdminTable() {
    let tbody = document.getElementById("admin-products-body");
    if (!tbody) return;

    let products = await loadProductsData();
    tbody.innerHTML = "";

    for (let i = 0; i < products.length; i++) {
        let p = products[i];
        tbody.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td><img src="${p.image}" alt="${p.name}"></td>
                <td><strong>${p.name}</strong></td>
                <td>${p.category}</td>
                <td>${p.manufacturer}</td>
                <td>${p.price} грн</td>
                <td>${p.amount} шт.</td>
                <td>
                    <button class="btn btn-amber" style="padding:5px 10px; font-size:12px;" onclick="editProduct(${p.id})">Редагувати</button>
                    <button class="btn btn-danger" style="padding:5px 10px; font-size:12px;" onclick="deleteProduct(${p.id})">Видалити</button>
                </td>
            </tr>
        `;
    }
}

// Додавання нового товару або збереження змін після редагування
async function saveAdminProduct() {
    let editId = document.getElementById("admin-id").value;
    let name = document.getElementById("admin-name").value;
    let category = document.getElementById("admin-category").value;
    let manufacturer = document.getElementById("admin-manufacturer").value;
    let price = document.getElementById("admin-price").value;
    let amount = document.getElementById("admin-amount").value;
    let image = document.getElementById("admin-image").value;
    let specs = document.getElementById("admin-specs").value;
    let desc = document.getElementById("admin-desc").value;

    if (name == "" || manufacturer == "" || price == "" || amount == "" || image == "") {
        alert("Заповніть усі обов'язкові поля товару!");
        return false;
    }
    if (Number(price) <= 0 || Number(amount) < 0) {
        alert("Ціна має бути більшою за 0, а кількість не може бути від'ємною!");
        return false;
    }

    let products = await loadProductsData();

    if (editId !== "") {
        let index = products.findIndex(p => p.id === Number(editId));
        if (index !== -1) {
            products[index] = {
                id: Number(editId),
                name: name,
                category: category,
                manufacturer: manufacturer,
                price: Number(price),
                amount: Number(amount),
                image: image,
                specs: specs || "Стандартні характеристики",
                description: desc || "Опис товару онлайн-каталогу ElectroMarket."
            };
        }
        alert("Дані товару оновлено!");
    } else {
        let newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push({
            id: newId,
            name: name,
            category: category,
            manufacturer: manufacturer,
            price: Number(price),
            amount: Number(amount),
            image: image,
            specs: specs || "Стандартні характеристики",
            description: desc || "Опис товару онлайн-каталогу ElectroMarket."
        });
        alert("Новий товар успішно додано до каталогу!");
    }

    saveProductsData(products);
    resetAdminForm();
    renderAdminTable();
    return false;
}

// Заповнення форми даними вибраного товару для редагування
async function editProduct(id) {
    let products = await loadProductsData();
    let p = products.find(item => item.id === id);
    if (!p) return;

    document.getElementById("admin-form-title").innerHTML = "Редагування товару #" + p.id;
    document.getElementById("admin-id").value = p.id;
    document.getElementById("admin-name").value = p.name;
    document.getElementById("admin-category").value = p.category;
    document.getElementById("admin-manufacturer").value = p.manufacturer;
    document.getElementById("admin-price").value = p.price;
    document.getElementById("admin-amount").value = p.amount;
    document.getElementById("admin-image").value = p.image;
    document.getElementById("admin-specs").value = p.specs;
    document.getElementById("admin-desc").value = p.description;
}

// Видалення товару з каталогу
async function deleteProduct(id) {
    if (!confirm("Ви дійсно бажаєте видалити цей товар?")) return;

    let products = await loadProductsData();
    products = products.filter(item => item.id !== id);
    saveProductsData(products);
    renderAdminTable();
}

// Очищення форми адміністрування
function resetAdminForm() {
    document.getElementById("admin-form-title").innerHTML = "Додати товар";
    document.getElementById("admin-id").value = "";
    document.getElementById("admin-product-form").reset();
}

// Скидання змін та відновлення початкового списку товарів із JSON
function resetDefaultDatabase() {
    localStorage.removeItem("electro_products");
    alert("Дані відновлено з файлу products.json!");
    location.reload();
}

// ІНІЦІАЛІЗАЦІЯ ПРИ ЗАВАНТАЖЕННІ СТОРІНКИ

window.onload = async function () {
    updateAuthMenu();
    if (!checkAccess()) return;

    showSlides(slideIndex);

    if (document.getElementById("catalog-container")) {
        let data = await loadProductsData();
        store.fillStoreWithProducts(data);
    }

    if (document.getElementById("product-detail-container")) {
        renderProductDetail();
    }

    if (document.getElementById("admin-products-body")) {
        renderAdminTable();
    }
};