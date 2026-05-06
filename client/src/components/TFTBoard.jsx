import { useState, useRef, useEffect } from 'react'
import DroppableHex from "./DroppableHex.jsx";
import DraggableUnit from "./DraggableUnit.jsx";
import EquippedItems from "./EquippedItems.jsx";
import styles from "./TFTBoard.module.css";

const ROWS = 4;
const COLS = 7;
const MAX_HEX_SIZE = 90;
const MIN_HEX_SIZE = 38;
const HEX_GAP = 10;

// BOARD_WIDTH = (COLS + 2)*HEX_GAP + (COLS + 0.5)*hexSize
// Solve for hexSize given available container width (minus 20px padding).
function calcHexSize(wrapperWidth) {
  const available = wrapperWidth - 20;
  const size = (available - (COLS + 2) * HEX_GAP) / (COLS + 0.5);
  return Math.min(MAX_HEX_SIZE, Math.max(MIN_HEX_SIZE, Math.floor(size)));
}

export default function TFTBoard({
  board,
  champions,
  items,
  onToggleStars,
  onRemoveUnit,
  onRemoveItem,
}) {
  const wrapperRef = useRef(null);
  const [hexSize, setHexSize] = useState(MAX_HEX_SIZE);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setHexSize(calcHexSize(entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const horizSpacing = hexSize + HEX_GAP;
  const vertSpacing = hexSize * 0.75 + HEX_GAP;
  const rowOffset = horizSpacing / 2;
  const boardWidth = (COLS + 2) * HEX_GAP + (COLS + 0.5) * hexSize;
  const boardHeight = vertSpacing * 3 + hexSize + HEX_GAP * 2;

  return (
    <div
      ref={wrapperRef}
      className={styles.boardWrapper}
      style={{ height: boardHeight + 60 }}
    >
      <div className={styles.board} style={{ width: boardWidth, height: boardHeight }}>
        {Array.from({ length: ROWS }, (_, row) =>
          Array.from({ length: COLS }, (_, col) => {
            const cellId = `cell-${row}-${col}`;
            const left =
              HEX_GAP + col * horizSpacing + (row % 2 === 1 ? rowOffset : 0);
            const top = row * vertSpacing + HEX_GAP;

            const unit = board[cellId];
            const champion = unit
              ? champions?.find((c) => c.id === unit.championId)
              : null;

            return (
              <div
                key={cellId}
                className={styles.cellWrap}
                style={{
                  left,
                  top,
                  width: hexSize,
                  height: hexSize,
                }}
              >
                <DroppableHex cellId={cellId} size={hexSize}>
                  {champion && (
                    <>
                      <DraggableUnit
                        id={`board-${cellId}`}
                        champion={champion}
                        variant="hex"
                        fillParent
                        stars={!!unit.stars}
                        onClick={() => onToggleStars?.(cellId)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          onRemoveUnit?.(cellId);
                        }}
                      />
                      <div className={styles.unitName}>{champion.name}</div>
                    </>
                  )}
                </DroppableHex>

                {champion && unit.stars && (
                  <div className={styles.starBadge} aria-hidden="true">
                    <span className={styles.badgeStar}>★</span>
                    <span className={styles.badgeStar}>★</span>
                    <span className={styles.badgeStar}>★</span>
                  </div>
                )}

                {champion && unit.items?.length > 0 && (
                  <EquippedItems
                    itemIds={unit.items}
                    items={items || []}
                    onRemove={(itemId) => onRemoveItem?.(cellId, itemId)}
                  />
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
