// ЗАВАНТАЖЕННЯ ТА ЗБЕРЕЖЕННЯ ДАНИХ JSON ЗАСОБАМИ JQUERY

// Завантаження списку товарів із localStorage або через $.getJSON("products.json")
function loadProductsData(callback) {
    let saved = localStorage.getItem("electro_products");
    if (saved) {
        callback(JSON.parse(saved));
        return;
    }

    $.getJSON("products.json", function (data) {
        localStorage.setItem("electro_products", JSON.stringify(data));
        callback(data);
    }).fail(function () {
        alert("Помилка завантаження файлу products.json. Запустіть сайт через Live Server!");
    });
}

// Збереження оновленого масиву товарів у localStorage
function saveProductsData(products) {
    localStorage.setItem("electro_products", JSON.stringify(products));
}

// КОНТРОЛЬ ДОСТУПУ ТА НАВІГАЦІЯ

function checkAccess() {
    let role = localStorage.getItem("electro_user_role"); // "user", "admin" або null

    // Обмеження доступу до каталогу та сторінки товару для неавторизованих користувачів
    if ($("#catalog-container").length || $("#product-detail-container").length) {
        if (!role) {
            alert("Перегляд каталогу доступний лише зареєстрованим користувачам! Будь ласка, увійдіть або зареєструйтеся.");
            window.location.href = "auth.html";
            return false;
        }
    }

    // Відображення форми входу або робочої панелі в розділі адміністратора
    if ($("#admin-products-body").length) {
        if (role === "admin") {
            $("#admin-login-box").hide();
            $("#admin-panel-content").css("display", "flex").hide().fadeIn(300);
            return true;
        } else {
            $("#admin-login-box").show();
            $("#admin-panel-content").hide();
            return false;
        }
    }

    return true;
}

// Оновлення кнопки входу або виходу у верхньому меню через jQuery
function updateAuthMenu() {
    const $navAuth = $(".nav-auth");
    if (!$navAuth.length) return;

    const role = localStorage.getItem("electro_user_role");

    if (role === "user" || role === "admin") {
        $navAuth.html('<a href="#" id="logout-link">Вийти</a>');
    } else {
        $navAuth.html('<a href="auth.html">Вхід / Реєстрація</a>');
    }
}

// СЛАЙДЕР НА ГОЛОВНІЙ СТОРІНЦІ (з ефектами fadeOut / fadeIn)

let slideIndex = 1;

function showSlides(n) {
    let $slides = $(".slider .item");
    let $dots = $(".slider-dots_item");
    if ($slides.length === 0) return;

    if (n > $slides.length) { slideIndex = 1; }
    if (n < 1) { slideIndex = $slides.length; }

    $slides.hide();
    $dots.removeClass("active");

    $slides.eq(slideIndex - 1).fadeIn(350);
    $dots.eq(slideIndex - 1).addClass("active");
}

// КЛАСИ КАТАЛОГУ ТА КОШИКА НА БАЗІ JQUERY

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
        console.log(`Товар «${this.name}» додано до кошика`);
    }
}

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
        let $basketList = $("#basket-list");
        let $basketCount = $("#basket-count");
        let $basketTotal = $("#basket-total-sum");
        if (!$basketList.length) return;

        $basketList.empty();
        let totalSum = 0;

        if (this.products.length === 0) {
            $basketList.html("<p style='color:#64748b; text-align:center; padding:15px 0;'>Кошик порожній.</p>");
            $basketCount.text("0");
            $basketTotal.text("0 грн");
            return;
        }

        $.each(this.products, function (i, item) {
            totalSum += Number(item.product.price);
            let $row = $(`
                <div class="basket-item" style="display:none;">
                    <div>
                        <strong>${i + 1}. ${item.product.name}</strong><br>
                        <small>${item.product.price} грн</small>
                    </div>
                    <div class="basket-time">Додано: ${item.addedTime}</div>
                </div>
            `);
            $basketList.append($row);
            $row.fadeIn(250);
        });

        $basketCount.text(this.products.length);
        $basketTotal.text(totalSum + " грн");
    }
}

class Store {
    constructor() {
        this.products = [];
        this.basket = new Basket();
    }

    fillStoreWithProducts(data) {
        this.products = [];
        $.each(data, (i, item) => {
            this.products.push(new Product(item));
        });
        this.populateManufacturers();
        this.renderStore();
    }

