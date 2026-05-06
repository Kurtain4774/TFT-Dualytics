import styles from './ItemIcon.module.css'

export default function ItemIcon({ item, size = 28 }) {
  if (!item || !item.iconUrl) return null
  return (
    <div
      className={styles.icon}
      style={{ width: size, height: size }}
    >
      <img
        src={item.iconUrl}
        alt={item.name}
        className={styles.img}
        loading="lazy"
      />
    </div>
  )
}
