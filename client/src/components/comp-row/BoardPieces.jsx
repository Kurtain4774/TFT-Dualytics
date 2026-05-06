import { TraitChips as SharedTraitChips, UnitsGrid as SharedUnitsGrid } from '../shared/HoverableBoardPieces.jsx'
import styles from '../CompRow.module.css'

export function TraitChips(props) {
  return <SharedTraitChips {...props} styles={styles} />
}

export function UnitsGrid(props) {
  return <SharedUnitsGrid {...props} styles={styles} />
}
