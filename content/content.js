/**
 * Cookie Eater & AdBlocker - Content Script v3.0
 * Automatically detects and manages cookie banners
 * with support for data anonymization and cosmetic ad blocking
 * 
 * Created by Fusion AI
 */

(function() {
  'use strict';

  // ==========================================
  // CONFIGURATION
  // ==========================================

  const DEFAULT_CONFIG = {
    enabled: true,
    mode: 'reject_all',
    autoHide: true,
    showNotification: true,
    delay: 500,
    anonymizeData: true,
    cleanTrackingCookies: true
  };

  let config = { ...DEFAULT_CONFIG };
  let currentLang = 'en';

  // ==========================================
  // SITE WHITELIST - No cosmetic blocking on these sites
  // ==========================================
  
  const COSMETIC_WHITELIST = [
    'github.com',
    'github.io',
    'githubusercontent.com',
    'gitlab.com',
    'bitbucket.org',
    'stackoverflow.com',
    'stackexchange.com',
    'developer.mozilla.org',
    'docs.google.com',
    'drive.google.com',
    'mail.google.com',
    'calendar.google.com',
    'meet.google.com',
    'notion.so',
    'figma.com',
    'canva.com',
    'trello.com',
    'slack.com',
    'discord.com',
    'teams.microsoft.com',
    'office.com',
    'linkedin.com',
    'codepen.io',
    'jsfiddle.net',
    'codesandbox.io',
    'replit.com',
    'vercel.app',
    'netlify.app',
    'herokuapp.com'
  ];

  // Sites requiring special anti-adblock bypass
  const SPECIAL_BYPASS_SITES = [
    'youtube.com',
    'youtu.be',
    'twitch.tv',
    'dailymotion.com',
    'vimeo.com'
  ];

  /**
   * Check if current site is in whitelist
   */
  function isWhitelistedSite() {
    const hostname = window.location.hostname.toLowerCase();
    return COSMETIC_WHITELIST.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  }

  /**
   * Check if current site needs special bypass
   */
  function needsSpecialBypass() {
    const hostname = window.location.hostname.toLowerCase();
    return SPECIAL_BYPASS_SITES.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  }

  /**
   * Check if we're on YouTube
   */
  function isYouTube() {
    const hostname = window.location.hostname.toLowerCase();
    return hostname.includes('youtube.com') || hostname.includes('youtu.be');
  }

  /**
   * Check if we're on a video streaming site where we should disable most features
   */
  function isVideoStreamingSite() {
    const hostname = window.location.hostname.toLowerCase();
    return hostname.includes('youtube.com') || 
           hostname.includes('youtu.be') ||
           hostname.includes('twitch.tv') ||
           hostname.includes('netflix.com') ||
           hostname.includes('primevideo.com') ||
           hostname.includes('disneyplus.com') ||
           hostname.includes('hulu.com') ||
           hostname.includes('hbomax.com') ||
           hostname.includes('peacocktv.com') ||
           hostname.includes('paramountplus.com') ||
           hostname.includes('crunchyroll.com') ||
           hostname.includes('funimation.com');
  }

  // Notification texts
  const notificationTexts = {
    en: {
      reject: 'Cookies rejected',
      essential: 'Essential cookies accepted',
      accept_anonymized: 'Accepted & anonymized',
      close: 'Banner closed',
      accept: 'Cookies accepted',
      hidden: 'Banner hidden',
      popup_closed: 'Marketing popup closed',
      adblock_bypassed: 'Anti-adblock bypassed'
    },
    fr: {
      reject: 'Cookies refusés',
      essential: 'Cookies essentiels acceptés',
      accept_anonymized: 'Accepté & anonymisé',
      close: 'Bannière fermée',
      accept: 'Cookies acceptés',
      hidden: 'Bannière masquée',
      popup_closed: 'Popup marketing fermé',
      adblock_bypassed: 'Anti-adblock contourné'
    }
  };

  function getNotificationText(action) {
    return notificationTexts[currentLang]?.[action] || notificationTexts['en'][action] || action;
  }

  let processedBanners = new Set();
  let observer = null;

  // ==========================================
  // TRACKING COOKIE PATTERNS
  // ==========================================

  const TRACKING_COOKIE_PATTERNS = [
    /^_ga/i, /^_gid/i, /^_gat/i, /^_gcl/i,
    /^_fbp/i, /^_fbc/i, /^fr$/i,
    /^_pin/i, /^_tt/i, /^_scid/i, /^_uet/i,
    /^IDE$/i, /^NID$/i, /^DSID$/i, /^__utm/i,
    /^_hjid/i, /^_hjSession/i,
    /^ajs_/i, /^mp_/i, /^amplitude/i,
    /^intercom/i, /^crisp/i, /^hubspot/i,
    /^__hssc/i, /^__hstc/i, /^__hsfp/i,
    /^_clck/i, /^_clsk/i, /^MUID$/i,
    /^OptanonConsent/i
  ];

  const ANONYMOUS_DATA = {
    visitorId: () => 'anon_' + Math.random().toString(36).substr(2, 9),
    sessionId: () => 'sess_' + Date.now().toString(36),
    timestamp: () => Date.now(),
    clientId: () => '000000000.0000000000',
    userId: () => 'anonymous'
  };

  // ==========================================
  // COSMETIC BLOCKING SELECTORS
  // ==========================================

  const AD_SELECTORS = [
    // Generic ad containers
    '[class*="ad-container"]',
    '[class*="ad-wrapper"]',
    '[class*="ad-slot"]',
    '[class*="ad-unit"]',
    '[class*="ad-banner"]',
    '[class*="ad-box"]',
    '[class*="ad-placement"]',
    '[class*="advertisement"]',
    '[class*="sponsored"]',
    '[class*="promoted"]',
    '[id*="ad-container"]',
    '[id*="ad-wrapper"]',
    '[id*="ad-slot"]',
    '[id*="advertisement"]',
    // Google Ads
    'ins.adsbygoogle',
    '[id^="google_ads"]',
    '[id^="div-gpt-ad"]',
    '.gpt-ad',
    // Common ad networks
    '[class*="taboola"]',
    '[class*="outbrain"]',
    '[id*="taboola"]',
    '[id*="outbrain"]',
    '.OUTBRAIN',
    '#taboola-below-article',
    // Social ads
    '[class*="facebook-ad"]',
    '[class*="twitter-ad"]',
    // In-article ads
    '.in-article-ad',
    '.article-ad',
    '.inline-ad',
    '.mid-article-ad',
    // Sidebar ads
    '.sidebar-ad',
    '.sidebar-advertisement',
    '[class*="sidebar"] [class*="ad"]',
    // Footer ads
    '.footer-ad',
    '[class*="footer"] [class*="ad"]',
    // Sticky ads
    '.sticky-ad',
    '[class*="sticky-ad"]',
    // Native ads
    '.native-ad',
    '[class*="native-ad"]',
    // Video ads containers
    '.video-ad',
    '[class*="video-ad"]',
    '.preroll-ad',
    // Popover/popup ads
    '[class*="popup-ad"]',
    '[class*="popover-ad"]',
    // Specific ad iframes
    'iframe[src*="doubleclick"]',
    'iframe[src*="googlesyndication"]',
    'iframe[src*="googleadservices"]',
    'iframe[src*="facebook.com/plugins"]',
    'iframe[src*="taboola"]',
    'iframe[src*="outbrain"]'
  ];

  const SOCIAL_WIDGET_SELECTORS = [
    // Facebook
    '.fb-like',
    '.fb-share-button',
    '.fb-comments',
    '.fb-page',
    '[class*="facebook-widget"]',
    'iframe[src*="facebook.com/plugins"]',
    // Twitter
    '.twitter-share-button',
    '.twitter-follow-button',
    '.twitter-timeline',
    '[class*="twitter-widget"]',
    'iframe[src*="platform.twitter.com"]',
    // LinkedIn
    '.linkedin-share',
    '[class*="linkedin-widget"]',
    // Pinterest
    '.pinterest-widget',
    '[data-pin-do]',
    // Instagram
    '[class*="instagram-widget"]',
    // General social
    '.social-share',
    '.share-buttons',
    '.social-buttons',
    '[class*="social-widget"]',
    '[class*="share-widget"]',
    // AddThis / ShareThis
    '.addthis_toolbox',
    '.addthis-smartlayers',
    '.sharethis-inline-share-buttons',
    // Disqus
    '#disqus_thread',
    '.disqus-comment-count'
  ];

  // ==========================================
  // MARKETING POPUP SELECTORS
  // ==========================================

  const MARKETING_POPUP_SELECTORS = [
    // Newsletter popups
    '[class*="newsletter-popup"]',
    '[class*="newsletter-modal"]',
    '[class*="newsletter-overlay"]',
    '[id*="newsletter-popup"]',
    '[id*="newsletter-modal"]',
    '[class*="email-popup"]',
    '[class*="email-modal"]',
    '[class*="signup-popup"]',
    '[class*="signup-modal"]',
    '[class*="subscribe-popup"]',
    '[class*="subscribe-modal"]',
    // Discount/promo popups
    '[class*="discount-popup"]',
    '[class*="promo-popup"]',
    '[class*="offer-popup"]',
    '[class*="deal-popup"]',
    '[class*="coupon-popup"]',
    '[class*="welcome-popup"]',
    '[class*="welcome-modal"]',
    '[class*="first-visit"]',
    '[class*="exit-intent"]',
    '[class*="exit-popup"]',
    // Generic marketing modals
    '[class*="marketing-popup"]',
    '[class*="marketing-modal"]',
    '[class*="promotional-popup"]',
    '[class*="lead-capture"]',
    '[class*="lead-popup"]',
    '[class*="popup-newsletter"]',
    '[class*="modal-newsletter"]',
    // Specific platforms
    '[class*="klaviyo"]',
    '[class*="mailchimp-popup"]',
    '[class*="optinmonster"]',
    '[class*="privy-popup"]',
    '[class*="sumo-popup"]',
    '[class*="justuno"]',
    '[class*="wisepops"]',
    '[class*="poptin"]',
    '[class*="sleeknote"]',
    '[class*="omnisend"]',
    '[id*="klaviyo"]',
    '[id*="optinmonster"]',
    '[id*="privy"]',
    // French specific
    '[class*="inscription-popup"]',
    '[class*="popup-inscription"]',
    '[class*="popup-promo"]',
    '[class*="reduction-popup"]',
    // Generic overlay modals with forms
    '.modal[style*="display: block"]',
    '.modal.show',
    '.popup.active',
    '.overlay.active',
    '[class*="lightbox"][class*="popup"]',
    '[class*="popup-overlay"]',
    '[class*="modal-overlay"]'
  ];

  // Keywords to identify marketing popups
  const MARKETING_KEYWORDS = [
    // English
    'newsletter', 'subscribe', 'sign up', 'signup', 'email', 'discount',
    'off your', '% off', 'promo', 'coupon', 'deal', 'offer', 'save',
    'join', 'exclusive', 'don\'t miss', 'limited time', 'special',
    'free shipping', 'first order', 'welcome',
    // French
    'newsletter', 'inscription', 'inscrivez', 'abonnez', 'email', 'réduction',
    'sur ta commande', 'sur votre commande', '% sur', 'promo', 'coupon',
    'offre', 'économisez', 'rejoignez', 'exclusif', 'ne ratez pas',
    'temps limité', 'livraison gratuite', 'première commande', 'bienvenue',
    'valider', 'prénom', 'nouveaux clients',
    // German
    'newsletter', 'anmelden', 'rabatt', 'gutschein', 'angebot',
    // Spanish
    'suscribir', 'descuento', 'oferta', 'boletín',
    // Italian
    'iscriviti', 'sconto', 'offerta'
  ];

  // Close button selectors for popups
  const POPUP_CLOSE_SELECTORS = [
    '[class*="close"]',
    '[class*="dismiss"]',
    '[class*="fermer"]',
    '[aria-label="Close"]',
    '[aria-label="Fermer"]',
    '[aria-label="close"]',
    'button[class*="close"]',
    'span[class*="close"]',
    'div[class*="close"]',
    'a[class*="close"]',
    '.modal-close',
    '.popup-close',
    '[data-dismiss="modal"]',
    '[data-close]',
    '[data-action="close"]',
    'button[type="button"]:not([class*="submit"]):not([class*="validate"])',
    'svg[class*="close"]',
    '[class*="icon-close"]',
    '[class*="btn-close"]',
    '[class*="close-btn"]',
    '[class*="close-button"]',
    '[class*="exit"]',
    'i[class*="close"]',
    'i[class*="times"]',
    '.fa-times',
    '.fa-close',
    '.fa-xmark',
    '[class*="×"]'
  ];

  // ==========================================
  // ANTI-ADBLOCK DETECTION & BYPASS
  // ==========================================

  // Selectors for anti-adblock walls
  const ANTI_ADBLOCK_SELECTORS = [
    '[class*="adblock-notice"]',
    '[class*="adblock-modal"]',
    '[class*="adblock-popup"]',
    '[class*="adblock-warning"]',
    '[class*="adblock-overlay"]',
    '[class*="adblock-wall"]',
    '[class*="adblocker-notice"]',
    '[class*="adblocker-modal"]',
    '[class*="adblocker-detected"]',
    '[class*="ad-blocker"]',
    '[class*="anti-adblock"]',
    '[class*="disable-adblock"]',
    '[id*="adblock-notice"]',
    '[id*="adblock-modal"]',
    '[id*="adblock-popup"]',
    '[id*="adblocker"]',
    '[id*="anti-adblock"]',
    '[class*="pub-block"]',
    '[class*="blocker-detected"]',
    '[class*="blocker-notice"]',
    '[class*="blocker-warning"]',
    '[class*="ab-detection"]',
    '[class*="ab-message"]',
    '[class*="ad-block-message"]',
    '[class*="adblock-message"]',
    '[class*="adsblock"]',
    '[class*="block-detector"]',
    '[class*="detector-modal"]',
    '[class*="extension-warning"]',
    '[class*="paywall-adblock"]',
    // French specific
    '[class*="bloqueur"]',
    '[class*="antipub"]',
    '[id*="bloqueur"]',
    '[class*="pub-bloquee"]',
    '[class*="detection-pub"]',
    // Common platform specific
    '[class*="tp-modal"]',  // Third-party detection modals
    '[class*="piano-"]',    // Piano paywall
    '[class*="poool-"]',    // Poool paywall
    '[id*="piano"]',
    '[id*="poool"]'
  ];

  // Keywords to identify anti-adblock popups
  const ANTI_ADBLOCK_KEYWORDS = [
    // English
    'adblock', 'ad blocker', 'ad-blocker', 'adblocker', 'ad block',
    'ublock', 'ublock origin', 'adblock plus',
    'disable your ad', 'turn off your ad', 'deactivate your ad',
    'whitelist', 'white list', 'allow ads', 'enable ads',
    'detected an ad', 'using an ad', 'ad blocking', 'ad-blocking',
    'support us by', 'support our site', 'free content',
    'pause your ad', 'turn off ad blocker', 'disable ad blocker',
    'click on the icon', 'refresh the page', 'reload the page',
    'extension detected', 'blocker detected',
    // French
    'bloqueur de publicité', 'bloqueur de pub', 'bloqueur publicitaire',
    'désactiver votre bloqueur', 'désactivez votre bloqueur', 'désactiviez',
    'autorisez les publicités', 'autoriser les publicités',
    'liste blanche', 'publicité participe', 'financement',
    'utilisiez un bloqueur', 'utilisez un bloqueur',
    'contenu gratuit', 'contenu exclusif', 'notre contribution',
    'quelles extensions', 'disposez-vous', 'extensions disposez',
    'cliquez sur l\'icône', 'icône adblock',
    'ne pas activer', 'pas activer sur', 'pages de ce site',
    'actualiser la page', 'rafraîchir la page', 'recharger la page',
    'exclure', 'mettre en pause', 'désactiver sur ce site',
    'adblock plus', 'ublock origin', 'adblock',
    // German
    'werbeblocker', 'adblocker deaktivieren', 'werbung erlauben',
    'seite aktualisieren', 'erweiterung erkannt',
    // Spanish
    'bloqueador de anuncios', 'desactivar bloqueador',
    'actualizar la página', 'extensión detectada',
    // Italian
    'blocco pubblicità', 'disattiva adblock',
    'aggiorna la pagina', 'estensione rilevata'
  ];

  // Fake ad element configurations to bypass detection
  const FAKE_AD_CONFIGS = [
    // Google Ads bait elements
    { tag: 'div', className: 'ad-container', id: 'google_ads_iframe' },
    { tag: 'div', className: 'ad', id: 'ad-container' },
    { tag: 'div', className: 'ads', id: 'ads' },
    { tag: 'div', className: 'adsbox', id: 'adsbox' },
    { tag: 'div', className: 'ad-placeholder', id: 'ad-placeholder' },
    { tag: 'div', className: 'afs_ads', id: 'afs_ads' },
    { tag: 'div', className: 'ad-banner', id: 'ad-banner' },
    { tag: 'div', className: 'ad-unit', id: 'ad-unit' },
    { tag: 'div', className: 'ad-slot', id: 'ad-slot' },
    { tag: 'div', className: 'adsbygoogle', id: 'adsbygoogle' },
    { tag: 'ins', className: 'adsbygoogle', id: null },
    { tag: 'div', className: 'banner-ad', id: 'banner-ad' },
    { tag: 'div', className: 'textAd', id: 'textAd' },
    { tag: 'div', className: 'ad-text', id: 'ad-text' },
    { tag: 'div', className: 'sponsor', id: 'sponsor' },
    { tag: 'div', className: 'sponsored', id: 'sponsored' },
    { tag: 'div', className: 'ad-wrapper', id: 'ad-wrapper' },
    { tag: 'div', className: 'ad_wrapper', id: 'ad_wrapper' },
    { tag: 'div', className: 'doubleclick', id: 'doubleclick' },
    { tag: 'div', className: 'pub', id: 'pub' },
    { tag: 'div', className: 'publicite', id: 'publicite' }
  ];

  let fakeAdsInjected = false;
  let antiAdblockBypassed = false;
  let youtubeBypassApplied = false;

  /**
   * Create and inject fake ad elements to bypass detection
   */
  function injectFakeAdElements() {
    if (fakeAdsInjected) return;
    fakeAdsInjected = true;
    
    console.log('Cookie Eater: Injecting fake ad elements to bypass detection...');
    
    // Create a hidden container for fake ads
    const container = document.createElement('div');
    container.id = 'ce-fake-ads-container';
    container.style.cssText = 'position: absolute !important; left: -9999px !important; top: -9999px !important; width: 1px !important; height: 1px !important; overflow: hidden !important; pointer-events: none !important;';
    
    // Create fake ad elements
    for (const config of FAKE_AD_CONFIGS) {
      const el = document.createElement(config.tag);
      el.className = config.className;
      if (config.id) el.id = config.id;
      
      // Set dimensions to appear as visible ads
      el.style.cssText = 'width: 300px !important; height: 250px !important; display: block !important; visibility: visible !important; opacity: 1 !important;';
      el.innerHTML = '&nbsp;'; // Non-empty content
      el.setAttribute('data-ad-status', 'filled');
      el.setAttribute('data-ad-loaded', 'true');
      
      container.appendChild(el);
    }
    
    // Insert at the beginning of body
    if (document.body) {
      document.body.insertBefore(container, document.body.firstChild);
    }
  }

  /**
   * Minimal YouTube handling - only hide ad-blocker warning popups
   * Does NOT interfere with video playback or YouTube APIs
   */
  function applyYouTubeMinimalBypass() {
    if (youtubeBypassApplied || !isYouTube()) return;
    youtubeBypassApplied = true;
    
    console.log('Cookie Eater: YouTube detected - minimal mode (only cookie handling)');
    
    // Only hide ad-blocker warning dialogs, don't touch anything else
    function hideAdblockWarningsOnly() {
      // Target ONLY the ad-blocker warning dialogs
      const warningSelectors = [
        'ytd-enforcement-message-view-model',
        'yt-playability-error-supported-renderers:has([class*="enforcement"])'
      ];
      
      warningSelectors.forEach(selector => {
        try {
          document.querySelectorAll(selector).forEach(el => {
            const text = el.textContent?.toLowerCase() || '';
            // Only hide if it mentions ad blocker
            if (text.includes('ad blocker') || 
                text.includes('bloqueur') || 
                text.includes('adblock') ||
                text.includes('bloqueurs de publicité')) {
              el.style.display = 'none';
            }
          });
        } catch(e) {}
      });
    }
    
    // Run periodically but very lightly
    setTimeout(hideAdblockWarningsOnly, 2000);
    setTimeout(hideAdblockWarningsOnly, 5000);
  }

  /**
   * Minimal Twitch handling
   */
  function applyTwitchMinimalBypass() {
    if (!window.location.hostname.includes('twitch.tv')) return;
    console.log('Cookie Eater: Twitch detected - minimal mode (only cookie handling)');
  }

  /**
   * Create fake ad elements to fool detection scripts (CSP-compatible, DOM only)
   * This doesn't inject scripts - it only creates DOM elements that ad detectors look for
   */
  function createFakeAdElementsForBypass() {
    if (antiAdblockBypassed) return;
    antiAdblockBypassed = true;
    
    console.log('Cookie Eater: Creating fake ad elements (CSP-compatible)...');
    
    // Create a hidden container for fake ads
    const container = document.createElement('div');
    container.id = 'ce-fake-ads-container';
    container.style.cssText = 'position: absolute !important; left: -9999px !important; top: -9999px !important; width: 1px !important; height: 1px !important; overflow: hidden !important; pointer-events: none !important;';
    
    // Create fake ad elements that detectors typically look for
    const fakeAdConfigs = [
      { tag: 'div', className: 'ad-container', id: 'google_ads_iframe' },
      { tag: 'div', className: 'ad', id: 'ad-container' },
      { tag: 'div', className: 'ads', id: 'ads' },
      { tag: 'div', className: 'adsbox', id: 'adsbox' },
      { tag: 'div', className: 'ad-placeholder', id: 'ad-placeholder' },
      { tag: 'div', className: 'afs_ads', id: 'afs_ads' },
      { tag: 'div', className: 'ad-banner', id: 'ad-banner' },
      { tag: 'div', className: 'adsbygoogle', id: 'adsbygoogle' },
      { tag: 'ins', className: 'adsbygoogle', id: null },
      { tag: 'div', className: 'banner-ad', id: 'banner-ad' },
      { tag: 'div', className: 'textAd', id: 'textAd' },
      { tag: 'div', className: 'sponsor', id: 'sponsor' },
      { tag: 'div', className: 'sponsored', id: 'sponsored' },
      { tag: 'div', className: 'pub', id: 'pub' },
      { tag: 'div', className: 'publicite', id: 'publicite' }
    ];
    
    for (const config of fakeAdConfigs) {
      const el = document.createElement(config.tag);
      el.className = config.className;
      if (config.id) el.id = config.id;
      
      // Set dimensions to appear as visible ads
      el.style.cssText = 'width: 300px !important; height: 250px !important; display: block !important; visibility: visible !important; opacity: 1 !important;';
      el.innerHTML = '&nbsp;';
      el.setAttribute('data-ad-status', 'filled');
      el.setAttribute('data-ad-loaded', 'true');
      
      container.appendChild(el);
    }
    
    // Insert at the beginning of body when ready
    if (document.body) {
      document.body.insertBefore(container, document.body.firstChild);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        if (document.body) {
          document.body.insertBefore(container, document.body.firstChild);
        }
      });
    }
    
    console.log('Cookie Eater: Fake ad elements created');
  }

  /**
   * Check if element is an anti-adblock popup
   */
  function isAntiAdblockPopup(element) {
    if (!element || !element.textContent) return false;
    
    const text = element.textContent.toLowerCase();
    
    // Count keyword matches
    const matchCount = ANTI_ADBLOCK_KEYWORDS.filter(keyword => 
      text.includes(keyword.toLowerCase())
    ).length;
    
    // More than 1 keyword match indicates anti-adblock
    return matchCount >= 2;
  }

  /**
   * Find anti-adblock popups
   */
  function findAntiAdblockPopups() {
    const popups = [];
    
    // Check specific selectors
    for (const selector of ANTI_ADBLOCK_SELECTORS) {
      try {
        document.querySelectorAll(selector).forEach(element => {
          if (isVisibleElement(element) && !processedPopups.has(element)) {
            popups.push(element);
          }
        });
      } catch (e) {}
    }
    
    // Check generic modal/popup elements for anti-adblock content
    const genericPopups = document.querySelectorAll(
      '[role="dialog"], [role="alertdialog"], .modal, .popup, [class*="modal"], [class*="popup"], [class*="overlay"], [class*="wall"]'
    );
    
    for (const element of genericPopups) {
      if (processedPopups.has(element)) continue;
      if (!isVisibleElement(element)) continue;
      
      if (isAntiAdblockPopup(element)) {
        if (!popups.includes(element)) {
          popups.push(element);
        }
      }
    }
    
    return popups;
  }

  /**
   * Handle anti-adblock popup - bypass and close
   */
  async function handleAntiAdblockPopup(popup) {
    if (processedPopups.has(popup)) return false;
    processedPopups.add(popup);
    
    console.log('Cookie Eater: Anti-adblock popup detected, bypassing...');
    
    // Create fake ads elements (CSP-compatible approach)
    injectFakeAdElements();
    createFakeAdElementsForBypass();
    
    // Try to find and click close button
    const closeBtn = findPopupCloseButton(popup);
    if (closeBtn) {
      simulateClick(closeBtn);
      await sleep(200);
    }
    
    // Force hide the popup
    hideElement(popup);
    
    // Remove any full-page overlays
    const overlays = document.querySelectorAll(
      '[class*="overlay"], [class*="backdrop"], [class*="modal-bg"], ' +
      '[class*="wall"], [class*="mask"], .modal-backdrop, [class*="blocker"]'
    );
    overlays.forEach(overlay => {
      const style = window.getComputedStyle(overlay);
      if (style.position === 'fixed' && parseInt(style.zIndex) > 0) {
        hideElement(overlay);
      }
    });
    
    // Restore scroll and pointer events
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('position');
    document.body.style.removeProperty('top');
    document.body.style.removeProperty('pointer-events');
    document.documentElement.style.removeProperty('overflow');
    document.documentElement.style.removeProperty('pointer-events');
    document.body.classList.remove('modal-open', 'no-scroll', 'overflow-hidden', 'noscroll', 'adblock-modal-open');
    document.documentElement.classList.remove('modal-open', 'no-scroll', 'overflow-hidden', 'noscroll');
    
    // Re-enable scrolling
    document.body.style.setProperty('overflow', 'auto', 'important');
    
    // Show notification
    showPageNotification(getNotificationText('adblock_bypassed'), 'close');
    
    return true;
  }

  /**
   * Scan and handle anti-adblock popups
   */
  async function scanAndBypassAntiAdblock() {
    if (!config.enabled) return;
    
    const popups = findAntiAdblockPopups();
    
    for (const popup of popups) {
      await handleAntiAdblockPopup(popup);
    }
  }

  // ==========================================
  // COOKIE BANNER SELECTORS
  // ==========================================

  const COOKIE_BANNER_SELECTORS = {
    generic: [
      '[class*="cookie-banner"]', '[class*="cookie-consent"]',
      '[class*="cookie-notice"]', '[class*="cookie-popup"]',
      '[class*="cookie-modal"]', '[class*="cookie-dialog"]',
      '[class*="cookie-bar"]', '[class*="cookie-wall"]',
      '[class*="cookie-layer"]', '[class*="cookie-message"]',
      '[class*="cookie-alert"]', '[class*="cookie-info"]',
      '[class*="gdpr"]', '[class*="consent-banner"]',
      '[class*="consent-modal"]', '[class*="consent-popup"]',
      '[class*="consent-dialog"]', '[class*="consent-layer"]',
      '[class*="consent-notice"]', '[class*="privacy-banner"]',
      '[class*="privacy-notice"]', '[class*="privacy-popup"]',
      '[class*="privacy-modal"]', '[id*="cookie-banner"]',
      '[id*="cookie-consent"]', '[id*="cookie-notice"]',
      '[id*="cookie-popup"]', '[id*="cookie-modal"]',
      '[id*="cookie-layer"]', '[id*="cookies"]',
      '[id*="gdpr"]', '[id*="consent-banner"]',
      '[id*="consent-modal"]', '[id*="consent-popup"]',
      '[id*="privacy-notice"]', '[aria-label*="cookie"]',
      '[aria-label*="consent"]', '[aria-label*="Cookie"]',
      '[aria-label*="Consent"]', '[role="dialog"][class*="cookie"]',
      '[role="alertdialog"][class*="cookie"]',
      '[role="dialog"][class*="consent"]',
      '[role="banner"][class*="cookie"]',
      // Generic dialogs often used for cookies
      '[role="dialog"]',
      '[role="alertdialog"]',
      '[aria-modal="true"]'
    ],
    onetrust: ['#onetrust-consent-sdk', '#onetrust-banner-sdk', '.onetrust-pc-dark-filter', '#ot-sdk-btn-floating'],
    cookiebot: ['#CybotCookiebotDialog', '#CybotCookiebotDialogBody', '.CybotCookiebotDialogActive'],
    trustpilot: ['[class*="cookie-information"]', '[class*="CookieConsentBanner"]', '[class*="trustpilot-consent"]', '[class*="cookie-policy-banner"]', '[data-testid*="cookie"]'],
    trustarc: ['#truste-consent-track', '.truste-consent-content', '#consent_blackbar'],
    quantcast: ['.qc-cmp2-container', '.qc-cmp-ui-container', '#qc-cmp2-main'],
    didomi: ['#didomi-host', '.didomi-popup-container', '.didomi-notice-banner'],
    klaro: ['.klaro', '.cookie-notice', '.cn-body'],
    iubenda: ['.iubenda-cs-container', '#iubenda-cs-banner'],
    cookiefirst: ['.cookiefirst-root', '[data-cookiefirst-widget]'],
    sourcepoint: ['.sp-message-container', '[id^="sp_message_container"]'],
    osano: ['.osano-cm-window', '.osano-cm-dialog'],
    complianz: ['.cmplz-cookiebanner', '#cmplz-cookiebanner-container'],
    usercentrics: ['#usercentrics-root', '.uc-banner'],
    termly: ['.termly-consent-banner', '#termly-code-snippet-support'],
    consentmanager: ['#cmpbox', '.cmpboxBG'],
    axeptio: ['#axeptio_overlay', '[class*="axeptio"]'],
    tarteaucitron: ['#tarteaucitronRoot', '#tarteaucitronAlertBig'],
    wordpress: ['.cookie-law-info-bar', '#cookie-law-info-bar', '.cli-modal-content', '.gdpr-cookie-consent-bar']
  };

  const BUTTON_SELECTORS = {
    reject: [
      '[class*="reject"]', '[class*="decline"]', '[class*="refuse"]',
      '[class*="deny"]', '[class*="disagree"]', '[id*="reject"]',
      '[id*="decline"]', '[id*="refuse"]', '[id*="deny"]',
      'button[data-action="reject"]', 'button[data-action="decline"]',
      'a[data-action="reject"]', '#onetrust-reject-all-handler',
      '.onetrust-close-btn-handler', '#ot-pc-refuse-all-handler',
      '#CybotCookiebotDialogBodyButtonDecline',
      '#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll',
      '.truste-button2', '[data-choice="decline"]',
      '.qc-cmp2-summary-buttons button:first-child', '[mode="secondary"]',
      '#didomi-notice-disagree-button', '.didomi-dismiss-button',
      '.cn-decline', '.cm-btn-decline', '.iubenda-cs-reject-btn',
      '.cmplz-deny', '[data-testid="uc-deny-all-button"]',
      '#tarteaucitronAllDenied', '.tarteaucitronDeny'
    ],
    essential: [
      '[class*="essential"]', '[class*="necessary"]', '[class*="required"]',
      '[class*="functional"]', '[class*="minimum"]',
      '#onetrust-accept-btn-handler', '.accept-necessary',
      '[data-action="accept-necessary"]', '.cookie-consent__button--necessary',
      '#tarteaucitronAllDenied'
    ],
    accept: [
      '[class*="accept"]', '[class*="agree"]', '[class*="allow"]',
      '[class*="confirm"]', '[class*="valider"]', '[class*="continuer"]',
      '[id*="accept"]', '[id*="agree"]', '[id*="allow"]',
      'button[data-action="accept"]', '#onetrust-accept-btn-handler',
      '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
      '#CybotCookiebotDialogBodyButtonAccept',
      '.didomi-notice-agree-button', '#didomi-notice-agree-button',
      '.qc-cmp2-summary-buttons button:last-child',
      '.iubenda-cs-accept-btn', '.cmplz-accept',
      '[data-testid="uc-accept-all-button"]',
      '#tarteaucitronAllAllowed', '.tarteaucitronAllow'
    ],
    close: [
      '.close-button', '[class*="close"]', '[class*="dismiss"]',
      '[class*="fermer"]', '[aria-label="Close"]', '[aria-label="Fermer"]',
      '[aria-label="close"]', 'button[type="button"][class*="dismiss"]',
      '.modal-close', '.popup-close'
    ]
  };

  const BUTTON_TEXTS = {
    reject: [
      'tout refuser', 'refuser tout', 'refuser tous', 'refuser les cookies',
      'refuser', 'refuse', 'non merci', 'non, merci', 'pas maintenant',
      'continuer sans accepter', 'sans accepter', 'rejeter',
      'reject all', 'reject', 'decline all', 'decline', 'deny all', 'deny',
      'disagree', 'no thanks', 'not now', 'refuse all',
      'continue without', 'without accepting', 'opt out', 'opt-out',
      'alle ablehnen', 'ablehnen', 'nein danke', 'nicht akzeptieren',
      'rechazar todo', 'rechazar', 'no acepto', 'no gracias',
      'rifiuta tutto', 'rifiuta', 'rifiuto', 'non accetto',
      'recusar tudo', 'recusar', 'rejeitar', 'não aceito',
      'weigeren', 'afwijzen', 'nee bedankt', 'alles weigeren',
      'no', 'non', 'nein', 'nie', 'não', 'nej', 'ei'
    ],
    essential: [
      'essentiel', 'nécessaire', 'uniquement essentiels', 'cookies essentiels',
      'accepter les essentiels', 'uniquement les cookies nécessaires',
      'essential', 'necessary', 'required', 'functional only',
      'only essential', 'only necessary', 'accept essential', 'strictly necessary',
      'notwendig', 'nur notwendige', 'erforderlich',
      'necesario', 'esencial', 'solo esenciales',
      'necessario', 'essenziale', 'solo necessari',
      'necessário', 'essencial', 'apenas essenciais'
    ],
    accept: [
      'tout accepter', 'accepter tout', 'accepter tous', 'accepter les cookies',
      'accepter', 'j\'accepte', "j'accepte", 'accepte', 'ok', 'd\'accord',
      "d'accord", 'compris', 'continuer', 'valider', 'confirmer',
      'accept all', 'accept', 'agree', 'allow all', 'allow', 'i agree',
      'got it', 'understand', 'continue', 'ok', 'okay', 'yes', 'confirm',
      'accept cookies', 'i accept', 'agree all',
      'alle akzeptieren', 'akzeptieren', 'zustimmen', 'einverstanden',
      'aceptar', 'acepto', 'de acuerdo', 'aceptar todo',
      'accetta', 'accetto', 'va bene', 'accetta tutto',
      'aceitar', 'aceito', 'concordo', 'aceitar tudo',
      'accepteren', 'akkoord', 'alles accepteren'
    ],
    close: ['fermer', 'close', 'dismiss', 'schließen', 'chiudi', 'cerrar', 'sluiten', 'fechar', '×', 'x', '✕', '✖']
  };

  const COOKIE_KEYWORDS = [
    'cookie', 'cookies', 'gdpr', 'rgpd', 'consent', 'consentement',
    'privacy', 'confidentialité', 'vie privée', 'données personnelles',
    'personal data', 'tracking', 'traceurs', 'trackers',
    'nous utilisons', 'we use', 'wir verwenden', 'utilizamos',
    'accepter', 'accept', 'akzeptieren', 'aceptar',
    'politique de confidentialité', 'privacy policy',
    'en poursuivant', 'by continuing', 'en continuant',
    'voici comment', 'how we use', 'comment nous utilisons',
    'stockés sur votre appareil', 'stored on your device',
    'cookies supplémentaires', 'additional cookies',
    'tout accepter', 'tout refuser', 'accept all', 'reject all',
    'gérer les cookies', 'manage cookies', 'cookie settings',
    'paramètres des cookies', 'préférences', 'preferences',
    'partenaires', 'partners', 'réseaux sociaux', 'social networks',
    'publicités personnalisées', 'personalized ads',
    'analyser', 'analyze', 'améliorer', 'improve'
  ];

  // ==========================================
  // COSMETIC BLOCKING
  // ==========================================

  /**
   * Apply cosmetic blocking to hide ad elements
   * Skipped on whitelisted sites to prevent breaking functionality
   */
  function applyCosmeticBlocking() {
    // Skip on whitelisted sites
    if (isWhitelistedSite()) {
      console.log('Cookie Eater: Cosmetic blocking skipped (whitelisted site)');
      return;
    }
    
    // On YouTube/Twitch, only hide specific ad elements, not all
    if (needsSpecialBypass()) {
      applyLimitedCosmeticBlocking();
      return;
    }
    
    // Combine all selectors
    const allSelectors = [...AD_SELECTORS, ...SOCIAL_WIDGET_SELECTORS];
    
    allSelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(element => {
          if (!element.dataset.cookieEaterHidden) {
            // Additional check: don't hide if element is essential (has interactive children)
            if (isEssentialElement(element)) return;
            
            element.style.setProperty('display', 'none', 'important');
            element.style.setProperty('visibility', 'hidden', 'important');
            element.style.setProperty('opacity', '0', 'important');
            element.style.setProperty('height', '0', 'important');
            element.style.setProperty('overflow', 'hidden', 'important');
            element.dataset.cookieEaterHidden = 'true';
          }
        });
      } catch (e) {
        // Invalid selector, skip
      }
    });
  }

  /**
   * Check if element is essential and shouldn't be hidden
   */
  function isEssentialElement(element) {
    // Don't hide if it contains navigation, forms, or main content
    const hasNav = element.querySelector('nav, [role="navigation"]');
    const hasForm = element.querySelector('form:not([class*="subscribe"]):not([class*="newsletter"])');
    const hasMainContent = element.querySelector('main, article, [role="main"]');
    const isLargeElement = element.offsetWidth > window.innerWidth * 0.5 && 
                          element.offsetHeight > window.innerHeight * 0.5;
    
    // Check if element has important interactive elements
    const hasImportantInputs = element.querySelectorAll('input[type="text"], input[type="email"], textarea, select').length > 2;
    
    return hasNav || hasForm || hasMainContent || isLargeElement || hasImportantInputs;
  }

  /**
   * Limited cosmetic blocking for video sites
   * Only hides obvious ad containers, not anything that might break the player
   */
  function applyLimitedCosmeticBlocking() {
    const safeAdSelectors = [
      // Only very specific ad selectors
      '#masthead-ad',
      '.video-ads',
      '.ytp-ad-overlay-container',
      '.ytp-ad-text-overlay',
      'ytd-banner-promo-renderer',
      'ytd-in-feed-ad-layout-renderer',
      '.ytd-ad-slot-renderer',
      '.ytd-mealbar-promo-renderer',
      '#player-ads',
      // Twitch ads
      '[data-a-target="video-ad-label"]',
      '.player-ad-overlay',
      // Dailymotion
      '.dm-ad-overlay'
    ];
    
    safeAdSelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(element => {
          if (!element.dataset.cookieEaterHidden) {
            element.style.setProperty('display', 'none', 'important');
            element.dataset.cookieEaterHidden = 'true';
          }
        });
      } catch (e) {}
    });
  }

  /**
   * Inject CSS rules for cosmetic blocking
   * Skipped on whitelisted and special bypass sites
   */
  function injectCosmeticCSS() {
    // Skip on whitelisted sites
    if (isWhitelistedSite()) {
      return;
    }
    
    // On special sites, inject only limited CSS
    if (needsSpecialBypass()) {
      injectLimitedCosmeticCSS();
      return;
    }
    
    const existingStyle = document.getElementById('cookie-eater-cosmetic-css');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'cookie-eater-cosmetic-css';
    
    const rules = [...AD_SELECTORS, ...SOCIAL_WIDGET_SELECTORS].map(selector => 
      `${selector} { display: none !important; visibility: hidden !important; }`
    ).join('\n');
    
    style.textContent = rules;
    
    // Insert at the start to load early
    if (document.head) {
      document.head.insertBefore(style, document.head.firstChild);
    } else if (document.documentElement) {
      document.documentElement.appendChild(style);
    }
  }

  /**
   * Limited CSS for video sites
   */
  function injectLimitedCosmeticCSS() {
    const existingStyle = document.getElementById('cookie-eater-cosmetic-css');
    if (existingStyle) return;
    
    const style = document.createElement('style');
    style.id = 'cookie-eater-cosmetic-css';
    
    // Only target specific ad elements that won't break the site
    style.textContent = `
      /* YouTube specific */
      #masthead-ad,
      .video-ads,
      .ytp-ad-overlay-container,
      .ytp-ad-text-overlay,
      ytd-banner-promo-renderer,
      ytd-in-feed-ad-layout-renderer,
      .ytd-ad-slot-renderer,
      #player-ads,
      ytd-promoted-sparkles-web-renderer,
      ytd-promoted-video-renderer,
      .ytd-mealbar-promo-renderer,
      ytd-statement-banner-renderer,
      .ytp-ad-skip-button-container { display: none !important; }
      
      /* Hide YouTube ad-blocker warnings */
      tp-yt-paper-dialog.ytd-popup-container:has(yt-formatted-string[contains="ad blocker"]),
      ytd-enforcement-message-view-model { display: none !important; }
      
      /* Twitch specific */
      [data-a-target="video-ad-label"],
      .player-ad-overlay { display: none !important; }
      
      /* Dailymotion specific */
      .dm-ad-overlay { display: none !important; }
    `;
    
    if (document.head) {
      document.head.insertBefore(style, document.head.firstChild);
    } else if (document.documentElement) {
      document.documentElement.appendChild(style);
    }
  }

  // ==========================================
  // CONFIGURATION LOADING
  // ==========================================

  async function loadConfig() {
    try {
      const result = await chrome.storage.sync.get('cookieEaterConfig');
      if (result.cookieEaterConfig) {
        config = { ...DEFAULT_CONFIG, ...result.cookieEaterConfig };
      }
    } catch (e) {
      console.log('Cookie Eater: Using default config');
    }
  }

  async function loadLanguage() {
    try {
      const result = await chrome.storage.sync.get('cookieEaterLang');
      if (result.cookieEaterLang) {
        currentLang = result.cookieEaterLang;
      }
    } catch (e) {}
  }

  // ==========================================
  // COOKIE BANNER DETECTION
  // ==========================================

  function detectBannerByContent(element) {
    if (!element || !element.textContent) return false;
    
    const text = element.textContent.toLowerCase();
    const matchCount = COOKIE_KEYWORDS.filter(keyword => 
      text.includes(keyword.toLowerCase())
    ).length;
    
    return matchCount >= 2;
  }

  function findFixedElements() {
    const candidates = [];
    const allElements = document.querySelectorAll('div, section, aside, footer, header, [role="dialog"], [role="alertdialog"], [role="banner"]');
    
    for (const element of allElements) {
      if (processedBanners.has(element)) continue;
      
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      
      const isFixed = style.position === 'fixed' || style.position === 'sticky';
      const isAbsolute = style.position === 'absolute';
      const hasHighZIndex = parseInt(style.zIndex) > 1000;
      const isVisible = style.display !== 'none' && 
                       style.visibility !== 'hidden' && 
                       rect.width > 100 && 
                       rect.height > 50;
      
      if (isVisible && (isFixed || (isAbsolute && hasHighZIndex))) {
        if (detectBannerByContent(element)) {
          candidates.push(element);
        }
      }
    }
    
    return candidates;
  }

  function findCookieBanner() {
    // First try specific CMP selectors (not generic ones)
    for (const [category, selectors] of Object.entries(COOKIE_BANNER_SELECTORS)) {
      if (category === 'generic') continue; // Process generic last
      
      for (const selector of selectors) {
        try {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            if (isVisibleElement(element) && !processedBanners.has(element)) {
              // For specific CMP selectors, trust them
              return { element, category };
            }
          }
        } catch (e) {}
      }
    }
    
    // Then try generic selectors, but verify content
    if (COOKIE_BANNER_SELECTORS.generic) {
      for (const selector of COOKIE_BANNER_SELECTORS.generic) {
        try {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            if (isVisibleElement(element) && !processedBanners.has(element)) {
              // For generic selectors (like role="dialog"), verify it's about cookies
              if (detectBannerByContent(element)) {
                return { element, category: 'generic' };
              }
            }
          }
        } catch (e) {}
      }
    }
    
    // Finally try heuristic detection
    const candidates = findFixedElements();
    for (const element of candidates) {
      if (isVisibleElement(element) && !processedBanners.has(element)) {
        return { element, category: 'heuristic' };
      }
    }
    
    return null;
  }

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

  // ==========================================
  // BUTTON FINDING
  // ==========================================

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

  function findButtonBySelector(container, selectors) {
    for (const selector of selectors) {
      try {
        const button = container.querySelector(selector);
        if (button && isVisibleElement(button)) {
          return button;
        }
        const globalButton = document.querySelector(selector);
        if (globalButton && isVisibleElement(globalButton)) {
          return globalButton;
        }
      } catch (e) {}
    }
    return null;
  }

  function findAnyButton(container) {
    const buttons = container.querySelectorAll(
      'button, a[role="button"], [class*="btn"], [class*="button"], ' +
      'input[type="button"], input[type="submit"]'
    );
    
    for (const button of buttons) {
      if (isVisibleElement(button)) {
        const text = (button.textContent || '').toLowerCase();
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

  function findBestButton(banner, mode) {
    const container = banner.element;
    
    if (mode === 'reject_all') {
      let button = findButtonBySelector(container, BUTTON_SELECTORS.reject);
      if (button) return { button, action: 'reject' };
      
      button = findButtonByText(container, BUTTON_TEXTS.reject);
      if (button) return { button, action: 'reject' };
      
      button = findButtonBySelector(container, BUTTON_SELECTORS.essential);
      if (button) return { button, action: 'essential' };
      
      button = findButtonByText(container, BUTTON_TEXTS.essential);
      if (button) return { button, action: 'essential' };
    }
    
    if (mode === 'accept_essential') {
      let button = findButtonBySelector(container, BUTTON_SELECTORS.essential);
      if (button) return { button, action: 'essential' };
      
      button = findButtonByText(container, BUTTON_TEXTS.essential);
      if (button) return { button, action: 'essential' };
    }
    
    if (mode === 'accept_anonymized' || mode === 'reject_all' || mode === 'accept_essential') {
      let button = findButtonBySelector(container, BUTTON_SELECTORS.accept);
      if (button) return { button, action: 'accept_anonymized' };
      
      button = findButtonByText(container, BUTTON_TEXTS.accept);
      if (button) return { button, action: 'accept_anonymized' };
      
      button = findAnyButton(container);
      if (button) return { button, action: 'accept_anonymized' };
    }
    
    let button = findButtonBySelector(container, BUTTON_SELECTORS.close);
    if (button) return { button, action: 'close' };
    
    button = findButtonByText(container, BUTTON_TEXTS.close);
    if (button) return { button, action: 'close' };
    
    return null;
  }

  // ==========================================
  // COOKIE CLEANING
  // ==========================================

  function cleanTrackingCookies() {
    if (!config.cleanTrackingCookies) return;
    
    const cookies = document.cookie.split(';');
    let cleaned = 0;
    
    for (const cookie of cookies) {
      const [name] = cookie.split('=').map(s => s.trim());
      
      for (const pattern of TRACKING_COOKIE_PATTERNS) {
        if (pattern.test(name)) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
          cleaned++;
          break;
        }
      }
    }
    
    if (cleaned > 0) {
      console.log(`Cookie Eater: ${cleaned} tracking cookies cleaned`);
    }
  }

  function anonymizeCookies() {
    if (!config.anonymizeData) return;
    
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
          document.cookie = `${name}=${rule.value}; path=/`;
          break;
        }
      }
    }
  }

  // ==========================================
  // MARKETING POPUP BLOCKING
  // ==========================================

  let processedPopups = new Set();

  /**
   * Check if element is a marketing popup
   */
  function isMarketingPopup(element) {
    if (!element || !element.textContent) return false;
    
    const text = element.textContent.toLowerCase();
    const hasEmailField = element.querySelector('input[type="email"], input[name*="email"], input[placeholder*="email"], input[placeholder*="Email"]');
    const hasNameField = element.querySelector('input[name*="name"], input[name*="prenom"], input[placeholder*="prénom"], input[placeholder*="Prénom"], input[placeholder*="name"]');
    
    // Count keyword matches
    const matchCount = MARKETING_KEYWORDS.filter(keyword => 
      text.includes(keyword.toLowerCase())
    ).length;
    
    // Is marketing if has email field + keywords OR has multiple marketing keywords
    return (hasEmailField && matchCount >= 1) || (hasNameField && matchCount >= 2) || matchCount >= 3;
  }

  /**
   * Find marketing popups
   */
  function findMarketingPopups() {
    const popups = [];
    
    // Check specific selectors first
    for (const selector of MARKETING_POPUP_SELECTORS) {
      try {
        document.querySelectorAll(selector).forEach(element => {
          if (isVisibleElement(element) && !processedPopups.has(element)) {
            popups.push(element);
          }
        });
      } catch (e) {}
    }
    
    // Also check for generic fixed/modal elements with marketing content
    const potentialPopups = document.querySelectorAll(
      '[role="dialog"], [role="alertdialog"], .modal, .popup, [class*="modal"], [class*="popup"], [class*="overlay"]'
    );
    
    for (const element of potentialPopups) {
      if (processedPopups.has(element)) continue;
      if (!isVisibleElement(element)) continue;
      
      const style = window.getComputedStyle(element);
      const isFixed = style.position === 'fixed' || style.position === 'absolute';
      const hasHighZIndex = parseInt(style.zIndex) > 100;
      
      if ((isFixed || hasHighZIndex) && isMarketingPopup(element)) {
        if (!popups.includes(element)) {
          popups.push(element);
        }
      }
    }
    
    return popups;
  }

  /**
   * Find close button in popup
   */
  function findPopupCloseButton(popup) {
    // First try specific close selectors
    for (const selector of POPUP_CLOSE_SELECTORS) {
      try {
        const buttons = popup.querySelectorAll(selector);
        for (const btn of buttons) {
          if (isVisibleElement(btn)) {
            // Make sure it's actually a close button, not a submit
            const text = (btn.textContent || btn.getAttribute('aria-label') || '').toLowerCase();
            const isCloseButton = 
              text.includes('close') || 
              text.includes('fermer') || 
              text.includes('×') || 
              text.includes('x') ||
              text === '' || // Icons without text
              btn.querySelector('svg') || // SVG icons
              btn.classList.toString().includes('close');
            
            if (isCloseButton) {
              return btn;
            }
          }
        }
      } catch (e) {}
    }
    
    // Look for X symbol or close icon
    const allElements = popup.querySelectorAll('*');
    for (const el of allElements) {
      if (!isVisibleElement(el)) continue;
      
      const text = el.textContent?.trim();
      const ariaLabel = el.getAttribute('aria-label') || '';
      
      // Check for X symbol
      if (text === '×' || text === 'X' || text === 'x' || text === '✕' || text === '✖' || text === '✗') {
        return el;
      }
      
      // Check aria-label
      if (ariaLabel.toLowerCase().includes('close') || ariaLabel.toLowerCase().includes('fermer')) {
        return el;
      }
    }
    
    // Check parent for backdrop/overlay click
    const parent = popup.parentElement;
    if (parent) {
      const parentStyle = window.getComputedStyle(parent);
      if (parent.classList.toString().includes('overlay') || 
          parent.classList.toString().includes('backdrop') ||
          parentStyle.position === 'fixed') {
        // Return null to trigger direct hide instead
      }
    }
    
    return null;
  }

  /**
   * Close a marketing popup
   */
  async function closeMarketingPopup(popup) {
    if (processedPopups.has(popup)) return false;
    processedPopups.add(popup);
    
    console.log('Cookie Eater: Marketing popup detected, closing...');
    
    const closeBtn = findPopupCloseButton(popup);
    
    if (closeBtn) {
      console.log('Cookie Eater: Close button found, clicking...');
      simulateClick(closeBtn);
      await sleep(200);
    }
    
    // Force hide the popup
    hideElement(popup);
    
    // Also hide common overlays/backdrops
    const overlays = document.querySelectorAll(
      '[class*="overlay"], [class*="backdrop"], [class*="modal-bg"], ' +
      '[class*="popup-bg"], [class*="mask"], .modal-backdrop'
    );
    overlays.forEach(overlay => {
      const style = window.getComputedStyle(overlay);
      if (style.position === 'fixed' && parseInt(style.zIndex) > 0) {
        hideElement(overlay);
      }
    });
    
    // Restore scroll
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('position');
    document.body.style.removeProperty('top');
    document.body.style.removeProperty('width');
    document.documentElement.style.removeProperty('overflow');
    document.body.classList.remove('modal-open', 'no-scroll', 'overflow-hidden', 'popup-open', 'noscroll');
    document.documentElement.classList.remove('modal-open', 'no-scroll', 'overflow-hidden', 'popup-open', 'noscroll');
    
    // Show notification
    showPageNotification(getNotificationText('popup_closed'), 'close');
    
    return true;
  }

  /**
   * Hide element with !important
   */
  function hideElement(element) {
    if (!element) return;
    element.style.setProperty('display', 'none', 'important');
    element.style.setProperty('visibility', 'hidden', 'important');
    element.style.setProperty('opacity', '0', 'important');
    element.style.setProperty('pointer-events', 'none', 'important');
    element.style.setProperty('z-index', '-9999', 'important');
  }

  /**
   * Scan and close marketing popups
   */
  async function scanAndCloseMarketingPopups() {
    if (!config.enabled) return;
    
    const popups = findMarketingPopups();
    
    for (const popup of popups) {
      await closeMarketingPopup(popup);
    }
  }

  // ==========================================
  // BANNER PROCESSING
  // ==========================================

  function hideBanner(banner) {
    if (!config.autoHide) return;
    
    try {
      banner.element.style.setProperty('display', 'none', 'important');
      banner.element.style.setProperty('visibility', 'hidden', 'important');
      banner.element.style.setProperty('opacity', '0', 'important');
      banner.element.style.setProperty('pointer-events', 'none', 'important');
      
      const overlays = document.querySelectorAll(
        '.cookie-overlay, .consent-overlay, [class*="overlay"][class*="cookie"], ' +
        '[class*="overlay"][class*="consent"], [class*="overlay"][class*="gdpr"], ' +
        '.onetrust-pc-dark-filter, .CybotCookiebotDialogBodyUnderlay, ' +
        '[class*="backdrop"], [class*="modal-overlay"], [class*="modal-backdrop"]'
      );
      
      overlays.forEach(overlay => {
        overlay.style.setProperty('display', 'none', 'important');
      });
      
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('position');
      document.documentElement.style.removeProperty('overflow');
      document.documentElement.classList.remove('modal-open', 'no-scroll', 'overflow-hidden');
      document.body.classList.remove('modal-open', 'no-scroll', 'overflow-hidden');
      
    } catch (e) {
      console.log('Cookie Eater: Could not hide banner', e);
    }
  }

  function simulateClick(element) {
    try {
      element.scrollIntoView({ behavior: 'instant', block: 'center' });
      
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
      
      if (typeof element.click === 'function') {
        element.click();
      }
      
      return true;
    } catch (e) {
      console.log('Cookie Eater: Click error', e);
      return false;
    }
  }

  function showPageNotification(message, action) {
    if (!config.showNotification) return;
    
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
    
    setTimeout(() => {
      notification.classList.add('hiding');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  async function processBanner(banner) {
    if (processedBanners.has(banner.element)) return false;
    
    processedBanners.add(banner.element);
    
    console.log(`Cookie Eater: Banner detected (${banner.category})`);
    
    const result = findBestButton(banner, config.mode);
    
    if (result) {
      console.log(`Cookie Eater: Action "${result.action}" on button:`, result.button.textContent?.trim());
      
      await sleep(config.delay);
      
      const clicked = simulateClick(result.button);
      
      if (clicked) {
        await sleep(300);
        hideBanner(banner);
        
        if (result.action === 'accept_anonymized' || result.action === 'accept') {
          await sleep(500);
          cleanTrackingCookies();
          anonymizeCookies();
        }
        
        showPageNotification(getNotificationText(result.action), result.action);
        
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

  function notifyBackground(message) {
    try {
      chrome.runtime.sendMessage(message);
    } catch (e) {}
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==========================================
  // ANTI-ADBLOCK BYPASS (CSP-compatible, DOM only)
  // ==========================================

  const processedAntiAdblockElements = new Set();

  /**
   * Inject fake ad elements to fool detection scripts
   */
  function injectFakeAdElements() {
    try {
      // Create common bait element classes that adblock detectors look for
      const baitClasses = [
        'adsbox', 'ad-banner', 'ad-placeholder', 'adsbygoogle',
        'ad_unit', 'ad-unit', 'ad_wrapper', 'sponsored-ad',
        'banner_ad', 'advertisement', 'ad-container'
      ];
      
      for (const className of baitClasses) {
        const bait = document.createElement('div');
        bait.className = className;
        bait.id = className;
        bait.style.cssText = 'position: absolute !important; height: 1px !important; width: 1px !important; top: -9999px !important; left: -9999px !important; pointer-events: none !important;';
        bait.innerHTML = '&nbsp;';
        
        if (document.body) {
          document.body.appendChild(bait);
        }
      }
      
      console.log('[Cookie Eater] Fake ad elements injected');
    } catch (e) {
      console.log('[Cookie Eater] Could not inject fake ad elements:', e);
    }
  }

  /**
   * Find anti-adblock popup/wall elements
   */
  function findAntiAdblockElements() {
    const elements = [];
    
    // Check specific selectors first
    for (const selector of ANTI_ADBLOCK_SELECTORS) {
      try {
        document.querySelectorAll(selector).forEach(element => {
          if (isVisibleElement(element) && !processedAntiAdblockElements.has(element)) {
            elements.push(element);
          }
        });
      } catch (e) {}
    }
    
    // Check for overlays/modals with anti-adblock content
    const potentialElements = document.querySelectorAll(
      '[role="dialog"], [role="alertdialog"], .modal, .popup, .overlay, ' +
      '[class*="modal"], [class*="popup"], [class*="overlay"], [class*="wall"], ' +
      '[class*="blocker"], [class*="notice"], [class*="message"]'
    );
    
    for (const element of potentialElements) {
      if (processedAntiAdblockElements.has(element)) continue;
      if (!isVisibleElement(element)) continue;
      
      const style = window.getComputedStyle(element);
      const isFixed = style.position === 'fixed' || style.position === 'absolute';
      const hasHighZIndex = parseInt(style.zIndex) > 100;
      
      if ((isFixed || hasHighZIndex) && isAntiAdblockElement(element)) {
        if (!elements.includes(element)) {
          elements.push(element);
        }
      }
    }
    
    return elements;
  }

  /**
   * Check if element contains anti-adblock content
   */
  function isAntiAdblockElement(element) {
    const text = (element.textContent || '').toLowerCase();
    const className = (element.className || '').toString().toLowerCase();
    const id = (element.id || '').toLowerCase();
    
    // Check for anti-adblock related class or id
    const hasAntiAdblockSelector = 
      /adblock|adblocker|ad-block|blocker|detector|anti-?ad/i.test(className) ||
      /adblock|adblocker|ad-block|blocker|detector|anti-?ad/i.test(id);
    
    if (hasAntiAdblockSelector) return true;
    
    // Count keyword matches in text
    let keywordMatches = 0;
    for (const keyword of ANTI_ADBLOCK_KEYWORDS) {
      if (text.includes(keyword.toLowerCase())) {
        keywordMatches++;
      }
    }
    
    // Need at least 2 keyword matches to be considered anti-adblock
    if (keywordMatches >= 2) return true;
    
    // Check for specific patterns in the popup
    const hasDisableInstructions = 
      /disable|désactiver|deactivate|turn off|pause|whitelist|liste blanche/i.test(text) &&
      /adblock|blocker|bloqueur|extension/i.test(text);
    
    const hasRefreshInstructions =
      /refresh|reload|actualiser|recharger|rafraîchir/i.test(text) &&
      /page|site/i.test(text);
    
    const mentionsAdblockExtensions =
      /adblock plus|ublock origin|adguard|ghostery/i.test(text);
    
    const hasExtensionIcons = 
      element.querySelector('img[src*="adblock"], img[src*="ublock"], img[alt*="adblock"], img[alt*="ublock"]');
    
    return hasDisableInstructions || (hasRefreshInstructions && mentionsAdblockExtensions) || mentionsAdblockExtensions || !!hasExtensionIcons;
  }

  /**
   * Close/hide anti-adblock element
   */
  function closeAntiAdblockElement(element) {
    processedAntiAdblockElements.add(element);
    
    // Try to find close button first
    const closeButton = findPopupCloseButton(element);
    if (closeButton) {
      simulateClick(closeButton);
      console.log('[Cookie Eater] Closed anti-adblock popup via button');
      return true;
    }
    
    // Hide the element
    hideElement(element);
    console.log('[Cookie Eater] Hid anti-adblock element');
    
    // Also try to restore page scrolling and remove overlay effects
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.classList.remove('modal-open', 'no-scroll', 'noscroll', 'overflow-hidden');
    
    // Look for and hide backdrop/overlay siblings
    const parent = element.parentElement;
    if (parent) {
      const siblings = parent.children;
      for (const sibling of siblings) {
        if (sibling === element) continue;
        const siblingStyle = window.getComputedStyle(sibling);
        const className = (sibling.className || '').toString().toLowerCase();
        
        if ((className.includes('overlay') || className.includes('backdrop') || className.includes('mask')) ||
            (siblingStyle.position === 'fixed' && siblingStyle.zIndex > 100)) {
          hideElement(sibling);
        }
      }
    }
    
    return true;
  }

  /**
   * Scan and bypass anti-adblock elements
   */
  async function scanAndBypassAntiAdblock() {
    if (!config.enabled) return;
    
    const elements = findAntiAdblockElements();
    
    for (const element of elements) {
      const closed = closeAntiAdblockElement(element);
      if (closed) {
        showPageNotification(getNotificationText('adblock_bypassed'), 'reject');
        
        notifyBackground({
          type: 'antiAdblockBypassed',
          domain: window.location.hostname
        });
      }
      
      // Small delay between processing multiple elements
      await sleep(100);
    }
  }

  // ==========================================
  // MAIN SCAN
  // ==========================================

  async function scanAndProcess() {
    if (!config.enabled) return;
    
    const banner = findCookieBanner();
    if (banner) {
      await processBanner(banner);
    }
  }

  function setupObserver() {
    if (observer) {
      observer.disconnect();
    }
    
    observer = new MutationObserver(async (mutations) => {
      clearTimeout(observer.timeout);
      observer.timeout = setTimeout(async () => {
        await scanAndProcess();
        await scanAndCloseMarketingPopups();
        await scanAndBypassAntiAdblock();
        applyCosmeticBlocking();
      }, 200);
    });
    
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden']
    });
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================

  async function init() {
    await loadConfig();
    await loadLanguage();
    
    if (!config.enabled) {
      console.log('Cookie Eater: Extension disabled');
      return;
    }
    
    console.log('Cookie Eater & AdBlocker: Initializing v3.0...');
    
    // CRITICAL: On video streaming sites, ONLY handle cookies - nothing else!
    if (isVideoStreamingSite()) {
      console.log('Cookie Eater: Video streaming site detected - MINIMAL MODE (cookies only)');
      
      // Only handle cookie banners on these sites, no ad blocking at all
      await sleep(config.delay);
      await scanAndProcess(); // Only cookie banners
      
      // Minimal periodic scan for cookie banners only
      setInterval(() => {
        scanAndProcess();
      }, 3000);
      
      // Apply minimal bypass for warnings only (no interference with player)
      if (isYouTube()) {
        applyYouTubeMinimalBypass();
      }
      
      return; // EXIT EARLY - don't do any ad blocking on video sites
    }
    
    // Log site status
    if (isWhitelistedSite()) {
      console.log('Cookie Eater: Whitelisted site - cosmetic blocking disabled');
    }
    
    // On non-video sites, apply full ad blocking
    if (!isWhitelistedSite()) {
      // Create fake ad elements (CSP-compatible approach - no script injection)
      injectFakeAdElements();
      createFakeAdElementsForBypass();
      
      // Inject cosmetic CSS early
      injectCosmeticCSS();
    }
    
    // First scan - delayed for page load
    await sleep(config.delay);
    await scanAndProcess();
    applyCosmeticBlocking();
    
    // Scan for marketing popups and anti-adblock after a bit (they often appear with delay)
    setTimeout(scanAndCloseMarketingPopups, 1500);
    setTimeout(scanAndBypassAntiAdblock, 1500);
    setTimeout(scanAndCloseMarketingPopups, 3000);
    setTimeout(scanAndBypassAntiAdblock, 3000);
    setTimeout(scanAndCloseMarketingPopups, 5000);
    setTimeout(scanAndBypassAntiAdblock, 5000);
    
    // Setup observer
    if (document.body) {
      setupObserver();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        setupObserver();
      });
    }
    
    // Periodic scans
    setInterval(() => {
      scanAndProcess();
      scanAndCloseMarketingPopups();
      scanAndBypassAntiAdblock();
      applyCosmeticBlocking();
    }, 2000);
    
    // Periodic cookie cleaning
    if (config.cleanTrackingCookies) {
      setInterval(cleanTrackingCookies, 30000);
    }
  }

  // ==========================================
  // MESSAGE LISTENER
  // ==========================================

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'configUpdate') {
      config = { ...DEFAULT_CONFIG, ...message.config };
      console.log('Cookie Eater: Config updated', config);
    }
    
    if (message.type === 'langUpdate') {
      currentLang = message.lang;
      console.log('Cookie Eater: Language updated to', currentLang);
    }
    
    if (message.type === 'manualScan') {
      processedBanners.clear();
      processedPopups.clear();
      scanAndProcess();
      scanAndCloseMarketingPopups();
      sendResponse({ success: true });
    }
    
    if (message.type === 'cleanCookies') {
      cleanTrackingCookies();
      anonymizeCookies();
      sendResponse({ success: true });
    }
    
    if (message.type === 'closePopups') {
      processedPopups.clear();
      scanAndCloseMarketingPopups();
      sendResponse({ success: true });
    }
    
    return true;
  });

  // ==========================================
  // START
  // ==========================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

