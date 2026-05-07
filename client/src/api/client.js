import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')

const api = axios.create({
  baseURL: API_BASE_URL || undefined,
})

export async function apiGet(url, config) {
  const response = await api.get(url, config)
  return response.data
}

export async function apiPost(url, data, config) {
  const response = await api.post(url, data, config)
  return response.data
}
