# artic-prime-react

React + TypeScript + Vite project using PrimeReact to show Art Institute of Chicago artworks with server-side pagination and persistent selection across pages.

## Setup

1. Install dependencies

```powershell
cd "c:\Users\hp\Desktop\Page\artic-prime-react"
npm install
```

2. Run dev server

```powershell
npm run dev
```

Open the URL shown by Vite (usually http://localhost:5173).

## Notes
- Uses PrimeReact, PrimeFlex and PrimeIcons for layout and UI.
- Axios is used for API calls.
- Toast shows errors and success messages.
- Server-side pagination (page query param) — does not prefetch other pages.
