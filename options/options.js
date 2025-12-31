/**
 * Cookie Eater & AdBlocker - Options Page Script
 * Created by Fusion AI
 */

// ==========================================
// TRANSLATIONS
// ==========================================

const translations = {
  en: {
    opt_dashboard_title: 'Dashboard',
    opt_stats_title: 'Statistics Overview',
    opt_quick_stats: 'Quick Stats',
    opt_total_blocked: 'Total requests blocked',
    opt_cookies_blocked: 'Non-essential cookies blocked',
    opt_trackers_blocked: 'Trackers blocked',
    opt_total_cookies: 'Banners processed',
    opt_today_blocked: 'Blocked today',
    opt_whitelist_count: 'Whitelisted sites',
    opt_breakdown_title: 'Breakdown by category',
    opt_top_domains: 'Top 10 blocked domains',
    opt_no_domains: 'No domains blocked yet',
    opt_categories_title: 'Blocking Categories',
    opt_categories_desc: 'Enable or disable specific blocking categories',
    cat_ads: 'Advertisements',
    cat_trackers: 'Trackers',
    cat_social: 'Social Widgets',
    opt_cat_ads_desc: 'Block ad banners, popups, video pre-roll/mid-roll ads',
    opt_cat_trackers_desc: 'Block analytics, beacons, pixels and user tracking',
    opt_cat_social_desc: 'Block like buttons, share buttons and social tracking',
    opt_whitelist_title: 'Whitelist Management',
    opt_whitelist_desc: 'Sites where ads and trackers are allowed',
    opt_whitelist_placeholder: 'example.com',
    opt_add: 'Add',
    opt_whitelist_empty: 'No sites in whitelist',
    opt_clear_whitelist: 'Clear all',
    opt_cookie_title: 'Cookie Eater Settings',
    opt_auto_hide: 'Auto-hide banners',
    opt_auto_hide_desc: 'Hide cookie banners after processing',
    opt_clean_tracking: 'Clean tracking cookies',
    opt_clean_tracking_desc: 'Remove known tracking cookies',
    opt_anonymize: 'Anonymize data',
    opt_anonymize_desc: 'Replace tracking IDs with fake data',
    opt_notifications: 'Show notifications',
    opt_notifications_desc: 'Display notifications when banners are processed',
    opt_danger_zone: 'Danger Zone',
    opt_reset_stats: 'Reset all statistics',
    opt_reset_stats_desc: 'This will reset all counters to zero',
    opt_reset_all: 'Reset all settings',
    opt_reset_all_desc: 'Restore extension to default settings',
    opt_reset: 'Reset',
    footer_credits: 'Made by Fusion AI',
    toast_added: 'Site added to whitelist',
    toast_removed: 'Site removed from whitelist',
    toast_cleared: 'Whitelist cleared',
    toast_stats_reset: 'Statistics reset',
    toast_settings_reset: 'Settings reset to default',
    toast_saved: 'Settings saved',
    toast_invalid_domain: 'Please enter a valid domain',
    toast_already_exists: 'Site already in whitelist',
    confirm_clear: 'Are you sure you want to clear the whitelist?',
    confirm_reset_stats: 'Are you sure you want to reset all statistics?',
    confirm_reset_all: 'Are you sure you want to reset all settings to default?'
  },
  fr: {
    opt_dashboard_title: 'Tableau de bord',
    opt_stats_title: 'Aperçu des statistiques',
    opt_quick_stats: 'Stats rapides',
    opt_total_blocked: 'Requêtes bloquées au total',
    opt_cookies_blocked: 'Cookies non-essentiels bloqués',
    opt_trackers_blocked: 'Trackers bloqués',
    opt_total_cookies: 'Bannières traitées',
    opt_today_blocked: "Bloqués aujourd'hui",
    opt_whitelist_count: 'Sites en whitelist',
    opt_breakdown_title: 'Répartition par catégorie',
    opt_top_domains: 'Top 10 des domaines bloqués',
    opt_no_domains: 'Aucun domaine bloqué pour le moment',
    opt_categories_title: 'Catégories de blocage',
    opt_categories_desc: 'Activer ou désactiver des catégories spécifiques',
    cat_ads: 'Publicités',
    cat_trackers: 'Trackers',
    cat_social: 'Widgets sociaux',
    opt_cat_ads_desc: 'Bloquer les bannières, popups, vidéos pré-roll/mid-roll',
    opt_cat_trackers_desc: 'Bloquer analytics, balises, pixels et tracking',
    opt_cat_social_desc: 'Bloquer les boutons like, partage et tracking social',
    opt_whitelist_title: 'Gestion de la whitelist',
    opt_whitelist_desc: 'Sites où les pubs et trackers sont autorisés',
    opt_whitelist_placeholder: 'exemple.com',
    opt_add: 'Ajouter',
    opt_whitelist_empty: 'Aucun site en whitelist',
    opt_clear_whitelist: 'Tout effacer',
    opt_cookie_title: 'Paramètres Cookie Eater',
    opt_auto_hide: 'Masquer automatiquement',
    opt_auto_hide_desc: 'Masquer les bannières après traitement',
    opt_clean_tracking: 'Nettoyer les cookies tracking',
    opt_clean_tracking_desc: 'Supprimer les cookies de tracking connus',
    opt_anonymize: 'Anonymiser les données',
    opt_anonymize_desc: 'Remplacer les IDs de tracking par de fausses données',
    opt_notifications: 'Afficher les notifications',
    opt_notifications_desc: 'Afficher une notification quand une bannière est traitée',
    opt_danger_zone: 'Zone dangereuse',
    opt_reset_stats: 'Réinitialiser les statistiques',
    opt_reset_stats_desc: 'Remettra tous les compteurs à zéro',
    opt_reset_all: 'Réinitialiser tous les paramètres',
    opt_reset_all_desc: 'Restaurer les paramètres par défaut',
    opt_reset: 'Réinitialiser',
    footer_credits: 'Créé par Fusion AI',
    toast_added: 'Site ajouté à la whitelist',
    toast_removed: 'Site retiré de la whitelist',
    toast_cleared: 'Whitelist vidée',
    toast_stats_reset: 'Statistiques réinitialisées',
    toast_settings_reset: 'Paramètres par défaut restaurés',
    toast_saved: 'Paramètres sauvegardés',
    toast_invalid_domain: 'Veuillez entrer un domaine valide',
    toast_already_exists: 'Site déjà dans la whitelist',
    confirm_clear: 'Êtes-vous sûr de vouloir vider la whitelist ?',
    confirm_reset_stats: 'Êtes-vous sûr de vouloir réinitialiser les statistiques ?',
    confirm_reset_all: 'Êtes-vous sûr de vouloir restaurer les paramètres par défaut ?'
  }
};

