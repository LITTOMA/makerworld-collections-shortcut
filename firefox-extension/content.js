/**
 * MakerWorld Collection Shortcut - Firefox Extension Content Script
 * 核心功能：在 MakerWorld 导航栏添加收藏夹快捷按钮
 */

(function() {
  'use strict';

  // 配置
  const CONFIG = {
    // 收藏夹页面 URL 模式（动态获取用户名）
    favoritesUrlPattern: '/collections/models',
    
    // 按钮文本（支持多语言）
    buttonText: {
      en: 'Collections',
      zh: '收藏夹',
      de: 'Sammlungen',
      fr: 'Collections',
      it: 'Collezioni',
      es: 'Colecciones',
      ja: 'コレクション',
      ko: '컬렉션',
      sv: 'Samlingar',
      pt: 'Coleções'
    },
    
    // 重试配置
    maxRetries: 10,
    retryDelay: 500, // ms
  };

  /**
   * 获取当前语言
   */
  function getCurrentLanguage() {
    const path = window.location.pathname;
    
    // 支持的语言列表
    const supportedLangs = ['en', 'zh', 'de', 'fr', 'it', 'es', 'ja', 'ko', 'sv', 'pt'];
    
    // 匹配 URL 第一段路径，如 /zh、/en、/de 等
    const pathParts = path.split('/').filter(p => p);
    if (pathParts.length > 0) {
      const firstPart = pathParts[0].toLowerCase();
      if (supportedLangs.includes(firstPart)) {
        return firstPart;
      }
    }
    
    // 默认返回英文
    return 'en';
  }

  /**
   * 获取当前用户的收藏夹 URL
   */
  function getFavoritesUrl() {
    const lang = getCurrentLanguage();
    
    // 方法1: 从 localStorage 获取 UID
    try {
      const uid = localStorage.getItem('uid');
      if (uid) {
        return `/${lang}/@user_${uid}${CONFIG.favoritesUrlPattern}`;
      }
    } catch (e) {
      console.log('[MakerWorld Collection Shortcut] Failed to read localStorage:', e);
    }
    
    // 方法2: 尝试从页面中获取当前登录用户的用户名
    const userLinks = document.querySelectorAll('a[href*="/@"]');
    for (let link of userLinks) {
      const href = link.getAttribute('href');
      const match = href.match(/@([^/]+)/);
      if (match && match[1]) {
        const username = match[1];
        // 验证这是用户相关的链接（避免误匹配）
        if (link.closest('[class*="user-operate"]') || link.closest('[class*="avatar"]')) {
          return `/${lang}/@${username}${CONFIG.favoritesUrlPattern}`;
        }
      }
    }
    
    // 方法3: 默认返回通用收藏夹路径（登录后会自动跳转到用户收藏夹）
    return `/${lang}/user/collections`;
  }

  /**
   * 创建收藏夹按钮元素
   */
  function createFavButton() {
    const lang = getCurrentLanguage();
    const buttonText = CONFIG.buttonText[lang] || CONFIG.buttonText.en;
    const favUrl = getFavoritesUrl();
    
    // 完全复制"社区"按钮的结构（包括 swiper-slide 外层）
    const swiperSlide = document.createElement('div');
    swiperSlide.className = 'swiper-slide swiper-slide-visible';
    swiperSlide.id = 'quickfav-button-container';
    
    swiperSlide.innerHTML = `
      <div class="is-last mw-css-1ufg2dn">
        <a target="" href="${favUrl}">
          <div class="label-box mw-css-0">
            <div class="pause mw-css-1e43kvc">
              <div class="mw-css-11z90yd">${buttonText}</div>
            </div>
          </div>
        </a>
      </div>
    `;
    
    return swiperSlide;
  }

  /**
   * 查找导航按钮的直接容器
   */
  function findTargetContainer() {
    // 方法1: 使用 XPath 直接定位容器
    const xpath = '/html/body/div[1]/div/div[2]/div[1]/div[1]/div/div[1]/div/div/div[1]/div[2]/div/div/div/div[1]/div';
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    
    if (result.singleNodeValue) {
      console.log('[MakerWorld Collection Shortcut] Found nav container via XPath');
      return result.singleNodeValue;
    }
    
    // 方法2: 通过查找"社区"链接向上定位
    const communityTexts = ['社区', 'Community', 'Comunidad', 'Comunità', 'Communauté', 'Gemeinschaft', 'コミュニティ', '커뮤니티', 'Comunidade', 'Gemenskap'];
    
    for (let text of communityTexts) {
      const links = Array.from(document.querySelectorAll('a'));
      const communityLink = links.find(link => link.textContent.trim() === text);
      
      if (communityLink) {
        // 向上查找，找到包含多个导航项的容器
        let element = communityLink;
        let depth = 0;
        while (element && depth < 20) {
          const children = element.children;
          // 检查是否有多个子元素且包含导航链接
          if (children.length >= 5) {
            const hasNavLinks = Array.from(children).filter(child => child.querySelector('a')).length >= 3;
            if (hasNavLinks) {
              console.log('[MakerWorld Collection Shortcut] Found nav container via link search');
              return element;
            }
          }
          element = element.parentElement;
          depth++;
        }
      }
    }
    
    console.log('[MakerWorld Collection Shortcut] Container search failed');
    return null;
  }

  /**
   * 插入收藏夹按钮
   */
  function insertFavButton() {
    // 检查是否已经插入
    if (document.getElementById('quickfav-button-container')) {
      console.log('[MakerWorld Collection Shortcut] Button already exists');
      return true;
    }
    
    // 查找目标容器
    const targetContainer = findTargetContainer();
    if (!targetContainer) {
      console.log('[MakerWorld Collection Shortcut] Target container not found');
      return false;
    }
    
    // 移除原"社区"按钮的 is-last 样式
    const lastButton = targetContainer.querySelector('.is-last');
    if (lastButton) {
      lastButton.classList.remove('is-last');
    }
    
    // 创建并插入按钮
    const favButton = createFavButton();
    
    // 直接插入到容器末尾（在最后一个导航项后面）
    targetContainer.appendChild(favButton);
    
    console.log('[MakerWorld Collection Shortcut] Button inserted successfully');
    return true;
  }

  /**
   * 带重试机制的初始化
   */
  function initWithRetry(retryCount = 0) {
    if (insertFavButton()) {
      console.log('[MakerWorld Collection Shortcut] Initialized successfully');
      return;
    }
    
    if (retryCount < CONFIG.maxRetries) {
      console.log(`[MakerWorld Collection Shortcut] Retry ${retryCount + 1}/${CONFIG.maxRetries}`);
      setTimeout(() => {
        initWithRetry(retryCount + 1);
      }, CONFIG.retryDelay);
    } else {
      console.error('[MakerWorld Collection Shortcut] Failed to initialize after max retries');
    }
  }

  /**
   * 监听页面变化（SPA 路由切换）
   */
  function observePageChanges() {
    let debounceTimer = null;
    
    const observer = new MutationObserver((mutations) => {
      // 防抖：避免频繁触发
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      debounceTimer = setTimeout(() => {
        // 检查按钮是否还在页面上
        if (!document.getElementById('quickfav-button-container')) {
          console.log('[MakerWorld Collection Shortcut] Button removed, re-inserting...');
          insertFavButton();
        }
      }, 1000); // 1秒防抖
    });
    
    // 只监听导航栏区域，减少触发频率
    const navBar = document.querySelector('.mw-css-1krv8is') || document.body;
    observer.observe(navBar, {
      childList: true,
      subtree: true
    });
  }

  /**
   * 主初始化函数
   */
  function init() {
    console.log('[MakerWorld Collection Shortcut] Starting initialization...');
    
    // 等待 DOM 加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initWithRetry();
        observePageChanges();
      });
    } else {
      initWithRetry();
      observePageChanges();
    }
  }

  // 启动
  init();

})();

