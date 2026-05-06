import { useTranslation } from 'react-i18next'
import styles from './RiotIdCandidates.module.css'

export default function RiotIdCandidates({ id = 'riot-id-candidates', players, onSelect }) {
  const { t } = useTranslation()
  if (!players?.length) return null

  const promptId = `${id}-prompt`
  const statusId = `${id}-status`

  return (
    <div className={styles.chooser} role="group" aria-labelledby={promptId}>
      <p id={promptId} className={styles.prompt}>{t('search.candidatePrompt')}</p>
      <p id={statusId} className="sr-only" role="status" aria-live="polite">
        {t('search.candidatesFound', { count: players.length })}
      </p>
      <div className={styles.list}>
        {players.map(player => (
          <button
            key={`${player.puuid || player.gameName}-${player.tagLine}`}
            type="button"
            className={styles.choice}
            onClick={() => onSelect(player)}
          >
            <span className={styles.riotId}>
              {player.gameName}
              <span className={styles.tag}>#{player.tagLine}</span>
            </span>
            {(player.tier || player.leaguePoints !== null) && (
              <span className={styles.meta}>
                {[player.tier, player.rank].filter(Boolean).join(' ')}
                {player.leaguePoints !== null && player.leaguePoints !== undefined ? ` ${player.leaguePoints} LP` : ''}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
