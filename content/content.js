/**
 * Cookie Eater - Content Script v2.0
 * Automatically detects and manages cookie banners
 * with support for data anonymization
 * 
 * Created by Fusion AI
 */

(function() {
  'use strict';

  // Default configuration
  const DEFAULT_CONFIG = {
    enabled: true,
    mode: 'reject_all', // 'reject_all', 'accept_essential', 'accept_anonymized'
    autoHide: true,
    showNotification: true,
    delay: 500,
    anonymizeData: true,
    cleanTrackingCookies: true
  };

  // Current language (default: English)
  let currentLang = 'en';

  // Translations for notifications
  const notificationTexts = {
    en: {
      reject: 'Cookies rejected',
      essential: 'Essential cookies accepted',
      accept_anonymized: 'Accepted & anonymized',
      close: 'Banner closed',
      accept: 'Cookies accepted',
      hidden: 'Banner hidden'
    },
    fr: {
      reject: 'Cookies refusés',
      essential: 'Cookies essentiels acceptés',
      accept_anonymized: 'Accepté & anonymisé',
      close: 'Bannière fermée',
      accept: 'Cookies acceptés',
      hidden: 'Bannière masquée'
    }
  };

  /**
   * Get notification text for current language
   */
  function getNotificationText(action) {
    return notificationTexts[currentLang]?.[action] || notificationTexts['en'][action] || action;
  }

  let config = { ...DEFAULT_CONFIG };
  let processedBanners = new Set();
  let observer = null;

  // Liste des cookies de tracking à nettoyer
  const TRACKING_COOKIE_PATTERNS = [
    /^_ga/i,           // Google Analytics
    /^_gid/i,          // Google Analytics
    /^_gat/i,          // Google Analytics
    /^_gcl/i,          // Google Ads
    /^_fbp/i,          // Facebook Pixel
    /^_fbc/i,          // Facebook Click
    /^fr$/i,           // Facebook
    /^_pin/i,          // Pinterest
    /^_tt/i,           // TikTok
    /^_scid/i,         // Snapchat
    /^_uet/i,          // Bing Ads
    /^IDE$/i,          // DoubleClick
    /^NID$/i,          // Google
    /^DSID$/i,         // DoubleClick
    /^__utm/i,         // Google Analytics (ancien)
    /^_hjid/i,         // Hotjar
    /^_hjSession/i,    // Hotjar
    /^ajs_/i,          // Segment
    /^mp_/i,           // Mixpanel
    /^amplitude/i,     // Amplitude
    /^intercom/i,      // Intercom
    /^crisp/i,         // Crisp
    /^hubspot/i,       // HubSpot
    /^__hssc/i,        // HubSpot
    /^__hstc/i,        // HubSpot
    /^__hsfp/i,        // HubSpot
    /^_clck/i,         // Clarity
    /^_clsk/i,         // Clarity
    /^MUID$/i,         // Microsoft
    /^OptanonConsent/i // OneTrust
  ];

  // Données anonymisées pour remplacer les vraies données
  const ANONYMOUS_DATA = {
    visitorId: () => 'anon_' + Math.random().toString(36).substr(2, 9),
    sessionId: () => 'sess_' + Date.now().toString(36),
    timestamp: () => Date.now(),
    clientId: () => '000000000.0000000000',
    userId: () => 'anonymous'
  };

  // Sélecteurs pour les bannières de cookies populaires
  const COOKIE_BANNER_SELECTORS = {
    // Bannières génériques
    generic: [
      '[class*="cookie-banner"]',
      '[class*="cookie-consent"]',
      '[class*="cookie-notice"]',
      '[class*="cookie-popup"]',
      '[class*="cookie-modal"]',
      '[class*="cookie-dialog"]',
      '[class*="cookie-bar"]',
      '[class*="cookie-wall"]',
      '[class*="cookie-layer"]',
      '[class*="cookie-message"]',
      '[class*="cookie-alert"]',
      '[class*="cookie-info"]',
      '[class*="gdpr"]',
      '[class*="consent-banner"]',
      '[class*="consent-modal"]',
      '[class*="consent-popup"]',
      '[class*="consent-dialog"]',
      '[class*="consent-layer"]',
      '[class*="consent-notice"]',
      '[class*="privacy-banner"]',
      '[class*="privacy-notice"]',
      '[class*="privacy-popup"]',
      '[class*="privacy-modal"]',
      '[id*="cookie-banner"]',
      '[id*="cookie-consent"]',
      '[id*="cookie-notice"]',
      '[id*="cookie-popup"]',
      '[id*="cookie-modal"]',
      '[id*="cookie-layer"]',
      '[id*="cookies"]',
      '[id*="gdpr"]',
      '[id*="consent-banner"]',
      '[id*="consent-modal"]',
      '[id*="consent-popup"]',
      '[id*="privacy-notice"]',
      '[aria-label*="cookie"]',
      '[aria-label*="consent"]',
      '[aria-label*="Cookie"]',
      '[aria-label*="Consent"]',
      '[role="dialog"][class*="cookie"]',
      '[role="alertdialog"][class*="cookie"]',
      '[role="dialog"][class*="consent"]',
      '[role="banner"][class*="cookie"]'
    ],
    // Solutions spécifiques
    onetrust: [
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '.onetrust-pc-dark-filter',
      '#ot-sdk-btn-floating'
    ],
    cookiebot: [
      '#CybotCookiebotDialog',
      '#CybotCookiebotDialogBody',
      '.CybotCookiebotDialogActive'
    ],
    trustarc: [
      '#truste-consent-track',
      '.truste-consent-content',
      '#consent_blackbar'
    ],
    quantcast: [
      '.qc-cmp2-container',
      '.qc-cmp-ui-container',
      '#qc-cmp2-main'
    ],
    didomi: [
      '#didomi-host',
      '.didomi-popup-container',
      '.didomi-notice-banner'
    ],
    klaro: [
      '.klaro',
      '.cookie-notice',
      '.cn-body'
    ],
    iubenda: [
      '.iubenda-cs-container',
      '#iubenda-cs-banner'
    ],
    cookiefirst: [
      '.cookiefirst-root',
      '[data-cookiefirst-widget]'
    ],
    sourcepoint: [
      '.sp-message-container',
      '[id^="sp_message_container"]'
    ],
    osano: [
      '.osano-cm-window',
      '.osano-cm-dialog'
    ],
    complianz: [
      '.cmplz-cookiebanner',
      '#cmplz-cookiebanner-container'
    ],
    usercentrics: [
      '#usercentrics-root',
      '.uc-banner'
    ],
    termly: [
      '.termly-consent-banner',
      '#termly-code-snippet-support'
    ],
    consentmanager: [
      '#cmpbox',
      '.cmpboxBG'
    ],
    axeptio: [
      '#axeptio_overlay',
      '[class*="axeptio"]'
    ],
    tarteaucitron: [
      '#tarteaucitronRoot',
      '#tarteaucitronAlertBig'
    ],
    // WordPress plugins
    wordpress: [
      '.cookie-law-info-bar',
      '#cookie-law-info-bar',
      '.cli-modal-content',
      '.gdpr-cookie-consent-bar'
    ]
  };

  // Sélecteurs pour les boutons de refus/acceptation
  const BUTTON_SELECTORS = {
    // Boutons de refus (priorité)
    reject: [
      '[class*="reject"]',
      '[class*="decline"]',
      '[class*="refuse"]',
      '[class*="deny"]',
      '[class*="disagree"]',
      '[id*="reject"]',
      '[id*="decline"]',
      '[id*="refuse"]',
      '[id*="deny"]',
      'button[data-action="reject"]',
      'button[data-action="decline"]',
      'a[data-action="reject"]',
      // OneTrust
      '#onetrust-reject-all-handler',
      '.onetrust-close-btn-handler',
      '#ot-pc-refuse-all-handler',
      // Cookiebot
      '#CybotCookiebotDialogBodyButtonDecline',
      '#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll',
      // TrustArc
      '.truste-button2',
      '[data-choice="decline"]',
      // Quantcast
      '.qc-cmp2-summary-buttons button:first-child',
      '[mode="secondary"]',
      // Didomi
      '#didomi-notice-disagree-button',
      '.didomi-dismiss-button',
      // Klaro
      '.cn-decline',
      '.cm-btn-decline',
      // Iubenda
      '.iubenda-cs-reject-btn',
      // Complianz
      '.cmplz-deny',
      // Usercentrics
      '[data-testid="uc-deny-all-button"]',
      // Tarteaucitron
      '#tarteaucitronAllDenied',
      '.tarteaucitronDeny'
    ],
    // Boutons pour accepter uniquement les essentiels
    essential: [
      '[class*="essential"]',
      '[class*="necessary"]',
      '[class*="required"]',
      '[class*="functional"]',
      '[class*="minimum"]',
      '#onetrust-accept-btn-handler',
      '.accept-necessary',
      '[data-action="accept-necessary"]',
      '.cookie-consent__button--necessary',
      // Tarteaucitron
      '#tarteaucitronAllDenied'
    ],
    // Boutons d'acceptation (fallback)
    accept: [
      '[class*="accept"]',
      '[class*="agree"]',
      '[class*="allow"]',
      '[class*="confirm"]',
      '[class*="valider"]',
      '[class*="continuer"]',
      '[id*="accept"]',
      '[id*="agree"]',
      '[id*="allow"]',
      'button[data-action="accept"]',
      '#onetrust-accept-btn-handler',
      '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
      '#CybotCookiebotDialogBodyButtonAccept',
      '.didomi-notice-agree-button',
      '#didomi-notice-agree-button',
      '.qc-cmp2-summary-buttons button:last-child',
      '.iubenda-cs-accept-btn',
      '.cmplz-accept',
      '[data-testid="uc-accept-all-button"]',
      '#tarteaucitronAllAllowed',
      '.tarteaucitronAllow'
    ],
    // Boutons de fermeture
    close: [
      '.close-button',
      '[class*="close"]',
      '[class*="dismiss"]',
      '[class*="fermer"]',
      '[aria-label="Close"]',
      '[aria-label="Fermer"]',
      '[aria-label="close"]',
      'button[type="button"][class*="dismiss"]',
      '.modal-close',
      '.popup-close'
    ],
    // Boutons de paramétrage
    settings: [
      '[class*="settings"]',
      '[class*="preferences"]',
      '[class*="manage"]',
      '[class*="customize"]',
      '[class*="parametr"]',
      '[class*="options"]',
      '#onetrust-pc-btn-handler',
      '#CybotCookiebotDialogBodyButtonDetails',
      '.didomi-notice-learn-more-button'
    ]
  };

  // Textes indicatifs de boutons (multilingue étendu)
  const BUTTON_TEXTS = {
    reject: [
      // Français
      'refuser', 'refuse', 'non merci', 'non, merci', 'pas maintenant',
      'continuer sans accepter', 'sans accepter', 'rejeter',
      // Anglais
      'reject', 'decline', 'deny', 'disagree', 'no thanks', 'not now',
      'continue without', 'without accepting', 'opt out', 'opt-out',
      // Allemand
      'ablehnen', 'nein danke', 'nicht akzeptieren',
      // Espagnol
      'rechazar', 'no acepto', 'no gracias',
      // Italien
      'rifiuta', 'rifiuto', 'non accetto',
      // Portugais
      'recusar', 'rejeitar', 'não aceito',
      // Néerlandais
      'weigeren', 'afwijzen', 'nee bedankt',
      // Autres
      'no', 'non', 'nein', 'nie', 'não', 'nej', 'ei'
    ],
    essential: [
      // Français
      'essentiel', 'nécessaire', 'uniquement essentiels', 
      'cookies essentiels', 'accepter les essentiels',
      'uniquement les cookies nécessaires',
      // Anglais
      'essential', 'necessary', 'required', 'functional only',
      'only essential', 'only necessary', 'accept essential',
      'strictly necessary',
      // Allemand
      'notwendig', 'nur notwendige', 'erforderlich',
      // Espagnol
      'necesario', 'esencial', 'solo esenciales',
      // Italien
      'necessario', 'essenziale', 'solo necessari',
      // Portugais
      'necessário', 'essencial', 'apenas essenciais'
    ],
    accept: [
      // Français
      'accepter', 'j\'accepte', "j'accepte", 'accepte', 'ok', 'd\'accord',
      "d'accord", 'compris', 'continuer', 'valider', 'confirmer',
      'tout accepter', 'accepter tout', 'accepter tous', 'accepter les cookies',
      // Anglais
      'accept', 'agree', 'allow', 'i agree', 'got it', 'understand',
      'continue', 'ok', 'okay', 'yes', 'confirm', 'accept all',
      'allow all', 'accept cookies', 'i accept',
      // Allemand
      'akzeptieren', 'zustimmen', 'einverstanden', 'alle akzeptieren',
      // Espagnol
      'aceptar', 'acepto', 'de acuerdo', 'aceptar todo',
      // Italien
      'accetta', 'accetto', 'va bene', 'accetta tutto',
      // Portugais
      'aceitar', 'aceito', 'concordo', 'aceitar tudo',
      // Néerlandais
      'accepteren', 'akkoord', 'alles accepteren'
    ],
    close: [
      'fermer', 'close', 'dismiss', 'schließen', 'chiudi', 'cerrar', 
      'sluiten', 'fechar', '×', 'x', '✕', '✖'
    ]
  };

  // Mots-clés pour détecter une bannière de cookies par son contenu
  const COOKIE_KEYWORDS = [
    'cookie', 'cookies', 'gdpr', 'rgpd', 'consent', 'consentement',
    'privacy', 'confidentialité', 'vie privée', 'données personnelles',
    'personal data', 'tracking', 'traceurs', 'trackers',
    'nous utilisons', 'we use', 'wir verwenden', 'utilizamos',
    'accepter', 'accept', 'akzeptieren', 'aceptar',
    'politique de confidentialité', 'privacy policy',
    'en poursuivant', 'by continuing', 'en continuant'
  ];

  /**
   * Charge la configuration depuis le stockage
   */
  async function loadConfig() {
    try {
      const result = await chrome.storage.sync.get('cookieEaterConfig');
      if (result.cookieEaterConfig) {
        config = { ...DEFAULT_CONFIG, ...result.cookieEaterConfig };
      }
    } catch (e) {
      console.log('Cookie Eater: Utilisation de la configuration par défaut');
    }
  }

  /**
   * Détection heuristique d'une bannière de cookies par son contenu
   */
  function detectBannerByContent(element) {
    if (!element || !element.textContent) return false;
    
    const text = element.textContent.toLowerCase();
    const matchCount = COOKIE_KEYWORDS.filter(keyword => 
      text.includes(keyword.toLowerCase())
    ).length;
    
    // Au moins 2 mots-clés doivent correspondre
    return matchCount >= 2;
  }

  /**
   * Recherche les éléments fixes/sticky qui pourraient être des bannières
   */
  function findFixedElements() {
    const candidates = [];
    const allElements = document.querySelectorAll('div, section, aside, footer, header, [role="dialog"], [role="alertdialog"], [role="banner"]');
    
    for (const element of allElements) {
      if (processedBanners.has(element)) continue;
      
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      
      // Vérifier si l'élément est fixe ou sticky
      const isFixed = style.position === 'fixed' || style.position === 'sticky';
      const isAbsolute = style.position === 'absolute';
      const hasHighZIndex = parseInt(style.zIndex) > 1000;
      const isVisible = style.display !== 'none' && 
                       style.visibility !== 'hidden' && 
                       rect.width > 100 && 
                       rect.height > 50;
      
      if (isVisible && (isFixed || (isAbsolute && hasHighZIndex))) {
        // Vérifier le contenu
        if (detectBannerByContent(element)) {
          candidates.push(element);
        }
      }
    }
    
    return candidates;
  }

  /**
   * Trouve un élément de bannière de cookies
   */
  function findCookieBanner() {
    // 1. Chercher avec les sélecteurs connus
    for (const [category, selectors] of Object.entries(COOKIE_BANNER_SELECTORS)) {
      for (const selector of selectors) {
        try {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            if (isVisibleElement(element) && !processedBanners.has(element)) {
              return { element, category };
            }
          }
        } catch (e) {
          // Sélecteur invalide, ignorer
        }
      }
    }
    
    // 2. Détection heuristique pour les bannières personnalisées
    const candidates = findFixedElements();
    for (const element of candidates) {
      if (isVisibleElement(element) && !processedBanners.has(element)) {
        return { element, category: 'heuristic' };
      }
    }
    
    // 3. Rechercher les éléments avec du texte cookie/consent
    const textSearch = document.querySelectorAll('*');
    for (const element of textSearch) {
      if (processedBanners.has(element)) continue;
      if (!isVisibleElement(element)) continue;
      
      // Vérifier si c'est un conteneur de haut niveau
      const rect = element.getBoundingClientRect();
      if (rect.width < 200 || rect.height < 80) continue;
      
      // Vérifier le contenu
      const text = element.textContent?.toLowerCase() || '';
      const hasAcceptButton = element.querySelector('button, [role="button"], a[class*="btn"]');
      
      if (hasAcceptButton && 
          (text.includes('cookie') || text.includes('consent')) &&
          (text.includes('accepter') || text.includes('accept') || text.includes('j\'accepte'))) {
        
        // S'assurer que c'est un élément de haut niveau (pas un enfant d'un autre candidat)
        const style = window.getComputedStyle(element);
        if (style.position === 'fixed' || style.position === 'sticky' || parseInt(style.zIndex) > 100) {
          return { element, category: 'text-detected' };
        }
      }
    }
    
    return null;
  }

  /**
   * Vérifie si un élément est visible
   */
  function isVisibleElement(element) {
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      rect.width > 0 &&
      rect.height > 0
    );
  }

  /**
   * Trouve un bouton par son texte
   */
  function findButtonByText(container, textPatterns) {
    const buttons = container.querySelectorAll(
      'button, a[role="button"], [class*="btn"], [class*="button"], ' +
      'input[type="button"], input[type="submit"], a[href="#"], ' +
      '[onclick], [class*="cta"], [class*="action"]'
    );
    
    for (const button of buttons) {
      if (!isVisibleElement(button)) continue;
      
      const buttonText = (
        button.textContent || 
        button.value || 
        button.getAttribute('aria-label') || 
        button.getAttribute('title') ||
        ''
      ).toLowerCase().trim();
      
      for (const pattern of textPatterns) {
        if (buttonText.includes(pattern.toLowerCase())) {
          return button;
        }
      }
    }
    return null;
  }

  /**
   * Trouve un bouton par sélecteur
   */
  function findButtonBySelector(container, selectors) {
    for (const selector of selectors) {
      try {
        const button = container.querySelector(selector);
        if (button && isVisibleElement(button)) {
          return button;
        }
        // Chercher aussi dans le document entier
        const globalButton = document.querySelector(selector);
        if (globalButton && isVisibleElement(globalButton)) {
          return globalButton;
        }
      } catch (e) {
        // Sélecteur invalide, ignorer
      }
    }
    return null;
  }

  /**
   * Trouve le premier bouton visible dans un conteneur
   */
  function findAnyButton(container) {
    const buttons = container.querySelectorAll(
      'button, a[role="button"], [class*="btn"], [class*="button"], ' +
      'input[type="button"], input[type="submit"]'
    );
    
    for (const button of buttons) {
      if (isVisibleElement(button)) {
        const text = (button.textContent || '').toLowerCase();
        // Éviter les boutons de paramétrage ou de fermeture
        if (!text.includes('paramètr') && 
            !text.includes('setting') && 
            !text.includes('gérer') && 
            !text.includes('manage') &&
            !text.includes('plus') &&
            !text.includes('more') &&
            !text.includes('savoir')) {
          return button;
        }
      }
    }
    return null;
  }

  /**
   * Trouve le meilleur bouton à cliquer selon le mode
   */
  function findBestButton(banner, mode) {
    const container = banner.element;
    
    // Mode: Refuser tout
    if (mode === 'reject_all') {
      // 1. Chercher un bouton de refus explicite
      let button = findButtonBySelector(container, BUTTON_SELECTORS.reject);
      if (button) return { button, action: 'reject' };
      
      button = findButtonByText(container, BUTTON_TEXTS.reject);
      if (button) return { button, action: 'reject' };
      
      // 2. Chercher un bouton "essentiels uniquement"
      button = findButtonBySelector(container, BUTTON_SELECTORS.essential);
      if (button) return { button, action: 'essential' };
      
      button = findButtonByText(container, BUTTON_TEXTS.essential);
      if (button) return { button, action: 'essential' };
      
      // 3. Si mode strict, ne pas continuer
      // Sinon, passer au fallback accept_anonymized
    }
    
    // Mode: Accepter les essentiels
    if (mode === 'accept_essential') {
      let button = findButtonBySelector(container, BUTTON_SELECTORS.essential);
      if (button) return { button, action: 'essential' };
      
      button = findButtonByText(container, BUTTON_TEXTS.essential);
      if (button) return { button, action: 'essential' };
    }
    
    // Mode: Accepter avec anonymisation OU fallback pour reject_all
    if (mode === 'accept_anonymized' || mode === 'reject_all' || mode === 'accept_essential') {
      // Chercher un bouton d'acceptation
      let button = findButtonBySelector(container, BUTTON_SELECTORS.accept);
      if (button) return { button, action: 'accept_anonymized' };
      
      button = findButtonByText(container, BUTTON_TEXTS.accept);
      if (button) return { button, action: 'accept_anonymized' };
      
      // Dernier recours: n'importe quel bouton principal
      button = findAnyButton(container);
      if (button) return { button, action: 'accept_anonymized' };
    }
    
    // Fallback: Bouton de fermeture
    let button = findButtonBySelector(container, BUTTON_SELECTORS.close);
    if (button) return { button, action: 'close' };
    
    button = findButtonByText(container, BUTTON_TEXTS.close);
    if (button) return { button, action: 'close' };
    
    return null;
  }

  /**
   * Nettoie les cookies de tracking
   */
  function cleanTrackingCookies() {
    if (!config.cleanTrackingCookies) return;
    
    const cookies = document.cookie.split(';');
    let cleaned = 0;
    
    for (const cookie of cookies) {
      const [name] = cookie.split('=').map(s => s.trim());
      
      for (const pattern of TRACKING_COOKIE_PATTERNS) {
        if (pattern.test(name)) {
          // Supprimer le cookie
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
          cleaned++;
          console.log(`Cookie Eater: Cookie de tracking supprimé: ${name}`);
          break;
        }
      }
    }
    
    if (cleaned > 0) {
      console.log(`Cookie Eater: ${cleaned} cookies de tracking nettoyés`);
    }
  }

  /**
   * Anonymise les données des cookies restants
   */
  function anonymizeCookies() {
    if (!config.anonymizeData) return;
    
    // Remplacer les identifiants de tracking par des valeurs anonymes
    const cookiesToAnonymize = [
      { pattern: /_ga$/, value: 'GA1.1.' + ANONYMOUS_DATA.clientId() },
      { pattern: /_gid$/, value: 'GA1.1.' + ANONYMOUS_DATA.visitorId() },
      { pattern: /^_fbp$/, value: 'fb.1.' + ANONYMOUS_DATA.timestamp() + '.' + ANONYMOUS_DATA.visitorId() }
    ];
    
    const cookies = document.cookie.split(';');
    
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=').map(s => s.trim());
      
      for (const rule of cookiesToAnonymize) {
        if (rule.pattern.test(name) && value) {
          // Remplacer par une valeur anonyme
          const anonValue = rule.value;
          document.cookie = `${name}=${anonValue}; path=/`;
          console.log(`Cookie Eater: Cookie anonymisé: ${name}`);
          break;
        }
      }
    }
  }

  /**
   * Désactive les checkboxes non essentiels dans les paramètres
   */
  function uncheckNonEssentialOptions(container) {
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    
    for (const checkbox of checkboxes) {
      const label = checkbox.closest('label') || 
                   document.querySelector(`label[for="${checkbox.id}"]`) ||
                   checkbox.parentElement;
      
      if (!label) continue;
      
      const labelText = label.textContent.toLowerCase();
      
      // Garder coché uniquement si c'est essentiel/nécessaire
      const isEssential = 
        labelText.includes('essentiel') ||
        labelText.includes('essential') ||
        labelText.includes('nécessaire') ||
        labelText.includes('necessary') ||
        labelText.includes('required') ||
        labelText.includes('obligatoire') ||
        labelText.includes('strictly') ||
        labelText.includes('technique') ||
        labelText.includes('fonctionnel') ||
        labelText.includes('functional') ||
        checkbox.disabled; // Les essentiels sont souvent désactivés
      
      if (!isEssential && checkbox.checked) {
        checkbox.click();
      }
    }
  }

  /**
   * Masque une bannière
   */
  function hideBanner(banner) {
    if (!config.autoHide) return;
    
    try {
      banner.element.style.setProperty('display', 'none', 'important');
      banner.element.style.setProperty('visibility', 'hidden', 'important');
      banner.element.style.setProperty('opacity', '0', 'important');
      banner.element.style.setProperty('pointer-events', 'none', 'important');
      
      // Supprimer les overlays
      const overlays = document.querySelectorAll(
        '.cookie-overlay, .consent-overlay, [class*="overlay"][class*="cookie"], ' +
        '[class*="overlay"][class*="consent"], [class*="overlay"][class*="gdpr"], ' +
        '.onetrust-pc-dark-filter, .CybotCookiebotDialogBodyUnderlay, ' +
        '[class*="backdrop"], [class*="modal-overlay"], [class*="modal-backdrop"]'
      );
      
      overlays.forEach(overlay => {
        overlay.style.setProperty('display', 'none', 'important');
      });
      
      // Restaurer le scroll du body
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('position');
      document.documentElement.style.removeProperty('overflow');
      document.documentElement.classList.remove('modal-open', 'no-scroll', 'overflow-hidden');
      document.body.classList.remove('modal-open', 'no-scroll', 'overflow-hidden');
      
    } catch (e) {
      console.log('Cookie Eater: Impossible de masquer la bannière', e);
    }
  }

  /**
   * Simule un clic naturel
   */
  function simulateClick(element) {
    try {
      // Scroll vers l'élément si nécessaire
      element.scrollIntoView({ behavior: 'instant', block: 'center' });
      
      // Créer et dispatcher les événements
      const events = ['mouseenter', 'mouseover', 'focus', 'mousedown', 'mouseup', 'click'];
      
      for (const eventType of events) {
        const event = new MouseEvent(eventType, {
          view: window,
          bubbles: true,
          cancelable: true,
          buttons: eventType === 'mousedown' || eventType === 'mouseup' ? 1 : 0
        });
        element.dispatchEvent(event);
      }
      
      // Essayer aussi un click direct
      if (typeof element.click === 'function') {
        element.click();
      }
      
      return true;
    } catch (e) {
      console.log('Cookie Eater: Erreur lors du clic', e);
      return false;
    }
  }

  /**
   * Affiche une notification sur la page
   */
  function showPageNotification(message, action) {
    if (!config.showNotification) return;
    
    // Supprimer les notifications existantes
    document.querySelectorAll('.cookie-eater-notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'cookie-eater-notification';
    
    const icons = {
      reject: '🛡️',
      essential: '🔒',
      accept_anonymized: '🎭',
      close: '✖️',
      accept: '✓'
    };
    
    notification.innerHTML = `
      <span class="cookie-eater-notification-icon">${icons[action] || '🍪'}</span>
      <span class="cookie-eater-notification-text">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-hide après 3 secondes
    setTimeout(() => {
      notification.classList.add('hiding');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Traite une bannière de cookies
   */
  async function processBanner(banner) {
    if (processedBanners.has(banner.element)) return false;
    
    processedBanners.add(banner.element);
    
    console.log(`Cookie Eater: Bannière détectée (${banner.category})`);
    
    // Chercher le meilleur bouton
    const result = findBestButton(banner, config.mode);
    
    if (result) {
      console.log(`Cookie Eater: Action "${result.action}" sur le bouton:`, result.button.textContent?.trim());
      
      // Attendre un peu avant de cliquer (simulation naturelle)
      await sleep(config.delay);
      
      // Cliquer sur le bouton
      const clicked = simulateClick(result.button);
      
      if (clicked) {
        // Masquer la bannière après un délai
        await sleep(300);
        hideBanner(banner);
        
        // Si on a accepté, nettoyer et anonymiser les cookies
        if (result.action === 'accept_anonymized' || result.action === 'accept') {
          await sleep(500);
          cleanTrackingCookies();
          anonymizeCookies();
        }
        
        // Notification
        showPageNotification(getNotificationText(result.action), result.action);
        
        // Notifier le background script
        notifyBackground({
          type: 'bannerProcessed',
          domain: window.location.hostname,
          action: result.action,
          category: banner.category
        });
        
        return true;
      }
    } else {
      console.log('Cookie Eater: No button found, hiding banner');
      hideBanner(banner);
      showPageNotification(getNotificationText('hidden'), 'close');
    }
    
    return false;
  }

  /**
   * Notifie le background script
   */
  function notifyBackground(message) {
    try {
      chrome.runtime.sendMessage(message);
    } catch (e) {
      // Extension peut être déconnectée
    }
  }

  /**
   * Pause asynchrone
   */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Scan et traitement des bannières
   */
  async function scanAndProcess() {
    if (!config.enabled) return;
    
    const banner = findCookieBanner();
    if (banner) {
      await processBanner(banner);
    }
  }

  /**
   * Configure le MutationObserver pour détecter les nouvelles bannières
   */
  function setupObserver() {
    if (observer) {
      observer.disconnect();
    }
    
    observer = new MutationObserver(async (mutations) => {
      // Debounce pour éviter les traitements multiples
      clearTimeout(observer.timeout);
      observer.timeout = setTimeout(async () => {
        await scanAndProcess();
      }, 200);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden']
    });
  }

  /**
   * Initialize the extension
   */
  async function init() {
    // Load configuration and language
    await loadConfig();
    await loadLanguage();
    
    if (!config.enabled) {
      console.log('Cookie Eater: Extension désactivée');
      return;
    }
    
    console.log('Cookie Eater: Initialisation v2.0...');
    
    // Premier scan
    await sleep(config.delay);
    await scanAndProcess();
    
    // Observer les changements
    if (document.body) {
      setupObserver();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        setupObserver();
      });
    }
    
    // Scan périodique (pour les bannières qui apparaissent tard)
    setInterval(scanAndProcess, 2000);
    
    // Nettoyage périodique des cookies de tracking
    if (config.cleanTrackingCookies) {
      setInterval(cleanTrackingCookies, 30000);
    }
  }

  // Load saved language
  async function loadLanguage() {
    try {
      const result = await chrome.storage.sync.get('cookieEaterLang');
      if (result.cookieEaterLang) {
        currentLang = result.cookieEaterLang;
      }
    } catch (e) {
      // Use default language
    }
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'configUpdate') {
      config = { ...DEFAULT_CONFIG, ...message.config };
      console.log('Cookie Eater: Configuration updated', config);
    }
    
    if (message.type === 'langUpdate') {
      currentLang = message.lang;
      console.log('Cookie Eater: Language updated to', currentLang);
    }
    
    if (message.type === 'manualScan') {
      processedBanners.clear();
      scanAndProcess();
      sendResponse({ success: true });
    }
    
    if (message.type === 'cleanCookies') {
      cleanTrackingCookies();
      anonymizeCookies();
      sendResponse({ success: true });
    }
    
    return true;
  });

  // Démarrage
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
