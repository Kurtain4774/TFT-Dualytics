import { useDraggable } from '@dnd-kit/core'
import ItemIcon from './ItemIcon.jsx'

export default function DraggableItem({ id, item, size = 42 }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id })

  const wrapperStyle = {
    opacity: isDragging ? 0 : 1,
    cursor: 'grab',
    touchAction: 'none',
  }

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={wrapperStyle}>
      <ItemIcon item={item} size={size} />
    </div>
  )
}
