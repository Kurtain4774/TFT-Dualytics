import { useContext } from 'react'
import { SettingsContext } from './settingsContext.js'

export function useSettings() {
  return useContext(SettingsContext)
}
