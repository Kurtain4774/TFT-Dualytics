import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import ItemCard from '../components/ItemCard.jsx'
import TraitCard from '../components/TraitCard.jsx'
import UnitCard from '../components/UnitCard.jsx'
import { useChampions } from '../hooks/useChampions.js'
import { useHoverCard } from '../hooks/useHoverCard.js'
import { useItems } from '../hooks/useItems.js'
import { useStats } from '../hooks/useStats.js'
import { useTraits } from '../hooks/useTraits.js'
import styles from './StatsPage.module.css'

const COSTS = [1, 2, 3, 4, 5]
const ITEM_CATEGORIES = ['craftable', 'radiant', 'artifact', 'emblem', 'other']
const DEFAULT_SORT = { key: 'avgPlacement', direction: 'asc' }
const SORT_DEFAULTS = {
  name: 'asc',
  avgPlacement: 'asc',
  winRate: 'desc',
  frequency: 'desc',
}

const STYLE_TIER = { 1: 'style1', 2: 'style2', 3: 'style3', 4: 'style4', 5: 'style5', 6: 'style6' }
const TIER_GRADIENTS = {
  style1: 'linear-gradient(145deg, #8a5a3b 0%, #4a2f1e 100%)',
  style3: 'linear-gradient(145deg, #c7c9cc 0%, #6b6d70 100%)',
  style4: 'linear-gradient(145deg, rgba(230, 110, 80, 0.9) 0%, rgba(160, 50, 40, 0.9) 100%)',
  style5: 'linear-gradient(145deg, #e8c55a 0%, #9a7624 100%)',
  style6: 'linear-gradient(145deg, #ff7ae0 0%, #7ad2ff 50%, #fff27a 100%)',
}

function getTraitTierInfo(meta, tier) {
  const effects = (meta?.effects || [])
    .filter(e => (e.minUnits ?? 0) > 0)
    .sort((a, b) => a.minUnits - b.minUnits)
  const effect = effects[tier - 1]
  if (!effect) return { minUnits: null, style: null }
  const style = typeof effect.style === 'number' ? STYLE_TIER[effect.style] : null
  return { minUnits: effect.minUnits, style }
}

const formatAvg = value => Number(value || 0).toFixed(2)
const formatPercent = value => `${((value || 0) * 100).toFixed(1)}%`

function getAvgPlacementColor(value) {
  const placement = Number(value)
  if (!Number.isFinite(placement)) return undefined
  if (placement <= 1.85) return '#22C55E'
  if (placement <= 2.0) return '#65C95A'
  if (placement <= 2.15) return '#A3CF4A'
  if (placement <= 2.25) return '#FACC15'
  if (placement <= 2.35) return '#F59E0B'
  if (placement <= 2.5) return '#EF6A24'
  return '#DC2626'
}

function getWinRateColor(value) {
  const winRate = Number(value)
  if (!Number.isFinite(winRate)) return undefined
  const percent = winRate <= 1 ? winRate * 100 : winRate
  if (percent >= 37.5) return '#22C55E'
  if (percent >= 32.5) return '#65C95A'
  if (percent >= 28) return '#A3CF4A'
  if (percent >= 25) return '#FACC15'
  if (percent >= 22) return '#F59E0B'
  if (percent >= 17.5) return '#EF6A24'
  return '#DC2626'
}

function getAvgPlacementQualityKey(value) {
  const placement = Number(value)
  if (!Number.isFinite(placement)) return 'unknown'
  if (placement <= 1.85) return 'excellent'
  if (placement <= 2.15) return 'good'
  if (placement <= 2.35) return 'average'
  return 'low'
}

function getWinRateQualityKey(value) {
  const winRate = Number(value)
  if (!Number.isFinite(winRate)) return 'unknown'
  const percent = winRate <= 1 ? winRate * 100 : winRate
  if (percent >= 32.5) return 'excellent'
  if (percent >= 28) return 'good'
  if (percent >= 22) return 'average'
  return 'low'
}

function makeMap(list) {
  return new Map((list || []).map(item => [item.id, item]))
}

function normalizeName(name) {
  return String(name || '').toLowerCase()
}

function compareRows(a, b, sort) {
  const direction = sort.direction === 'asc' ? 1 : -1
  if (sort.key === 'name') {
    return direction * a.name.localeCompare(b.name)
  }

  const aValue = Number(a[sort.key] || 0)
  const bValue = Number(b[sort.key] || 0)
  if (aValue !== bValue) return direction * (aValue - bValue)
  return a.name.localeCompare(b.name)
}

