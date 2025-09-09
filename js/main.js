// Функция для отправки данных на сервер
async function sendFormData(url, formData, formType) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        return {
            success: response.ok,
            data: result,
            status: response.status
        };
    } catch (error) {
        console.error('Ошибка отправки формы:', error);
        return {
            success: false,
            data: { message: 'Ошибка соединения с сервером' },
            status: 0
        };
    }
}

function showFormError(form, message, field = null) {
    if (field) {
        const fieldElement = form.find(`[name="${field}"], [placeholder*="${field}"]`).closest('.field');
        if (fieldElement.length) {
            fieldElement.addClass('error');
            fieldElement.find('.error_text').remove();
            fieldElement.append(`<div class="error_text server-error">${message}</div>`);
            return;
        }
    }
    
    form.find('.server-error-general').remove();
    form.prepend(`<div class="error_text server-error-general" style="margin-bottom: 15px; color: #ff4444;">${message}</div>`);
}

function clearServerErrors(form) {
    form.find('.server-error, .server-error-general').remove();
    form.find('.field').removeClass('server-error');
}

$('.login_modal form').on('submit', async function(e) {
    e.preventDefault();
    
    let form = $(this);
    let hasErrors = false;
    
    clearServerErrors(form);

    form.find('.field').each(function() {
        var valueInput = $(this).find('input').val();
        if ($(this).hasClass('required') && valueInput == '') {
            $(this).addClass('error');
            if (!$(this).find('.error_text').length) {
                $(this).append('<div class="error_text error_text_r">Поле обязательно для заполнения</div>');
            }
            hasErrors = true;
        }

        if ($(this).hasClass('required') && $(this).find('input[type="checkbox"]').length) {
            if (!$(this).find('input[type="checkbox"]').is(":checked")) {
                $(this).addClass('error no_checked');
                if (!$(this).find('.error_text').length) {
                    $(this).append('<div class="error_text error_text_r">Поле обязательно для заполнения</div>');
                }
                hasErrors = true;
            }
        }
    });

    if (form.find('.field').hasClass('incorrect-phone') || hasErrors) {
        return;
    }

    const formData = {
        email: form.find('input[type="text"]').val(),
        password: form.find('input[type="password"]').val(),
        remember: form.find('input[type="checkbox"]').is(':checked'),
        action: 'login'
    };

    const submitBtn = form.find('input[type="submit"]');
    const originalValue = submitBtn.val();
    submitBtn.val('Вход...').prop('disabled', true);

    const result = await sendFormData('/api/auth/login', formData, 'login');

    if (result.success) {
        console.log('Авторизация успешна:', result.data);
        
        if (result.data.redirect) {
            window.location.href = result.data.redirect;
        } else {
            window.location.reload();
        }
    } else {
        submitBtn.val(originalValue).prop('disabled', false);
        
        if (result.status === 422 && result.data.errors) {
            Object.keys(result.data.errors).forEach(field => {
                showFormError(form, result.data.errors[field][0], field);
            });
        } else if (result.status === 401) {
            showFormError(form, result.data.message || 'Неверный email или пароль');
        } else {
            showFormError(form, result.data.message || 'Произошла ошибка при входе');
        }
    }
});

