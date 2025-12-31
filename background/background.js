/**
 * Cookie Eater & AdBlocker - Service Worker (Background Script)
 * Manages statistics, notifications, ad blocking and communication
 * 
 * Created by Fusion AI
 * Version 3.0.0
 */

// ==========================================
// ÉTAT GLOBAL
// ==========================================

// Stats pour les cookies
let cookieStats = {
  totalProcessed: 0,
  todayProcessed: 0,
  domains: {},
  lastReset: new Date().toDateString()
};

// Stats pour l'adblocker
let adblockStats = {
  totalBlocked: 0,
  todayBlocked: 0,
  pageBlocked: {},  // Par tabId
  lastReset: new Date().toDateString(),
  // Stats détaillées par catégorie
  adsBlocked: 0,
  trackersBlocked: 0,
  socialBlocked: 0,
  cookiesBlocked: 0,
  // Top domaines bloqués
  blockedDomains: {}  // { domain: { count, category, lastBlocked } }
};

// Configuration AdBlocker
let adblockConfig = {
  enabled: true,
  adsEnabled: true,
  trackersEnabled: true,
  socialEnabled: true,
  whitelist: []
};

// ==========================================
// CHARGEMENT DES DONNÉES
// ==========================================

// Charger les statistiques au démarrage
async function loadAllData() {
  try {
    const result = await chrome.storage.local.get([
      'cookieEaterStats', 
      'adblockStats', 
      'adblockConfig'
    ]);
    
    if (result.cookieEaterStats) {
      cookieStats = result.cookieEaterStats;
      checkDailyReset();
    }
    
    if (result.adblockStats) {
      adblockStats = result.adblockStats;
      checkAdblockDailyReset();
    }
    
    if (result.adblockConfig) {
      adblockConfig = { ...adblockConfig, ...result.adblockConfig };
    }
    
    // Appliquer la configuration des règles
    await updateRulesets();
    
  } catch (e) {
    console.error('Cookie Eater: Erreur lors du chargement des données', e);
  }
}

loadAllData();

// ==========================================
// GESTION DES RÈGLES DE BLOCAGE
// ==========================================

/**
 * Met à jour les rulesets activés/désactivés
 */
async function updateRulesets() {
  try {
    const enableIds = [];
    const disableIds = [];
    
    // TOUJOURS garder les exceptions activées (pour protéger les sites importants)
    enableIds.push('exceptions');
    
    // Gérer chaque catégorie
    if (adblockConfig.enabled && adblockConfig.adsEnabled) {
      enableIds.push('ads');
    } else {
      disableIds.push('ads');
    }
    
    if (adblockConfig.enabled && adblockConfig.trackersEnabled) {
      enableIds.push('trackers');
    } else {
      disableIds.push('trackers');
    }
    
    if (adblockConfig.enabled && adblockConfig.socialEnabled) {
      enableIds.push('social');
    } else {
      disableIds.push('social');
    }
    
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: enableIds,
      disableRulesetIds: disableIds
    });
    
    console.log('Cookie Eater: Règles mises à jour', { enableIds, disableIds });
    
  } catch (e) {
    console.error('Cookie Eater: Erreur lors de la mise à jour des règles', e);
  }
}

/**
 * Ajoute des règles dynamiques pour la whitelist
 */
