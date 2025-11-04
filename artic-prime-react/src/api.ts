import axios from 'axios'
import type { ArtworksApiResponse } from './types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000
})

export async function fetchArtworks(page = 1): Promise<ArtworksApiResponse> {
  const res = await api.get(`/artworks`, { params: { page } })
  return res.data as ArtworksApiResponse
}