const flags = { en: '🇬🇧', fr: '🇫🇷' };
let currentLang = 'en';

function t(key) {
  return translations[currentLang][key] || translations['en'][key] || key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  
  document.getElementById('currentFlag').textContent = flags[currentLang];
}

async function loadLanguage() {
  try {
    const result = await chrome.storage.sync.get('cookieEaterLang');
    if (result.cookieEaterLang) {
      currentLang = result.cookieEaterLang;
    }
  } catch (e) {}
}

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'fr' : 'en';
  chrome.storage.sync.set({ cookieEaterLang: currentLang });
  applyTranslations();
  showToast(currentLang === 'en' ? 'Language changed 🇬🇧' : 'Langue changée 🇫🇷');
}

// ==========================================
// DOM ELEMENTS
// ==========================================

const elements = {
  langBtn: document.getElementById('langBtn'),
  // Dashboard stats
  totalBlocked: document.getElementById('totalBlocked'),
  cookiesBlocked: document.getElementById('cookiesBlocked'),
  trackersBlocked: document.getElementById('trackersBlocked'),
  adsBlocked: document.getElementById('adsBlocked'),
  trackersBlockedDetail: document.getElementById('trackersBlockedDetail'),
  socialBlocked: document.getElementById('socialBlocked'),
  adsBar: document.getElementById('adsBar'),
  trackersBar: document.getElementById('trackersBar'),
  socialBar: document.getElementById('socialBar'),
  topDomainsList: document.getElementById('topDomainsList'),
  domainsEmpty: document.getElementById('domainsEmpty'),
  // Quick stats
  totalCookies: document.getElementById('totalCookies'),
  todayBlocked: document.getElementById('todayBlocked'),
  whitelistCount: document.getElementById('whitelistCount'),
  // Category toggles
  adsToggle: document.getElementById('adsToggle'),
  trackersToggle: document.getElementById('trackersToggle'),
  socialToggle: document.getElementById('socialToggle'),
  // Whitelist
  whitelistInput: document.getElementById('whitelistInput'),
  addWhitelistBtn: document.getElementById('addWhitelistBtn'),
  whitelistContainer: document.getElementById('whitelistContainer'),
  whitelistEmpty: document.getElementById('whitelistEmpty'),
  clearWhitelistBtn: document.getElementById('clearWhitelistBtn'),
  // Cookie settings
  autoHideToggle: document.getElementById('autoHideToggle'),
  cleanTrackingToggle: document.getElementById('cleanTrackingToggle'),
  anonymizeToggle: document.getElementById('anonymizeToggle'),
  notificationToggle: document.getElementById('notificationToggle'),
  // Danger zone
  resetStatsBtn: document.getElementById('resetStatsBtn'),
  resetAllBtn: document.getElementById('resetAllBtn')
};

