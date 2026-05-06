import styles from './EquippedItems.module.css'

export default function EquippedItems({ itemIds = [], items = [], onRemove }) {
  if (!itemIds.length) return null

  return (
    <div className={styles.row}>
      {itemIds.map(id => {
        const item = items.find(i => i.id === id)
        if (!item) return null
        return (
          <button
            key={id}
            type="button"
            className={styles.slot}
            title={`${item.name} (right-click to remove)`}
            onContextMenu={(e) => {
              e.preventDefault()
              onRemove?.(id)
            }}
          >
            <img src={item.iconUrl} alt={item.name} draggable={false} />
          </button>
        )
      })}
    </div>
  )
}
