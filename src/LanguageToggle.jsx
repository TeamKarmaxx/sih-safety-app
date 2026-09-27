import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from './i18n.js';

function LanguageToggle() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const current =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectLanguage = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          background: 'rgba(100, 181, 246, 0.2)',
          border: '1px solid rgba(100, 181, 246, 0.4)',
          color: '#64b5f6',
          borderRadius: '6px',
          padding: '6px 12px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        {current.label}
        <span style={{ fontSize: '9px' }}>▾</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: 'var(--color-surface, #16233d)',
            border: '1px solid var(--color-border-strong, rgba(255,255,255,0.16))',
            borderRadius: '10px',
            padding: '6px',
            minWidth: '160px',
            zIndex: 50,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => selectLanguage(lang.code)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: lang.code === current.code ? 'rgba(100, 181, 246, 0.15)' : 'transparent',
                border: 'none',
                color: '#e8eef7',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '13px',
                cursor: 'pointer',
                marginBottom: '2px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{lang.label}</span>
                {lang.translationStatus !== 'complete' && (
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      color: lang.translationStatus === 'untranslated' ? '#f59e0b' : '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {lang.translationStatus === 'untranslated' ? 'Not yet translated' : 'Partial'}
                  </span>
                )}
              </div>
            </button>
          ))}
          {current.translationStatus !== 'complete' && (
            <p style={{ fontSize: '10px', color: '#94a3b8', margin: '6px 4px 2px', lineHeight: 1.4 }}>
              Some screens will show in English until this translation is complete.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default LanguageToggle;
