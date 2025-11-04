import axios from 'axios'
import type { ArtworksApiResponse } from './types'

const api = axios.create({
  baseURL: 'https://api.artic.edu/api/v1',
  timeout: 10000
})

export async function fetchArtworks(page = 1): Promise<ArtworksApiResponse> {
  const res = await api.get(`/artworks`, { params: { page } })
  return res.data as ArtworksApiResponse
}
