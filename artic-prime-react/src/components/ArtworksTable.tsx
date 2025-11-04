import React, { useEffect, useState, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { OverlayPanel } from 'primereact/overlaypanel'
import { InputNumber } from 'primereact/inputnumber'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Toast } from 'primereact/toast'
import type { Artwork } from '../types'
import { fetchArtworks } from '../api'


export default function ArtworksTable() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(false)

  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const [selectedRowsOnPage, setSelectedRowsOnPage] = useState<Artwork[]>([])

  const overlayRef = useRef<OverlayPanel | null>(null)
  const [nValue, setNValue] = useState<number | null>(null)

  const toast = useRef<Toast | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetchArtworks(page)
        if (cancelled) return
        const data = (res?.data || []).map((item: any) => ({
          id: item.id,
          title: item.title ?? 'N/A',
          place_of_origin: item.place_of_origin ?? 'N/A',
          artist_display: item.artist_display ?? 'N/A',
          inscriptions: item.inscriptions ?? 'N/A',
          date_start: item.date_start ?? null,
          date_end: item.date_end ?? null
        })) as Artwork[]
        setArtworks(data)
        if (res?.pagination) {
          setTotalPages(res.pagination.total_pages ?? undefined)
        }
        const selectedOnThisPage = data.filter(d => selectedIds.includes(d.id))
        setSelectedRowsOnPage(selectedOnThisPage)
      } catch (err: any) {
        console.error(err)
        toast.current?.show({ severity: 'error', summary: 'Error', detail: err?.message ?? 'Failed to fetch artworks', life: 5000 })
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [page])

  const onSelectionChange = (e: { value: Artwork[] }) => {
    const newlySelectedOnPage = (e.value || []).map((r: Artwork) => r.id)
    const currentPageIds = artworks.map(a => a.id)

    const remaining = selectedIds.filter(id => !currentPageIds.includes(id))

    const merged = [...remaining, ...newlySelectedOnPage]
    setSelectedIds(merged)
    setSelectedRowsOnPage(e.value || [])
  }

  const onPage = (event: any) => {
    const newPage = (event.page ?? 0) + 1
    setPage(newPage)
  }

  const selectNRows = (n: number | null) => {
    if (n == null) return
    if (loading) {
      toast.current?.show({ severity: 'warn', summary: 'Please wait', detail: 'Data is still loading', life: 3000 })
      return
    }
    const totalOnPage = artworks.length
    if (n <= 0) {
      toast.current?.show({ severity: 'error', summary: 'Invalid number', detail: 'Please enter a positive number', life: 4000 })
      return
    }
    if (n > totalOnPage) {
      toast.current?.show({ severity: 'error', summary: 'Too large', detail: `There are only ${totalOnPage} rows on this page`, life: 4000 })
      return
    }
    const firstN = artworks.slice(0, n).map(a => a.id)
    const setIds = new Set([...selectedIds.filter(id => !artworks.map(a=>a.id).includes(id)), ...firstN])
    const merged = Array.from(setIds)
    setSelectedIds(merged)
    const selectedOnThisPage = artworks.filter(a => firstN.includes(a.id))
    setSelectedRowsOnPage(selectedOnThisPage)
    toast.current?.show({ severity: 'success', summary: 'Selected', detail: `Selected first ${n} rows on this page`, life: 3000 })
    overlayRef.current?.hide()
  }

  const selectionForCurrentPage = artworks.filter(a => selectedIds.includes(a.id))

  return (
    <div>
      <Toast ref={toast} />
      <div className="p-grid p-align-center p-justify-between controls">
        <div>
          <Button label={`Select  Rows`} icon="pi pi-list" onClick={(e) => overlayRef.current?.toggle(e)} disabled={loading} />
          <OverlayPanel ref={overlayRef} id="op" className="overlay-panel-custom" style={{ minWidth: '320px' }}>
            <div className="overlay-title">Select Multiple Rows</div>
            <div className="overlay-subtitle">Enter number of rows to select across all pages</div>

            <div className="overlay-body">
              <div className="overlay-input-row">
                <InputNumber id="nInput" value={nValue} onValueChange={(e) => setNValue(e.value ?? null)} showButtons mode="decimal" min={1} max={artworks.length || 9999} className="overlay-input" />
                <Button label="Select" onClick={() => selectNRows(nValue)} className="overlay-select-btn p-button-primary" />
              </div>

              <div className="overlay-actions">
                <Button label="Cancel" onClick={() => overlayRef.current?.hide()} className="p-button-text" />
              </div>
            </div>
          </OverlayPanel>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span className="p-mr-2">Total Selected:</span>
          <b>{selectedIds.length}</b>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div className="p-card card">
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <ProgressSpinner />
            </div>
          )}

          <DataTable
            value={artworks}
            paginator
            rows={12}
            first={(page - 1) * 12}
            totalRecords={totalPages ? totalPages * 12 : undefined}
            onPage={onPage}
            lazy
            selectionMode="checkbox"
            dataKey="id"
            selection={selectionForCurrentPage}
            onSelectionChange={(e: any) => onSelectionChange(e)}
            emptyMessage={loading ? 'Loading...' : 'No records found'}
            footer={`Page ${page}${totalPages ? ' of ' + totalPages : ''}`}
          >
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
            <Column field="title" header="Title" sortable></Column>
            <Column field="place_of_origin" header="Place of Origin" style={{ width: '160px' }}></Column>
            <Column field="artist_display" header="Artist" style={{ width: '240px' }}></Column>
            <Column field="inscriptions" header="Inscriptions" style={{ width: '220px' }}></Column>
            <Column field="date_start" header="Start Date" style={{ width: '110px' }} body={(row: Artwork) => row.date_start ?? 'N/A'}></Column>
            <Column field="date_end" header="End Date" style={{ width: '110px' }} body={(row: Artwork) => row.date_end ?? 'N/A'}></Column>
          </DataTable>
        </div>
      </div>

    </div>
  )
}
