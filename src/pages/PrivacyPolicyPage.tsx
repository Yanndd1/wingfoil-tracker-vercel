import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const PrivacyPolicyPage: React.FC = () => {
  const { language } = useTranslation();

  const content = {
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: January 2025',
      intro: 'Wingfoil Tracker respects your privacy. This policy explains how we handle your data.',
      sections: [
        {
          title: '1. Data We Access',
          content: 'We access your Strava activities that are tagged as "Kitesurf" or "Kitesurfing" to analyze your wingfoil sessions. We request read-only access to your activities and do not modify any data on Strava.'
        },
        {
          title: '2. How We Use Your Data',
          content: 'Your activity data is used solely to provide you with session analytics, including run detection, speed statistics, and progress tracking. We use mathematical algorithms (not AI or machine learning) to detect runs from your GPS data.'
        },
        {
          title: '3. Data Storage',
          content: 'All your data is stored locally in your browser (localStorage). We do not store your data on any external server. Your Strava tokens are stored locally and are only used to communicate with Strava\'s API on your behalf.'
        },
        {
          title: '4. Data Sharing',
          content: 'We do not share, sell, or transfer your personal data to any third party. Your data is only visible to you (single-player mode).'
        },
        {
          title: '5. Data Retention',
          content: 'Your data remains in your browser until you clear it. You can delete all your data at any time from the Settings page. We refresh data from Strava on each sync and do not cache data beyond what is necessary for the app to function.'
        },
        {
          title: '6. Your Rights',
          content: 'You can revoke Wingfoil Tracker\'s access to your Strava data at any time from your Strava settings (Settings > My Apps). You can also delete all local data from the app\'s Settings page.'
        },
        {
          title: '7. Contact',
          content: 'For any questions about this privacy policy, please contact us via GitHub.'
        }
      ]
    },
    fr: {
      title: 'Politique de Confidentialité',
      lastUpdated: 'Dernière mise à jour : Janvier 2025',
      intro: 'Wingfoil Tracker respecte votre vie privée. Cette politique explique comment nous traitons vos données.',
      sections: [
        {
          title: '1. Données auxquelles nous accédons',
          content: 'Nous accédons à vos activités Strava taguées "Kitesurf" ou "Kitesurfing" pour analyser vos sessions de wingfoil. Nous demandons un accès en lecture seule à vos activités et ne modifions aucune donnée sur Strava.'
        },
        {
          title: '2. Comment nous utilisons vos données',
          content: 'Vos données d\'activité sont utilisées uniquement pour vous fournir des analyses de sessions, incluant la détection de runs, les statistiques de vitesse et le suivi de progression. Nous utilisons des algorithmes mathématiques (pas d\'IA ni de machine learning) pour détecter les runs à partir de vos données GPS.'
        },
        {
          title: '3. Stockage des données',
          content: 'Toutes vos données sont stockées localement dans votre navigateur (localStorage). Nous ne stockons pas vos données sur un serveur externe. Vos tokens Strava sont stockés localement et sont uniquement utilisés pour communiquer avec l\'API Strava en votre nom.'
        },
        {
          title: '4. Partage des données',
          content: 'Nous ne partageons, vendons ou transférons pas vos données personnelles à des tiers. Vos données ne sont visibles que par vous (mode single-player).'
        },
        {
          title: '5. Conservation des données',
          content: 'Vos données restent dans votre navigateur jusqu\'à ce que vous les effaciez. Vous pouvez supprimer toutes vos données à tout moment depuis la page Paramètres. Nous rafraîchissons les données de Strava à chaque synchronisation et ne mettons pas en cache les données au-delà de ce qui est nécessaire au fonctionnement de l\'application.'
        },
        {
          title: '6. Vos droits',
          content: 'Vous pouvez révoquer l\'accès de Wingfoil Tracker à vos données Strava à tout moment depuis vos paramètres Strava (Paramètres > Mes Applications). Vous pouvez également supprimer toutes les données locales depuis la page Paramètres de l\'application.'
        },
        {
          title: '7. Contact',
          content: 'Pour toute question concernant cette politique de confidentialité, veuillez nous contacter via GitHub.'
        }
      ]
    },
    nl: {
      title: 'Privacybeleid',
      lastUpdated: 'Laatst bijgewerkt: Januari 2025',
      intro: 'Wingfoil Tracker respecteert je privacy. Dit beleid legt uit hoe we met je gegevens omgaan.',
      sections: [
        {
          title: '1. Gegevens die we benaderen',
          content: 'We benaderen je Strava-activiteiten die zijn getagd als "Kitesurf" of "Kitesurfing" om je wingfoil-sessies te analyseren. We vragen alleen-lezen toegang tot je activiteiten en wijzigen geen gegevens op Strava.'
        },
        {
          title: '2. Hoe we je gegevens gebruiken',
          content: 'Je activiteitsgegevens worden uitsluitend gebruikt om je sessie-analyses te bieden, inclusief run-detectie, snelheidsstatistieken en voortgangsregistratie. We gebruiken wiskundige algoritmen (geen AI of machine learning) om runs te detecteren uit je GPS-gegevens.'
        },
        {
          title: '3. Gegevensopslag',
          content: 'Al je gegevens worden lokaal opgeslagen in je browser (localStorage). We slaan je gegevens niet op een externe server op. Je Strava-tokens worden lokaal opgeslagen en worden alleen gebruikt om namens jou met de Strava API te communiceren.'
        },
        {
          title: '4. Gegevens delen',
          content: 'We delen, verkopen of dragen je persoonlijke gegevens niet over aan derden. Je gegevens zijn alleen zichtbaar voor jou (single-player modus).'
        },
        {
          title: '5. Gegevensbewaring',
          content: 'Je gegevens blijven in je browser totdat je ze wist. Je kunt al je gegevens op elk moment verwijderen via de Instellingenpagina. We vernieuwen gegevens van Strava bij elke synchronisatie en cachen geen gegevens langer dan nodig is voor de werking van de app.'
        },
        {
          title: '6. Je rechten',
          content: 'Je kunt de toegang van Wingfoil Tracker tot je Strava-gegevens op elk moment intrekken via je Strava-instellingen (Instellingen > Mijn Apps). Je kunt ook alle lokale gegevens verwijderen via de Instellingenpagina van de app.'
        },
        {
          title: '7. Contact',
          content: 'Voor vragen over dit privacybeleid kun je contact met ons opnemen via GitHub.'
        }
      ]
    }
  };

  const currentContent = content[language as keyof typeof content] || content.en;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/login"
            className="inline-flex items-center text-ocean-600 hover:text-ocean-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-ocean-600" />
            <h1 className="text-3xl font-bold text-gray-900">{currentContent.title}</h1>
          </div>
          <p className="text-gray-500 mt-2">{currentContent.lastUpdated}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <p className="text-gray-700 mb-6">{currentContent.intro}</p>

          <div className="space-y-6">
            {currentContent.sections.map((section, index) => (
              <div key={index}>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {section.title}
                </h2>
                <p className="text-gray-600">{section.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Wingfoil Tracker &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
