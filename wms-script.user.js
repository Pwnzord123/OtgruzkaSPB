// ==UserScript==
// @name         WMS Container Override Enhanced - Complete with GitHub API
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Автозамена контейнеров WMS с полной функциональностью + GitHub API обновления
// @author       Жигалов Ю.В.
// @match        http://edu.sutd.ru/moodle/*
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

    // ========== КОНФИГУРАЦИЯ GitHub API ==========

    const GITHUB_CONFIG = {
        owner: 'Pwnzord123',
        repo: 'OtgruzkaSPB',
        branch: 'main',
        scriptPath: 'wms-script.user.js',
        apiBase: 'https://api.github.com',
        rawBase: 'https://raw.githubusercontent.com',
        webBase: 'https://github.com'
    };

    // Текущая версия скрипта
    const CURRENT_VERSION = '4.0';

    // ========== КОНФИГУРАЦИЯ WMS ==========

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
            "Парнас": "какашка",
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
            "Мужества": "4---Площадь Мужества",
            "Революции": "5---Шоссе Революции",
            "Десантников": "6---Десантников",
            "Швейцарская": "7---Ломоносов Швейцарская",
            "Кронштадт": "8---Кронштадт",
            "Комендантский": "11---Комендантский д.55",
            "Славянка": "9---Славянка",
            "Кузнецовская": "10---Кузнецовская",
            "Кузьмоловский": "11---Кузьмоловский",
            "Богатырский": "12---Богатырский",
            "Мурманское": "13---Мурманское Шоссе",
            "Парашютная": "14---Парашютная",
            "Южное шоссе": "15---Южное Шоссе",
            "Мебельная": "16---Мебельная",
            "Шувалова": "17---Шувалова",
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

    // ========== GITHUB API КЛАСС ==========

    class GitHubAPIUpdater {
        constructor(config) {
            this.config = config;
            this.cache = new Map();
            this.rateLimit = {
                remaining: 60,
                reset: Date.now() + 3600000,
                limit: 60
            };
        }

        // Получить информацию о файле через API
        async getFileInfo() {
            const url = `${this.config.apiBase}/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.scriptPath}`;

            console.log('🔍 Получаем информацию о файле через GitHub API...');

            const response = await this.makeAPIRequest(url);

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            this.updateRateLimit(response.headers);

            return {
                sha: data.sha,
                size: data.size,
                downloadUrl: data.download_url,
                content: data.content,
                encoding: data.encoding,
                lastModified: data.last_modified || new Date().toISOString()
            };
        }

        // Получить содержимое файла
        async getFileContent() {
            const fileInfo = await this.getFileInfo();

            if (fileInfo.encoding === 'base64') {
                return this.decodeBase64Content(fileInfo.content);
            } else {
                throw new Error(`Неподдерживаемая кодировка: ${fileInfo.encoding}`);
            }
        }

        // Декодировать base64 контент
        decodeBase64Content(base64Content) {
            try {
                const cleanBase64 = base64Content.replace(/\s/g, '');
                const binaryString = atob(cleanBase64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const decoder = new TextDecoder('utf-8');
                return decoder.decode(bytes);
            } catch (error) {
                throw new Error(`Ошибка декодирования base64: ${error.message}`);
            }
        }

        // Выполнить запрос к API
        async makeAPIRequest(url, options = {}) {
            const defaultOptions = {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'WMS-Script-Updater/4.0',
                    'Cache-Control': 'no-cache',
                    'If-None-Match': ''
                },
                cache: 'no-store',
                ...options
            };

            const separator = url.includes('?') ? '&' : '?';
            const cacheUrl = `${url}${separator}_=${Date.now()}&rand=${Math.random().toString(36).substring(7)}`;

            const response = await fetch(cacheUrl, defaultOptions);
            return response;
        }

        // Обновить информацию о лимитах API
        updateRateLimit(headers) {
            if (headers.get('x-ratelimit-remaining')) {
                this.rateLimit.remaining = parseInt(headers.get('x-ratelimit-remaining'));
                this.rateLimit.limit = parseInt(headers.get('x-ratelimit-limit'));
                this.rateLimit.reset = parseInt(headers.get('x-ratelimit-reset')) * 1000;
            }
            console.log(`🔢 GitHub API лимит: ${this.rateLimit.remaining}/${this.rateLimit.limit}`);
        }

        // Сравнить версии
        async compareVersions() {
            try {
                const content = await this.getFileContent();
                const remoteVersion = this.extractVersion(content);

                return {
                    current: CURRENT_VERSION,
                    remote: remoteVersion,
                    hasUpdate: this.isNewerVersion(remoteVersion, CURRENT_VERSION),
                    content: content
                };
            } catch (error) {
                throw new Error(`Ошибка сравнения версий: ${error.message}`);
            }
        }

        // Извлечь версию из скрипта
        extractVersion(scriptContent) {
            const versionMatch = scriptContent.match(/@version\s+([\d.]+)/);
            return versionMatch ? versionMatch[1] : 'неизвестно';
        }

        // Проверить, является ли версия более новой
        isNewerVersion(remote, current) {
            if (remote === 'неизвестно') return false;

            const remoteParts = remote.split('.').map(Number);
            const currentParts = current.split('.').map(Number);

            for (let i = 0; i < Math.max(remoteParts.length, currentParts.length); i++) {
                const r = remoteParts[i] || 0;
                const c = currentParts[i] || 0;

                if (r > c) return true;
                if (r < c) return false;
            }

            return false;
        }
    }

    // ========== СИСТЕМА ОБНОВЛЕНИЙ ==========

    class ScriptUpdater {
        constructor() {
            this.github = new GitHubAPIUpdater(GITHUB_CONFIG);
        }

        // Главная функция обновления
        async updateScript() {
            console.log('🚀 Начинаем обновление скрипта...');
            showNotification('Проверяем обновления через GitHub API...', 'info');

            try {
                // Пробуем GitHub API
                const result = await this.updateViaGitHubAPI();
                if (result.success) {
                    return result;
                }
            } catch (error) {
                console.warn('❌ GitHub API недоступен:', error.message);
                showNotification('GitHub API недоступен, используем резервные методы...', 'info');
            }

            // Резервные методы
            return await this.tryFallbackMethods();
        }

        // Обновление через GitHub API
        async updateViaGitHubAPI() {
            const comparison = await this.github.compareVersions();

            console.log(`📊 Версии: текущая ${comparison.current}, удаленная ${comparison.remote}`);

            if (!comparison.hasUpdate) {
                showNotification(`У вас актуальная версия ${comparison.current}`, 'success');
                return { success: true, updated: false, version: comparison.current };
            }

            const installResult = await this.installUpdate(comparison.content, `GitHub API v${comparison.remote}`);

            return {
                success: installResult,
                updated: installResult,
                version: comparison.remote,
                method: 'GitHub API'
            };
        }

        // Резервные методы
        async tryFallbackMethods() {
            const methods = [
                { name: 'Raw URL', func: this.updateViaRawURL.bind(this) },
                { name: 'HTML Parsing', func: this.updateViaHTMLParsing.bind(this) }
            ];

            for (let i = 0; i < methods.length; i++) {
                try {
                    console.log(`🔄 Пробуем метод ${i + 1}: ${methods[i].name}...`);
                    showNotification(`Метод ${i + 1}: ${methods[i].name}...`, 'info');

                    const scriptContent = await methods[i].func();

                    if (this.validateScript(scriptContent)) {
                        const installResult = await this.installUpdate(scriptContent, methods[i].name);
                        return { success: installResult, updated: installResult, method: methods[i].name };
                    }
                } catch (error) {
                    console.warn(`❌ Метод ${i + 1} неудачен:`, error.message);
                    if (i < methods.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }

            showNotification('Автообновление неудачно. Открываем GitHub...', 'error');
            window.open(`${GITHUB_CONFIG.webBase}/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`, '_blank');
            return { success: false, updated: false };
        }

        // Резервный метод: Raw URL
        async updateViaRawURL() {
            const url = `${GITHUB_CONFIG.rawBase}/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${GITHUB_CONFIG.scriptPath}`;
            const fetchUrl = `${url}?v=${Date.now()}&_=${Math.random().toString(36).substring(7)}`;

            const response = await fetch(fetchUrl, {
                method: 'GET',
                headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.text();
        }

        // Резервный метод: HTML парсинг
        async updateViaHTMLParsing() {
            const url = `${GITHUB_CONFIG.webBase}/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/blob/${GITHUB_CONFIG.branch}/${GITHUB_CONFIG.scriptPath}`;
            const fetchUrl = `${url}?t=${Date.now()}`;

            const response = await fetch(fetchUrl, {
                headers: { 'Cache-Control': 'no-cache' },
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            return this.extractScriptFromHTML(html);
        }

        // Валидация скрипта
        validateScript(content) {
            return content &&
                   content.length > 5000 &&
                   content.includes('==UserScript==') &&
                   content.includes('WMS Container Override');
        }

        // Извлечь скрипт из HTML
        extractScriptFromHTML(html) {
            const tableMatch = html.match(/<table[^>]*class="[^"]*highlight[^"]*"[^>]*>(.*?)<\/table>/s);
            if (!tableMatch) {
                throw new Error('Не найден контейнер с кодом');
            }

            const content = tableMatch[1];
            const linePattern = /<td[^>]*class="[^"]*blob-code[^"]*"[^>]*>(.*?)<\/td>/gs;
            const lineMatches = [...content.matchAll(linePattern)];

            const scriptLines = lineMatches.map(match => {
                let line = match[1].replace(/<[^>]*>/g, '');
                return this.decodeHTMLEntities(line);
            });

            return scriptLines.join('\n');
        }

        // Декодирование HTML сущностей
        decodeHTMLEntities(text) {
            const entities = {
                '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
                '&#x27;': "'", '&#x2F;': '/', '&#39;': "'", '&nbsp;': ' ', '&#x60;': '`'
            };
            return text.replace(/&[#\w]+;/g, entity => entities[entity] || entity);
        }

        // Установить обновление
        async installUpdate(scriptContent, methodName) {
            try {
                console.log(`✅ Скрипт получен через: ${methodName}`);

                const modifiedScript = this.prepareScriptForInstall(scriptContent, methodName);
                const blob = new Blob([modifiedScript], { type: 'text/javascript; charset=utf-8' });
                const blobUrl = URL.createObjectURL(blob);

                window.open(blobUrl, '_blank');

                showNotification(`Скрипт готов к установке! (${methodName})`, 'success');
                this.showInstallInstructions();

                setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
                return true;
            } catch (error) {
                throw new Error(`Ошибка установки: ${error.message}`);
            }
        }

        // Подготовить скрипт для установки
        prepareScriptForInstall(scriptContent, methodName) {
            const timestamp = Date.now();
            const newVersion = `4.0.${timestamp}`;

            let modified = scriptContent;
            modified = modified.replace(/@version\s+[\d.]+/g, `@version      ${newVersion}`);
            modified = modified.replace(/const\s+CURRENT_VERSION\s*=\s*['"`][\d.]+['"`]/g, `const CURRENT_VERSION = '${newVersion}'`);

            const updateComment = `
// ========== ОБНОВЛЕНО ${new Date().toLocaleString('ru-RU')} ==========
// Версия: ${newVersion}
// Метод: ${methodName}
// ================================================================

`;

            const headerEnd = modified.indexOf('==/UserScript==') + '==/UserScript=='.length;
            if (headerEnd > 0) {
                modified = modified.substring(0, headerEnd) + '\n' + updateComment + modified.substring(headerEnd);
            }

            return modified;
        }

        // Показать инструкции по установке
        showInstallInstructions() {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.8); z-index: 99999; display: flex;
                align-items: center; justify-content: center; font-family: Arial, sans-serif;
            `;

            modal.innerHTML = `
                <div style="background: white; border-radius: 10px; padding: 30px; max-width: 400px; width: 90%; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold; color: #4CAF50; margin-bottom: 15px;">
                        🚀 Обновление готово!
                    </div>
                    <div style="margin-bottom: 20px; font-size: 14px; color: #333;">
                        Нажмите <strong>"Переустановить"</strong> в новой вкладке
                    </div>
                    <button onclick="this.closest('div').parentElement.remove()"
                            style="padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        👍 Понял
                    </button>
                </div>
            `;

            document.body.appendChild(modal);
            setTimeout(() => modal.remove(), 20000);
        }
    }

    // ========== УПРАВЛЕНИЕ НАСТРОЙКАМИ ==========

    // Проверить и обновить пресеты при обновлении скрипта
    function checkAndUpdatePresets() {
        const lastVersion = localStorage.getItem('wms_last_version');

        if (lastVersion !== CURRENT_VERSION) {
            console.log(`🔄 Обнаружено обновление: ${lastVersion || 'неизвестно'} → ${CURRENT_VERSION}`);

            const savedPresets = localStorage.getItem('wms_user_presets');
            let currentUserPresets = {};

            if (savedPresets) {
                try {
                    currentUserPresets = JSON.parse(savedPresets);
                } catch (e) {
                    console.error('Ошибка парсинга пресетов:', e);
                }
            }

            Object.keys(TABLE_PRESETS).forEach(tableName => {
                const userPreset = currentUserPresets[tableName];
                const builtinPreset = TABLE_PRESETS[tableName];

                if (userPreset) {
                    const updatedPreset = { ...builtinPreset };
                    Object.keys(userPreset).forEach(locationName => {
                        if (!builtinPreset[locationName]) {
                            updatedPreset[locationName] = userPreset[locationName];
                        }
                    });
                    currentUserPresets[tableName] = updatedPreset;
                } else {
                    currentUserPresets[tableName] = { ...builtinPreset };
                }
            });

            userPresets = currentUserPresets;
            savePresets();
            localStorage.setItem('wms_last_version', CURRENT_VERSION);

            setTimeout(() => {
                showNotification(`Пресеты обновлены до версии ${CURRENT_VERSION}!`, 'success');
            }, 2000);

            return true;
        }

        return false;
    }

    // Загрузить настройки
    function loadSettings() {
        const wasUpdated = checkAndUpdatePresets();

        if (!wasUpdated) {
            const savedPresets = localStorage.getItem('wms_user_presets');
            if (savedPresets) {
                try {
                    userPresets = JSON.parse(savedPresets);
                } catch (e) {
                    initializeDefaultPresets();
                }
            } else {
                initializeDefaultPresets();
            }
        }

        const savedCurrentPreset = localStorage.getItem('wms_current_preset');
        if (savedCurrentPreset && userPresets[savedCurrentPreset]) {
            currentPreset = savedCurrentPreset;
        }

        const savedFontSize = localStorage.getItem('wms_font_size');
        if (savedFontSize) {
            LARGE_FONT_SIZE = savedFontSize;
        }
    }

    // Инициализация пресетов
    function initializeDefaultPresets() {
        userPresets = JSON.parse(JSON.stringify(TABLE_PRESETS));
        savePresets();
    }

    // Сохранить настройки
    function saveSettings() {
        localStorage.setItem('wms_font_size', LARGE_FONT_SIZE);
        localStorage.setItem('wms_current_preset', currentPreset);
    }

    // Сохранить пресеты
    function savePresets() {
        localStorage.setItem('wms_user_presets', JSON.stringify(userPresets));
    }

    // Получить текущие маппинги
    function getCurrentMappings() {
        return userPresets[currentPreset] || {};
    }

    // ========== CSS СТИЛИ ==========

    function injectCSS() {
        const styleId = 'wms-override-styles';
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
                background: #f0f0f0; border: 1px solid #ddd; padding: 8px 12px;
                margin: 2px; border-radius: 4px; cursor: pointer; font-size: 11px;
                transition: all 0.2s ease;
            }

            .wms-tab-button:hover { background: #e0e0e0; }
            .wms-tab-button.active { background: #4CAF50; color: white; border-color: #4CAF50; }

            .wms-section {
                border: 1px solid #ddd; border-radius: 5px; padding: 10px;
                margin-bottom: 10px; background: #f8f9fa;
            }
        `;

        document.head.appendChild(style);
    }

    // ========== РАБОТА С XPATH ==========

    function getElementByXPath(xpath, useCache = true) {
        const now = Date.now();

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

        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        const element = result.singleNodeValue;

        if (element) {
            if (xpath === DIRECTION_XPATH) cachedElements.direction = element;
            if (xpath === CONTAINER_XPATH_1) cachedElements.container1 = element;
            if (xpath === CONTAINER_XPATH_2) cachedElements.container2 = element;
            cachedElements.lastUpdate = now;
        }

        return element;
    }

    function clearElementCache() {
        cachedElements = { direction: null, container1: null, container2: null, lastUpdate: 0 };
    }

    // ========== ОСНОВНЫЕ ФУНКЦИИ WMS ==========

    function getCurrentDirection(useCache = true) {
        const directionElement = getElementByXPath(DIRECTION_XPATH, useCache);
        return directionElement ? directionElement.textContent.trim() : null;
    }

    function findMappingByLocationName(fullDirection, mappings) {
        if (!fullDirection || !mappings) return null;

        const normalizedDirection = fullDirection.toLowerCase().trim();

        for (const [mappingKey, mappingValue] of Object.entries(mappings)) {
            const normalizedKey = mappingKey.toLowerCase().trim();
            if (normalizedDirection.includes(normalizedKey)) {
                console.log(`✅ НАЙДЕНО: "${mappingKey}" → ${mappingValue}`);
                return mappingValue;
            }
        }

        return null;
    }

    function extractLocationName(fullDirection) {
        if (!fullDirection) return null;
        let cleaned = fullDirection.replace(/^\([^)]+\)\s*/, '');
        cleaned = cleaned.replace(/---.*$/, '');
        cleaned = cleaned.replace(/--.*$/, '');
        return cleaned.trim() || null;
    }

    function applyLargeFontToContainer1() {
        const containerElement1 = getElementByXPath(CONTAINER_XPATH_1);
        if (containerElement1) {
            containerElement1.classList.remove('wms-large-container');
            containerElement1.classList.add('wms-large-container');
            return true;
        }
        return false;
    }

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
                element.textContent = newContainer;
                element.classList.add('wms-highlight');
                successCount++;
            }
        });

        if (successCount > 0) {
            setTimeout(() => applyLargeFontToContainer1(), 100);
            return true;
        }
        return false;
    }

    function checkAndReplace(forced = false) {
        const currentDirection = getCurrentDirection(!forced);
        const currentMappings = getCurrentMappings();

        if (currentDirection) {
            let newContainer = findMappingByLocationName(currentDirection, currentMappings);

            if (!newContainer) {
                const locationName = extractLocationName(currentDirection);
                if (locationName) {
                    newContainer = findMappingByLocationName(locationName, currentMappings);
                }
            }

            if (newContainer) {
                const containerElement1 = getElementByXPath(CONTAINER_XPATH_1, !forced);
                const containerElement2 = getElementByXPath(CONTAINER_XPATH_2, !forced);

                const currentContainer1 = containerElement1 ? containerElement1.textContent.trim() : '';
                const currentContainer2 = containerElement2 ? containerElement2.textContent.trim() : '';

                if (currentContainer1 !== newContainer || currentContainer2 !== newContainer) {
                    setContainer(newContainer);
                    return true;
                }
            }
        }
        return false;
    }

    function quickCheck() {
        const currentDirection = getCurrentDirection(true);
        const currentMappings = getCurrentMappings();

        if (currentDirection) {
            let newContainer = findMappingByLocationName(currentDirection, currentMappings);

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

    // ========== УВЕДОМЛЕНИЯ ==========

    function showNotification(message, type = 'info') {
        if (typeof GM_notification !== 'undefined' && type !== 'error') {
            GM_notification({
                title: 'WMS Container Override',
                text: message,
                timeout: 4000
            });
            return;
        }

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 15px 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white; border-radius: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000; font-family: Arial, sans-serif; font-size: 14px;
            max-width: 350px; word-wrap: break-word;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), type === 'error' ? 6000 : 4000);
    }

    // ========== ИНТЕРФЕЙС УПРАВЛЕНИЯ ==========

    function createControlPanel() {
        const panel = document.createElement('div');
        panel.id = 'wms-control-panel';
        panel.style.cssText = `
            position: fixed; top: 10px; left: 10px; background: white;
            border: 2px solid #ddd; border-radius: 8px; padding: 15px;
            z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: Arial, sans-serif; font-size: 12px;
            max-width: 500px; max-height: 80vh; overflow-y: auto; display: none;
        `;

        const currentMappings = getCurrentMappings();
        const mappingsCount = Object.keys(currentMappings).length;

        panel.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; color: #333;">
                🚀 WMS Container Override Enhanced v${CURRENT_VERSION}
            </div>

            <div style="margin-bottom: 15px; font-size: 11px; color: #666;">
                GitHub API + автозамена контейнеров
            </div>

            <div class="wms-section">
                <div style="font-weight: bold; margin-bottom: 8px; color: #333;">
                    🎯 Активный стол: <span style="color: #FF5722;">${currentPreset}</span> (${mappingsCount} направлений)
                </div>
                <div style="display: flex; gap: 5px; margin-bottom: 8px;">
                    <select id="wms-table-preset" style="flex: 1; padding: 5px; border: 1px solid #ddd; border-radius: 3px; font-size: 11px;">
                        <option value="">-- Переключить на стол --</option>
                        ${Object.keys(userPresets).map(tableName => {
                            const count = Object.keys(userPresets[tableName]).length;
                            return `<option value="${tableName}">${tableName} (${count})</option>`;
                        }).join('')}
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
            </div>

            <div style="margin-bottom: 15px;">
                <button id="wms-update-script" style="width: 100%; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold;">
                    🚀 Обновить скрипт через GitHub API
                </button>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 15px;">
                <button id="wms-test-now" style="padding: 8px 12px; background: #2196F3; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">
                    🔍 Тест сейчас
                </button>
                <button id="wms-diagnose" style="padding: 8px 12px; background: #607D8B; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">
                    🔧 Диагностика
                </button>
            </div>

            <div style="margin-top: 15px; text-align: center; padding-top: 10px; border-top: 1px solid #ddd;">
                <button id="wms-close-panel" style="padding: 5px 15px; background: #666; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    Закрыть
                </button>
            </div>
        `;

        document.body.appendChild(panel);
        setupPanelEventHandlers(panel);
    }

    function setupPanelEventHandlers(panel) {
        // Обновление скрипта
        document.getElementById('wms-update-script').addEventListener('click', function() {
            const updater = new ScriptUpdater();
            updater.updateScript();
        });

        // Переключение пресета
        document.getElementById('wms-switch-preset').addEventListener('click', function() {
            const selectedTable = document.getElementById('wms-table-preset').value;
            if (selectedTable && userPresets[selectedTable]) {
                currentPreset = selectedTable;
                saveSettings();
                panel.style.display = 'none';
                createControlPanel();
                document.getElementById('wms-control-panel').style.display = 'block';
                showNotification(`Переключено на "${selectedTable}"`, 'success');
            }
        });

        // Применить размер шрифта
        document.getElementById('wms-apply-font-size').addEventListener('click', function() {
            const newSize = document.getElementById('wms-font-size-input').value;
            if (newSize && newSize >= 12 && newSize <= 100) {
                LARGE_FONT_SIZE = newSize + 'px';
                saveSettings();
                injectCSS();
                applyLargeFontToContainer1();
                showNotification(`Размер шрифта изменен на ${LARGE_FONT_SIZE}`, 'success');
            }
        });

        // Тест сейчас
        document.getElementById('wms-test-now').addEventListener('click', function() {
            clearElementCache();
            const result = checkAndReplace(true);
            showNotification(result ? 'Проверка выполнена - найдены изменения!' : 'Проверка - изменений нет', 'info');
        });

        // Диагностика
        document.getElementById('wms-diagnose').addEventListener('click', function() {
            console.log('=== ДИАГНОСТИКА ===');
            console.log('Версия:', CURRENT_VERSION);
            console.log('Активный пресет:', currentPreset);
            console.log('Направлений в пресете:', Object.keys(getCurrentMappings()).length);

            const directionElement = getElementByXPath(DIRECTION_XPATH);
            console.log('Направление:', directionElement ? directionElement.textContent : 'НЕ НАЙДЕНО');

            const containerElement1 = getElementByXPath(CONTAINER_XPATH_1);
            console.log('Контейнер 1:', containerElement1 ? containerElement1.textContent : 'НЕ НАЙДЕНО');

            showNotification('Диагностика выполнена (смотрите консоль)', 'info');
        });

        // Закрыть панель
        document.getElementById('wms-close-panel').addEventListener('click', function() {
            panel.style.display = 'none';
        });
    }

    function createToggleButton() {
        const button = document.createElement('button');
        button.id = 'wms-toggle-button';
        button.innerHTML = '⚙️';
        button.style.cssText = `
            position: fixed; top: 10px; right: 10px; width: 50px; height: 50px;
            border-radius: 50%; background: #4CAF50; color: white; border: none;
            font-size: 20px; cursor: pointer; z-index: 9998;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.3s ease;
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

        document.body.appendChild(button);
    }

    // ========== УПРАВЛЕНИЕ РЕЖИМАМИ ==========

    function startNormalMode() {
        if (normalCheckTimer) {
            clearInterval(normalCheckTimer);
        }

        setTimeout(() => applyLargeFontToContainer1(), 500);

        normalCheckTimer = setInterval(() => {
            if (isEnabled) {
                quickCheck();
                applyLargeFontToContainer1();
            }
        }, CHECK_INTERVAL);

        console.log(`🚀 Запущен обычный режим (каждые ${CHECK_INTERVAL}ms)`);
    }

    function setupDOMObserver() {
        if (!window.MutationObserver) return;

        const observer = new MutationObserver((mutations) => {
            if (!isEnabled) return;

            let shouldCheck = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const target = mutation.target;
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

    function setupHotkeys() {
        document.addEventListener('keydown', function(e) {
            // Ctrl+Shift+W - открыть/закрыть панель
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

            // Ctrl+Shift+U - обновить скрипт
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyU') {
                e.preventDefault();
                const updater = new ScriptUpdater();
                updater.updateScript();
            }

            // Ctrl+Shift+T - быстрый тест
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyT') {
                e.preventDefault();
                clearElementCache();
                checkAndReplace(true);
            }
        });

        console.log('⌨️ Горячие клавиши активированы');
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========

    function initialize() {
        console.log('🚀 WMS Container Override Enhanced v4.0 с GitHub API активирован');

        injectCSS();
        loadSettings();
        createToggleButton();
        setupHotkeys();
        setupDOMObserver();
        startNormalMode();

        setTimeout(() => checkAndReplace(true), 1000);

        const presetsCount = Object.keys(getCurrentMappings()).length;
        const lastVersion = localStorage.getItem('wms_last_version');
        const updateInfo = lastVersion !== CURRENT_VERSION ? ' (обновлено!)' : '';

        showNotification(`WMS Override v${CURRENT_VERSION} активен! Стол: "${currentPreset}" (${presetsCount})${updateInfo}`, 'success');
    }

    // Глобальные функции
    window.updateWMSScript = () => {
        const updater = new ScriptUpdater();
        updater.updateScript();
    };

    window.wmsShowVersion = () => console.log(`WMS Container Override v${CURRENT_VERSION}`);

    // Ожидание полной загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 150);
    }

    console.log('✅ WMS Container Override Enhanced v4.0 загружен');
    console.log('🔧 Команды: updateWMSScript(), wmsShowVersion()');
    console.log('⌨️ Горячие клавиши: Ctrl+Shift+W (панель), Ctrl+Shift+U (обновление), Ctrl+Shift+T (тест)');

})();
