import React from 'react'
import ArtworksTable from './components/ArtworksTable'

export default function App() {
  return (
    <div className="app-container">
      <header className="header">
        <h1>Art Institute of Chicago - Artworks</h1>
      </header>

      <main className="content">
        <div className="card">
          <ArtworksTable />
        </div>
      </main>

      <footer className="footer">Built with PrimeReact • Responsive layout</footer>
    </div>
  )
}
