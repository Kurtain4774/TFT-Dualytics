import { HeaderStats } from './CompStats.jsx'
import { TraitChips } from './BoardPieces.jsx'
import styles from '../CompRow.module.css'

export default function CompRowHeader({ comp, traits, champions }) {
  return (
    <div className={styles.headerBar}>
      <HeaderStats comp={comp} />
      <div className={styles.headerRight}>
        <div className={styles.traitRow}>
          <TraitChips traitData={comp.traits} traits={traits} allChampions={champions} />
        </div>
      </div>
    </div>
  )
}
