import { create } from 'zustand'

const STORAGE_KEY = 'tft.bookmarks.v1'

function loadInitial() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(b => b && b.gameName && b.tagLine && b.region)
  } catch {
    return []
  }
}

function persist(bookmarks) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks))
  } catch {
    // ignore quota / privacy-mode errors
  }
}

const keyOf = (b) =>
  `${b.gameName.toLowerCase()}#${b.tagLine.toLowerCase()}@${b.region.toLowerCase()}`

export const useBookmarkStore = create((set, get) => ({
  bookmarks: loadInitial(),

  hasBookmark: ({ gameName, tagLine, region }) => {
    if (!gameName || !tagLine || !region) return false
    const target = keyOf({ gameName, tagLine, region })
    return get().bookmarks.some(b => keyOf(b) === target)
  },

  addBookmark: ({ gameName, tagLine, region }) => {
    if (!gameName || !tagLine || !region) return
    const entry = { gameName, tagLine, region: region.toLowerCase(), addedAt: Date.now() }
    set((state) => {
      const target = keyOf(entry)
      if (state.bookmarks.some(b => keyOf(b) === target)) return {}
      const next = [...state.bookmarks, entry]
      persist(next)
      return { bookmarks: next }
    })
  },

  removeBookmark: ({ gameName, tagLine, region }) => {
    set((state) => {
      const target = keyOf({ gameName, tagLine, region })
      const next = state.bookmarks.filter(b => keyOf(b) !== target)
      if (next.length === state.bookmarks.length) return {}
      persist(next)
      return { bookmarks: next }
    })
  },

  clearAll: () => {
    persist([])
    set({ bookmarks: [] })
  },
}))