// ==========================================
// STATE
// ==========================================

let adblockConfig = {
  enabled: true,
  adsEnabled: true,
  trackersEnabled: true,
  socialEnabled: true,
  whitelist: []
};

let cookieConfig = {
  enabled: true,
  mode: 'reject_all',
  autoHide: true,
  showNotification: true,
  cleanTrackingCookies: true,
  anonymizeData: true
};

// ==========================================
// DATA LOADING
// ==========================================

async function loadStats() {
  try {
    const stats = await chrome.runtime.sendMessage({ type: 'getStats' });
    
    if (stats) {
      // Dashboard main stats
      if (stats.adblock) {
        const adblock = stats.adblock;
        
        // Main counters
        animateNumber(elements.totalBlocked, adblock.totalBlocked || 0);
        animateNumber(elements.cookiesBlocked, adblock.cookiesBlocked || 0);
        animateNumber(elements.trackersBlocked, adblock.trackersBlocked || 0);
        animateNumber(elements.todayBlocked, adblock.todayBlocked || 0);
        
        // Breakdown
        const adsCount = adblock.adsBlocked || 0;
        const trackersCount = adblock.trackersBlocked || 0;
        const socialCount = adblock.socialBlocked || 0;
        const total = adsCount + trackersCount + socialCount;
        
        animateNumber(elements.adsBlocked, adsCount);
        animateNumber(elements.trackersBlockedDetail, trackersCount);
        animateNumber(elements.socialBlocked, socialCount);
        
        // Progress bars
        if (total > 0) {
          elements.adsBar.style.width = `${(adsCount / total) * 100}%`;
          elements.trackersBar.style.width = `${(trackersCount / total) * 100}%`;
          elements.socialBar.style.width = `${(socialCount / total) * 100}%`;
        }
        
        // Top domains
        renderTopDomains(adblock.blockedDomains || {});
      }
      
      // Cookie stats
      if (stats.cookies) {
        animateNumber(elements.totalCookies, stats.cookies.totalProcessed || 0);
      }
    }
  } catch (e) {
    console.error('Error loading stats:', e);
  }
}

function renderTopDomains(blockedDomains) {
  const container = elements.topDomainsList;
  
  // Clear existing items (except empty message)
  container.querySelectorAll('.domain-item').forEach(item => item.remove());
  
  // Convert to array and sort by count
  const domainsArray = Object.entries(blockedDomains)
    .map(([domain, data]) => ({ domain, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10
  
  if (domainsArray.length === 0) {
    elements.domainsEmpty.style.display = 'block';
  } else {
    elements.domainsEmpty.style.display = 'none';
    
    domainsArray.forEach((item, index) => {
      const domainEl = document.createElement('div');
      domainEl.className = 'domain-item';
      
      // Rank class
      let rankClass = '';
      if (index === 0) rankClass = 'gold';
      else if (index === 1) rankClass = 'silver';
      else if (index === 2) rankClass = 'bronze';
      
      // Category badge
      const categoryLabels = {
        ads: t('cat_ads'),
        trackers: t('cat_trackers'),
        social: t('cat_social')
      };
      
      domainEl.innerHTML = `
        <div class="domain-rank ${rankClass}">${index + 1}</div>
        <div class="domain-info">
          <span class="domain-name">${item.domain}</span>
          <div class="domain-category">
            <span class="domain-category-badge ${item.category}">${categoryLabels[item.category] || item.category}</span>
          </div>
        </div>
        <span class="domain-count">${formatNumber(item.count)}</span>
      `;
      
      container.appendChild(domainEl);
    });
  }
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

async function loadAdblockConfig() {
  try {
    const config = await chrome.runtime.sendMessage({ type: 'getAdblockConfig' });
    if (config) {
      adblockConfig = config;
      updateAdblockUI();
    }
  } catch (e) {
    console.error('Error loading adblock config:', e);
  }
}

async function loadCookieConfig() {
  try {
    const result = await chrome.storage.sync.get('cookieEaterConfig');
    if (result.cookieEaterConfig) {
      cookieConfig = { ...cookieConfig, ...result.cookieEaterConfig };
      updateCookieUI();
    }
  } catch (e) {
    console.error('Error loading cookie config:', e);
  }
}

async function loadWhitelist() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'getWhitelist' });
    if (response && response.whitelist) {
      adblockConfig.whitelist = response.whitelist;
      renderWhitelist();
    }
  } catch (e) {
    console.error('Error loading whitelist:', e);
  }
}