async function updateWhitelistRules() {
  try {
    // Supprimer les anciennes règles de whitelist
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingIds = existingRules.map(r => r.id);
    
    if (existingIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingIds
      });
    }
    
    // Ajouter les nouvelles règles de whitelist
    if (adblockConfig.whitelist.length > 0) {
      const whitelistRules = adblockConfig.whitelist.map((domain, index) => ({
        id: 10000 + index,
        priority: 100, // Priorité haute pour permettre le trafic
        action: { type: 'allow' },
        condition: {
          urlFilter: `||${domain}^`,
          resourceTypes: ['main_frame', 'sub_frame', 'script', 'image', 'xmlhttprequest', 'media', 'other']
        }
      }));
      
      // Ajouter aussi des règles pour permettre le contenu SUR ces domaines
      const initiatorRules = adblockConfig.whitelist.map((domain, index) => ({
        id: 20000 + index,
        priority: 100,
        action: { type: 'allow' },
        condition: {
          initiatorDomains: [domain],
          resourceTypes: ['main_frame', 'sub_frame', 'script', 'image', 'xmlhttprequest', 'media', 'other']
        }
      }));
      
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [...whitelistRules, ...initiatorRules]
      });
    }
    
    console.log('Cookie Eater: Whitelist mise à jour', adblockConfig.whitelist);
    
  } catch (e) {
    console.error('Cookie Eater: Erreur lors de la mise à jour de la whitelist', e);
  }
}

// ==========================================
// COMPTAGE DES REQUÊTES BLOQUÉES
// ==========================================

// Écouter les événements de matching des règles
chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener((info) => {
  // Incrémenter les compteurs
  adblockStats.totalBlocked++;
  adblockStats.todayBlocked++;
  
  // Compteur par page
  const tabId = info.request.tabId;
  if (tabId > 0) {
    if (!adblockStats.pageBlocked[tabId]) {
      adblockStats.pageBlocked[tabId] = 0;
    }
    adblockStats.pageBlocked[tabId]++;
  }
  
  // Déterminer la catégorie basée sur l'ID de la règle
  const ruleId = info.rule.ruleId;
  let category = 'ads';
  if (ruleId >= 1001 && ruleId < 2000) {
    category = 'trackers';
    adblockStats.trackersBlocked++;
  } else if (ruleId >= 2001) {
    category = 'social';
    adblockStats.socialBlocked++;
  } else {
    adblockStats.adsBlocked++;
  }
  
  // Tracker le domaine bloqué
  try {
    const url = new URL(info.request.url);
    const domain = url.hostname.replace(/^www\./, '');
    
    if (!adblockStats.blockedDomains[domain]) {
      adblockStats.blockedDomains[domain] = {
        count: 0,
        category: category,
        lastBlocked: null
      };
    }
    adblockStats.blockedDomains[domain].count++;
    adblockStats.blockedDomains[domain].lastBlocked = Date.now();
    adblockStats.blockedDomains[domain].category = category;
  } catch (e) {
    // URL invalide, ignorer
  }
  
  // Sauvegarder périodiquement
  saveAdblockStats();
  updateBadge();
});

// Alternative sans debug (utilise le matching count)
setInterval(async () => {
  try {
    // Récupérer les règles matchées
    const enabledRulesets = await chrome.declarativeNetRequest.getEnabledRulesets();
    // Note: Dans MV3, on n'a pas accès direct au count de matching
    // On utilise les listeners quand disponibles
  } catch (e) {
    // Ignorer
  }
}, 5000);

// ==========================================
// SAUVEGARDE DES DONNÉES
// ==========================================

function saveCookieStats() {
  chrome.storage.local.set({ cookieEaterStats: cookieStats });
}

let adblockSaveTimeout = null;
function saveAdblockStats() {
  // Debounce pour éviter trop d'écritures
  if (adblockSaveTimeout) return;
  adblockSaveTimeout = setTimeout(() => {
    chrome.storage.local.set({ adblockStats: adblockStats });
    adblockSaveTimeout = null;
  }, 1000);
}

function saveAdblockConfig() {
  chrome.storage.local.set({ adblockConfig: adblockConfig });
}

// ==========================================
// GESTION DES BADGES
// ==========================================

function updateBadge(tabId = null) {
  let count = 0;
  
  if (tabId && adblockStats.pageBlocked[tabId]) {
    count = adblockStats.pageBlocked[tabId];
  } else {
    count = adblockStats.todayBlocked + cookieStats.todayProcessed;
  }
  
  const text = count > 0 ? (count > 999 ? '999+' : count.toString()) : '';
  
  if (tabId) {
    chrome.action.setBadgeText({ text, tabId });
  } else {
    chrome.action.setBadgeText({ text });
  }
  
  // Couleur selon si le blocage est actif
  const color = adblockConfig.enabled ? '#667eea' : '#718096';
  chrome.action.setBadgeBackgroundColor({ color });
}

