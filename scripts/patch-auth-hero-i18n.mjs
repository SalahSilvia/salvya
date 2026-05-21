/**
 * Adds auth hero / forgot / update-password / login keys to all locales.
 * Run: node scripts/patch-auth-hero-i18n.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "messages");
const LOCALES = ["en", "fr", "ar", "es", "it", "nl"];

const enAuth = {
  loginHeroKicker: "Salvya customers",
  loginHeroTitle: "One sign-in for your bag, orders, and artist shops.",
  loginHeroBody:
    "One account for every device. Sign in to sync your bag, likes, follows, notifications, and orders placed while logged in. Checkout contact fields still use your browser session until saved addresses ship.",
  loginBullet1: "Bag, likes, alerts, and order history on your profile when cloud sync is enabled.",
  loginBullet2: "Secure access with email and password — recovery steps live in Help & terms.",
  loginBullet3: "Selling as a creator? Use this account, then open creator tools from the menu.",
  loginMobileIntro:
    "Sign in for the member shell, synced bag & likes, and artist shops. Checkout contact details stay in your browser session until saved addresses ship.",
  existingEmailBanner:
    "An account already exists for {email}. Sign in below — do not create another account with the same email.",
  helpCenter: "Help center",
  accountRecoveryLink: "Account recovery",
  menuLink: "Menu",
  creatorHubLink: "Creator hub",
  forgotHeroBody:
    "We send a secure, single-use link to your inbox. Open it on this device to choose a new password — the link expires after a short time for your safety.",
  forgotBullet1: "Check spam or promotions if nothing arrives within a few minutes.",
  forgotBullet2: "Use the newest email if you requested more than one reset.",
  forgotBullet3: "Still stuck? Visit Help or create an account if you are new to Salvya.",
  forgotMobileIntro: "Enter your account email. We will send a link to set a new password.",
  resetSentShort: "If an account exists for that email, a reset link is on its way.",
  resetPrivacyNote:
    "Use the same email you sign in with. We never tell outsiders whether an address is registered.",
  resetSentTo: "We sent instructions to {email}. Open the link to choose a new password.",
  resetStepOpenEmail: "Open the email from Salvya (check spam).",
  resetStepTapReset: "Tap Reset password in the message.",
  resetStepPickPassword: "Pick a new password on the Salvya page that opens.",
  sendAgain: "Did not get it? Send again",
  sendingAgain: "Sending again…",
  forgotEmailRequired: "Enter the email address you use to sign in to Salvya.",
  forgotEmailInvalid: "Enter a valid email address.",
  authConnectFailed: "Could not connect to authentication. Check your environment variables.",
  resetLinkBuildFailed: "Could not build a secure reset link. Reload this page and try again.",
  rememberedIt: "Remembered it?",
  pillNewPassword: "New password",
  updateHeroTitle: "Choose a strong new password.",
  updateHeroBody:
    "You arrived here from a secure reset link. After saving, sign in on any device with your new password. Your bag, likes, and orders stay on your account.",
  updateBullet1: "Use a password you do not reuse on other sites.",
  updateBullet2: "Mix letters, numbers, and a symbol for the best protection.",
  updateBullet3: "Sign out of shared devices after updating.",
  updateMobileIntro: "Set a new password for your Salvya account.",
  linkExpiredKicker: "Link expired",
  linkExpiredTitle: "Request a fresh reset link.",
  linkExpiredBody:
    "Reset links are single-use and expire. Open the newest email from Salvya, or send yourself a new link.",
  linkExpiredPageBody:
    "This page needs a valid reset link from your email. Older links stop working after you use them or when they expire.",
  sendNewResetLink: "Send a new reset link",
  passwordUpdatedBody: "Your password is saved. You can continue shopping or sign in again on another device.",
  signedInNewPassword: "You are signed in with your new password on this device.",
  continueBtn: "Continue",
  signInOtherDevice: "Sign in on another device",
  passwordStrongerRequired: "Use a stronger password — include upper and lower case letters and a number.",
  passwordReqSymbol: "One symbol (recommended)",
  confirmPasswordLabel: "Confirm password",
  accountEmailLabel: "Account email",
  countryPlaceholder: "Country / region",
  countryFR: "France",
  countryBE: "Belgium",
  countryNL: "Netherlands",
  countryDE: "Germany",
  countryES: "Spain",
  countryIT: "Italy",
  countryPT: "Portugal",
  countryGB: "United Kingdom",
  countryIE: "Ireland",
  countryCH: "Switzerland",
  countryMA: "Morocco",
  countryUS: "United States",
  countryOTHER: "Other",
  registerHeroTitle: "Create your Salvya customer account.",
  registerHeroBody:
    "One profile for checkout, your bag, and order history. Morocco and international shipping — save your country once.",
  registerBullet1: "Faster checkout with saved contact and addresses when signed in.",
  registerBullet2: "Track orders with your SVY number and email on any device.",
  registerBullet3: "Optional culture emails — limited drops and restocks only.",
};

const frAuth = {
  loginHeroKicker: "Clients Salvya",
  loginHeroTitle: "Une connexion pour votre panier, vos commandes et les boutiques artistes.",
  loginHeroBody:
    "Un compte sur tous vos appareils. Connectez-vous pour synchroniser panier, favoris, alertes et commandes. Les champs de livraison au paiement restent dans la session du navigateur tant que les adresses enregistrées ne sont pas actives.",
  loginBullet1: "Panier, favoris, alertes et historique sur votre profil lorsque la synchro cloud est active.",
  loginBullet2: "Accès sécurisé par e-mail et mot de passe — la récupération est dans Aide et conditions.",
  loginBullet3: "Créateur ? Utilisez ce compte, puis ouvrez les outils créateur depuis le menu.",
  loginMobileIntro:
    "Connectez-vous pour l’espace membre, le panier et les favoris synchronisés, et les boutiques artistes.",
  existingEmailBanner:
    "Un compte existe déjà pour {email}. Connectez-vous ci-dessous — ne créez pas un second compte avec le même e-mail.",
  helpCenter: "Centre d’aide",
  accountRecoveryLink: "Récupération de compte",
  menuLink: "Menu",
  creatorHubLink: "Espace créateur",
  forgotHeroBody:
    "Nous envoyons un lien sécurisé à usage unique dans votre boîte mail. Ouvrez-le sur cet appareil pour choisir un nouveau mot de passe — il expire rapidement pour votre sécurité.",
  forgotBullet1: "Vérifiez les spams ou promotions si rien n’arrive en quelques minutes.",
  forgotBullet2: "Utilisez le dernier e-mail si vous avez demandé plusieurs réinitialisations.",
  forgotBullet3: "Besoin d’aide ? Centre d’aide ou créez un compte si vous débutez sur Salvya.",
  forgotMobileIntro: "Saisissez l’e-mail de votre compte. Nous enverrons un lien pour définir un nouveau mot de passe.",
  resetSentShort: "Si un compte existe pour cet e-mail, un lien de réinitialisation est en route.",
  resetPrivacyNote:
    "Utilisez le même e-mail que pour la connexion. Nous ne révélons jamais si une adresse est enregistrée.",
  resetSentTo: "Instructions envoyées à {email}. Ouvrez le lien pour choisir un nouveau mot de passe.",
  resetStepOpenEmail: "Ouvrez l’e-mail Salvya (vérifiez les spams).",
  resetStepTapReset: "Appuyez sur Réinitialiser le mot de passe dans le message.",
  resetStepPickPassword: "Choisissez un nouveau mot de passe sur la page Salvya.",
  sendAgain: "Rien reçu ? Renvoyer",
  sendingAgain: "Nouvel envoi…",
  forgotEmailRequired: "Saisissez l’e-mail utilisé pour vous connecter à Salvya.",
  forgotEmailInvalid: "Saisissez une adresse e-mail valide.",
  authConnectFailed: "Connexion à l’authentification impossible. Vérifiez la configuration.",
  resetLinkBuildFailed: "Impossible de créer un lien sécurisé. Rechargez la page et réessayez.",
  rememberedIt: "Vous vous souvenez ?",
  pillNewPassword: "Nouveau mot de passe",
  updateHeroTitle: "Choisissez un mot de passe solide.",
  updateHeroBody:
    "Vous arrivez depuis un lien sécurisé. Après l’enregistrement, connectez-vous partout avec le nouveau mot de passe. Panier, favoris et commandes restent sur votre compte.",
  updateBullet1: "N’utilisez pas un mot de passe déjà utilisé ailleurs.",
  updateBullet2: "Mélangez lettres, chiffres et un symbole pour une meilleure protection.",
  updateBullet3: "Déconnectez-vous des appareils partagés après la mise à jour.",
  updateMobileIntro: "Définissez un nouveau mot de passe pour votre compte Salvya.",
  linkExpiredKicker: "Lien expiré",
  linkExpiredTitle: "Demandez un nouveau lien.",
  linkExpiredBody:
    "Les liens sont à usage unique et expirent. Ouvrez le dernier e-mail Salvya ou demandez-en un nouveau.",
  linkExpiredPageBody:
    "Cette page nécessite un lien valide depuis votre e-mail. Les anciens liens cessent de fonctionner après utilisation ou expiration.",
  sendNewResetLink: "Envoyer un nouveau lien",
  passwordUpdatedBody:
    "Mot de passe enregistré. Vous pouvez continuer vos achats ou vous reconnecter sur un autre appareil.",
  signedInNewPassword: "Vous êtes connecté avec votre nouveau mot de passe sur cet appareil.",
  continueBtn: "Continuer",
  signInOtherDevice: "Se connecter sur un autre appareil",
  passwordStrongerRequired:
    "Choisissez un mot de passe plus fort — majuscules, minuscules et un chiffre.",
  passwordReqSymbol: "Un symbole (recommandé)",
  confirmPasswordLabel: "Confirmer le mot de passe",
  accountEmailLabel: "E-mail du compte",
  countryPlaceholder: "Pays / région",
  countryMA: "Maroc",
  registerHeroTitle: "Créez votre compte client Salvya.",
  registerHeroBody:
    "Un profil pour le paiement, le panier et l’historique. Livraison Maroc et international — enregistrez votre pays une fois.",
  registerBullet1: "Paiement plus rapide avec coordonnées et adresses enregistrées.",
  registerBullet2: "Suivez vos commandes avec le numéro SVY et l’e-mail.",
  registerBullet3: "E-mails culture optionnels — drops et réassorts uniquement.",
};

const arAuth = {
  loginHeroKicker: "عملاء سالفيا",
  loginHeroTitle: "تسجيل واحد للسلة والطلبات ومتاجر الفنانين.",
  loginHeroBody:
    "حساب واحد على كل أجهزتك. سجّل الدخول لمزامنة السلة والإعجابات والتنبيهات والطلبات. حقول التوصيل عند الدفع تبقى في جلسة المتصفح حتى تُفعَّل العناوين المحفوظة.",
  loginBullet1: "السلة والإعجابات والتنبيهات وسجل الطلبات في ملفك عند تفعيل المزامنة.",
  loginBullet2: "دخول آمن بالبريد وكلمة المرور — الاسترداد في المساعدة والشروط.",
  loginBullet3: "منشئ محتوى؟ استخدم هذا الحساب ثم افتح أدوات المنشئ من القائمة.",
  existingEmailBanner: "يوجد حساب بالفعل لـ {email}. سجّل الدخول أدناه — لا تنشئ حسابًا آخر بنفس البريد.",
  helpCenter: "مركز المساعدة",
  forgotHeroBody:
    "نرسل رابطًا آمنًا لمرة واحدة إلى بريدك. افتحه على هذا الجهاز لاختيار كلمة مرور جديدة — ينتهي صلاحيته قريبًا لسلامتك.",
  resetSentTo: "أرسلنا التعليمات إلى {email}. افتح الرابط لاختيار كلمة مرور جديدة.",
  countryMA: "المغرب",
  countryPlaceholder: "البلد / المنطقة",
  rememberedIt: "تذكرتها؟",
  pillNewPassword: "كلمة مرور جديدة",
};

const enAccount = {
  settingsPageTitle: "Account settings",
  settingsPageIntro: "Profile, shipping book, preferences, and security — tuned for Salvya checkout and culture drops.",
  sectionPersonal: "Personal",
  sectionShipping: "Shipping",
  sectionExperience: "Experience",
  sectionAccess: "Access",
  sectionIrreversible: "Irreversible",
  personalDetailsDesc: "Name, contact, and profile info — saved to your Salvya account and used at checkout.",
  addressesDesc:
    "Save multiple destinations and choose one at checkout. Only one default applies — we reset the others automatically.",
  preferencesDesc: "Language and communications — tuned for how you browse and hear from Salvya.",
  securityTitle: "Security",
  securityDesc: "Protect your Salvya identity and sessions.",
  changePassword: "Change password",
  signOutDevice: "Sign out on this device",
  signOutEverywhereHint: "Sign out everywhere will arrive with device/session management.",
  dangerZoneDesc:
    "You can temporarily deactivate sign-in or permanently erase your Salvya account and linked personal data. Order records may be retained in anonymised form where the law requires it.",
  deleteOrDeactivate: "Delete or deactivate account →",
};

const frAccount = {
  settingsPageTitle: "Paramètres du compte",
  settingsPageIntro: "Profil, carnet d’adresses, préférences et sécurité — pour le paiement Salvya et les drops culture.",
  sectionPersonal: "Personnel",
  sectionShipping: "Livraison",
  sectionExperience: "Expérience",
  sectionAccess: "Accès",
  sectionIrreversible: "Irréversible",
  personalDetailsDesc: "Nom, contact et profil — enregistrés sur votre compte Salvya et utilisés au paiement.",
  addressesDesc:
    "Enregistrez plusieurs destinations et choisissez-en une au paiement. Une seule adresse par défaut à la fois.",
  preferencesDesc: "Langue et communications — selon votre façon de parcourir Salvya.",
  securityTitle: "Sécurité",
  securityDesc: "Protégez votre identité Salvya et vos sessions.",
  changePassword: "Changer le mot de passe",
  signOutDevice: "Se déconnecter sur cet appareil",
  signOutEverywhereHint: "La déconnexion partout arrivera avec la gestion des sessions.",
  dangerZoneDesc:
    "Vous pouvez désactiver temporairement la connexion ou supprimer définitivement votre compte. Les commandes peuvent être conservées de façon anonymisée si la loi l’exige.",
  deleteOrDeactivate: "Supprimer ou désactiver le compte →",
};

const overrides = { fr: { auth: frAuth, account: frAccount }, ar: { auth: arAuth } };

for (const loc of LOCALES) {
  const p = path.join(ROOT, `${loc}.json`);
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  j.auth = { ...j.auth, ...enAuth, ...(overrides[loc]?.auth ?? {}) };
  j.account = { ...j.account, ...enAccount, ...(overrides[loc]?.account ?? {}) };
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n");
  console.log(loc, "auth", Object.keys(j.auth).length, "account", Object.keys(j.account).length);
}
