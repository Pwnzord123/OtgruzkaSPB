// ==UserScript==
// @name         WMS Container Override Enhanced - Manual Updates
// @namespace    http://tampermonkey.net/
// @version      2.8
// @description  Автозамена контейнеров WMS с ручными обновлениями через GitHub
// @author       Жигалов Ю.В.
// @match        https://wms.vseinstrumenti.ru/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @exclude      https://wms.vseinstrumenti.ru/Report/*
// @updateURL    https://raw.githubusercontent.com/Pwnzord123/OtgruzkaSPB/main/wms-script.user.js
// @downloadURL  https://raw.githubusercontent.com/Pwnzord123/OtgruzkaSPB/main/wms-script.user.js
// @supportURL   https://github.com/Pwnzord123/OtgruzkaSPB
// ==/UserScript==

(function() {
    'use strict';

    // ========== УПРОЩЕННАЯ СИСТЕМА ОБНОВЛЕНИЙ ==========
    
    const UPDATE_CONFIG = {
        // Прямая ссылка для обновления
        DIRECT_UPDATE_URL: 'https://raw.githubusercontent.com/Pwnzord123/OtgruzkaSPB/main/wms-script.user.js',
        GITHUB_REPO: 'https://github.com/Pwnzord123/OtgruzkaSPB'
    };

    // Текущая версия скрипта
    const CURRENT_VERSION = '3.0';

    // Простая функция открытия ссылки для обновления
    function openUpdateLink() {
        console.log('🔄 Открываем ссылку для обновления...');
        showNotification('Открываем страницу обновления...', 'info');
        window.open(UPDATE_CONFIG.DIRECT_UPDATE_URL, '_blank');
        
        setTimeout(() => {
            showUpdateInstructions();
        }, 500);
    }

    // Показать инструкции по обновлению
    function showUpdateInstructions() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); z-index: 99999; display: flex;
            align-items: center; justify-content: center; font-family: Arial, sans-serif;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 10px; padding: 25px; max-width: 450px; width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 18px; font-weight: bold; color: #4CAF50; margin-bottom: 10px;">
                        🚀 Страница обновления открыта
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <div style="font-weight: bold; margin-bottom: 10px; color: #333;">📋 Следующие шаги:</div>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; font-size: 13px; line-height: 1.5;">
                        <div style="margin-bottom: 8px;">1️⃣ В новой вкладке Tampermonkey покажет кнопку <strong>"Обновить"</strong></div>
                        <div style="margin-bottom: 8px;">2️⃣ Нажмите <strong>"Обновить"</strong> или <strong>"Переустановить"</strong></div>
                        <div style="margin-bottom: 8px;">3️⃣ Закройте вкладку обновления</div>
                        <div>4️⃣ Перезагрузите эту страницу (<strong>F5</strong>)</div>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <button onclick="this.closest('div').parentElement.remove()" 
                            style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                        👍 Понятно
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 15000);
    }

    // ========== КОНФИГУРАЦИЯ ==========

    // XPath пути к элементам
    const DIRECTION_XPATH = '/html/body/div/div/div/div[1]/main/div/div/div/div[5]/div/b[2]';
    const CONTAINER_XPATH_1 = '/html/body/div[1]/div/div/div[1]/main/div/div/div/div[4]/form/div/div[5]/div[2]/div/div/div[1]/h1';
    const CONTAINER_XPATH_2 = '/html/body/div[1]/div/div/div[1]/main/div/div/div/div[5]/div/b[1]';

    // Размер шрифта для первого контейнера (по умолчанию)
    let LARGE_FONT_SIZE = '100px';

    // Текущий активный пресет
    let currentPreset = 'Стол 18';

    // Рабочие пресеты (могут редактироваться пользователем)
    let userPresets = {};

    // Пресеты для всех столов комплектации (ВСТРОЕННЫЕ ДАННЫЕ) - по буквенным названиям
    const TABLE_PRESETS = {
        "Стол 12": {
            "Парнас": "писька",
            "Международная": "2---Международная",
            "Всеволожск": "3---Всеволожск",
            "Красное": "4---Красное Село",
            "Октября": "5---Гатчина 25 Октября",
            "Ладожская": "6---Ладожская",
            "Ветеранов": "7---Ветеранов",
            "Бабушкина": "8---Бабушкина",
            "Просвещения": "9---Просвещения д.72",
            "Большевиков": "10---Большевиков",
            "Солнечный": "11---Солнечный город",
            "Девяткино": "12---Девяткино",
            "Тельмана": "13---Тельмана",
            "Свердлова": "14---Свердлова",
            "Бугры": "15---Бугры",
            "Попова": "16---Профессора Попова",
            "Никольское": "17---Никольское"
        },
        "Стол 14": {
            "Обороны": "1---Обуховской Обороны",
            "Новоселье": "2---Новоселье",
            "Рыбацкое": "3---Рыбацкое",
            "Московская": "4---Московская",
            "Боровая": "5---Боровая",
            "Мужества": "6---Площадь Мужества",
            "Революции": "7---Шоссе Революции",
            "Десантников": "8---Десантников",
            "Швейцарская": "9---Ломоносов Швейцарская",
            "Кронштадт": "10---Кронштадт",
            "Комендантский": "11---Комендантский д.55",
            "Славянка": "12---Славянка",
            "Кузнецовская": "13---Кузнецовская",
            "Кузьмоловский": "14---Кузьмоловский",
            "Богатырский": "15---Богатырский",
            "Мурманское": "16---Мурманское Шоссе",
            "Парашютная": "17---Парашютная",
            "Южное шоссе": "18---Южное Шоссе",
            "Мебельная": "19---Мебельная"
        },
        "Стол 16": {
            "Энгельса": "1---Энгельса д.70",
            "Таллинское": "2---Таллинское Шоссе",
            "Янино": "3---Янино",
            "Тверская": "4---Колпино Тверская",
            "Благодатная": "5---Благодатная",
            "Приморская": "6---Приморская",
            "Колпино Ленина": "7---Колпино Ленина",
            "Краснопутиловская": "8---Краснопутиловская",
            "Василеостровская": "9---Василеостровская",
            "Индустриальный": "10---Индустриальный",
            "Народная": "11---Народная",
            "Черниговская": "12---Черниговская",
            "Сертолово": "13---Сертолово",
            "Зверевой": "14---Гатчина Зверевой-Кныша",
            "Кубинская": "15---Кубинская",
            "Зеленогорск": "16---Зеленогорск",
            "Новгородский": "17---Новгородский",
            "Кубатура": "18---Кубатура"
        },
        "Стол 18": {
            "Стачек": "1---Стачек",
            "Дыбенко": "2---Дыбенко",
            "Ленинский": "3---Ленинский",
            "Выборгская": "4---Выборгская",
            "Кировск": "5---Кировск",
            "Пушкин-": "6---Пушкин",
            "Оптиков": "7---Оптиков",
            "Ломоносовская": "8---Ломоносовская",
            "Пискарёвка": "9---Пискаревка",
            "Новочеркасский": "10---Новочеркасский",
            "Нарвский проспект": "11---Нарвский",
            "Гатчина": "12---Гатчина Пушкинское",
            "Славы": "13---Славы",
            "Энгельса": "14---Энгельса д.133",
            "Всеволожск Крымская": "15---Всеволожск Крымская",
            "Коммунар": "16---Коммунар",
            "Орджоникидзе": "17---Орджоникидзе",
            "Потапова": "18---Потапова",
            "Выборгское": "19---Выборгское шоссе"
        },
        "Стол 20": {
            "Балтийский": "1---Балтийский вокзал",
            "Полюстровский": "2---Полюстровский",
            "Купчино": "3---Купчино",
            "Испытателей": "4---Комендантский Испытателей",
            "Двинская": "5---Двинская",
            "Федоровское": "6---Фёдоровское",
            "Тосно": "7---Тосно",
            "Петергоф": "8---Петергоф Гостилицкая",
            "Новое Девяткино": "9---Новое Девяткино",
            "Черная речка": "10---Черная речка",
            "Беговая": "11---Беговая",
            "Стародеревенская": "12---Стародеревенская",
            "Металлострой": "13---Металлострой Садовая",
            "Художников": "14---Художников",
            "Трибуца": "15---Трибуца",
            "Рощино": "16---Рощино Советская",
            "СтройДвор": "17---Стройдвор",
            "Ланское": "18---Ланское Шоссе",
            "Плесецкая": "19---Плесецкая"
        }
    };

    // ========== НАСТРОЙКИ ПРОИЗВОДИТЕЛЬНОСТИ ==========

    // Интервалы проверки
    const CHECK_INTERVAL = 160; // Основной интервал проверки (мс)
    const CACHE_LIFETIME = 100; // Время жизни кэша элементов (мс)

    // Переменные состояния
    let isEnabled = true;
    let normalCheckTimer = null;
    let fastCheckTimer = null;

    // Кэш элементов для ускорения
    let cachedElements = {
        direction: null,
        container1: null,
        container2: null,
        lastUpdate: 0
    };

    // ========== УПРАВЛЕНИЕ НАСТРОЙКАМИ ==========

    // Проверить и обновить пресеты при обновлении скрипта
    function checkAndUpdatePresets() {
        const lastVersion = localStorage.getItem('wms_last_version');
        
        if (lastVersion !== CURRENT_VERSION) {
            console.log(`🔄 Обнаружено обновление: ${lastVersion || 'неизвестно'} → ${CURRENT_VERSION}`);
            
            // Загружаем текущие пользовательские пресеты
            const savedPresets = localStorage.getItem('wms_user_presets');
            let currentUserPresets = {};
            
            if (savedPresets) {
                try {
                    currentUserPresets = JSON.parse(savedPresets);
                } catch (e) {
                    console.error('Ошибка парсинга пресетов:', e);
                }
            }
            
            // Обновляем встроенные пресеты, сохраняя пользовательские изменения
            Object.keys(TABLE_PRESETS).forEach(tableName => {
                const userPreset = currentUserPresets[tableName];
                const builtinPreset = TABLE_PRESETS[tableName];
                
                if (userPreset) {
                    // Если у пользователя есть этот пресет, обновляем только недостающие направления
                    const updatedPreset = { ...builtinPreset }; // Начинаем с актуальных встроенных данных
                    
                    // Добавляем пользовательские изменения/дополнения
                    Object.keys(userPreset).forEach(locationName => {
                        // Если направление есть в встроенном пресете, берем встроенное значение
                        // Если это пользовательское направление - сохраняем его
                        if (!builtinPreset[locationName]) {
                            updatedPreset[locationName] = userPreset[locationName];
                            console.log(`📝 Сохранено пользовательское направление: ${tableName}["${locationName}"]`);
                        }
                    });
                    
                    currentUserPresets[tableName] = updatedPreset;
                    console.log(`✅ Обновлен пресет: ${tableName}`);
                } else {
                    // Если пресета у пользователя нет - добавляем встроенный
                    currentUserPresets[tableName] = { ...builtinPreset };
                    console.log(`➕ Добавлен новый пресет: ${tableName}`);
                }
            });
            
            // Сохраняем обновленные пресеты
            userPresets = currentUserPresets;
            savePresets();
            
            // Сохраняем текущую версию
            localStorage.setItem('wms_last_version', CURRENT_VERSION);
            
            console.log(`🎉 Пресеты обновлены до версии ${CURRENT_VERSION}`);
            
            // Показываем уведомление пользователю
            setTimeout(() => {
                showNotification(`Пресеты обновлены до версии ${CURRENT_VERSION}!`, 'success');
            }, 2000);
            
            return true; // Обновление произошло
        }
        
        return false; // Обновления не было
    }

    // Загрузить настройки из localStorage (если есть)
    function loadSettings() {
        // Сначала проверяем и обновляем пресеты при необходимости
        const wasUpdated = checkAndUpdatePresets();
        
        if (!wasUpdated) {
            // Если обновления не было, загружаем как обычно
            const savedPresets = localStorage.getItem('wms_user_presets');
            if (savedPresets) {
                try {
                    userPresets = JSON.parse(savedPresets);
                    console.log('Загружены пользовательские пресеты:', Object.keys(userPresets));
                } catch (e) {
                    console.error('Ошибка загрузки пресетов:', e);
                    initializeDefaultPresets();
                }
            } else {
                // Первый запуск - копируем встроенные пресеты
                console.log('Первый запуск - инициализируем пресеты из встроенных данных');
                initializeDefaultPresets();
            }
        }

        // Загрузить текущий активный пресет
        const savedCurrentPreset = localStorage.getItem('wms_current_preset');
        if (savedCurrentPreset && userPresets[savedCurrentPreset]) {
            currentPreset = savedCurrentPreset;
            console.log('Загружен активный пресет:', currentPreset);
        }

        // Загрузить размер шрифта
        const savedFontSize = localStorage.getItem('wms_font_size');
        if (savedFontSize) {
            LARGE_FONT_SIZE = savedFontSize;
            console.log('Загружен размер шрифта:', LARGE_FONT_SIZE);
        }
    }

    // Инициализация пресетов из встроенных данных
    function initializeDefaultPresets() {
        userPresets = JSON.parse(JSON.stringify(TABLE_PRESETS)); // Глубокая копия
        savePresets();
        console.log('Инициализированы встроенные пресеты:', Object.keys(userPresets));
    }

    // Сохранить настройки в localStorage
    function saveSettings() {
        localStorage.setItem('wms_font_size', LARGE_FONT_SIZE);
        localStorage.setItem('wms_current_preset', currentPreset);
        console.log('Основные настройки сохранены');
    }

    // Сохранить пресеты
    function savePresets() {
        localStorage.setItem('wms_user_presets', JSON.stringify(userPresets));
        console.log('Пользовательские пресеты сохранены');
    }

    // Получить текущие маппинги
    function getCurrentMappings() {
        return userPresets[currentPreset] || {};
    }

    // ========== НОВЫЕ ФУНКЦИИ ДЛЯ ПОЛЬЗОВАТЕЛЬСКИХ СТОЛОВ ==========

    // Создать новый пользовательский стол
    function createCustomTable(tableName) {
        if (!tableName || tableName.trim() === '') {
            return { success: false, message: 'Имя стола не может быть пустым' };
        }

        const trimmedName = tableName.trim();

        // Проверить, что имя не занято
        if (userPresets[trimmedName]) {
            return { success: false, message: 'Стол с таким именем уже существует' };
        }

        // Создать пустой стол
        userPresets[trimmedName] = {};
        savePresets();

        console.log(`Создан новый стол: "${trimmedName}"`);
        return { success: true, message: `Стол "${trimmedName}" создан успешно` };
    }

    // Удалить пользовательский стол
    function deleteCustomTable(tableName) {
        // Нельзя удалять встроенные столы
        if (TABLE_PRESETS[tableName]) {
            return { success: false, message: 'Нельзя удалить встроенный стол' };
        }

        if (!userPresets[tableName]) {
            return { success: false, message: 'Стол не найден' };
        }

        // Если удаляем активный стол, переключаемся на стол 18
        if (currentPreset === tableName) {
            currentPreset = 'Стол 18';
            saveSettings();
        }

        delete userPresets[tableName];
        savePresets();

        console.log(`Удален стол: "${tableName}"`);
        return { success: true, message: `Стол "${tableName}" удален` };
    }

    // Переименовать стол
    function renameTable(oldName, newName) {
        if (!newName || newName.trim() === '') {
            return { success: false, message: 'Новое имя не может быть пустым' };
        }

        const trimmedNewName = newName.trim();

        // Нельзя переименовывать встроенные столы
        if (TABLE_PRESETS[oldName]) {
            return { success: false, message: 'Нельзя переименовать встроенный стол' };
        }

        if (!userPresets[oldName]) {
            return { success: false, message: 'Исходный стол не найден' };
        }

        if (userPresets[trimmedNewName]) {
            return { success: false, message: 'Стол с новым именем уже существует' };
        }

        // Копируем данные под новым именем
        userPresets[trimmedNewName] = { ...userPresets[oldName] };
        delete userPresets[oldName];

        // Если переименовываем активный стол
        if (currentPreset === oldName) {
            currentPreset = trimmedNewName;
            saveSettings();
        }

        savePresets();

        console.log(`Стол переименован: "${oldName}" → "${trimmedNewName}"`);
        return { success: true, message: `Стол переименован в "${trimmedNewName}"` };
    }

    // Копировать стол
    function copyTable(sourceName, newName) {
        if (!newName || newName.trim() === '') {
            return { success: false, message: 'Имя копии не может быть пустым' };
        }

        const trimmedNewName = newName.trim();

        if (!userPresets[sourceName]) {
            return { success: false, message: 'Исходный стол не найден' };
        }

        if (userPresets[trimmedNewName]) {
            return { success: false, message: 'Стол с таким именем уже существует' };
        }

        // Создаем глубокую копию
        userPresets[trimmedNewName] = JSON.parse(JSON.stringify(userPresets[sourceName]));
        savePresets();

        console.log(`Стол скопирован: "${sourceName}" → "${trimmedNewName}"`);
        return { success: true, message: `Создана копия "${trimmedNewName}"` };
    }

    // Получить список всех столов с дополнительной информацией
    function getAllTablesInfo() {
        const tables = {};

        Object.keys(userPresets).forEach(tableName => {
            const isBuiltIn = TABLE_PRESETS.hasOwnProperty(tableName);
            const mappingsCount = Object.keys(userPresets[tableName]).length;
            const isModified = isBuiltIn ?
                JSON.stringify(TABLE_PRESETS[tableName]) !== JSON.stringify(userPresets[tableName]) :
                false;

            tables[tableName] = {
                isBuiltIn,
                mappingsCount,
                isModified,
                isActive: tableName === currentPreset
            };
        });

        return tables;
    }

    // ========== ОБРАБОТКА НАЗВАНИЙ НАПРАВЛЕНИЙ (УЛУЧШЕНО) ==========

    // УЛУЧШЕННАЯ функция поиска соответствий
    // Теперь ищет название из маппинга ВНУТРИ полного направления
    function findMappingByLocationName(fullDirection, mappings) {
        if (!fullDirection || !mappings) {
            console.log('🔍 Поиск: пустое направление или маппинги');
            return null;
        }

        console.log('🔍 Начинаем поиск соответствий...');
        console.log('📍 Полное направление:', `"${fullDirection}"`);

        // Нормализуем направление для поиска
        const normalizedDirection = fullDirection.toLowerCase().trim();

        // Сначала ищем точные совпадения названий из маппинга в полном направлении
        for (const [mappingKey, mappingValue] of Object.entries(mappings)) {
            const normalizedKey = mappingKey.toLowerCase().trim();

            console.log(`🔍 Проверяем: "${mappingKey}" → "${mappingValue}"`);

            // Проверяем, содержится ли название из маппинга в полном направлении
            if (normalizedDirection.includes(normalizedKey)) {
                console.log(`✅ НАЙДЕНО ТОЧНОЕ СОВПАДЕНИЕ: "${mappingKey}" содержится в "${fullDirection}"`);
                console.log(`📦 Возвращаем контейнер: ${mappingValue}`);
                return mappingValue;
            }
        }

        console.log('🔍 Точных совпадений не найдено, пробуем частичные...');

        // Если точных совпадений нет, ищем частичные (более мягкий поиск)
        for (const [mappingKey, mappingValue] of Object.entries(mappings)) {
            const normalizedKey = mappingKey.toLowerCase().trim();

            // Разбиваем на слова и ищем частичные совпадения
            const keyWords = normalizedKey.split(/\s+/);
            const directionWords = normalizedDirection.split(/\s+/);

            // Если хотя бы одно слово из ключа есть в направлении
            let hasPartialMatch = false;
            for (const keyWord of keyWords) {
                if (keyWord.length >= 3) { // Минимум 3 символа для поиска
                    for (const dirWord of directionWords) {
                        if (dirWord.includes(keyWord) || keyWord.includes(dirWord)) {
                            hasPartialMatch = true;
                            break;
                        }
                    }
                }
                if (hasPartialMatch) break;
            }

            if (hasPartialMatch) {
                console.log(`🔍 НАЙДЕНО ЧАСТИЧНОЕ СОВПАДЕНИЕ: "${mappingKey}" ~ "${fullDirection}"`);
                console.log(`📦 Возвращаем контейнер: ${mappingValue}`);
                return mappingValue;
            }
        }

        console.log('❌ Соответствие не найдено');
        console.log('📋 Доступные маппинги:', Object.keys(mappings));
        return null;
    }

    // ДОПОЛНИТЕЛЬНАЯ функция извлечения названия (как fallback)
    function extractLocationName(fullDirection) {
        if (!fullDirection) return null;

        // Убираем код в скобках в начале: (А-12) или (Б-15) и т.д.
        let cleaned = fullDirection.replace(/^\([^)]+\)\s*/, '');

        // Убираем номера в конце: ---123--- или --456-- и т.д.
        cleaned = cleaned.replace(/---.*$/, '');
        cleaned = cleaned.replace(/--.*$/, '');

        // Убираем лишние пробелы
        cleaned = cleaned.trim();

        return cleaned || null;
    }

    // ========== РАБОТА С ПРЕСЕТАМИ ==========

    // Переключиться на выбранный пресет
    function switchToPreset(presetName) {
        if (userPresets[presetName]) {
            currentPreset = presetName;
            saveSettings();
            console.log(`Переключено на пресет: ${presetName}`);
            return true;
        }
        return false;
    }

    // Добавить/изменить направление в текущем пресете (по буквенному названию)
    function addMappingToCurrentPreset(locationName, container) {
        if (!userPresets[currentPreset]) {
            userPresets[currentPreset] = {};
        }
        userPresets[currentPreset][locationName] = container;
        savePresets();
        console.log(`Добавлено в ${currentPreset}: "${locationName}" → ${container}`);
    }

    // Удалить направление из текущего пресета
    function removeMappingFromCurrentPreset(locationName) {
        if (userPresets[currentPreset] && userPresets[currentPreset][locationName]) {
            delete userPresets[currentPreset][locationName];
            savePresets();
            console.log(`Удалено из ${currentPreset}: "${locationName}"`);
            return true;
        }
        return false;
    }

    // Сбросить пресет к исходному состоянию
    function resetPresetToDefault(presetName) {
        if (TABLE_PRESETS[presetName]) {
            userPresets[presetName] = JSON.parse(JSON.stringify(TABLE_PRESETS[presetName]));
            savePresets();
            console.log(`Пресет ${presetName} сброшен к исходному состоянию`);
            return true;
        }
        return false;
    }

    // Получить информацию о пресетах
    function getPresetsInfo() {
        const info = {};
        Object.keys(userPresets).forEach(presetName => {
            const isBuiltIn = TABLE_PRESETS.hasOwnProperty(presetName);
            const originalCount = isBuiltIn ? Object.keys(TABLE_PRESETS[presetName]).length : 0;
            const currentCount = Object.keys(userPresets[presetName]).length;
            const isModified = isBuiltIn ?
                JSON.stringify(TABLE_PRESETS[presetName]) !== JSON.stringify(userPresets[presetName]) :
                false;

            info[presetName] = {
                isBuiltIn,
                original: originalCount,
                current: currentCount,
                isModified
            };
        });
        return info;
    }

    // ========== CSS СТИЛИ ==========

    // Добавить CSS стили в head
    function injectCSS() {
        const styleId = 'wms-override-styles';

        // Удалить существующие стили если есть
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .wms-large-container {
                font-size: ${LARGE_FONT_SIZE} !important;
                font-weight: bold !important;
                color: #2c3e50 !important;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3) !important;
                line-height: 1.2 !important;
                font-family: Arial, sans-serif !important;
            }

            .wms-highlight {
                background-color: #e8f5e8 !important;
                border: 3px solid #4CAF50 !important;
                transition: all 0.3s ease !important;
                border-radius: 4px !important;
                padding: 2px 4px !important;
            }

            .wms-tab-button {
                background: #f0f0f0;
                border: 1px solid #ddd;
                padding: 8px 12px;
                margin: 2px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.2s ease;
            }

            .wms-tab-button:hover {
                background: #e0e0e0;
            }

            .wms-tab-button.active {
                background: #4CAF50;
                color: white;
                border-color: #4CAF50;
            }

            .wms-section {
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 10px;
                margin-bottom: 10px;
                background: #f8f9fa;
            }
        `;

        document.head.appendChild(style);
        console.log('✨ CSS стили добавлены с размером шрифта:', LARGE_FONT_SIZE);
    }

    // ========== РАБОТА С XPATH ==========

    // Получить элемент по XPath с кэшированием
    function getElementByXPath(xpath, useCache = true) {
        const now = Date.now();

        // Проверяем кэш
        if (useCache && cachedElements.lastUpdate > 0 && (now - cachedElements.lastUpdate) < CACHE_LIFETIME) {
            if (xpath === DIRECTION_XPATH && cachedElements.direction) {
                return cachedElements.direction;
            }
            if (xpath === CONTAINER_XPATH_1 && cachedElements.container1) {
                return cachedElements.container1;
            }
            if (xpath === CONTAINER_XPATH_2 && cachedElements.container2) {
                return cachedElements.container2;
            }
        }

        // Получаем элемент
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        const element = result.singleNodeValue;

        // Обновляем кэш
        if (element) {
            if (xpath === DIRECTION_XPATH) cachedElements.direction = element;
            if (xpath === CONTAINER_XPATH_1) cachedElements.container1 = element;
            if (xpath === CONTAINER_XPATH_2) cachedElements.container2 = element;
            cachedElements.lastUpdate = now;
        }

        return element;
    }

    // Сброс кэша
    function clearElementCache() {
        cachedElements = {
            direction: null,
            container1: null,
            container2: null,
            lastUpdate: 0
        };
        console.log('🗑️ Кэш элементов очищен');
    }

    // ========== ОСНОВНЫЕ ФУНКЦИИ ==========

    // Получить текущее направление
    function getCurrentDirection(useCache = true) {
        const directionElement = getElementByXPath(DIRECTION_XPATH, useCache);
        return directionElement ? directionElement.textContent.trim() : null;
    }

    // Функция для увеличения шрифта в первом поле контейнера
    function applyLargeFontToContainer1() {
        const containerElement1 = getElementByXPath(CONTAINER_XPATH_1);
        if (containerElement1) {
            // Удалить класс если есть
            containerElement1.classList.remove('wms-large-container');

            // Добавить класс с большим шрифтом
            containerElement1.classList.add('wms-large-container');

            console.log('✨ Применен CSS класс для увеличенного шрифта к контейнеру 1');
            console.log('Размер шрифта:', LARGE_FONT_SIZE);
            console.log('Классы элемента:', containerElement1.className);

            return true;
        } else {
            console.warn('❌ Контейнер 1 не найден по XPath:', CONTAINER_XPATH_1);
            return false;
        }
    }

    // Установить значение контейнера в оба поля
    function setContainer(newContainer) {
        console.log(`📦 Установка контейнера: ${newContainer}`);

        const containers = [
            { xpath: CONTAINER_XPATH_1, name: 'Контейнер 1' },
            { xpath: CONTAINER_XPATH_2, name: 'Контейнер 2' }
        ];

        let successCount = 0;
        containers.forEach(container => {
            const element = getElementByXPath(container.xpath);
            if (element) {
                const containerValue = newContainer;
                element.textContent = containerValue;
                element.classList.add('wms-highlight');

                console.log(`✅ ${container.name} установлен: ${containerValue}`);
                successCount++;
            } else {
                console.warn(`❌ ${container.name} не найден по пути: ${container.xpath}`);
            }
        });

        if (successCount > 0) {
            // Применить увеличенный шрифт к первому контейнеру
            setTimeout(() => {
                applyLargeFontToContainer1();
            }, 100);

            console.log(`✅ Контейнер установлен в ${successCount} полях: ${newContainer}`);
            return true;
        }
        return false;
    }

    // УЛУЧШЕННАЯ основная функция проверки и замены
    function checkAndReplace(forced = false) {
        const currentDirection = getCurrentDirection(!forced);
        const currentMappings = getCurrentMappings();

        console.log('🔄 === НАЧАЛО ПРОВЕРКИ ===');
        console.log('📍 Направление с сайта:', currentDirection || 'НЕ НАЙДЕНО');
        console.log('📋 Активный пресет:', currentPreset);
        console.log('📊 Количество маппингов:', Object.keys(currentMappings).length);

        if (currentDirection) {
            // НОВЫЙ ПОДХОД: сначала ищем напрямую в полном направлении
            let newContainer = findMappingByLocationName(currentDirection, currentMappings);

            // Если не нашли, пробуем старый подход (fallback)
            if (!newContainer) {
                console.log('🔄 Пробуем старый подход с извлечением названия...');
                const locationName = extractLocationName(currentDirection);
                console.log(`📝 Извлеченное название: "${locationName}"`);

                if (locationName) {
                    newContainer = findMappingByLocationName(locationName, currentMappings);
                }
            }

            if (newContainer) {
                // Быстрая проверка - получаем элементы из кэша если возможно
                const containerElement1 = getElementByXPath(CONTAINER_XPATH_1, !forced);
                const containerElement2 = getElementByXPath(CONTAINER_XPATH_2, !forced);

                const currentContainer1 = containerElement1 ? containerElement1.textContent.trim() : '';
                const currentContainer2 = containerElement2 ? containerElement2.textContent.trim() : '';

                if (currentContainer1 !== newContainer || currentContainer2 !== newContainer) {
                    console.log(`🚀 НАЙДЕН КОНТЕЙНЕР: ${newContainer}`);
                    console.log('💾 Устанавливаем контейнер...');
                    setContainer(newContainer);
                    console.log('🔄 === ПРОВЕРКА ЗАВЕРШЕНА: УСПЕШНО ===');
                    return true;
                } else {
                    console.log('✅ Контейнер уже установлен правильно');
                }
            } else {
                console.log('❌ Соответствие не найдено');
                if (forced) {
                    console.log('📋 Попробуйте добавить направление в маппинги:');
                    console.log(`   Направление: "${currentDirection}"`);
                    console.log(`   Активный стол: "${currentPreset}"`);
                }
            }
        } else {
            console.log('❌ Направление не найдено на странице');
        }

        console.log('🔄 === ПРОВЕРКА ЗАВЕРШЕНА: БЕЗ ИЗМЕНЕНИЙ ===');
        return false;
    }

    // Быстрая проверка без подробного логирования (для частых вызовов)
    function quickCheck() {
        const currentDirection = getCurrentDirection(true);
        const currentMappings = getCurrentMappings();

        if (currentDirection) {
            // Сначала прямой поиск
            let newContainer = findMappingByLocationName(currentDirection, currentMappings);

            // Потом через извлечение
            if (!newContainer) {
                const locationName = extractLocationName(currentDirection);
                if (locationName) {
                    newContainer = findMappingByLocationName(locationName, currentMappings);
                }
            }

            if (newContainer) {
                const containerElement1 = getElementByXPath(CONTAINER_XPATH_1, true);

                if (containerElement1) {
                    const currentContainer = containerElement1.textContent.trim();
                    if (currentContainer !== newContainer) {
                        return checkAndReplace(false);
                    }
                }
            }
        }
        return false;
    }

    // ========== ДИАГНОСТИКА (скрытая функция) ==========

    function diagnoseElements() {
        console.log('=== ДИАГНОСТИКА ЭЛЕМЕНТОВ ===');

        // Информация о пресетах
        console.log('Текущий активный пресет:', currentPreset);
        console.log('Количество направлений в активном пресете:', Object.keys(getCurrentMappings()).length);
        console.log('Информация о всех пресетах:', getPresetsInfo());

        // Проверка направления
        const directionElement = getElementByXPath(DIRECTION_XPATH);
        const fullDirection = directionElement ? directionElement.textContent.trim() : null;
        const locationName = extractLocationName(fullDirection);

        console.log('Элемент направления:', directionElement);
        console.log('Полное направление:', fullDirection || 'НЕ НАЙДЕНО');
        console.log('Извлеченное название:', locationName || 'НЕ ИЗВЛЕЧЕНО');

        // Проверка соответствия
        if (fullDirection) {
            const currentMappings = getCurrentMappings();
            console.log('=== ТЕСТ ПОИСКА ===');
            const foundContainer = findMappingByLocationName(fullDirection, currentMappings);
            console.log('Результат поиска:', foundContainer || 'НЕТ СООТВЕТСТВИЯ');
        }

        // Проверка контейнеров
        const containerElement1 = getElementByXPath(CONTAINER_XPATH_1);
        const containerElement2 = getElementByXPath(CONTAINER_XPATH_2);

        console.log('Контейнер 1:', containerElement1);
        console.log('Контейнер 1 текст:', containerElement1 ? containerElement1.textContent : 'НЕ НАЙДЕНО');
        console.log('Контейнер 1 классы:', containerElement1 ? containerElement1.className : 'НЕТ');
        console.log('Размер шрифта:', LARGE_FONT_SIZE);

        console.log('Контейнер 2:', containerElement2);
        console.log('Контейнер 2 текст:', containerElement2 ? containerElement2.textContent : 'НЕ НАЙДЕНО');

        // Поиск похожих элементов
        console.log('--- Поиск альтернативных элементов ---');
        const h1Elements = document.querySelectorAll('h1');
        console.log('Найдено H1 элементов:', h1Elements.length);

        const bElements = document.querySelectorAll('b');
        console.log('Найдено B элементов:', bElements.length);
        bElements.forEach((el, i) => {
            if (el.textContent.includes('Дыбенко') || el.textContent.includes('156-157')) {
                console.log(`B[${i}] (СОВПАДЕНИЕ):`, el.textContent);
            }
        });
    }

    // ========== УВЕДОМЛЕНИЯ ==========

    function showNotification(message, type = 'info') {
        // Используем GM_notification если доступно
        if (typeof GM_notification !== 'undefined' && type !== 'error') {
            GM_notification({
                title: 'WMS Container Override',
                text: message,
                timeout: 4000
            });
            return;
        }
        
        // Fallback к обычным уведомлениям
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            max-width: 350px;
            word-wrap: break-word;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, type === 'error' ? 6000 : 4000);
    }

    // ========== ИНТЕРФЕЙС УПРАВЛЕНИЯ ==========

    function createControlPanel() {
        const panel = document.createElement('div');
        panel.id = 'wms-control-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: white;
            border: 2px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: Arial, sans-serif;
            font-size: 12px;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            display: none;
        `;

        const tablesInfo = getAllTablesInfo();
        const tablesSelectOptions = Object.keys(tablesInfo).map(tableName => {
            const info = tablesInfo[tableName];
            const suffix = info.isBuiltIn ? (info.isModified ? ' (изменен)' : ' (базовый)') : ' (пользовательский)';
            return `<option value="${tableName}">${tableName} (${info.mappingsCount})${suffix}</option>`;
        }).join('');

        panel.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; color: #333;">
                🚀 WMS Container Override Enhanced v${CURRENT_VERSION}
            </div>

            <div style="margin-bottom: 15px; font-size: 11px; color: #666;">
                Автозамена контейнеров + ручные обновления + пользовательские столы
            </div>

            <!-- Табы -->
            <div style="margin-bottom: 15px; border-bottom: 1px solid #ddd;">
                <button class="wms-tab-button active" data-tab="main">Основное</button>
                <button class="wms-tab-button" data-tab="tables">Управление столами</button>
                <button class="wms-tab-button" data-tab="mappings">Маппинги</button>
                <button class="wms-tab-button" data-tab="updates">Обновления</button>
            </div>

            <!-- Основная вкладка -->
            <div id="wms-tab-main" class="wms-tab-content">
                <div class="wms-section">
                    <div style="font-weight: bold; margin-bottom: 8px; color: #333;">
                        🎯 Активный стол: <span style="color: #FF5722;">${currentPreset}</span>
                    </div>
                    <div style="display: flex; gap: 5px; align-items: center; margin-bottom: 8px;">
                        <select id="wms-table-preset" style="flex: 1; padding: 5px; border: 1px solid #ddd; border-radius: 3px; font-size: 11px;">
                            <option value="">-- Переключить на стол --</option>
                            ${tablesSelectOptions}
                        </select>
                        <button id="wms-switch-preset" style="padding: 5px 10px; background: #FF5722; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">
                            Переключить
                        </button>
                    </div>
                </div>

                <div class="wms-section">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Размер шрифта (px):</label>
                    <div style="display: flex; gap: 5px; align-items: center;">
                        <input type="number" id="wms-font-size-input" value="${parseInt(LARGE_FONT_SIZE)}" min="12" max="100" style="width: 80px; padding: 5px; border: 1px solid #ddd; border-radius: 3px;">
                        <span style="font-size: 11px; color: #666;">px</span>
                        <button id="wms-apply-font-size" style="padding: 5px 10px; background: #9C27B0; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">
                            Применить
                        </button>
                    </div>
                    <div style="font-size: 10px; color: #888; margin-top: 2px;" class="current-font-size">Текущий: ${LARGE_FONT_SIZE}</div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 15px;">
                    <button id="wms-test-now" style="padding: 8px 12px; background: #2196F3; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">
                        🔍 Тест сейчас
                    </button>
                    <button id="wms-diagnose" style="padding: 8px 12px; background: #607D8B; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">
                        🔧 Диагностика
                    </button>
                </div>
            </div>

            <!-- Вкладка управления столами -->
            <div id="wms-tab-tables" class="wms-tab-content" style="display: none;">
                <div class="wms-section">
                    <div style="font-weight: bold; margin-bottom: 10px;">📝 Создать новый стол</div>
                    <div style="display: flex; gap: 5px; margin-bottom: 10px;">
                        <input type="text" id="wms-new-table-name" placeholder="Название нового стола" style="flex: 1; padding: 5px; border: 1px solid #ddd; border-radius: 3px;">
                        <button id="wms-create-table" style="padding: 5px 10px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">
                            Создать
                        </button>
                    </div>
                </div>

                <div class="wms-section">
                    <div style="font-weight: bold; margin-bottom: 10px;">📋 Все столы</div>
                    <div id="wms-tables-list" style="max-height: 300px; overflow-y: auto;"></div>
                </div>
            </div>

            <!-- Вкладка маппингов -->
            <div id="wms-tab-mappings" class="wms-tab-content" style="display: none;">
                <div class="wms-section">
                    <div style="font-weight: bold; margin-bottom: 10px;">
                        Направления в ${currentPreset}:
                        <span id="wms-mappings-count" style="color: #666; font-weight: normal;">(${Object.keys(getCurrentMappings()).length})</span>
                    </div>

                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px;">Добавить направление (только буквенное название):</label>
                        <input type="text" id="wms-direction-input" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 3px; margin-bottom: 5px;" placeholder="Например: Дыбенко">
                        <label style="display: block; margin-bottom: 5px;">Контейнер:</label>
                        <input type="text" id="wms-container-input" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 3px; margin-bottom: 10px;" placeholder="Например: 2---Дыбенко">
                        <button id="wms-add-mapping" style="width: 100%; padding: 8px 12px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">
                            Добавить в ${currentPreset}
                        </button>
                        <div style="font-size: 10px; color: #888; margin-top: 5px;">
                            📝 Из "(Б-12) Дыбенко---156-157---" берется только "Дыбенко"
                        </div>
                    </div>

                    <div style="display: flex; gap: 5px; margin-bottom: 10px;">
                        <button id="wms-reset-preset" style="flex: 1; padding: 4px 8px; background: #9E9E9E; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">
                            Сбросить к исходному
                        </button>
                        <button id="wms-copy-preset" style="flex: 1; padding: 4px 8px; background: #607D8B; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">
                            Копировать в буфер
                        </button>
                    </div>

                    <div id="wms-mappings-list" style="max-height: 200px; overflow-y: auto; border: 1px solid #eee; padding: 5px; background: #f9f9f9;"></div>
                </div>
            </div>

            <!-- Вкладка обновлений -->
            <div id="wms-tab-updates" class="wms-tab-content" style="display: none;">
                <div class="wms-section">
                    <div style="font-weight: bold; margin-bottom: 15px; color: #333;">🔄 Обновление скрипта</div>
                    
                    <div style="margin-bottom: 15px;">
                        <button id="wms-open-update" style="width: 100%; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold;">
                            🚀 Обновить скрипт
                        </button>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <button onclick="window.open('${UPDATE_CONFIG.GITHUB_REPO}')" style="width: 100%; padding: 8px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">
                            📁 GitHub репозиторий
                        </button>
                    </div>
                    
                    <div style="font-size: 11px; color: #666; line-height: 1.4; margin-bottom: 10px;">
                        <strong>Версия:</strong> ${CURRENT_VERSION}<br>
                        <strong>Обновления:</strong> GitHub → Tampermonkey<br>
                        <strong>Тип:</strong> Ручные (по кнопке)
                    </div>
                    
                    <div style="padding: 10px; background: #e8f5e8; border-radius: 4px; font-size: 11px; color: #2e7d32;">
                        ✅ <strong>Как работает:</strong> Кнопка открывает ссылку на GitHub. Tampermonkey автоматически предложит обновление.
                    </div>
                </div>
            </div>

            <div style="margin-top: 15px; text-align: center; padding-top: 10px; border-top: 1px solid #ddd;">
                <button id="wms-close-panel" style="padding: 5px 15px; background: #666; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    Закрыть
                </button>
            </div>
        `;

        document.body.appendChild(panel);

        // Обработчики табов
        panel.querySelectorAll('.wms-tab-button').forEach(button => {
            button.addEventListener('click', function() {
                const tabName = this.dataset.tab;

                // Переключить активную кнопку
                panel.querySelectorAll('.wms-tab-button').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                // Показать соответствующий контент
                panel.querySelectorAll('.wms-tab-content').forEach(content => content.style.display = 'none');
                const targetContent = panel.querySelector(`#wms-tab-${tabName}`);
                if (targetContent) {
                    targetContent.style.display = 'block';
                }
            });
        });

        // Остальные обработчики событий...
        setupPanelEventHandlers(panel);

        updateMappingsList();
        updateTablesList();
    }

    function setupPanelEventHandlers(panel) {
        // Переключение пресета
        document.getElementById('wms-switch-preset').addEventListener('click', function() {
            const selectedTable = document.getElementById('wms-table-preset').value;
            if (selectedTable) {
                const success = switchToPreset(selectedTable);
                if (success) {
                    panel.style.display = 'none';
                    createControlPanel();
                    document.getElementById('wms-control-panel').style.display = 'block';
                    showNotification(`Переключено на "${selectedTable}" с ${Object.keys(getCurrentMappings()).length} направлениями`, 'success');
                } else {
                    showNotification('Ошибка переключения пресета', 'error');
                }
            } else {
                showNotification('Выберите стол для переключения', 'error');
            }
        });

        // Создание нового стола
        document.getElementById('wms-create-table').addEventListener('click', function() {
            const tableName = document.getElementById('wms-new-table-name').value.trim();
            const result = createCustomTable(tableName);

            if (result.success) {
                document.getElementById('wms-new-table-name').value = '';
                updateTablesList();
                showNotification(result.message, 'success');
            } else {
                showNotification(result.message, 'error');
            }
        });

        // Простая кнопка обновления
        document.getElementById('wms-open-update').addEventListener('click', function() {
            openUpdateLink();
        });

        // Остальные обработчики...
        document.getElementById('wms-reset-preset').addEventListener('click', function() {
            if (confirm(`Сбросить "${currentPreset}" к исходному состоянию? Все изменения будут потеряны!`)) {
                const success = resetPresetToDefault(currentPreset);
                if (success) {
                    panel.style.display = 'none';
                    createControlPanel();
                    document.getElementById('wms-control-panel').style.display = 'block';
                    showNotification(`"${currentPreset}" сброшен к исходному состоянию`, 'success');
                } else {
                    showNotification('Ошибка сброса пресета', 'error');
                }
            }
        });

        document.getElementById('wms-copy-preset').addEventListener('click', function() {
            const currentMappings = getCurrentMappings();
            const jsonText = JSON.stringify(currentMappings, null, 2);
            navigator.clipboard.writeText(jsonText).then(() => {
                showNotification(`Пресет "${currentPreset}" скопирован в буфер обмена`, 'success');
            }).catch(() => {
                console.log('Данные пресета:', jsonText);
                showNotification('Данные выведены в консоль (ошибка копирования)', 'info');
            });
        });

        document.getElementById('wms-add-mapping').addEventListener('click', function() {
            const locationName = document.getElementById('wms-direction-input').value.trim();
            const container = document.getElementById('wms-container-input').value.trim();

            if (locationName && container) {
                addMappingToCurrentPreset(locationName, container);
                updateMappingsList();
                updateMappingsCount();

                document.getElementById('wms-direction-input').value = '';
                document.getElementById('wms-container-input').value = '';

                showNotification(`Добавлено в "${currentPreset}": "${locationName}" → ${container}`, 'success');
            } else {
                showNotification('Заполните оба поля', 'error');
            }
        });

        document.getElementById('wms-test-now').addEventListener('click', function() {
            clearElementCache();
            const result = checkAndReplace(true);
            showNotification(result ? 'Быстрая проверка выполнена - найдены изменения!' : 'Быстрая проверка - изменений нет', 'info');
        });

        document.getElementById('wms-diagnose').addEventListener('click', function() {
            diagnoseElements();
            showNotification('Диагностика выполнена (смотрите консоль)', 'info');
        });

        document.getElementById('wms-apply-font-size').addEventListener('click', function() {
            const newSize = document.getElementById('wms-font-size-input').value;
            if (newSize && newSize >= 12 && newSize <= 100) {
                LARGE_FONT_SIZE = newSize + 'px';
                saveSettings();
                injectCSS();
                applyLargeFontToContainer1();
                document.querySelector('#wms-control-panel .current-font-size').textContent = `Текущий: ${LARGE_FONT_SIZE}`;
                showNotification(`Размер шрифта изменен на ${LARGE_FONT_SIZE}`, 'success');
            } else {
                showNotification('Размер должен быть от 12 до 100 пикселей', 'error');
            }
        });

        document.getElementById('wms-close-panel').addEventListener('click', function() {
            panel.style.display = 'none';
        });
    }

    // Обновить список столов
    function updateTablesList() {
        const listElement = document.getElementById('wms-tables-list');
        if (!listElement) return;

        listElement.innerHTML = '';
        const tablesInfo = getAllTablesInfo();

        for (const [tableName, info] of Object.entries(tablesInfo)) {
            const item = document.createElement('div');
            item.style.cssText = 'margin-bottom: 10px; padding: 10px; background: white; border-radius: 5px; border: 1px solid #ddd;';

            const typeLabel = info.isBuiltIn ? '🏭 Встроенный' : '👤 Пользовательский';
            const activeLabel = info.isActive ? ' (АКТИВНЫЙ)' : '';
            const modifiedLabel = info.isModified ? ' (изменен)' : '';

            item.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 5px; color: ${info.isActive ? '#FF5722' : '#333'};">
                    ${tableName}${activeLabel}
                </div>
                <div style="font-size: 11px; color: #666; margin-bottom: 8px;">
                    ${typeLabel} • ${info.mappingsCount} направлений${modifiedLabel}
                </div>
                <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                    ${!info.isActive ? `<button onclick="switchTableFromList('${tableName}')" style="padding: 3px 8px; background: #2196F3; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">Активировать</button>` : ''}
                    <button onclick="copyTableFromList('${tableName}')" style="padding: 3px 8px; background: #607D8B; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">Копировать</button>
                    ${!info.isBuiltIn ? `<button onclick="renameTableFromList('${tableName}')" style="padding: 3px 8px; background: #FF9800; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">Переименовать</button>` : ''}
                    ${!info.isBuiltIn ? `<button onclick="deleteTableFromList('${tableName}')" style="padding: 3px 8px; background: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">Удалить</button>` : ''}
                    ${info.isBuiltIn && info.isModified ? `<button onclick="resetTableFromList('${tableName}')" style="padding: 3px 8px; background: #9E9E9E; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">Сбросить</button>` : ''}
                </div>
            `;

            listElement.appendChild(item);
        }
    }

    // Глобальные функции для управления столами из списка
    window.switchTableFromList = function(tableName) {
        const success = switchToPreset(tableName);
        if (success) {
            const panel = document.getElementById('wms-control-panel');
            panel.style.display = 'none';
            createControlPanel();
            document.getElementById('wms-control-panel').style.display = 'block';
            showNotification(`Переключено на "${tableName}"`, 'success');
        }
    };

    window.copyTableFromList = function(tableName) {
        const newName = prompt(`Введите название для копии стола "${tableName}":`);
        if (newName) {
            const result = copyTable(tableName, newName);
            if (result.success) {
                updateTablesList();
                showNotification(result.message, 'success');
            } else {
                showNotification(result.message, 'error');
            }
        }
    };

    window.renameTableFromList = function(tableName) {
        const newName = prompt(`Введите новое название для стола "${tableName}":`);
        if (newName) {
            const result = renameTable(tableName, newName);
            if (result.success) {
                updateTablesList();
                const panel = document.getElementById('wms-control-panel');
                if (currentPreset === newName) {
                    // Если переименован активный стол, обновляем интерфейс
                    panel.style.display = 'none';
                    createControlPanel();
                    document.getElementById('wms-control-panel').style.display = 'block';
                }
                showNotification(result.message, 'success');
            } else {
                showNotification(result.message, 'error');
            }
        }
    };

    window.deleteTableFromList = function(tableName) {
        if (confirm(`Удалить стол "${tableName}" со всеми маппингами?`)) {
            const result = deleteCustomTable(tableName);
            if (result.success) {
                updateTablesList();
                const panel = document.getElementById('wms-control-panel');
                if (currentPreset !== tableName) {
                    updateTablesList(); // Просто обновляем список
                } else {
                    // Если удален активный стол, переключились на стол 18, обновляем интерфейс
                    panel.style.display = 'none';
                    createControlPanel();
                    document.getElementById('wms-control-panel').style.display = 'block';
                }
                showNotification(result.message, 'success');
            } else {
                showNotification(result.message, 'error');
            }
        }
    };

    window.resetTableFromList = function(tableName) {
        if (confirm(`Сбросить стол "${tableName}" к исходному состоянию?`)) {
            const success = resetPresetToDefault(tableName);
            if (success) {
                updateTablesList();
                if (currentPreset === tableName) {
                    updateMappingsList();
                    updateMappingsCount();
                }
                showNotification(`Стол "${tableName}" сброшен`, 'success');
            }
        }
    };

    // Обновить счетчик маппингов
    function updateMappingsCount() {
        const countElement = document.getElementById('wms-mappings-count');
        if (countElement) {
            countElement.textContent = `(${Object.keys(getCurrentMappings()).length})`;
        }
    }

    function updateMappingsList() {
        const listElement = document.getElementById('wms-mappings-list');
        if (listElement) {
            listElement.innerHTML = '';
            const currentMappings = getCurrentMappings();

            for (const [locationName, container] of Object.entries(currentMappings)) {
                const item = document.createElement('div');
                item.style.cssText = 'margin-bottom: 8px; padding: 5px; background: white; border-radius: 3px; font-size: 11px; position: relative;';

                const locationDiv = document.createElement('div');
                locationDiv.style.cssText = 'font-weight: bold; color: #333; padding-right: 25px;';
                locationDiv.textContent = locationName;

                const containerDiv = document.createElement('div');
                containerDiv.style.cssText = 'color: #666;';
                containerDiv.textContent = `→ ${container}`;

                const deleteBtn = document.createElement('button');
                deleteBtn.style.cssText = 'position: absolute; top: 5px; right: 5px; padding: 2px 6px; background: #f44336; color: white; border: none; border-radius: 2px; cursor: pointer; font-size: 10px;';
                deleteBtn.textContent = '×';
                deleteBtn.onclick = () => deleteMapping(locationName);

                item.appendChild(locationDiv);
                item.appendChild(containerDiv);
                item.appendChild(deleteBtn);
                listElement.appendChild(item);
            }
        }

        // Обновить счетчик
        updateMappingsCount();
    }

    // Глобальная функция для удаления соответствий
    window.deleteMapping = function(locationName) {
        const success = removeMappingFromCurrentPreset(locationName);
        if (success) {
            updateMappingsList();
            updateMappingsCount();
            showNotification(`Удалено из "${currentPreset}": "${locationName}"`, 'info');
        }
    };

    // ========== УПРАВЛЕНИЕ РЕЖИМАМИ ==========

    function startNormalMode() {
        if (normalCheckTimer) {
            clearInterval(normalCheckTimer);
        }

        // Применить увеличенный шрифт
        setTimeout(() => {
            applyLargeFontToContainer1();
        }, 500);

        // Основной цикл быстрых проверок (каждые 500ms)
        normalCheckTimer = setInterval(() => {
            if (isEnabled) {
                quickCheck();
                applyLargeFontToContainer1(); // Переприменяем шрифт
            }
        }, CHECK_INTERVAL);

        console.log(`🚀 Запущен обычный режим (каждые ${CHECK_INTERVAL}ms)`);
    }

    function startFastCheckMode() {
        if (fastCheckTimer) {
            clearInterval(fastCheckTimer);
        }

        fastCheckTimer = setInterval(() => {
            if (isEnabled) {
                quickCheck();
            }
        }, 100); // Ультрабыстрые проверки каждые 100ms

        // Отключаем быстрый режим через 10 секунд
        setTimeout(() => {
            if (fastCheckTimer) {
                clearInterval(fastCheckTimer);
                fastCheckTimer = null;
                console.log('⚡ Быстрый режим автоматически отключен');
            }
        }, 10000);

        console.log('⚡ Запущен быстрый режим проверок (100ms на 10 сек)');
    }

    // ========== МОНИТОРИНГ DOM ==========

    function setupDOMObserver() {
        if (!window.MutationObserver) {
            console.warn('MutationObserver не поддерживается');
            return;
        }

        const observer = new MutationObserver((mutations) => {
            if (!isEnabled) return;

            let shouldCheck = false;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const target = mutation.target;

                    // Быстрая проверка - ищем изменения в областях направления или контейнеров
                    if (target.tagName === 'B' || target.tagName === 'H1' ||
                        target.closest('div[5]') || target.querySelector('b, h1')) {
                        shouldCheck = true;
                    }
                }
            });

            if (shouldCheck) {
                setTimeout(quickCheck, 50);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        console.log('👀 DOM Observer активирован');
    }

    // ========== ГОРЯЧИЕ КЛАВИШИ ==========

    function setupHotkeys() {
        document.addEventListener('keydown', function(e) {
            // Ctrl+Shift+W - открыть/закрыть панель управления
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyW') {
                e.preventDefault();
                const panel = document.getElementById('wms-control-panel');
                if (panel) {
                    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
                } else {
                    createControlPanel();
                    document.getElementById('wms-control-panel').style.display = 'block';
                }
            }

            // Ctrl+Shift+T - быстрый тест
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyT') {
                e.preventDefault();
                clearElementCache();
                checkAndReplace(true);
            }

            // Ctrl+Shift+F - применить шрифт принудительно
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyF') {
                e.preventDefault();
                applyLargeFontToContainer1();
                showNotification('Шрифт переприменен принудительно', 'info');
            }

            // Ctrl+Shift+D - диагностика (скрытая функция)
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
                e.preventDefault();
                diagnoseElements();
                showNotification('Диагностика выполнена (смотрите консоль)', 'info');
            }

            // Ctrl+Shift+Q - режим быстрых проверок
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyQ') {
                e.preventDefault();
                startFastCheckMode();
                showNotification('Режим быстрых проверок запущен!', 'info');
            }

            // Ctrl+Shift+U - проверить обновления
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyU') {
                e.preventDefault();
                openUpdateLink();
            }
        });

        console.log('⌨️ Горячие клавиши активированы');
    }

    // ========== КНОПКА УПРАВЛЕНИЯ ==========

    function createToggleButton() {
        const button = document.createElement('button');
        button.id = 'wms-toggle-button';
        button.innerHTML = '⚙️';
        button.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #4CAF50;
            color: white;
            border: none;
            font-size: 20px;
            cursor: pointer;
            z-index: 9998;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
        `;

        button.addEventListener('click', function() {
            const panel = document.getElementById('wms-control-panel');
            if (panel) {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            } else {
                createControlPanel();
                document.getElementById('wms-control-panel').style.display = 'block';
            }
        });

        button.addEventListener('mouseenter', function() {
            button.style.transform = 'scale(1.1)';
        });

        button.addEventListener('mouseleave', function() {
            button.style.transform = 'scale(1)';
        });

        document.body.appendChild(button);
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========

    // Функция инициализации
    function initialize() {
        console.log('🚀 WMS Container Override Enhanced v2.8 с упрощенными обновлениями активирован');

        // Внедрить CSS стили
        injectCSS();

        // Загрузить настройки
        loadSettings();

        // Создать кнопку управления
        createToggleButton();

        // Настроить горячие клавиши
        setupHotkeys();

        // Настроить наблюдатель за DOM
        setupDOMObserver();

        // Запустить обычный режим
        startNormalMode();

        // Начальная проверка
        setTimeout(() => {
            checkAndReplace(true);
        }, 1000);

        showNotification(`WMS Override v${CURRENT_VERSION} с упрощенными обновлениями активен! Стол: "${currentPreset}" (${Object.keys(getCurrentMappings()).length} направлений)`, 'success');
    }

    // Ожидание полной загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 150);
    }

    // ========== ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ ТЕСТИРОВАНИЯ ==========
    
    // Функции для ручного управления обновлениями (упрощенные)
    window.wmsUpdate = () => openUpdateLink();
    window.wmsShowVersion = () => console.log(`WMS Container Override v${CURRENT_VERSION}`);
    
    console.log('✅ WMS Container Override Enhanced v2.8 с упрощенными обновлениями загружен');

})();
