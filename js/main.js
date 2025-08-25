$(function() {

    $('.phone_input input').on('blur', function() {
        let phoneWrapper = $(this).parents('.field'),
            thisNumber = $(this).val().split(''),
            lastIndex = thisNumber.length - 1,
            lastItem = thisNumber[lastIndex];
        if (isNaN(lastItem)) {
            phoneWrapper.addClass('incorrect-phone');
            if (!phoneWrapper.find('.empty_number').length) {
                phoneWrapper.append('<div class="error_text empty_number">Введите номер телефона полностью </div>');
            }
            //$(this).val('');
        } else {
            phoneWrapper.removeClass('incorrect-phone');
            phoneWrapper.removeClass('error');
            phoneWrapper.find('.empty_number').remove();
        }
    });

    $('.field input').on('input', function() {
        let phoneWrapper = $(this).parents('.field'),
            thisNumber = $(this).val();
        if (thisNumber && phoneWrapper.hasClass('error')) {
            phoneWrapper.find('.error_text_r').remove();
        }
    });

    $('input,textarea').on('blur', function() {
        if ($(this).parents('.field').hasClass('error')) {
            $(this).parents('.field').removeClass('error');
            $(this).parents('.field').find('.error_text').remove();
        }
    })

    $('input[type="checkbox"]').on('change', function(event) {
        let fieldRequired = $(this).closest('.field.required');

        if (fieldRequired.length > 0) {
            if (!$(this).is(":checked")) {
                fieldRequired.addClass('no_checked');
            } else {
                fieldRequired.removeClass('no_checked error');
                fieldRequired.find('.error_text').remove();
            }
        }
    });

    $('.email_input input').on('blur', function() {
        let emailWrapper = $(this).parents('.field');
        let email = $(this).val();
        // Строгая проверка e-mail
        let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (email.length > 0 && !emailRegex.test(email)) {
            emailWrapper.addClass('incorrect-phone');

            if (!emailWrapper.find('.empty_number').length) {
                emailWrapper.append('<div class="error_text empty_number">Вы ввели некорректный e-mail</div>');
            }
        } else {
            emailWrapper.removeClass('incorrect-phone error');
            emailWrapper.find('.empty_number').remove();
        }
    });

    $('.field select').on('change', function() {
        var field = $(this).closest('.field');

        // При выборе значения удаляем ошибку
        if ($(this).val() && $(this).val() !== '' && $(this).val() !== '0' && $(this).val() !== 'default') {
            field.removeClass('error');
            field.find('.jq-selectbox').removeClass('error');
            field.find('.error_text').remove();
        }
    });

    $('.form_button').on('click', function(e) {
        let form = $(this).parents('form');
        let hasErrors = false;

        $(this).parents('form').find('.field').each(function() {
            // Валидация текстовых полей
            var valueInput = $(this).find('input').val();
            if ($(this).hasClass('required') && valueInput == '') {
                $(this).addClass('error');
                if (!$(this).find('.error_text').length) {
                    $(this).append('<div class="error_text error_text_r">Поле обязательно для заполнения</div>');
                }
            }

            // Валидация textarea
            var valueTextarea = $(this).find('textarea').val();
            if ($(this).hasClass('required') && valueTextarea == '') {
                $(this).addClass('error');
                if (!$(this).find('.error_text').length) {
                    $(this).append('<div class="error_text error_text_r">Поле обязательно для заполнения</div>');
                }
            }

            // Валидация чекбоксов
            if ($(this).hasClass('required') && $(this).find('input[type="checkbox"]').length) {
                if (!$(this).find('input[type="checkbox"]').is(":checked")) {
                    $(this).addClass('error no_checked');
                    if (!$(this).find('.error_text').length) {
                        $(this).append('<div class="error_text error_text_r">Поле обязательно для заполнения</div>');
                    }
                } else {
                    $(this).removeClass('error no_checked');
                    $(this).find('.error_text').remove();
                }
            }

            // Валидация селектов
            if ($(this).hasClass('required') && $(this).find('select').length) {
                var selectValue = $(this).find('select').val();
                // Проверяем, выбрано ли какое-то значение (не пустое и не placeholder)
                if (!selectValue || selectValue === '' || selectValue === '0' || selectValue === 'default') {
                    $(this).addClass('error');
                    if (!$(this).find('.error_text').length) {
                        $(this).append('<div class="error_text error_text_r">Поле обязательно для заполнения</div>');
                    }
                } else {
                    $(this).removeClass('error');
                    $(this).find('.error_text').remove();
                }
            }
        });

        // --- Проверка паролей ---
        let passwordField = form.find('input[placeholder="Новый пароль"]');
        let confirmField = form.find('input[placeholder="Подтверждение пароля"]');

        if (passwordField.length > 0) {
            let password = passwordField.val().trim();
            let confirmPassword = confirmField.val().trim();

            // длина пароля
            if (password.length < 6) {
                let parent = passwordField.closest('.field');
                parent.addClass('error');
                parent.find('.error_text').remove();
                parent.append('<div class="error_text">Пароль должен быть не менее 6 символов</div>');
                hasErrors = true;
            }

            // совпадение паролей
            if (password !== confirmPassword) {
                let parent = confirmField.closest('.field');
                parent.addClass('error');
                parent.find('.error_text').remove();
                parent.append('<div class="error_text">Пароли не совпадают</div>');
                hasErrors = true;
            }
        }

        if ($(this).closest('form').find('.field').hasClass('incorrect-phone') || $(this).closest('form').find('.field').hasClass('error')) {
            e.preventDefault();
        } else {
            e.preventDefault(); // пока для теста
            if ($(this).parents('.popup-form').find('.popup-form-thanks').length) {
                $(this).parents('.popup-form').addClass('success');
            }

            console.log("Форма прошла проверку, можно отправлять");
        }
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const cities = [
        "Абаза", "Абакан", "Абдулино", "Абинск", "Агидель", "Агрыз",
        "Азов", "Аксай", "Алапаевск", "Альметьевск", "Анапа", "Ангарск",
        "Апатиты", "Арзамас", "Армавир", "Арсеньев", "Астрахань"
        // можно подключить список всех городов РФ
    ];

    const input = document.getElementById("cityInput");

    if(input){
        const list = document.getElementById("cityList");

        let cities = [];

        // города из JSON
        fetch("/files/cities.json")
            .then(response => response.json())
            .then(data => {
            cities = data;
        });


        input.addEventListener("input", function() {
            const value = this.value.toLowerCase();
            list.innerHTML = "";
            

            if (!value) return;

            const filtered = cities.filter(city => city.toLowerCase().startsWith(value));

            filtered.forEach(city => {
                const li = document.createElement("li");
                li.textContent = city;
                li.addEventListener("click", function() {
                    input.value = city;
                    list.innerHTML = "";
                });
                list.appendChild(li);
            });
            list.classList.add('show')
        });

        document.addEventListener("click", function(e) {
            if (!e.target.closest(".city_field")) {
                list.innerHTML = "";
                list.classList.remove('show')
            }
        });
    }

    document.querySelectorAll('.field .password_view').forEach(btn => {
        btn.setAttribute('role', 'button');
        btn.setAttribute('tabindex', '0');
        btn.setAttribute('aria-pressed', 'false');
    });

    document.addEventListener('click', onToggle);

    document.addEventListener('keydown', function(e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.password_view')) {
            e.preventDefault();
            onToggle(e);
        }
    });

    function onToggle(e) {
        const toggle = e.target.closest('.password_view');
        if (!toggle) return;

        const field = toggle.closest('.field');
        if (!field) return;

        const input = field.querySelector('input[type="password"], input[type="text"]');
        if (!input) return;

        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';

        // Состояние и доступность
        toggle.classList.toggle('is-visible', isHidden);
        toggle.setAttribute('aria-pressed', String(isHidden));
        toggle.setAttribute('aria-label', isHidden ? 'Скрыть пароль' : 'Показать пароль');
    }

    const myCabinet = document.querySelector('.my_cabinet');

    if (myCabinet) {
        myCabinet.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('.login_menu').classList.toggle('show');
        });
    }

    const sliderItems = document.querySelectorAll('.slider_item');


    if (sliderItems.length) {
        sliderItems.forEach((slider) => {
            const sliderWrap = slider.querySelector('.swiper');
            const wrap = sliderWrap.getAttribute('data-id');
            const arrow = sliderWrap.getAttribute('data-arrow');

            const swiperSimilar = new Swiper(`.${wrap}`, {
                loop: true,
                slidesPerView: 1,
                spaceBetween: 20,
                lazy: true,
                navigation: {
                    nextEl: `.next_${arrow}`,
                    prevEl: `.prev_${arrow}`,
                }
            });
        })
    }

    const favorityeItems = document.querySelectorAll('.favorite_list_item .item');

    if (favorityeItems.length) {

        favorityeItems.forEach(item => {
            const minusBtn = item.querySelector('.quantity_block .minus:first-child');
            const plusBtn = item.querySelector('.quantity_block .minus:last-child');
            const input = item.querySelector('.quantity_block input');
            const priceEl = item.querySelector('.price span');
            const sumEl = item.querySelector('.price_sum span');
            const stock = item.querySelector('.stoke_inner span');

            if (!minusBtn || !plusBtn || !input || !priceEl || !sumEl) return;

            const price = parseFloat(priceEl.textContent.replace(/\s/g, ''));
            const inStock = stock && stock.textContent.trim().toLowerCase() !== 'нет';

            if (!inStock) {
                input.disabled = true;
                minusBtn.disabled = true;
                plusBtn.disabled = true;
                item.classList.add('out-of-stock');
                return;
            }

            function updateSum() {
                let qty = parseInt(input.value) || 1;
                if (qty < 1) qty = 1;
                input.value = qty;
                sumEl.textContent = (qty * price).toLocaleString('ru-RU');
            }

            minusBtn.addEventListener('click', () => {
                let qty = parseInt(input.value) || 1;
                if (qty > 1) {
                    input.value = qty - 1;
                    updateSum();
                }
            });

            plusBtn.addEventListener('click', () => {
                let qty = parseInt(input.value) || 1;
                input.value = qty + 1;
                updateSum();
            });

            input.addEventListener('input', updateSum);

            updateSum();
        });
    }

    const favorityeBtn = document.querySelectorAll('.favorite_add');

    if (favorityeBtn.length) {

        favorityeBtn.forEach(btn => {
            btn.addEventListener('click', function() {
                btn.classList.toggle('add');
            })
        })
    }
});