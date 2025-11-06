import { useState } from 'react';
import { useRef } from 'react';
import PropTypes from 'prop-types';

const LanguageSwitcher = ({ className = "" }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const op = useRef(null);

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'ES', name: 'Spanish' },
    { code: 'FR', name: 'French' },
    { code: 'DE', name: 'German' },
  ];

  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    op.current.hide();
  };

  return (
    <div className={className}>
     {/*  <Button
        label={selectedLanguage}
        icon="pi pi-globe"
        onClick={(e) => op.current.toggle(e)}
        className="p-button-text p-button-sm text-gray-600 hover:text-gray-900"
        aria-label="Select Language"
      /> */}
     {/*  <OverlayPanel ref={op} className="w-48">
        <div className="flex flex-col gap-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors ${
                selectedLanguage === lang.code ? 'bg-gray-50 font-semibold' : ''
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </OverlayPanel> */}
    </div>
  );
};

LanguageSwitcher.propTypes = {
  className: PropTypes.string
};

export default LanguageSwitcher;
