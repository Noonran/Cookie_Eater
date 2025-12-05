/**
 * Cookie Eater - Service Worker (Background Script)
 * Manages statistics, notifications and communication
 * 
 * Created by Fusion AI
 */

// État global
let stats = {
  totalProcessed: 0,
  todayProcessed: 0,
  domains: {},
  lastReset: new Date().toDateString()
};

// Charger les statistiques au démarrage
chrome.storage.local.get('cookieEaterStats', (result) => {
  if (result.cookieEaterStats) {
    stats = result.cookieEaterStats;
    
    // Réinitialiser le compteur quotidien si nouveau jour
    const today = new Date().toDateString();
    if (stats.lastReset !== today) {
      stats.todayProcessed = 0;
      stats.lastReset = today;
      saveStats();
    }
  }
});

/**
 * Sauvegarde les statistiques
 */
function saveStats() {
  chrome.storage.local.set({ cookieEaterStats: stats });
}

/**
 * Met à jour le badge de l'extension
 */
function updateBadge(count) {
  const text = count > 0 ? count.toString() : '';
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
}

/**
 * Écoute les messages des content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'bannerProcessed') {
    // Mettre à jour les statistiques
    stats.totalProcessed++;
    stats.todayProcessed++;
    
    const domain = message.domain;
    if (!stats.domains[domain]) {
      stats.domains[domain] = {
        count: 0,
        lastAction: null,
        category: null
      };
    }
    stats.domains[domain].count++;
    stats.domains[domain].lastAction = message.action;
    stats.domains[domain].category = message.category;
    stats.domains[domain].lastDate = new Date().toISOString();
    
    saveStats();
    updateBadge(stats.todayProcessed);
    
    // Envoyer une notification si activé
    chrome.storage.sync.get('cookieEaterConfig', (result) => {
      const config = result.cookieEaterConfig || {};
      if (config.showNotification !== false) {
        // Notification subtile via le content script
        if (sender.tab) {
          chrome.tabs.sendMessage(sender.tab.id, {
            type: 'showNotification',
            action: message.action
          }).catch(() => {});
        }
      }
    });
    
    sendResponse({ success: true });
  }
  
  if (message.type === 'getStats') {
    sendResponse(stats);
  }
  
  if (message.type === 'resetStats') {
    stats = {
      totalProcessed: 0,
      todayProcessed: 0,
      domains: {},
      lastReset: new Date().toDateString()
    };
    saveStats();
    updateBadge(0);
    sendResponse({ success: true });
  }
  
  return true;
});

/**
 * Installation de l'extension
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Configuration par défaut
    chrome.storage.sync.set({
      cookieEaterConfig: {
        enabled: true,
        mode: 'reject_all',
        autoHide: true,
        showNotification: true,
        delay: 500
      }
    });
    
    console.log('Cookie Eater: Extension installée avec succès!');
  }
  
  if (details.reason === 'update') {
    console.log('Cookie Eater: Extension mise à jour vers la version', chrome.runtime.getManifest().version);
  }
});

/**
 * Mettre à jour le badge au changement d'onglet
 */
chrome.tabs.onActivated.addListener(() => {
  updateBadge(stats.todayProcessed);
});

/**
 * Réinitialiser le compteur quotidien à minuit
 */
function checkDailyReset() {
  const today = new Date().toDateString();
  if (stats.lastReset !== today) {
    stats.todayProcessed = 0;
    stats.lastReset = today;
    saveStats();
    updateBadge(0);
  }
}

// Vérifier toutes les heures
setInterval(checkDailyReset, 3600000);