$('.reg_modal form').on('submit', async function(e) {
    e.preventDefault();
    
    let form = $(this);
    let hasErrors = false;
    
    clearServerErrors(form);

    form.find('.field').each(function() {
        var valueInput = $(this).find('input').val();
        if ($(this).hasClass('required') && valueInput == '') {
            $(this).addClass('error');
            if (!$(this).find('.error_text').length) {
                $(this).append('<div class="error_text error_text_r">Поле обязательно для заполнения</div>');
            }
            hasErrors = true;
        }

        if ($(this).hasClass('required') && $(this).find('input[type="checkbox"]').length) {
            if (!$(this).find('input[type="checkbox"]').is(":checked")) {
                $(this).addClass('error no_checked');
                if (!$(this).find('.error_text').length) {
                    $(this).append('<div class="error_text error_text_r">Поле обязательно для заполнения</div>');
                }
                hasErrors = true;
            }
        }
    });

    let passwordField = form.find('input[placeholder="Новый пароль"]');
    let confirmField = form.find('input[placeholder="Подтверждение пароля"]');

    if (passwordField.length > 0) {
        let password = passwordField.val().trim();
        let confirmPassword = confirmField.val().trim();

        if (password.length < 6) {
            let parent = passwordField.closest('.field');
            parent.addClass('error');
            parent.find('.error_text').remove();
            parent.append('<div class="error_text">Пароль должен быть не менее 6 символов</div>');
            hasErrors = true;
        }

        if (password !== confirmPassword) {
            let parent = confirmField.closest('.field');
            parent.addClass('error');
            parent.find('.error_text').remove();
            parent.append('<div class="error_text">Пароли не совпадают</div>');
            hasErrors = true;
        }
    }

    if (form.find('.field').hasClass('incorrect-phone') || hasErrors) {
        return;
    }

    const formData = {
        organization: form.find('input[placeholder="Название организации *"]').val(),
        city: form.find('input[placeholder="Город *"]').val(),
        name: form.find('input[placeholder="ФИО *"]').val(),
        email: form.find('input[placeholder="E-mail *"]').val(),
        password: form.find('input[placeholder="Новый пароль"]').val(),
        password_confirmation: form.find('input[placeholder="Подтверждение пароля"]').val(),
        privacy_accepted: form.find('input[type="checkbox"]').is(':checked'),
        action: 'register'
    };

    const submitBtn = form.find('input[type="submit"]');
    const originalValue = submitBtn.val();
    submitBtn.val('Регистрация...').prop('disabled', true);

    const result = await sendFormData('/api/auth/register', formData, 'register');

    if (result.success) {
        console.log('Регистрация успешна:', result.data);
        
        if (form.parents('.popup-form').find('.popup-form-thanks').length) {
            form.parents('.popup-form').addClass('success');
        }
    } else {
        submitBtn.val(originalValue).prop('disabled', false);
        
        if (result.status === 422 && result.data.errors) {
            Object.keys(result.data.errors).forEach(field => {
                let message = Array.isArray(result.data.errors[field]) 
                    ? result.data.errors[field][0] 
                    : result.data.errors[field];
                showFormError(form, message, field);
            });
        } else if (result.status === 409) {
            showFormError(form, result.data.message || 'Пользователь с таким email уже существует', 'email');
        } else {
            showFormError(form, result.data.message || 'Произошла ошибка при регистрации');
        }
    }
});

$('.restore_modal form').on('submit', async function(e) {
    e.preventDefault();
    
    let form = $(this);
    let hasErrors = false;
    
    clearServerErrors(form);

    // Валидация email
    const emailField = form.find('input[type="text"]');
    const email = emailField.val().trim();
    
    if (!email) {
        emailField.closest('.field').addClass('error');
        emailField.closest('.field').append('<div class="error_text error_text_r">Поле обязательно для заполнения</div>');
        hasErrors = true;
    }

    if (hasErrors) {
        return;
    }

    const formData = {
        email: email,
        action: 'password_reset'
    };

    const submitBtn = form.find('input[type="submit"]');
    const originalValue = submitBtn.val();
    submitBtn.val('Отправка...').prop('disabled', true);

    const result = await sendFormData('/api/auth/password-reset', formData, 'password_reset');

    if (result.success) {
        console.log('Запрос на восстановление отправлен:', result.data);
        
        if (form.parents('.popup-form').find('.popup-form-thanks').length) {
            form.parents('.popup-form').addClass('success');
        }
    } else {
        submitBtn.val(originalValue).prop('disabled', false);
        
        if (result.status === 404) {
            showFormError(form, 'Пользователь с таким email не найден', 'email');
        } else {
            showFormError(form, result.data.message || 'Произошла ошибка при отправке запроса');
        }
    }
});

