import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../contexts/useSettings.js'
import { useFocusTrap } from '../hooks/useFocusTrap.js'
import styles from './SettingsModal.module.css'

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

export default function SettingsModal({ onClose }) {
  const { t } = useTranslation()
  const { theme, setTheme, language, setLanguage } = useSettings()
  const panelRef = useRef(null)
  const closeButtonRef = useRef(null)

  useFocusTrap({
    active: true,
    rootRef: panelRef,
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
  })

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} role="presentation">
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        tabIndex={-1}
      >
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <GearIcon />
            <span id="settings-modal-title" className={styles.title}>{t('settings.title')}</span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeBtn}
            aria-label={t('settings.close')}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.row}>
            <label className={styles.label} htmlFor="setting-theme">
              {t('settings.theme')}
            </label>
            <select
              id="setting-theme"
              className={styles.select}
              value={theme}
              onChange={e => setTheme(e.target.value)}
            >
              <option value="dark">{t('settings.dark')}</option>
              <option value="light">{t('settings.light')}</option>
            </select>
          </div>

          <div className={styles.row}>
            <label className={styles.label} htmlFor="setting-language">
              {t('settings.language')}
            </label>
            <select
              id="setting-language"
              className={styles.select}
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              <option value="en">{t('settings.langEn')}</option>
              <option value="es">{t('settings.langEs')}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
