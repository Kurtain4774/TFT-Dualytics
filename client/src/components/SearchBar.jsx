import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import RiotIdCandidates from './RiotIdCandidates.jsx'
import {
  REGIONS,
  REGION_DEFAULT_TAG,
  normalizeRegion,
  parseRiotId,
  resolveRiotIdCandidates,
  summonerPath,
  validRiotId,
  withDefaultTag,
} from '../utils/riotSearch.js'
import styles from './SearchBar.module.css'

export default function SearchBar({
  defaultRegion = 'na1',
  defaultName1 = '',
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [name1, setName1] = useState(defaultName1)
  const [region, setRegion] = useState(normalizeRegion(defaultRegion))
  const [error, setError] = useState('')
  const [candidates, setCandidates] = useState([])
  const [isResolving, setIsResolving] = useState(false)
  const errorId = 'summoner-search-error'
  const statusId = 'summoner-search-status'
  const candidateId = 'summoner-search-candidates'
  const regionHelpId = 'summoner-search-region-help'
  const inputHelpId = 'summoner-search-input-help'
  const statusText = isResolving ? t('search.resolving') : ''
  const inputDescriptionIds = [
    inputHelpId,
    error ? errorId : null,
    statusText ? statusId : null,
    candidates.length ? `${candidateId}-status` : null,
  ].filter(Boolean).join(' ')

  const navigateToId = (id) => {
    navigate(summonerPath(region, id))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCandidates([])

    const id1 = parseRiotId(name1)
    if (!validRiotId(id1)) {
      setError(t('search.error'))
      return
    }

    if (id1.hasExplicitTag) {
      navigateToId(id1)
      return
    }

    setIsResolving(true)
    try {
      const players = await resolveRiotIdCandidates(region, id1.gameName)
      if (players.length === 1) {
        navigateToId(players[0])
        return
      }
      if (players.length > 1) {
        setCandidates(players)
        return
      }
    } catch {
      // Keep the previous default-tag behavior if MongoDB resolution is unavailable.
    } finally {
      setIsResolving(false)
    }

    navigateToId(withDefaultTag(id1, region))
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
      <div className={styles.inputs}>
        <select
          className={styles.select}
          value={region}
          onChange={e => setRegion(e.target.value)}
          aria-label={t('search.regionLabel')}
          aria-describedby={regionHelpId}
        >
          {REGIONS.map(r => (
            <option key={r} value={r}>{r.toUpperCase()}</option>
          ))}
        </select>
        <input
          className={styles.input}
          type="text"
          placeholder={`GameName#${REGION_DEFAULT_TAG[region] || 'TAG'}`}
          value={name1}
          onChange={e => { setName1(e.target.value); setError(''); setCandidates([]) }}
          onKeyDown={handleInputKeyDown}
          aria-label={t('search.riotIdLabel')}
          aria-invalid={!!error}
          aria-describedby={inputDescriptionIds || undefined}
          maxLength={22}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />

        <button type="submit" className={styles.submitBtn} disabled={isResolving}>
          {isResolving ? t('search.searching') : t('search.search')}
        </button>
      </div>
      {error && <p id={errorId} className={styles.error} role="alert">{error}</p>}
      <RiotIdCandidates id={candidateId} players={candidates} onSelect={navigateToId} />
    </form>
  )
}