$('.change_modal form').on('submit', async function(e) {
    e.preventDefault();
    
    let form = $(this);
    let hasErrors = false;
    
    clearServerErrors(form);

    form.find('.field').each(function() {
        var valueInput = $(this).find('input').val();
        if ($(this).hasClass('required') && valueInput == '') {
            $(this).addClass('error');
            if (!$(this).find('.error_text').length) {
                $(this).append('<div class="error_text error_text_r">Поле обязательно для заполнения</div>');
            }
            hasErrors = true;
        }
    });

    let passwordField = form.find('input[placeholder="Новый пароль"]');
    let confirmField = form.find('input[placeholder="Подтверждение пароля"]');

    if (passwordField.length > 0) {
        let password = passwordField.val().trim();
        let confirmPassword = confirmField.val().trim();

        if (password.length < 6) {
            let parent = passwordField.closest('.field');
            parent.addClass('error');
            parent.find('.error_text').remove();
            parent.append('<div class="error_text">Пароль должен быть не менее 6 символов</div>');
            hasErrors = true;
        }

        if (password !== confirmPassword) {
            let parent = confirmField.closest('.field');
            parent.addClass('error');
            parent.find('.error_text').remove();
            parent.append('<div class="error_text">Пароли не совпадают</div>');
            hasErrors = true;
        }
    }

    if (hasErrors) {
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const formData = {
        email: form.find('input[placeholder="E-mail"]').val(),
        password: form.find('input[placeholder="Новый пароль"]').val(),
        password_confirmation: form.find('input[placeholder="Подтверждение пароля"]').val(),
        token: urlParams.get('token') || '', // Токен из URL
        action: 'password_change'
    };

    const submitBtn = form.find('input[type="submit"]');
    const originalValue = submitBtn.val();
    submitBtn.val('Изменение...').prop('disabled', true);

    const result = await sendFormData('/api/auth/password-change', formData, 'password_change');

    if (result.success) {
        console.log('Пароль успешно изменен:', result.data);
        
        if (form.parents('.popup-form').find('.popup-form-thanks').length) {
            form.parents('.popup-form').addClass('success');
        }
    } else {
        submitBtn.val(originalValue).prop('disabled', false);
        
        if (result.status === 422 && result.data.errors) {
            Object.keys(result.data.errors).forEach(field => {
                let message = Array.isArray(result.data.errors[field]) 
                    ? result.data.errors[field][0] 
                    : result.data.errors[field];
                showFormError(form, message, field);
            });
        } else if (result.status === 400) {
            showFormError(form, result.data.message || 'Ссылка для смены пароля недействительна или истекла');
        } else {
            showFormError(form, result.data.message || 'Произошла ошибка при смене пароля');
        }
    }
});

$('.field input, .field textarea').on('input', function() {
    $(this).closest('.field').find('.server-error').remove();
    $(this).closest('.field').removeClass('server-error');
    $(this).closest('form').find('.server-error-general').remove();
});


/*
УСПЕШНЫЕ ОТВЕТЫ:

Авторизация:
{
  "success": true,
  "message": "Успешная авторизация",
  "redirect": "/dashboard" // опционально
}

Регистрация:
{
  "success": true,
  "message": "Регистрация успешна. На ваш email отправлено письмо для подтверждения."
}

Восстановление пароля:
{
  "success": true,
  "message": "Ссылка для восстановления пароля отправлена на ваш email"
}

Смена пароля:
{
  "success": true,
  "message": "Пароль успешно изменен"
}

ОШИБКИ:

Валидационные ошибки (HTTP 422):
{
  "success": false,
  "message": "Ошибки валидации",
  "errors": {
    "email": ["Поле email обязательно для заполнения"],
    "password": ["Минимальная длина пароля 6 символов"]
  }
}

Неверные учетные данные (HTTP 401):
{
  "success": false,
  "message": "Неверный email или пароль"
}

Пользователь уже существует (HTTP 409):
{
  "success": false,
  "message": "Пользователь с таким email уже зарегистрирован"
}

Общие ошибки (HTTP 500):
{
  "success": false,
  "message": "Внутренняя ошибка сервера"
}
*/

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

        if ($(this).val() && $(this).val() !== '' && $(this).val() !== '0' && $(this).val() !== 'default') {
            field.removeClass('error');
            field.find('.jq-selectbox').removeClass('error');
            field.find('.error_text').remove();
        }
    });

    /*$('.popup-form__body form').on('submit', function(e) {

        let form = $(this);
        let hasErrors = false;

        form.find('.field').each(function() {
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

        if (form.find('.field').hasClass('incorrect-phone') || form.find('.field').hasClass('error')) {
            e.preventDefault();
        } else {
            e.preventDefault(); // пока для теста
            if ($(this).parents('.popup-form').find('.popup-form-thanks').length) {
                $(this).parents('.popup-form').addClass('success');
            }

            console.log("Форма прошла проверку, можно отправлять");
        }
    });*/


    $.extend($.remodal.defaults, {
        hashTracking: false
    });

    const urlParams = new URLSearchParams(window.location.search);
    const popupParam = urlParams.get("modal");
    if (popupParam) {
        $(document).ready(function() {
            const modalElement = document.querySelector('[data-remodal-id="' + popupParam + '"]');
            if (modalElement) {
                const inst = $(modalElement).remodal();
                inst.open();
            }
        });
    }

    $(document).on('opening', '.remodal', function () {
        const id = this.getAttribute('data-remodal-id');
        if (id) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set("modal", id);
            newUrl.hash = '';
            window.history.replaceState({}, '', newUrl.toString());
        }
    });

    $(document).on('closing', '.remodal', function () {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("modal");
        newUrl.hash = '';
        window.history.replaceState({}, '', newUrl.toString());
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

    // const myCabinet = document.querySelector('.my_cabinet');

    // if (myCabinet) {
    //     myCabinet.addEventListener('click', function(e) {
    //         e.preventDefault();
    //         document.querySelector('.login_menu').classList.toggle('show');
    //     });
    // }

    // const LoginMenuLi = document.querySelectorAll('.login_menu li:not(.my_cabinet)');

    // if (LoginMenuLi.length) {

    //     LoginMenuLi.forEach((item) => {
    //         item.addEventListener('click', function(e) {
    //             myCabinet.innerHTML = item.innerHTML
    //         });
    //     })
        
    // }

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
                console.log(123)
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