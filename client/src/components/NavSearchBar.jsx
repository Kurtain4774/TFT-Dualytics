import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import RiotIdCandidates from './RiotIdCandidates.jsx'
import {
  REGIONS,
  REGION_DEFAULT_TAG,
  parseRiotId,
  resolveRiotIdCandidates,
  summonerPath,
  validRiotId,
  withDefaultTag,
} from '../utils/riotSearch.js'
import styles from './NavSearchBar.module.css'

export default function NavSearchBar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [region, setRegion] = useState('na')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [candidates, setCandidates] = useState([])
  const [isResolving, setIsResolving] = useState(false)
  const [iconHover, setIconHover] = useState(false)
  const errorId = 'nav-search-error'
  const statusId = 'nav-search-status'
  const candidateId = 'nav-search-candidates'
  const regionHelpId = 'nav-search-region-help'
  const inputHelpId = 'nav-search-input-help'
  const statusText = isResolving ? t('search.resolving') : ''
  const inputDescriptionIds = [
    inputHelpId,
    error ? errorId : null,
    statusText ? statusId : null,
    candidates.length ? `${candidateId}-status` : null,
  ].filter(Boolean).join(' ')

  const navigateToId = (id) => {
    navigate(summonerPath(region, id))
    setName('')
    setCandidates([])
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCandidates([])

    const id = parseRiotId(name)
    if (!validRiotId(id)) {
      setError(t('search.errorShort'))
      return
    }

    if (id.hasExplicitTag) {
      navigateToId(id)
      return
    }

    setIsResolving(true)
    try {
      const players = await resolveRiotIdCandidates(region, id.gameName)
      if (players.length === 1) {
        navigateToId(players[0])
        return
      }
      if (players.length > 1) {
        setCandidates(players)
        return
      }
    } catch {
      // fall through to default tag behavior
    } finally {
      setIsResolving(false)
    }

    navigateToId(withDefaultTag(id, region))
  }

  const handleInputKeyDown = (e) => {
    if (e.key === 'Escape' && candidates.length) {
      e.stopPropagation()
      setCandidates([])
    }
  }

  return (
    <form className={styles.form} role="search" onSubmit={handleSubmit} aria-busy={isResolving}>
      <p id={regionHelpId} className="sr-only">{t('search.regionHelp')}</p>
      <p id={inputHelpId} className="sr-only">{t('search.riotIdHelp')}</p>
      <p id={statusId} className="sr-only" role="status" aria-live="polite">
        {statusText}
      </p>
      <div className={styles.inner}>
        <select
          className={styles.select}
          value={region}
          onChange={e => setRegion(e.target.value)}
          aria-label={t('search.regionLabel')}
          aria-describedby={regionHelpId}
        >
          {REGIONS.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
        </select>

        <div className={styles.inputWrap}>
          <input
            type="text"
            placeholder={`GameName#${REGION_DEFAULT_TAG[region] || 'TAG'}`}
            value={name}
            onChange={e => { setName(e.target.value); setError(''); setCandidates([]) }}
            onKeyDown={handleInputKeyDown}
            aria-label={t('search.riotIdLabel')}
            aria-invalid={!!error}
            aria-describedby={inputDescriptionIds || undefined}
            maxLength={22}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className={styles.input}
          />
          <button
            type="submit"
            className={styles.btn}
            disabled={isResolving}
            onMouseEnter={() => setIconHover(true)}
            onMouseLeave={() => setIconHover(false)}
            aria-label={isResolving ? t('search.searching') : t('search.search')}
          >
            <svg
              width="16" height="16" viewBox="0 0 18 18" fill="none"
              style={{ opacity: iconHover ? 1 : 0.65, transition: 'opacity 150ms' }}
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="12" y1="12" x2="16.5" y2="16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {error && <p id={errorId} className={styles.error} role="alert">{error}</p>}
      <RiotIdCandidates id={candidateId} players={candidates} onSelect={navigateToId} />
    </form>
  )
}
