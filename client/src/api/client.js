import axios from 'axios'

export function apiGet(url, config) {
  return axios.get(url, config).then(response => response.data)
}

export function apiPost(url, data, config) {
  return axios.post(url, data, config).then(response => response.data)
}
