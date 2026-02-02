import React from 'react';
import { useTranslation } from '../../context/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        <p>{t('footer.madeWith')}</p>
      </div>
    </footer>
  );
};

export default Footer;
