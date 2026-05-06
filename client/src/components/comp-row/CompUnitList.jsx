import { UnitsGrid } from './BoardPieces.jsx'
import styles from '../CompRow.module.css'

export default function CompUnitList({ resolvedUnits, items }) {
  return (
    <div className={styles.body}>
      <div className={styles.unitsRow}>
        <UnitsGrid resolvedUnits={resolvedUnits} allItems={items} />
      </div>
    </div>
  )
}