// ==========================================
// UI UPDATES
// ==========================================

function updateAdblockUI() {
  elements.adsToggle.checked = adblockConfig.adsEnabled;
  elements.trackersToggle.checked = adblockConfig.trackersEnabled;
  elements.socialToggle.checked = adblockConfig.socialEnabled;
  elements.whitelistCount.textContent = adblockConfig.whitelist.length;
}

function updateCookieUI() {
  elements.autoHideToggle.checked = cookieConfig.autoHide;
  elements.cleanTrackingToggle.checked = cookieConfig.cleanTrackingCookies;
  elements.anonymizeToggle.checked = cookieConfig.anonymizeData;
  elements.notificationToggle.checked = cookieConfig.showNotification;
}

function renderWhitelist() {
  const container = elements.whitelistContainer;
  
  // Clear existing items (except empty message)
  container.querySelectorAll('.whitelist-item').forEach(item => item.remove());
  
  if (adblockConfig.whitelist.length === 0) {
    elements.whitelistEmpty.style.display = 'block';
  } else {
    elements.whitelistEmpty.style.display = 'none';
    
    adblockConfig.whitelist.forEach(domain => {
      const item = document.createElement('div');
      item.className = 'whitelist-item';
      item.innerHTML = `
        <div class="whitelist-domain">
          <span class="whitelist-domain-icon">🌐</span>
          <span class="whitelist-domain-text">${domain}</span>
        </div>
        <button class="whitelist-remove" data-domain="${domain}">
          ✕ Remove
        </button>
      `;
      
      item.querySelector('.whitelist-remove').addEventListener('click', () => {
        removeFromWhitelist(domain);
      });
      
      container.appendChild(item);
    });
  }
  
  elements.whitelistCount.textContent = adblockConfig.whitelist.length;
}

function animateNumber(element, target) {
  const current = parseInt(element.textContent) || 0;
  if (current === target) return;
  
  const duration = 500;
  const steps = 20;
  const increment = (target - current) / steps;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    element.textContent = Math.round(current + increment * step);
    
    if (step >= steps) {
      element.textContent = target;
      clearInterval(timer);
    }
  }, duration / steps);
}

// ==========================================
// WHITELIST MANAGEMENT
// ==========================================

function isValidDomain(domain) {
  const pattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*(\.[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*)*\.[a-zA-Z]{2,}$/;
  return pattern.test(domain);
}

async function addToWhitelist() {
  let domain = elements.whitelistInput.value.trim().toLowerCase();
  
  // Remove protocol and path if present
  domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
  
  if (!domain || !isValidDomain(domain)) {
    showToast(t('toast_invalid_domain'), 'error');
    return;
  }
  
  if (adblockConfig.whitelist.includes(domain)) {
    showToast(t('toast_already_exists'), 'warning');
    return;
  }
  
  try {
    await chrome.runtime.sendMessage({ type: 'addToWhitelist', domain });
    adblockConfig.whitelist.push(domain);
    renderWhitelist();
    elements.whitelistInput.value = '';
    showToast(t('toast_added'));
  } catch (e) {
    console.error('Error adding to whitelist:', e);
  }
}

async function removeFromWhitelist(domain) {
  try {
    await chrome.runtime.sendMessage({ type: 'removeFromWhitelist', domain });
    adblockConfig.whitelist = adblockConfig.whitelist.filter(d => d !== domain);
    renderWhitelist();
    showToast(t('toast_removed'));
  } catch (e) {
    console.error('Error removing from whitelist:', e);
  }
}

async function clearWhitelist() {
  if (!confirm(t('confirm_clear'))) return;
  
  try {
    await chrome.runtime.sendMessage({ type: 'clearWhitelist' });
    adblockConfig.whitelist = [];
    renderWhitelist();
    showToast(t('toast_cleared'));
  } catch (e) {
    console.error('Error clearing whitelist:', e);
  }
}

// ==========================================
// SETTINGS MANAGEMENT
// ==========================================

async function saveCookieConfig() {
  try {
    await chrome.storage.sync.set({ cookieEaterConfig: cookieConfig });
    
    // Notify all tabs
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'configUpdate',
          config: cookieConfig
        });
      } catch (e) {}
    }
    
    showToast(t('toast_saved'));
  } catch (e) {
    console.error('Error saving cookie config:', e);
  }
}