    // Динамічне заповнення списку виробників через .empty() та .append()
    populateManufacturers() {
        let $select = $("#filter-manufacturer");
        if (!$select.length) return;

        let brands = [];
        $.each(this.products, function (i, p) {
            if (!brands.includes(p.manufacturer)) {
                brands.push(p.manufacturer);
            }
        });

        $select.empty();
        $select.append('<option value="all">Усі виробники</option>');
        $.each(brands, function (i, brand) {
            $select.append(`<option value="${brand}">${brand}</option>`);
        });
    }

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

    // Пошук, фільтрація та рендеринг карток у DOM засобами jQuery
    renderStore() {
        let $catalogContainer = $("#catalog-container");
        if (!$catalogContainer.length) return;

        let searchText = $("#search-input").val().toLowerCase().trim();
        let selectedCategory = $("#filter-category").val();
        let selectedBrand = $("#filter-manufacturer").val();

        $catalogContainer.empty();
        let foundCount = 0;

        $.each(this.products, function (i, p) {
            let matchesSearch = p.name.toLowerCase().includes(searchText) ||
                                p.manufacturer.toLowerCase().includes(searchText);
            let matchesCat = (selectedCategory === "all" || p.category === selectedCategory);
            let matchesBrand = (selectedBrand === "all" || p.manufacturer === selectedBrand);

            if (matchesSearch && matchesCat && matchesBrand) {
                foundCount++;
                let disabledAttr = p.amount === 0 ? "disabled" : "";
                let btnText = p.amount === 0 ? "Немає в наявності" : "Додати у кошик";

                let $card = $(`
                    <div class="product-card" style="display:none;">
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
                            <button type="button" class="btn add-to-basket-btn" data-id="${p.id}" ${disabledAttr}>${btnText}</button>
                        </div>
                    </div>
                `);

                $catalogContainer.append($card);
                $card.fadeIn(200);
            }
        });

        $("#catalog-stats").text(`Знайдено товарів: ${foundCount}`);

        if (foundCount === 0) {
            $catalogContainer.html("<p>За вашим запитом товарів не знайдено.</p>");
        }
    }
}

const store = new Store();

// ДЕТАЛЬНА ІНФОРМАЦІЯ ПРО ТОВАР

function renderProductDetail() {
    let $container = $("#product-detail-container");
    if (!$container.length) return;

    let params = new URLSearchParams(window.location.search);
    let id = Number(params.get("id")) || 1;

    loadProductsData(function (products) {
        let item = products.find(p => p.id === id) || products[0];

        let $box = $(`
            <div class="product-detail-box" style="display:none;">
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
        `);

        $container.empty().append($box);
        $box.fadeIn(300);
        // Виділення парних рядків таблиці характеристик за допомогою jQuery селектора tr:even
        $(".specs-table tr:even").addClass("even-row");
    });
}

// ІНТЕРФЕЙС АДМІНІСТРАТОРА

function renderAdminTable() {
    let $tbody = $("#admin-products-body");
    if (!$tbody.length) return;

    loadProductsData(function (products) {
        $tbody.empty();

        $.each(products, function (i, p) {
            $tbody.append(`
                <tr>
                    <td>${p.id}</td>
                    <td><img src="${p.image}" alt="${p.name}"></td>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.category}</td>
                    <td>${p.manufacturer}</td>
                    <td>${p.price} грн</td>
                    <td>${p.amount} шт.</td>
                    <td>
                        <button type="button" class="btn btn-amber admin-edit-btn" data-id="${p.id}" style="padding:5px 10px; font-size:12px;">Редагувати</button>
                        <button type="button" class="btn btn-danger admin-delete-btn" data-id="${p.id}" style="padding:5px 10px; font-size:12px;">Видалити</button>
                    </td>
                </tr>
            `);
        });

        // Стилізація парних рядків таблиці (як у прикладі з лекції 7.6.2)
        $("#admin-products-body tr:even").addClass("even-row");
    });
}

function resetAdminForm() {
    $("#admin-form-title").text("Додати товар");
    $("#admin-id").val("");
    $("#admin-product-form")[0].reset();
}

// ГОЛОВНИЙ БЛОК ІНІЦІАЛІЗАЦІЇ ТА ОБРОБКИ ПОДІЙ JQUERY

