/**
 * MIT 6.828 实验文档增强脚本
 * 提供代码高亮、主题切换、导航增强等功能
 */

(function() {
    'use strict';

    // 配置选项
    const CONFIG = {
        enableSyntaxHighlight: true,
        enableThemeToggle: true,
        enableCopyCode: true,
        enableLineNumbers: true,
        autoDetectLanguage: true,
        themes: {
            light: 'light',
            dark: 'dark',
            auto: 'auto'
        }
    };

    // 语法高亮规则
    const SYNTAX_RULES = {
        c: {
            keywords: /\b(auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|inline|int|long|register|restrict|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while|_Bool|_Complex|_Imaginary)\b/g,
            strings: /(["'])(?:(?=(\\?))\2.)*?\1/g,
            comments: /(\/\*[\s\S]*?\*\/|\/\/.*$)/gm,
            numbers: /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[fFlL]?\b/g,
            preprocessor: /^\s*#\s*\w+.*$/gm,
            functions: /\b([a-zA-Z_]\w*)\s*(?=\()/g
        },
        css: {
            selectors: /([.#]?[a-zA-Z_-][\w-]*(?:\s*[>+~]\s*)?)+\s*(?={)/g,
            properties: /\b(background|border|color|display|font|margin|padding|width|height|position|top|left|right|bottom|z-index|opacity|transform|transition|animation|flex|grid|text-align|text-decoration|line-height|letter-spacing|word-spacing|text-transform|white-space|overflow|visibility|float|clear|cursor|box-shadow|border-radius|background-color|background-image|background-size|background-position|background-repeat|font-family|font-size|font-weight|font-style|text-shadow|list-style|outline|resize|user-select|pointer-events|box-sizing|vertical-align|text-indent|min-width|max-width|min-height|max-height)\b/g,
            values: /\b(none|auto|inherit|initial|unset|block|inline|inline-block|flex|grid|absolute|relative|fixed|static|sticky|center|left|right|top|bottom|middle|baseline|bold|normal|italic|underline|overline|line-through|uppercase|lowercase|capitalize|nowrap|pre|pre-wrap|pre-line|hidden|visible|scroll|rgba?|hsla?|transparent|solid|dashed|dotted|double|groove|ridge|inset|outset)\b/g,
            units: /\b\d+(?:\.\d+)?(px|em|rem|%|vh|vw|vmin|vmax|pt|pc|in|cm|mm|ex|ch|fr|deg|rad|turn|s|ms)\b/g,
            numbers: /#[0-9a-fA-F]{3,8}|\b\d+(?:\.\d+)?\b/g,
            strings: /(["'])(?:(?=(\\?))\2.)*?\1/g,
            comments: /(\/\*[\s\S]*?\*\/)/g,
            important: /!important/g,
            pseudos: /:+[a-zA-Z-]+(\([^)]*\))?/g,
            atRules: /@[a-zA-Z-]+/g
        },
        assembly: {
            instructions: /\b(mov|add|sub|mul|div|push|pop|call|ret|jmp|je|jne|jz|jnz|cmp|test|lea|int|nop|hlt)\b/gi,
            registers: /\b([er]?[abcd]x|[er]?[sb]p|[er]?[sd]i|r[8-9]|r1[0-5]|[abcd][lh]|[ds]il|[ds]pl|cs|ds|es|fs|gs|ss)\b/gi,
            numbers: /\b0x[0-9a-fA-F]+\b|\b\d+\b/g,
            labels: /^\s*\w+:/gm,
            comments: /(;.*$|\/\*[\s\S]*?\*\/|\/\/.*$)/gm
        },
        shell: {
            commands: /\b(ls|cd|mkdir|rm|cp|mv|grep|find|cat|echo|pwd|chmod|chown|sudo|ssh|git|make|gcc|gdb|objdump|readelf|hexdump|qemu)\b/g,
            flags: /\s-+[a-zA-Z0-9-]+/g,
            variables: /\$\w+|\$\{[^}]+\}/g,
            strings: /(["'])(?:(?=(\\?))\2.)*?\1/g,
            paths: /(?:\/[^\s]*|\.\/[^\s]*|~\/[^\s]*)/g
        }
    };

    // 颜色主题
    const SYNTAX_COLORS = {
        light: {
            keyword: '#d73a49',
            string: '#032f62',
            comment: '#6a737d',
            number: '#005cc5',
            function: '#6f42c1',
            variable: '#e36209',
            operator: '#d73a49',
            preprocessor: '#735c0f',
            selector: '#6f42c1',
            property: '#005cc5',
            value: '#e36209',
            unit: '#005cc5',
            important: '#d73a49',
            pseudo: '#6f42c1',
            atRule: '#d73a49'
        },
        dark: {
            keyword: '#f97583',
            string: '#9ecbff',
            comment: '#6a737d',
            number: '#79b8ff',
            function: '#b392f0',
            variable: '#ffab70',
            operator: '#f97583',
            preprocessor: '#e1e4e8',
            selector: '#b392f0',
            property: '#79b8ff',
            value: '#ffab70',
            unit: '#79b8ff',
            important: '#f97583',
            pseudo: '#b392f0',
            atRule: '#f97583'
        }
    };

    // 工具类
    class Utils {
        static debounce(func, wait) {
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

        static createElement(tag, className, content) {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (content) element.textContent = content;
            return element;
        }

        static addStyles(styles) {
            const styleSheet = document.createElement('style');
            styleSheet.type = 'text/css';
            styleSheet.innerText = styles;
            document.head.appendChild(styleSheet);
        }

        static getTheme() {
            return localStorage.getItem('lab-theme') || 'auto';
        }

        static setTheme(theme) {
            localStorage.setItem('lab-theme', theme);
            document.documentElement.setAttribute('data-theme', theme);
            
            if (theme === 'auto') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            }
        }

        static detectLanguage(code) {
            // 简单的语言检测
            if (/^\s*#include|void\s+\w+\s*\(|int\s+main\s*\(/m.test(code)) {
                return 'c';
            }
            if (/^\s*[a-zA-Z_]\w*:/m.test(code) || /\b(mov|push|pop|call|ret)\b/i.test(code)) {
                return 'assembly';
            }
            if (/^\s*[a-zA-Z_]\w*\s*%|\$\s*|athena%/m.test(code)) {
                return 'shell';
            }
            if (/^\s*\/\*[\s\S]*?\*\/|[.#]?[a-zA-Z_-][\w-]*\s*{|@[a-zA-Z-]+|\b(background|color|font|margin|padding|width|height|display)\s*:/m.test(code)) {
                return 'css';
            }
            return 'text';
        }
    }

    // 语法高亮器
    class SyntaxHighlighter {
        constructor() {
            this.currentTheme = Utils.getTheme();
        }

        highlight(code, language) {
            language = language || Utils.detectLanguage(code);
            const rules = SYNTAX_RULES[language];
            
            if (!rules) return this.escapeHtml(code);

            let highlightedCode = this.escapeHtml(code);
            const colors = SYNTAX_COLORS[this.getEffectiveTheme()];

            // 应用语法规则
            Object.entries(rules).forEach(([type, rule]) => {
                const color = colors[type] || colors.keyword;
                highlightedCode = highlightedCode.replace(rule, 
                    `<span style="color: ${color};">$&</span>`);
            });

            return highlightedCode;
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        getEffectiveTheme() {
            if (this.currentTheme === 'auto') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            return this.currentTheme;
        }

        updateTheme(theme) {
            this.currentTheme = theme;
            this.rehighlightAll();
        }

        rehighlightAll() {
            document.querySelectorAll('pre[data-highlighted]').forEach(pre => {
                const code = pre.getAttribute('data-original-code');
                const language = pre.getAttribute('data-language');
                if (code) {
                    pre.querySelector('code').innerHTML = this.highlight(code, language);
                }
            });
        }
    }

    // 代码块增强器
    class CodeBlockEnhancer {
        constructor(highlighter) {
            this.highlighter = highlighter;
        }

        enhance() {
            const preElements = document.querySelectorAll('pre');
            console.log(`Found ${preElements.length} pre elements to enhance`);
            preElements.forEach((pre, index) => {
                console.log(`Enhancing pre element ${index + 1}:`, pre);
                this.enhanceCodeBlock(pre);
            });
        }

        enhanceCodeBlock(pre) {
            if (pre.hasAttribute('data-enhanced')) return;

            // 如果pre标签内已经有kbd标签，我们只进行包装，不进行语法高亮
            if (pre.querySelector('kbd')) {
                const wrapper = Utils.createElement('div', 'code-block-wrapper');
                const header = this.createCodeHeader('shell', pre.textContent); // 语言设为shell
                
                // 保留原始的pre及其内部的kbd标签
                const preClone = pre.cloneNode(true);
                preClone.setAttribute('data-enhanced', 'true');
                
                wrapper.appendChild(header);
                wrapper.appendChild(preClone);
                
                pre.parentNode.replaceChild(wrapper, pre);
                return; // 结束此函数的执行
            }

            const code = pre.querySelector('code') || pre;
            const originalCode = code.textContent;
            const language = this.detectLanguage(originalCode);

            // 保存原始代码
            pre.setAttribute('data-original-code', originalCode);
            pre.setAttribute('data-language', language);
            pre.setAttribute('data-enhanced', 'true');

            // 创建增强的结构
            this.createEnhancedStructure(pre, originalCode, language);
        }

        createEnhancedStructure(pre, originalCode, language) {
            const wrapper = Utils.createElement('div', 'code-block-wrapper');
            const header = this.createCodeHeader(language, originalCode);
            const contentWrapper = Utils.createElement('div', 'code-content');
            
            // 添加行号
            if (CONFIG.enableLineNumbers) {
                const lineNumbers = this.createLineNumbers(originalCode);
                contentWrapper.appendChild(lineNumbers);
            }

            // 高亮代码
            const codeElement = pre.querySelector('code') || pre;
            if (CONFIG.enableSyntaxHighlight) {
                codeElement.innerHTML = this.highlighter.highlight(originalCode, language);
                pre.setAttribute('data-highlighted', 'true');
            }

            // 包装代码内容
            const codeWrapper = Utils.createElement('div', 'code-wrapper');
            codeWrapper.appendChild(pre.cloneNode(true));
            contentWrapper.appendChild(codeWrapper);

            // 组装结构
            wrapper.appendChild(header);
            wrapper.appendChild(contentWrapper);
            
            // 替换原始pre元素
            pre.parentNode.replaceChild(wrapper, pre);
        }

        createCodeHeader(language, code) {
            const header = Utils.createElement('div', 'code-header');
            
            // 语言标签
            const langLabel = Utils.createElement('span', 'code-language', 
                this.getLanguageDisplayName(language));
            header.appendChild(langLabel);

            // 复制按钮
            if (CONFIG.enableCopyCode) {
                const copyBtn = Utils.createElement('button', 'code-copy-btn', 'Copy');
                copyBtn.setAttribute('data-tooltip', '复制代码');
                copyBtn.addEventListener('click', () => this.copyCode(code, copyBtn));
                header.appendChild(copyBtn);
            }

            return header;
        }

        createLineNumbers(code) {
            const lines = code.split('\n');
            const lineNumbersDiv = Utils.createElement('div', 'line-numbers');
            
            lines.forEach((_, index) => {
                const lineNumber = Utils.createElement('span', 'line-number', 
                    (index + 1).toString());
                lineNumbersDiv.appendChild(lineNumber);
            });

            return lineNumbersDiv;
        }

        detectLanguage(code) {
            return Utils.detectLanguage(code);
        }

        getLanguageDisplayName(language) {
            const displayNames = {
                'c': 'C',
                'css': 'CSS',
                'assembly': 'Assembly',
                'shell': 'Shell',
                'text': 'Text'
            };
            return displayNames[language] || 'Code';
        }

        async copyCode(code, button) {
            try {
                await navigator.clipboard.writeText(code);
                button.textContent = 'Copied!';
                button.setAttribute('data-tooltip', '已复制!');
                setTimeout(() => {
                    button.textContent = 'Copy';
                    button.setAttribute('data-tooltip', '复制代码');
                }, 2000);
            } catch (err) {
                console.error('复制失败:', err);
                button.textContent = 'Error';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            }
        }
    }

    // 主题切换器
    class ThemeToggler {
        constructor(highlighter) {
            this.highlighter = highlighter;
            this.themes = ['light', 'dark', 'auto'];
            this.currentTheme = Utils.getTheme();
        }

        init() {
            this.createToggleButton();
            this.applyTheme(this.currentTheme);
            this.setupMediaQueryListener();
        }

        createToggleButton() {
            const button = Utils.createElement('button', 'theme-toggle');
            button.innerHTML = this.getThemeIcon(this.currentTheme);
            button.setAttribute('data-tooltip', '切换主题');
            button.addEventListener('click', () => this.toggleTheme());
            
            document.body.appendChild(button);
        }

        toggleTheme() {
            const currentIndex = this.themes.indexOf(this.currentTheme);
            const nextIndex = (currentIndex + 1) % this.themes.length;
            this.currentTheme = this.themes[nextIndex];
            
            this.applyTheme(this.currentTheme);
            this.updateButton();
        }

        applyTheme(theme) {
            Utils.setTheme(theme);
            this.highlighter.updateTheme(theme);
        }

        updateButton() {
            const button = document.querySelector('.theme-toggle');
            if (button) {
                button.innerHTML = this.getThemeIcon(this.currentTheme);
            }
        }

        getThemeIcon(theme) {
            const icons = {
                'light': '☀️',
                'dark': '🌙',
                'auto': '🔄'
            };
            return icons[theme] || '🔄';
        }

        setupMediaQueryListener() {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addListener(() => {
                if (this.currentTheme === 'auto') {
                    this.applyTheme('auto');
                }
            });
        }
    }

    // 导航增强器
    class NavigationEnhancer {
        constructor() {
            this.isScrolling = false;
        }

        init() {
            this.enhanceJumpNavigation();
            this.addScrollSpy();
            this.addSmoothScrolling();
        }

        enhanceJumpNavigation() {
            const jumpHdr = document.querySelector('.jump-hdr');
            if (!jumpHdr) return;

            // 添加键盘导航支持
            jumpHdr.addEventListener('keydown', this.handleKeyboardNav.bind(this));
            
            // 改善移动端体验
            if (window.innerWidth <= 768) {
                this.makeMobileFriendly(jumpHdr);
            }
        }

        handleKeyboardNav(event) {
            if (event.key === 'Escape') {
                // 关闭所有下拉菜单
                document.querySelectorAll('.jump-drop').forEach(drop => {
                    drop.style.display = 'none';
                });
            }
        }

        makeMobileFriendly(jumpHdr) {
            jumpHdr.style.position = 'relative';
            jumpHdr.style.top = 'auto';
            jumpHdr.style.right = 'auto';
            jumpHdr.style.marginBottom = '2rem';
        }

        addScrollSpy() {
            const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const navLinks = document.querySelectorAll('.jump-drop a');

            if (headers.length === 0 || navLinks.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.updateActiveNavLink(entry.target.id);
                    }
                });
            }, {
                rootMargin: '-20% 0px -80% 0px'
            });

            headers.forEach(header => {
                if (header.id) observer.observe(header);
            });
        }

        updateActiveNavLink(activeId) {
            document.querySelectorAll('.jump-drop a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes('#' + activeId)) {
                    link.classList.add('active');
                }
            });
        }

        addSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(link => {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        }
    }

    // 可访问性增强器
    class AccessibilityEnhancer {
        init() {
            this.addSkipLinks();
            this.enhanceKeyboardNavigation();
            this.addFocusManagement();
            this.improveScreenReaderSupport();
        }

        addSkipLinks() {
            const skipLink = Utils.createElement('a', 'skip-link', '跳转到主内容');
            skipLink.href = '#main-content';
            skipLink.style.cssText = `
                position: absolute;
                top: -40px;
                left: 6px;
                background: var(--primary-color);
                color: white;
                padding: 8px;
                text-decoration: none;
                border-radius: 4px;
                z-index: 1000;
                transition: top 0.2s;
            `;
            
            skipLink.addEventListener('focus', () => {
                skipLink.style.top = '6px';
            });
            
            skipLink.addEventListener('blur', () => {
                skipLink.style.top = '-40px';
            });
            
            document.body.insertBefore(skipLink, document.body.firstChild);
        }

        enhanceKeyboardNavigation() {
            // 确保所有交互元素都可以通过键盘访问
            document.querySelectorAll('button, a, [tabindex]').forEach(element => {
                if (!element.hasAttribute('tabindex')) {
                    element.setAttribute('tabindex', '0');
                }
            });
        }

        addFocusManagement() {
            // 为焦点添加清晰的指示器
            Utils.addStyles(`
                .focus-visible {
                    outline: 2px solid var(--primary-color);
                    outline-offset: 2px;
                }
            `);
        }

        improveScreenReaderSupport() {
            // 为代码块添加ARIA标签
            document.querySelectorAll('pre').forEach((pre, index) => {
                pre.setAttribute('role', 'region');
                pre.setAttribute('aria-label', `代码块 ${index + 1}`);
            });

            // 为练习块添加ARIA标签
            document.querySelectorAll('.required, .challenge, .question').forEach(block => {
                const header = block.querySelector('.header');
                if (header) {
                    const type = block.classList.contains('required') ? '必做练习' :
                                block.classList.contains('challenge') ? '挑战练习' : '问题';
                    block.setAttribute('role', 'region');
                    block.setAttribute('aria-label', type);
                }
            });
        }
    }

    // 性能监视器
    class PerformanceMonitor {
        constructor() {
            this.metrics = {};
        }

        start(name) {
            this.metrics[name] = performance.now();
        }

        end(name) {
            if (this.metrics[name]) {
                const duration = performance.now() - this.metrics[name];
                console.log(`${name}: ${duration.toFixed(2)}ms`);
                delete this.metrics[name];
                return duration;
            }
        }

        measure(fn, name) {
            this.start(name);
            const result = fn();
            this.end(name);
            return result;
        }
    }

    // 主应用类
    class LabDocumentEnhancer {
        constructor() {
            this.perfMonitor = new PerformanceMonitor();
            this.highlighter = new SyntaxHighlighter();
            this.codeEnhancer = new CodeBlockEnhancer(this.highlighter);
            this.themeToggler = new ThemeToggler(this.highlighter);
            this.navEnhancer = new NavigationEnhancer();
            this.a11yEnhancer = new AccessibilityEnhancer();
        }

        async init() {
            this.perfMonitor.start('total-init');
            
            try {
                await this.loadDependencies();
                this.addEnhancementStyles();
                
                // 按顺序初始化各个模块
                this.perfMonitor.measure(() => {
                    this.codeEnhancer.enhance();
                }, 'code-enhancement');
                
                this.perfMonitor.measure(() => {
                    this.themeToggler.init();
                }, 'theme-toggle-init');
                
                this.perfMonitor.measure(() => {
                    this.navEnhancer.init();
                }, 'navigation-enhancement');
                
                this.perfMonitor.measure(() => {
                    this.a11yEnhancer.init();
                }, 'accessibility-enhancement');
                
                this.setupEventListeners();
                
                console.log('📚 MIT 6.828 实验文档增强已完成!');
                
            } catch (error) {
                console.error('❌ 文档增强初始化失败:', error);
            } finally {
                this.perfMonitor.end('total-init');
            }
        }

        async loadDependencies() {
            // 这里可以加载外部依赖，如果需要的话
            return Promise.resolve();
        }

        addEnhancementStyles() {
            Utils.addStyles(`
                /* 代码块增强样式 */
                .code-block-wrapper {
                    margin: 1.5rem 0;
                    border-radius: var(--border-radius-lg);
                    overflow: hidden;
                    box-shadow: var(--shadow-lg);
                    background: var(--bg-code);
                }
                
                .code-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
                    border-bottom: 1px solid #6b7280;
                }
                
                .code-language {
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: var(--text-inverse);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .code-copy-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid #6b7280;
                    color: var(--text-inverse);
                    padding: 0.25rem 0.5rem;
                    border-radius: var(--border-radius-sm);
                    cursor: pointer;
                    font-size: 0.7rem;
                    font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    transition: all var(--transition-fast);
                }
                
                .code-copy-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: #9ca3af;
                    transform: translateY(-1px);
                }
                
                .code-content {
                    display: flex;
                    background: var(--bg-code);
                }
                
                .line-numbers {
                    padding: 1.5rem 0.5rem;
                    background: rgba(0, 0, 0, 0.2);
                    color: #6b7280;
                    font-family: var(--font-mono);
                    font-size: 0.8rem;
                    line-height: 1.5;
                    text-align: right;
                    user-select: none;
                    min-width: 3rem;
                }
                
                .line-number {
                    display: block;
                    padding: 0 0.5rem;
                }
                
                .code-wrapper {
                    flex: 1;
                    overflow-x: auto;
                }
                
                .code-wrapper pre {
                    margin: 0;
                    padding: 1.5rem;
                    background: transparent;
                    border: none;
                    box-shadow: none;
                }
                
                .code-wrapper pre::before {
                    display: none;
                }
                
                /* 活跃导航链接样式 */
                .jump-drop a.active {
                    background: var(--primary-color) !important;
                    color: var(--text-inverse) !important;
                    font-weight: 600;
                }
                
                /* 跳转链接样式 */
                .skip-link:focus {
                    top: 6px !important;
                }
                
                /* 响应式代码块 */
                @media (max-width: 768px) {
                    .code-content {
                        flex-direction: column;
                    }
                    
                    .line-numbers {
                        display: none;
                    }
                    
                    .code-header {
                        padding: 0.5rem;
                    }
                    
                    .code-copy-btn {
                        font-size: 1rem;
                        padding: 0.25rem;
                    }
                }
                
                /* 打印时隐藏增强功能 */
                @media print {
                    .code-header,
                    .line-numbers,
                    .theme-toggle {
                        display: none !important;
                    }
                    
                    .code-block-wrapper {
                        background: white !important;
                        box-shadow: none !important;
                        border: 1px solid #ccc !important;
                    }
                }
            `);
        }

        setupEventListeners() {
            // 窗口大小变化时重新计算布局
            window.addEventListener('resize', Utils.debounce(() => {
                this.handleResize();
            }, 250));

            // 处理打印事件
            window.addEventListener('beforeprint', () => {
                this.preparePrint();
            });
        }

        handleResize() {
            // 在移动设备上调整导航
            const jumpHdr = document.querySelector('.jump-hdr');
            if (jumpHdr) {
                if (window.innerWidth <= 768) {
                    this.navEnhancer.makeMobileFriendly(jumpHdr);
                }
            }
        }

        preparePrint() {
            // 在打印前展开所有代码块
            document.querySelectorAll('.code-content').forEach(content => {
                content.style.display = 'block';
            });
        }
    }

    // 初始化应用
    function initializeApp() {
        // 检查文档是否已加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                const app = new LabDocumentEnhancer();
                app.init();
            });
        } else {
            const app = new LabDocumentEnhancer();
            app.init();
        }
    }

    // 启动应用
    try {
        console.log('MIT 6.828 Labs Enhancement Script Loading...');
        initializeApp();
        console.log('MIT 6.828 Labs Enhancement Script Loaded Successfully!');
    } catch (error) {
        console.error('MIT 6.828 Labs Enhancement Script Error:', error);
    }

})();