async function toggleCategory(category, enabled) {
  try {
    await chrome.runtime.sendMessage({ 
      type: 'toggleCategory', 
      category, 
      enabled 
    });
    
    if (category === 'ads') adblockConfig.adsEnabled = enabled;
    if (category === 'trackers') adblockConfig.trackersEnabled = enabled;
    if (category === 'social') adblockConfig.socialEnabled = enabled;
    
    showToast(t('toast_saved'));
  } catch (e) {
    console.error('Error toggling category:', e);
  }
}

async function resetStats() {
  if (!confirm(t('confirm_reset_stats'))) return;
  
  try {
    await chrome.runtime.sendMessage({ type: 'resetStats' });
    await chrome.runtime.sendMessage({ type: 'resetAdblockStats' });
    
    // Reset UI immediately
    elements.totalBlocked.textContent = '0';
    elements.cookiesBlocked.textContent = '0';
    elements.trackersBlocked.textContent = '0';
    elements.adsBlocked.textContent = '0';
    elements.trackersBlockedDetail.textContent = '0';
    elements.socialBlocked.textContent = '0';
    elements.todayBlocked.textContent = '0';
    elements.totalCookies.textContent = '0';
    elements.adsBar.style.width = '0%';
    elements.trackersBar.style.width = '0%';
    elements.socialBar.style.width = '0%';
    
    // Clear top domains
    elements.topDomainsList.querySelectorAll('.domain-item').forEach(item => item.remove());
    elements.domainsEmpty.style.display = 'block';
    
    loadStats();
    showToast(t('toast_stats_reset'));
  } catch (e) {
    console.error('Error resetting stats:', e);
  }
}

async function resetAllSettings() {
  if (!confirm(t('confirm_reset_all'))) return;
  
  try {
    // Reset cookie config
    cookieConfig = {
      enabled: true,
      mode: 'reject_all',
      autoHide: true,
      showNotification: true,
      cleanTrackingCookies: true,
      anonymizeData: true,
      delay: 500
    };
    await chrome.storage.sync.set({ cookieEaterConfig: cookieConfig });
    
    // Reset adblock config
    adblockConfig = {
      enabled: true,
      adsEnabled: true,
      trackersEnabled: true,
      socialEnabled: true,
      whitelist: []
    };
    await chrome.runtime.sendMessage({ 
      type: 'setAdblockConfig', 
      config: adblockConfig 
    });
    
    // Reset stats
    await chrome.runtime.sendMessage({ type: 'resetStats' });
    await chrome.runtime.sendMessage({ type: 'resetAdblockStats' });
    
    // Reload UI
    updateAdblockUI();
    updateCookieUI();
    renderWhitelist();
    loadStats();
    
    showToast(t('toast_settings_reset'));
  } catch (e) {
    console.error('Error resetting settings:', e);
  }
}

// ==========================================
// TOAST
// ==========================================

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==========================================
// EVENT LISTENERS
// ==========================================

elements.langBtn.addEventListener('click', toggleLanguage);

// Adblock category toggles
elements.adsToggle.addEventListener('change', (e) => {
  toggleCategory('ads', e.target.checked);
});

elements.trackersToggle.addEventListener('change', (e) => {
  toggleCategory('trackers', e.target.checked);
});

elements.socialToggle.addEventListener('change', (e) => {
  toggleCategory('social', e.target.checked);
});

// Whitelist
elements.addWhitelistBtn.addEventListener('click', addToWhitelist);
elements.whitelistInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addToWhitelist();
});
elements.clearWhitelistBtn.addEventListener('click', clearWhitelist);

// Cookie settings
elements.autoHideToggle.addEventListener('change', (e) => {
  cookieConfig.autoHide = e.target.checked;
  saveCookieConfig();
});

elements.cleanTrackingToggle.addEventListener('change', (e) => {
  cookieConfig.cleanTrackingCookies = e.target.checked;
  saveCookieConfig();
});

elements.anonymizeToggle.addEventListener('change', (e) => {
  cookieConfig.anonymizeData = e.target.checked;
  saveCookieConfig();
});

elements.notificationToggle.addEventListener('change', (e) => {
  cookieConfig.showNotification = e.target.checked;
  saveCookieConfig();
});

// Danger zone
elements.resetStatsBtn.addEventListener('click', resetStats);
elements.resetAllBtn.addEventListener('click', resetAllSettings);

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
  await loadLanguage();
  applyTranslations();
  
  await loadStats();
  await loadAdblockConfig();
  await loadCookieConfig();
  await loadWhitelist();
  
  // Refresh stats periodically
  setInterval(loadStats, 5000);
});