function StatIcon({ type, meta, tierStyle }) {
  const isTrait = type === 'traits'
  const iconClass = `${styles.icon} ${isTrait ? styles.traitIcon : ''}`
  const fallbackClass = `${styles.fallbackIcon} ${isTrait ? styles.traitIcon : ''}`
  const tierBg = isTrait && tierStyle ? TIER_GRADIENTS[tierStyle] : null
  if (!meta?.iconUrl) {
    return (
      <span className={fallbackClass} style={tierBg ? { background: tierBg } : undefined}>
        {meta?.name?.[0] || '?'}
      </span>
    )
  }
  let style
  if (type === 'units' && meta.cost) style = { borderColor: `var(--cost-${meta.cost})` }
  else if (tierBg) style = { background: tierBg }
  return <img className={iconClass} style={style} src={meta.iconUrl} alt="" loading="lazy" />
}

function HoverableNameCell({ type, row, allItems, allChampions }) {
  const data = type === 'traits'
    ? { meta: row.meta, count: row.tierMin ?? Math.round(row.avgUnits || 0) }
    : row.meta
  const { onMouseEnter, onMouseLeave, cardProps } = useHoverCard(data)
  const Card = type === 'units' ? UnitCard : type === 'items' ? ItemCard : TraitCard
  return (
    <>
      <div className={styles.nameCell} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <StatIcon type={type} meta={row.meta} tierStyle={row.tierStyle} />
        <span>{row.name}</span>
      </div>
      {cardProps.isOpen && createPortal(
        <Card {...cardProps} allItems={allItems} allChampions={allChampions} />,
        document.body
      )}
    </>
  )
}

function HoverablePopularIcon({ entry, meta, cardType, allItems }) {
  const { onMouseEnter, onMouseLeave, cardProps } = useHoverCard(meta)
  const Card = cardType === 'items' ? ItemCard : UnitCard
  if (!meta?.iconUrl) return null
  return (
    <>
      <img
        className={styles.smallIcon}
        src={meta.iconUrl}
        alt={meta.name || entry.id}
        title={`${meta.name || entry.id}: ${entry.count.toLocaleString()}`}
        loading="lazy"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
      {cardProps.isOpen && createPortal(
        <Card {...cardProps} allItems={allItems} />,
        document.body
      )}
    </>
  )
}

function PopularIcons({ entries, map, emptyLabel, popularCardType, allItems }) {
  if (!entries?.length) return <span className={styles.muted}>{emptyLabel}</span>
  return (
    <div className={styles.popularIcons}>
      {entries.map(entry => {
        const meta = map.get(entry.id)
        return (
          <HoverablePopularIcon
            key={entry.id}
            entry={entry}
            meta={meta}
            cardType={popularCardType}
            allItems={allItems}
          />
        )
      })}
    </div>
  )
}

