import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './FilterBar.module.css'

const FilterBar = forwardRef(function FilterBar({
  search,
  onSearchChange,
  champSort,
  onChampSortChange,
  itemCategory,
  onItemCategoryChange,
}, searchInputRef) {
  const { t } = useTranslation()
  const shortcutId = 'builder-filter-shortcut'

  const CHAMP_SORTS = [
    { id: 'cost', label: t('filterBar.sortCost') },
    { id: 'name', label: t('filterBar.sortName') },
    { id: 'origin', label: t('filterBar.sortOrigin') },
    { id: 'class', label: t('filterBar.sortClass') },
  ]

  const ITEM_CATEGORIES = [
    { id: 'craftable', label: t('filterBar.catCraftable') },
    { id: 'radiant', label: t('filterBar.catRadiant') },
    { id: 'artifact', label: t('filterBar.catArtifact') },
    { id: 'emblem', label: t('filterBar.catEmblem') },
    { id: 'other', label: t('filterBar.catOther') },
  ]

  return (
    <div className={styles.bar}>
      <div className={styles.searchWrap}>
        <input
          ref={searchInputRef}
          type="text"
          className={styles.search}
          placeholder={t('filterBar.searchPlaceholder')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label={t('filterBar.searchPlaceholder')}
          aria-describedby={shortcutId}
        />
        <kbd id={shortcutId} className={styles.hint}>{t('filterBar.shortcut')}</kbd>
      </div>

      <div className={styles.tabGroup}>
        {CHAMP_SORTS.map(s => (
          <button
            key={s.id}
            type="button"
            className={`${styles.tab} ${champSort === s.id ? styles.tabActive : ''}`}
            onClick={() => onChampSortChange(s.id)}
            aria-pressed={champSort === s.id}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className={styles.tabGroup}>
        {ITEM_CATEGORIES.map(c => (
          <button
            key={c.id}
            type="button"
            className={`${styles.tab} ${itemCategory === c.id ? styles.tabActive : ''}`}
            onClick={() => onItemCategoryChange(c.id)}
            aria-pressed={itemCategory === c.id}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
})

export default FilterBar
