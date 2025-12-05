# 🍪 Cookie Eater

**Browser extension to automatically manage cookie banners and protect your privacy.**

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Manifest](https://img.shields.io/badge/manifest-v3-orange.svg)
![Author](https://img.shields.io/badge/by-Fusion%20AI-purple.svg)

> 🌐 **Multilingual** - Available in English (default) and French

---

## ✨ Fonctionnalités

- 🛡️ **Détection automatique** des bannières de cookies sur tous les sites web
- 🚫 **Refus intelligent** des cookies non essentiels
- 🔒 **Protection de la vie privée** en utilisant des valeurs anonymisées
- ⚡ **Fonctionnement sans intervention** - tout est automatique
- 📊 **Statistiques** de suivi des bannières traitées
- 🎨 **Interface moderne** et intuitive
- 🌍 **Support multilingue** (FR, EN, DE, ES, IT, NL, PT)

---

## 🚀 Installation

### Méthode 1 : Installation depuis les sources (développeur)

1. **Téléchargez** ou clonez ce dépôt :
   ```bash
   git clone https://github.com/votre-repo/cookie-eater.git
   cd cookie-eater
   ```

2. **Générez les icônes PNG** :
   - Ouvrez le fichier `icons/generate-icons.html` dans votre navigateur
   - Téléchargez chaque icône (16, 32, 48, 128)
   - Placez-les dans le dossier `icons/`

3. **Chargez l'extension dans Chrome** :
   - Ouvrez Chrome et allez à `chrome://extensions/`
   - Activez le **Mode développeur** (coin supérieur droit)
   - Cliquez sur **Charger l'extension non empaquetée**
   - Sélectionnez le dossier du projet

4. **Chargez l'extension dans Firefox** :
   - Ouvrez Firefox et allez à `about:debugging#/runtime/this-firefox`
   - Cliquez sur **Charger un module complémentaire temporaire**
   - Sélectionnez le fichier `manifest.json`

### Méthode 2 : Installation depuis le store (bientôt)

L'extension sera bientôt disponible sur le Chrome Web Store et Firefox Add-ons.

---

## 📖 Utilisation

### Configuration

Cliquez sur l'icône 🍪 dans la barre d'outils pour ouvrir le panneau de configuration :

| Option | Description |
|--------|-------------|
| **Protection active** | Active/désactive l'extension |
| **Mode de gestion** | Choisissez entre "Refuser tout" ou "Essentiels uniquement" |
| **Masquer les bannières** | Cache automatiquement les bannières après traitement |
| **Notifications** | Affiche une notification discrète lors du traitement |

### Modes de gestion

1. **🛡️ Refuser tout** (recommandé)
   - Refuse automatiquement tous les cookies non essentiels
   - Maximum de confidentialité
   - Clique sur les boutons "Refuser", "Decline", "Ablehnen", etc.

2. **🔒 Essentiels uniquement**
   - Accepte uniquement les cookies fonctionnels
   - Équilibre entre fonctionnalité et confidentialité

---

## 🔧 Plateformes supportées

L'extension détecte automatiquement les bannières des plateformes suivantes :

| Plateforme | Support |
|------------|---------|
| OneTrust | ✅ Complet |
| Cookiebot | ✅ Complet |
| TrustArc | ✅ Complet |
| Quantcast | ✅ Complet |
| Didomi | ✅ Complet |
| Klaro | ✅ Complet |
| Iubenda | ✅ Complet |
| CookieFirst | ✅ Complet |
| Sourcepoint | ✅ Complet |
| Osano | ✅ Complet |
| Complianz | ✅ Complet |
| Usercentrics | ✅ Complet |
| Termly | ✅ Complet |
| ConsentManager | ✅ Complet |
| Bannières génériques | ✅ Complet |

---

## 📁 Structure du projet

```
cookie-eater/
├── manifest.json          # Configuration de l'extension (Manifest V3)
├── README.md              # Documentation
├── background/
│   └── background.js      # Service worker (gestion des stats)
├── content/
│   ├── content.js         # Script injecté (détection & action)
│   └── content.css        # Styles pour les notifications
├── popup/
│   ├── popup.html         # Interface utilisateur
│   ├── popup.css          # Styles du popup
│   └── popup.js           # Logique du popup
└── icons/
    ├── icon16.png         # Icône 16x16
    ├── icon32.png         # Icône 32x32
    ├── icon48.png         # Icône 48x48
    ├── icon128.png        # Icône 128x128
    └── generate-icons.html # Générateur d'icônes
```

---

## 🔐 Confidentialité

Cookie Eater respecte votre vie privée :

- ❌ **Aucune donnée** n'est envoyée à des serveurs externes
- ❌ **Aucun tracking** de votre navigation
- ✅ **Toutes les données** restent locales sur votre appareil
- ✅ **Code source ouvert** et vérifiable

### Permissions requises

| Permission | Raison |
|------------|--------|
| `storage` | Sauvegarder vos préférences localement |
| `activeTab` | Interagir avec la page active |
| `scripting` | Injecter le script de détection |
| `<all_urls>` | Fonctionner sur tous les sites web |

---

## 🛠️ Développement

### Prérequis

- Navigateur Chrome 88+ ou Firefox 109+
- Aucune dépendance externe requise

### Tests

1. Chargez l'extension en mode développeur
2. Visitez des sites avec des bannières de cookies
3. Vérifiez que les bannières sont automatiquement traitées
4. Consultez les statistiques dans le popup

### Sites de test recommandés

- https://www.lemonde.fr/
- https://www.bbc.com/
- https://www.theguardian.com/
- https://stackoverflow.com/
- https://www.amazon.fr/

---

## 📝 Changelog

### v1.0.0 (2025-12-05)
- 🎉 Version initiale
- ✅ Support de 14+ plateformes de consentement
- ✅ Modes "Refuser tout" et "Essentiels uniquement"
- ✅ Interface moderne avec statistiques
- ✅ Support multilingue

---

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Forkez le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 💬 Support

- 🐛 [Signaler un bug](https://github.com/votre-repo/cookie-eater/issues)
- 💡 [Demander une fonctionnalité](https://github.com/votre-repo/cookie-eater/issues)
- 📧 Contact : support@cookie-eater.dev

---

<p align="center">
  Made with ❤️ by <strong>Fusion AI</strong> to protect your privacy
</p>