// ==========================================
// RÉINITIALISATION QUOTIDIENNE
// ==========================================

function checkDailyReset() {
  const today = new Date().toDateString();
  if (cookieStats.lastReset !== today) {
    cookieStats.todayProcessed = 0;
    cookieStats.lastReset = today;
    saveCookieStats();
  }
}

function checkAdblockDailyReset() {
  const today = new Date().toDateString();
  if (adblockStats.lastReset !== today) {
    adblockStats.todayBlocked = 0;
    adblockStats.pageBlocked = {};
    adblockStats.lastReset = today;
    saveAdblockStats();
  }
}

// Vérifier toutes les heures
setInterval(() => {
  checkDailyReset();
  checkAdblockDailyReset();
}, 3600000);

// ==========================================
// GESTION DES ONGLETS
// ==========================================

// Réinitialiser le compteur de page lors de la navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    adblockStats.pageBlocked[tabId] = 0;
    updateBadge(tabId);
  }
});

// Nettoyer les compteurs des onglets fermés
chrome.tabs.onRemoved.addListener((tabId) => {
  delete adblockStats.pageBlocked[tabId];
});

// Mettre à jour le badge lors du changement d'onglet
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  updateBadge(activeInfo.tabId);
});

// ==========================================
// GESTION DES MESSAGES
// ==========================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // === Messages Cookie Eater ===
  
  if (message.type === 'bannerProcessed') {
    cookieStats.totalProcessed++;
    cookieStats.todayProcessed++;
    
    // Incrémenter le compteur de cookies bloqués si l'action est reject ou essential
    if (message.action === 'reject' || message.action === 'essential') {
      adblockStats.cookiesBlocked = (adblockStats.cookiesBlocked || 0) + 1;
      saveAdblockStats();
    }
    
    const domain = message.domain;
    if (!cookieStats.domains[domain]) {
      cookieStats.domains[domain] = {
        count: 0,
        lastAction: null,
        category: null
      };
    }
    cookieStats.domains[domain].count++;
    cookieStats.domains[domain].lastAction = message.action;
    cookieStats.domains[domain].category = message.category;
    cookieStats.domains[domain].lastDate = new Date().toISOString();
    
    saveCookieStats();
    updateBadge();
    
    // Notification si activée
    chrome.storage.sync.get('cookieEaterConfig', (result) => {
      const config = result.cookieEaterConfig || {};
      if (config.showNotification !== false && sender.tab) {
        chrome.tabs.sendMessage(sender.tab.id, {
          type: 'showNotification',
          action: message.action
        }).catch(() => {});
      }
    });
    
    sendResponse({ success: true });
  }
  
  if (message.type === 'getStats') {
    sendResponse({
      cookies: cookieStats,
      adblock: {
        totalBlocked: adblockStats.totalBlocked,
        todayBlocked: adblockStats.todayBlocked,
        adsBlocked: adblockStats.adsBlocked || 0,
        trackersBlocked: adblockStats.trackersBlocked || 0,
        socialBlocked: adblockStats.socialBlocked || 0,
        cookiesBlocked: adblockStats.cookiesBlocked || 0,
        blockedDomains: adblockStats.blockedDomains || {}
      }
    });
  }
  
  if (message.type === 'getPageStats') {
    const tabId = message.tabId;
    sendResponse({
      pageBlocked: adblockStats.pageBlocked[tabId] || 0
    });
  }
  
  if (message.type === 'resetStats') {
    cookieStats = {
      totalProcessed: 0,
      todayProcessed: 0,
      domains: {},
      lastReset: new Date().toDateString()
    };
    saveCookieStats();
    updateBadge();
    sendResponse({ success: true });
  }
  
  // === Messages AdBlocker ===
  
  if (message.type === 'getAdblockConfig') {
    sendResponse(adblockConfig);
  }
  
  if (message.type === 'setAdblockConfig') {
    adblockConfig = { ...adblockConfig, ...message.config };
    saveAdblockConfig();
    updateRulesets();
    updateWhitelistRules();
    updateBadge();
    sendResponse({ success: true });
  }
  
  if (message.type === 'toggleAdblock') {
    adblockConfig.enabled = message.enabled;
    saveAdblockConfig();
    updateRulesets();
    updateBadge();
    sendResponse({ success: true });
  }
  
  if (message.type === 'toggleCategory') {
    const { category, enabled } = message;
    if (category === 'ads') adblockConfig.adsEnabled = enabled;
    if (category === 'trackers') adblockConfig.trackersEnabled = enabled;
    if (category === 'social') adblockConfig.socialEnabled = enabled;
    saveAdblockConfig();
    updateRulesets();
    sendResponse({ success: true });
  }
  
  if (message.type === 'addToWhitelist') {
    const domain = message.domain;
    if (!adblockConfig.whitelist.includes(domain)) {
      adblockConfig.whitelist.push(domain);
      saveAdblockConfig();
      updateWhitelistRules();
    }
    sendResponse({ success: true });
  }
  
  if (message.type === 'removeFromWhitelist') {
    const domain = message.domain;
    const index = adblockConfig.whitelist.indexOf(domain);
    if (index > -1) {
      adblockConfig.whitelist.splice(index, 1);
      saveAdblockConfig();
      updateWhitelistRules();
    }
    sendResponse({ success: true });
  }
  
  if (message.type === 'isWhitelisted') {
    const domain = message.domain;
    const isWhitelisted = adblockConfig.whitelist.some(w => 
      domain === w || domain.endsWith('.' + w)
    );
    sendResponse({ isWhitelisted });
  }
  
  if (message.type === 'getWhitelist') {
    sendResponse({ whitelist: adblockConfig.whitelist });
  }
  
  if (message.type === 'clearWhitelist') {
    adblockConfig.whitelist = [];
    saveAdblockConfig();
    updateWhitelistRules();
    sendResponse({ success: true });
  }
  
  if (message.type === 'resetAdblockStats') {
    adblockStats = {
      totalBlocked: 0,
      todayBlocked: 0,
      pageBlocked: {},
      lastReset: new Date().toDateString(),
      adsBlocked: 0,
      trackersBlocked: 0,
      socialBlocked: 0,
      cookiesBlocked: 0,
      blockedDomains: {}
    };
    saveAdblockStats();
    updateBadge();
    sendResponse({ success: true });
  }
  
  return true;
});

// ==========================================
// INSTALLATION ET MISE À JOUR
// ==========================================

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Configuration par défaut Cookie Eater
    await chrome.storage.sync.set({
      cookieEaterConfig: {
        enabled: true,
        mode: 'reject_all',
        autoHide: true,
        showNotification: true,
        cleanTrackingCookies: true,
        anonymizeData: true,
        delay: 500
      }
    });
    
    // Configuration par défaut AdBlocker
    adblockConfig = {
      enabled: true,
      adsEnabled: true,
      trackersEnabled: true,
      socialEnabled: true,
      whitelist: []
    };
    saveAdblockConfig();
    
    // Activer toutes les règles
    await updateRulesets();
    
    console.log('Cookie Eater & AdBlocker: Extension installée avec succès! v3.0.0');
  }
  
  if (details.reason === 'update') {
    // Charger et appliquer la configuration existante
    await loadAllData();
    
    console.log('Cookie Eater & AdBlocker: Extension mise à jour vers la version', 
      chrome.runtime.getManifest().version);
  }
});

// ==========================================
// DÉMARRAGE
// ==========================================

// Mettre à jour le badge au démarrage
updateBadge();
