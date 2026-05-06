import { useMemo } from 'react'
import { TraitChips, UnitsGrid } from './BoardPieces.jsx'
import { PartnerStats } from './CompStats.jsx'
import { placementBucket } from './formatters.js'
import { resolveUnits } from './resolveUnits.js'
import styles from '../CompRow.module.css'

const PLACEMENT_CLASS = { 1: styles.p1, 2: styles.p2, 3: styles.p3, 4: styles.p4 }

export default function PartnerRow({ partner, champions, items, traits }) {
  const resolvedUnits = useMemo(
    () => resolveUnits(partner.units, champions, items),
    [partner.units, champions, items]
  )
  const bucket = placementBucket(partner.avgPlacement)
  const placementClass = PLACEMENT_CLASS[bucket] || ''

  return (
    <div className={`${styles.partnerRow} ${placementClass}`} role="listitem">
      <PartnerStats partner={partner} placementClass={placementClass} />
      <div className={styles.partnerBoard}>
        <div className={styles.partnerTraits}>
          <TraitChips traitData={partner.traits} traits={traits} allChampions={champions} />
        </div>
        <div className={styles.partnerUnits}>
          <UnitsGrid resolvedUnits={resolvedUnits} allItems={items} />
        </div>
      </div>
    </div>
  )
}