function Toolbar({ activeTab, setActiveTab, patch, patches, setPatch, query, setQuery, costFilter, setCostFilter, itemCategory, setItemCategory }) {
  const { t } = useTranslation()
  const patchHelpId = 'stats-patch-help'
  const searchHelpId = 'stats-search-help'
  const TABS = [
    { key: 'units', label: t('stats.tabUnits') },
    { key: 'items', label: t('stats.tabItems') },
    { key: 'traits', label: t('stats.tabTraits') },
  ]
  return (
    <>
      <p id={patchHelpId} className="sr-only">{t('stats.patchHelp')}</p>
      <p id={searchHelpId} className="sr-only">{t('stats.searchHelp')}</p>
      <div className={styles.primaryControls}>
        <select
          className={styles.select}
          value={patch || ''}
          onChange={event => setPatch(event.target.value)}
          aria-label={t('stats.patchLabel')}
          aria-describedby={patchHelpId}
        >
          {patches.length === 0 && <option value="">{t('stats.noPatch')}</option>}
          {patches.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
        {activeTab === 'units' && (
          <div className={styles.costFilters} role="group" aria-label={t('stats.costFilterLabel')}>
            <span className={styles.costLabel}>{t('stats.costLabel')}</span>
            {COSTS.map(cost => (
              <button
                key={cost}
                className={`${styles.costButton} ${costFilter === cost ? styles.costActive : ''}`}
                style={{ '--cost-color': `var(--cost-${cost})` }}
                type="button"
                onClick={() => setCostFilter(current => current === cost ? null : cost)}
                aria-pressed={costFilter === cost}
              >
                {cost}
              </button>
            ))}
          </div>
        )}
        <input
          className={styles.search}
          type="search"
          placeholder={t('stats.searchPlaceholder')}
          value={query}
          onChange={event => setQuery(event.target.value)}
          aria-label={t('stats.searchLabel')}
          aria-describedby={searchHelpId}
        />
      </div>
      <div className={styles.tabBar} role="group" aria-label={t('stats.statsTypeLabel')}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            aria-pressed={activeTab === tab.key}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'items' && (
        <div className={styles.categoryBar} role="group" aria-label={t('filterBar.categoryLabel', 'Item category')}>
          {ITEM_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              className={`${styles.tab} ${itemCategory === cat ? styles.tabActive : ''}`}
              onClick={() => setItemCategory(cat)}
              aria-pressed={itemCategory === cat}
            >
              {t(`filterBar.cat${cat.charAt(0).toUpperCase()}${cat.slice(1)}`)}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

function SortHeader({ columnKey, label, sort, onSort }) {
  const { t } = useTranslation()
  const isActive = sort.key === columnKey
  const ariaSort = isActive
    ? sort.direction === 'asc' ? 'ascending' : 'descending'
    : 'none'

  return (
    <th scope="col" aria-sort={ariaSort}>
      <button
        className={`${styles.sortButton} ${isActive ? styles.sortButtonActive : ''}`}
        type="button"
        onClick={() => onSort(columnKey)}
        aria-label={t('stats.sortBy', { column: label })}
      >
        <span>{label}</span>
        {isActive && <span className={styles.sortMark}>{sort.direction === 'asc' ? 'ASC' : 'DESC'}</span>}
      </button>
    </th>
  )
}

function StatsTable({ type, rows, maps, sort, onSort, allItems, allChampions }) {
  const { t } = useTranslation()
  const nameLabel = type === 'units' ? t('stats.colUnit') : type === 'items' ? t('stats.colItem') : t('stats.colTrait')
  const popularLabel = type === 'units' ? t('stats.colPopularItems') : t('stats.colPopularUnits')
  const popularMap = type === 'units' ? maps.items : maps.champions
  const popularCardType = type === 'units' ? 'items' : 'units'
  const descId = `stats-${type}-table-desc`
  const tableTypeLabel = type === 'units' ? t('stats.tabUnits') : type === 'items' ? t('stats.tabItems') : t('stats.tabTraits')

  return (
    <div className={styles.tableWrap}>
      <p id={descId} className="sr-only">{t('stats.tableDescription')}</p>
      <table className={styles.table} aria-describedby={descId}>
        <caption className="sr-only">{t('stats.tableCaption', { type: tableTypeLabel })}</caption>
        <thead>
          <tr>
            <SortHeader columnKey="name" label={nameLabel} sort={sort} onSort={onSort} />
            <SortHeader columnKey="avgPlacement" label={t('stats.colAvgPlace')} sort={sort} onSort={onSort} />
            <SortHeader columnKey="winRate" label={t('stats.colWinRate')} sort={sort} onSort={onSort} />
            <SortHeader columnKey="frequency" label={t('stats.colFrequency')} sort={sort} onSort={onSort} />
            {type === 'traits' && <th scope="col">{t('stats.colAvgUnits')}</th>}
            <th scope="col">{popularLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const avgValue = formatAvg(row.avgPlacement)
            const avgQuality = t(`stats.metric.${getAvgPlacementQualityKey(row.avgPlacement)}`)
            const winRateValue = formatPercent(row.winRate)
            const winRateQuality = t(`stats.metric.${getWinRateQualityKey(row.winRate)}`)

            return (
            <tr key={row.id}>
              <th scope="row" className={styles.rowHeader}>
                <HoverableNameCell type={type} row={row} allItems={allItems} allChampions={allChampions} />
              </th>
              <td
                className={`${styles.avg} ${styles.metricValue}`}
                style={{ '--metric-color': getAvgPlacementColor(row.avgPlacement) }}
                aria-label={`${t('stats.colAvgPlace')}: ${avgValue}. ${t('stats.metricLabel')}: ${avgQuality}`}
              >
                {avgValue}
                <span className={styles.metricLabel}>{avgQuality}</span>
              </td>
              <td
                className={styles.metricValue}
                style={{ '--metric-color': getWinRateColor(row.winRate) }}
                aria-label={`${t('stats.colWinRate')}: ${winRateValue}. ${t('stats.metricLabel')}: ${winRateQuality}`}
              >
                {winRateValue}
                <span className={styles.metricLabel}>{winRateQuality}</span>
              </td>
              <td>
                <span>{row.count.toLocaleString()}</span>
                <span className={styles.frequency}>{formatPercent(row.frequency)}</span>
              </td>
              {type === 'traits' && <td>{formatAvg(row.avgUnits)}</td>}
              <td>
                <PopularIcons
                  entries={type === 'units' ? row.popularItems : row.popularUnits}
                  map={popularMap}
                  emptyLabel={type === 'units' ? t('stats.noItems') : t('stats.noUnits')}
                  popularCardType={popularCardType}
                  allItems={allItems}
                />
              </td>
            </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function StatsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('units')
  const [selectedPatch, setSelectedPatch] = useState(null)
  const [query, setQuery] = useState('')
  const [costFilter, setCostFilter] = useState(null)
  const [itemCategory, setItemCategory] = useState('craftable')
  const [sort, setSort] = useState(DEFAULT_SORT)
  const { data: champions } = useChampions()
  const { data: items } = useItems()
  const { data: traits } = useTraits()
  const { data, isLoading, isError } = useStats({ type: activeTab, patch: selectedPatch })

  const maps = useMemo(() => ({
    champions: makeMap(champions),
    items: makeMap(items),
    traits: makeMap(traits),
  }), [champions, items, traits])

  const rows = useMemo(() => {
    const assetMap = activeTab === 'units' ? maps.champions : activeTab === 'items' ? maps.items : maps.traits
    const needle = normalizeName(query)
    return (data?.rows || [])
      .map(row => {
        if (activeTab === 'traits') {
          const traitId = row.traitId || row.id
          const meta = maps.traits.get(traitId)
          const { minUnits, style } = getTraitTierInfo(meta, row.tier)
          const baseName = meta?.name || traitId
          const name = minUnits != null ? `${minUnits} ${baseName}` : baseName
          return { ...row, meta, name, tierStyle: style, tierMin: minUnits }
        }
        const meta = assetMap.get(row.id)
        return { ...row, meta, name: meta?.name || row.id }
      })
      .filter(row => activeTab !== 'items' || row.id !== 'TFT_Item_EmptyBag')
      .filter(row => activeTab !== 'items' || (row.meta?.category || 'other') === itemCategory)
      .filter(row => !needle || normalizeName(row.name).includes(needle) || normalizeName(row.id).includes(needle))
      .filter(row => activeTab !== 'units' || !costFilter || row.meta?.cost === costFilter)
      .sort((a, b) => compareRows(a, b, sort))
  }, [activeTab, costFilter, data?.rows, itemCategory, maps, query, sort])

  const handleSort = columnKey => {
    setSort(current => {
      if (current.key === columnKey) {
        return { key: columnKey, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key: columnKey, direction: SORT_DEFAULTS[columnKey] || 'asc' }
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{t('stats.eyebrow')}</p>
          <h1 className={styles.title}>{t('stats.title')}</h1>
        </div>
        <div className={styles.meta}>{t('stats.gamesAnalyzed', { count: (data?.matchCount || 0).toLocaleString() })}</div>
      </div>
      <Toolbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        patch={data?.patch || selectedPatch}
        patches={data?.patches || []}
        setPatch={setSelectedPatch}
        query={query}
        setQuery={setQuery}
        costFilter={costFilter}
        setCostFilter={setCostFilter}
        itemCategory={itemCategory}
        setItemCategory={setItemCategory}
      />
      {isLoading && <p className={styles.message} role="status" aria-live="polite">{t('stats.loading')}</p>}
      {isError && <p className={styles.message} role="alert">{t('stats.error')}</p>}
      {!isLoading && !isError && rows.length === 0 && <p className={styles.message} role="status">{t('stats.empty')}</p>}
      {rows.length > 0 && (
        <StatsTable
          type={activeTab}
          rows={rows}
          maps={maps}
          sort={sort}
          onSort={handleSort}
          allItems={items}
          allChampions={champions}
        />
      )}
    </div>
  )
}
