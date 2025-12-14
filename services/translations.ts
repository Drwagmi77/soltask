import { Language } from '../types';

export const TRANSLATIONS = {
  EN: {
    badge: "The #1 Social Task Marketplace",
    heroTitle: "Complete Tasks,",
    heroTitleHighlight: "$SOL Rewards.",
    heroSubtitle: "Connect your X account and start earning immediately. No wallet required to start. Accumulate $SOL and withdraw whenever you want.",
    ctaEarn: "Login with X",
    ctaCreate: "Create Campaign",
    minWithdrawal: "Minimum withdrawal: 0.1 SOL",
    withdraw: "Withdraw Funds",
    stats: {
      totalPaid: "Total SOL Paid",
      tasksCompleted: "Tasks Verified",
      activeUsers: "Active Earners",
      avgPayout: "Avg. Daily Claim"
    },
    trust: {
      title: "Trusted by the Solana Ecosystem",
      subtitle: "Join thousands of users earning crypto daily through transparent, on-chain verification."
    },
    features: {
      verify: {
        title: "Instant Verification",
        desc: "Our X API integration verifies likes, retweets, and comments in seconds. No screenshots needed."
      },
      referral: {
        title: "Lazy Minting",
        desc: "Start earning without a wallet. Accumulate balance off-chain and claim to your wallet in one batch to save gas."
      },
      escrow: {
        title: "Secure Payouts",
        desc: "Advertisers fund campaigns upfront. Earnings are guaranteed and withdrawable at any time."
      }
    }
  },
  DE: {
    badge: "Der #1 Marktplatz für soziale Aufgaben",
    heroTitle: "Aufgaben erledigen,",
    heroTitleHighlight: "$SOL verdienen.",
    heroSubtitle: "Verbinden Sie Ihr X-Konto und beginnen Sie sofort. Zum Starten ist kein Wallet erforderlich. Sammeln Sie $SOL und heben Sie ab, wann immer Sie wollen.",
    ctaEarn: "Mit X anmelden",
    ctaCreate: "Kampagne erstellen",
    minWithdrawal: "Mindestauszahlung: 0.1 SOL",
    withdraw: "Geld abheben",
    stats: {
      totalPaid: "Ausbezahlte SOL",
      tasksCompleted: "Verifizierte Aufgaben",
      activeUsers: "Aktive Nutzer",
      avgPayout: "Durchschn. Auszahlung"
    },
    trust: {
      title: "Vertraut vom Solana-Ökosystem",
      subtitle: "Schließen Sie sich Tausenden von Nutzern an, die täglich Krypto durch transparente On-Chain-Verifizierung verdienen."
    },
    features: {
      verify: {
        title: "Sofortige Überprüfung",
        desc: "Unsere X-API-Integration überprüft Likes, Retweets und Kommentare in Sekunden."
      },
      referral: {
        title: "Lazy Minting",
        desc: "Verdienen ohne Wallet. Guthaben sammeln und später mit einer Transaktion abheben, um Gas zu sparen."
      },
      escrow: {
        title: "Sichere Auszahlungen",
        desc: "Werbetreibende finanzieren Kampagnen im Voraus. Einnahmen sind garantiert."
      }
    }
  },
  ES: {
    badge: "El mercado n.º 1 de tareas sociales",
    heroTitle: "Completa tareas,",
    heroTitleHighlight: "Gana $SOL.",
    heroSubtitle: "Conecta tu cuenta de X y comienza a ganar de inmediato. No se requiere billetera para comenzar. Acumula $SOL y retira cuando quieras.",
    ctaEarn: "Iniciar con X",
    ctaCreate: "Crear campaña",
    minWithdrawal: "Retiro mínimo: 0.1 SOL",
    withdraw: "Retirar fondos",
    stats: {
      totalPaid: "SOL Pagado Total",
      tasksCompleted: "Tareas Verificadas",
      activeUsers: "Usuarios Activos",
      avgPayout: "Reclamo Promedio"
    },
    trust: {
      title: "Confiado por el Ecosistema Solana",
      subtitle: "Únete a miles de usuarios que ganan criptomonedas diariamente mediante verificación transparente en cadena."
    },
    features: {
      verify: {
        title: "Verificación instantánea",
        desc: "Nuestra integración API de X verifica me gusta, retweets y comentarios en segundos."
      },
      referral: {
        title: "Acuñación diferida",
        desc: "Empieza a ganar sin billetera. Acumula saldo y reclámalo en un solo lote para ahorrar gas."
      },
      escrow: {
        title: "Pagos seguros",
        desc: "Los anunciantes financian campañas por adelantado. Las ganancias están garantizadas."
      }
    }
  },
  TR: {
    badge: "1 Numaralı Sosyal Görev Pazarı",
    heroTitle: "Görev Tamamla,",
    heroTitleHighlight: "$SOL Kazan.",
    heroSubtitle: "X hesabınızı bağlayın ve hemen kazanmaya başlayın. Başlamak için cüzdana gerek yok. $SOL biriktirin ve istediğiniz zaman tek seferde çekin.",
    ctaEarn: "X ile Giriş Yap",
    ctaCreate: "Kampanya Oluştur",
    minWithdrawal: "Minimum çekim: 0.1 SOL",
    withdraw: "Para Çek",
    stats: {
      totalPaid: "Toplam Ödenen SOL",
      tasksCompleted: "Doğrulanmış Görev",
      activeUsers: "Aktif Kazananlar",
      avgPayout: "Ort. Günlük Kazanç"
    },
    trust: {
      title: "Solana Ekosistemi Tarafından Onaylı",
      subtitle: "Şeffaf, zincir üstü doğrulama ile her gün kripto kazanan binlerce kullanıcıya katılın."
    },
    features: {
      verify: {
        title: "Anında Doğrulama",
        desc: "X API entegrasyonumuz beğenileri ve retweetleri saniyeler içinde doğrular. Ekran görüntüsü yok."
      },
      referral: {
        title: "Kolay Başlangıç",
        desc: "Cüzdan bağlamadan kazanmaya başla. Bakiyeni içeride biriktir, gas ücreti ödemeden tek seferde çek."
      },
      escrow: {
        title: "Garantili Ödeme",
        desc: "Reklamverenler ödemeyi peşin yapar. Paran içeride birikir, dilediğin an cüzdanına çekebilirsin."
      }
    }
  }
};

export const getTranslation = (lang: Language) => TRANSLATIONS[lang];