$(document).ready(function () {
    updateAuthMenu();
    if (!checkAccess()) return;

    // 1. Вихід із системи (делегування події кліку)
    $(document).on("click", "#logout-link", function (e) {
        e.preventDefault();
        localStorage.removeItem("electro_user_role");
        window.location.href = "index.html";
    });

    // 2. Підсвічування полів введення при фокусі (focus / blur з лекції 7.6.3)
    $("input[type='text'], input[type='password'], input[type='number'], select, textarea")
        .focus(function () {
            $(this).addClass("input-focused");
        })
        .blur(function () {
            $(this).removeClass("input-focused");
        });

    // 3. Слайдер та інтерактивні картки категорій на головній сторінці
    if ($(".slider").length) {
        showSlides(slideIndex);

        $(".slider .next").click(function () {
            showSlides(slideIndex += 1);
        });

        $(".slider .prev").click(function () {
            showSlides(slideIndex -= 1);
        });

        $(".slider-dots_item").click(function () {
            let n = Number($(this).attr("data-slide"));
            showSlides(slideIndex = n);
        });
    }

    // Клік по картці категорії на головній: перемикання класу та slideToggle опису
    $(".feature-card").click(function () {
        $(this).toggleClass("card-highlighted");
        $(this).find(".card-extra-info").slideToggle(250);
    });

    // Наведення миші на картки товарів та категорій (mouseenter / mouseleave)
    $(document).on("mouseenter", ".product-card", function () {
        $(this).addClass("card-highlighted");
    }).on("mouseleave", ".product-card", function () {
        $(this).removeClass("card-highlighted");
    });

    // 4. Акордеон на сторінці "Про нас" (slideToggle)
    $(".accordion-toggle").click(function () {
        $(this).next(".accordion-body").slideToggle(300);
    });

    // 5. Каталог товарів: завантаження JSON, живий пошук, фільтрація, кошик
    if ($("#catalog-container").length) {
        loadProductsData(function (data) {
            store.fillStoreWithProducts(data);
        });

        // Події пошуку та фільтрації
        $("#search-input").on("input", function () {
            store.renderStore();
        });

        $("#filter-category, #filter-manufacturer").on("change", function () {
            store.renderStore();
        });

        // Кнопка скидання фільтрів
        $("#reset-filters-btn").click(function () {
            $("#search-input").val("");
            $("#filter-category").val("all");
            $("#filter-manufacturer").val("all");
            store.renderStore();
        });

        // Згортання/розгортання панелі фільтрів (slideToggle)
        $("#toggle-filters-btn").click(function () {
            $("#filter-panel").slideToggle(250);
        });

        // Додавання товару до кошика (делегування події для динамічних кнопок)
        $(document).on("click", ".add-to-basket-btn", function () {
            let productId = Number($(this).attr("data-id"));
            store.addProductToBasket(productId);
        });

        // Оформлення замовлення
        $("#checkout-btn").click(function () {
            if (store.basket.products.length === 0) {
                alert("Спочатку додайте товари до кошика!");
                return;
            }
            alert("Замовлення сформовано та передано на склад!");
            store.basket.products = [];
            store.basket.renderBasket();
        });
    }

    // 6. Сторінка детального опису товару
    if ($("#product-detail-container").length) {
        renderProductDetail();
    }

    // 7. Авторизація та реєстрація покупця (fadeOut / fadeIn)
    $("#show-register-link").click(function (e) {
        e.preventDefault();
        $("#login-block").fadeOut(200, function () {
            $("#register-block").fadeIn(250);
        });
    });

    $("#show-login-link").click(function (e) {
        e.preventDefault();
        $("#register-block").fadeOut(200, function () {
            $("#login-block").fadeIn(250);
        });
    });

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    $("#login-form").submit(function (e) {
        e.preventDefault();
        let email = $("#email").val().trim();
        let password = $("#password").val().trim();

        if (!email) {
            alert("Поле Email має бути заповнене");
            return;
        }
        if (!email.match(emailRegex)) {
            alert("Будь ласка, введіть коректну адресу електронної пошти");
            return;
        }
        if (!password) {
            alert("Поле Пароль має бути заповнене");
            return;
        }

        localStorage.setItem("electro_user_role", "user");
        alert("Вхід до каталогу магазину ElectroMarket виконано успішно!");
        window.location.href = "catalog.html";
    });

    $("#register-form").submit(function (e) {
        e.preventDefault();
        let name = $("#reg_name").val().trim();
        let email = $("#reg_email").val().trim();
        let phone = $("#reg_phone").val().trim();
        let password1 = $("#reg_password1").val();
        let password2 = $("#reg_password2").val();

        if (!name || !email || !phone || !password1) {
            alert("Будь ласка, заповніть усі поля форми реєстрації!");
            return;
        }
        if (!email.match(emailRegex)) {
            alert("Будь ласка, введіть коректну адресу електронної пошти");
            return;
        }
        if (password1 !== password2) {
            alert("Паролі не співпадають!");
            return;
        }

        localStorage.setItem("electro_user_role", "user");
        alert("Реєстрація покупця в магазині ElectroMarket успішна!");
        window.location.href = "catalog.html";
    });

    // 8. Адмін-панель (вхід, CRUD-операції з товарами через jQuery)
    $("#admin-login-form").submit(function (e) {
        e.preventDefault();
        let email = $("#admin-login-email").val().trim();
        let password = $("#admin-login-password").val().trim();

        if (email !== "admin@electro.ua" || password !== "admin123") {
            alert("Невірний логін або пароль адміністратора. Перевірте введені дані.");
            return;
        }

        localStorage.setItem("electro_user_role", "admin");
        alert("Вхід до адмінпанелі ElectroMarket виконано успішно!");
        location.reload();
    });

    if ($("#admin-products-body").length) {
        renderAdminTable();

        $("#admin-product-form").submit(function (e) {
            e.preventDefault();
            let editId = $("#admin-id").val();
            let name = $("#admin-name").val().trim();
            let category = $("#admin-category").val();
            let manufacturer = $("#admin-manufacturer").val().trim();
            let price = Number($("#admin-price").val());
            let amount = Number($("#admin-amount").val());
            let image = $("#admin-image").val().trim();
            let specs = $("#admin-specs").val().trim();
            let desc = $("#admin-desc").val().trim();

            if (!name || !manufacturer || !image || price <= 0 || amount < 0) {
                alert("Перевірте правильність заповнення всіх обов'язкових полів!");
                return;
            }

            loadProductsData(function (products) {
                if (editId !== "") {
                    let index = products.findIndex(p => p.id === Number(editId));
                    if (index !== -1) {
                        products[index] = {
                            id: Number(editId),
                            name: name,
                            category: category,
                            manufacturer: manufacturer,
                            price: price,
                            amount: amount,
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
                        price: price,
                        amount: amount,
                        image: image,
                        specs: specs || "Стандартні характеристики",
                        description: desc || "Опис товару онлайн-каталогу ElectroMarket."
                    });
                    alert("Новий товар успішно додано до каталогу!");
                }

                saveProductsData(products);
                resetAdminForm();
                renderAdminTable();
            });
        });

        $(document).on("click", ".admin-edit-btn", function () {
            let id = Number($(this).attr("data-id"));
            loadProductsData(function (products) {
                let p = products.find(item => item.id === id);
                if (!p) return;

                $("#admin-form-title").text("Редагування товару #" + p.id);
                $("#admin-id").val(p.id);
                $("#admin-name").val(p.name);
                $("#admin-category").val(p.category);
                $("#admin-manufacturer").val(p.manufacturer);
                $("#admin-price").val(p.price);
                $("#admin-amount").val(p.amount);
                $("#admin-image").val(p.image);
                $("#admin-specs").val(p.specs);
                $("#admin-desc").val(p.description);
            });
        });

        $(document).on("click", ".admin-delete-btn", function () {
            let id = Number($(this).attr("data-id"));
            if (!confirm("Ви дійсно бажаєте видалити цей товар?")) return;

            loadProductsData(function (products) {
                products = products.filter(item => item.id !== id);
                saveProductsData(products);
                renderAdminTable();
            });
        });

        $("#admin-reset-form-btn").click(function () {
            resetAdminForm();
        });

        $("#admin-reset-db-btn").click(function () {
            localStorage.removeItem("electro_products");
            alert("Дані відновлено з файлу products.json!");
            location.reload();
        });
    }
});