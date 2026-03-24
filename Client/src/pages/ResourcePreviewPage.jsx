import React, { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Download, ExternalLink, FileText } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import mammoth from 'mammoth'

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || `${window.location.protocol}//${window.location.hostname}:5000`
const API_BASE = `${API_ORIGIN}/api/resources`

const getAuthHeaders = () => {
  const token = (localStorage.getItem('token') || '').replace(/[\r\n"]/g, '')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

const getFileUrl = (filePath) => {
  if (!filePath) return ''
  const normalized = String(filePath).replace(/\\/g, '/')

  // If DB stores an absolute filesystem path (e.g. /Users/.../uploads/resources/file.pdf),
  // map it to the public static route served by Express: /uploads/...
  const uploadsMarker = '/uploads/'
  const uploadsIndex = normalized.indexOf(uploadsMarker)
  if (uploadsIndex !== -1) {
    const publicPath = normalized.slice(uploadsIndex)
    return `${API_ORIGIN}${publicPath}`
  }

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized
  if (normalized.startsWith('/')) return `${API_ORIGIN}${normalized}`
  return `${API_ORIGIN}/${normalized}`
}

const getExtension = (url) => {
  const clean = url.split('?')[0]
  const parts = clean.split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

export default function ResourcePreviewPage() {
  const navigate = useNavigate()
  const { resourceId } = useParams()

  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const [docxHtml, setDocxHtml] = useState('')
  const [docxError, setDocxError] = useState('')
  const [docxLoading, setDocxLoading] = useState(false)

  useEffect(() => {
    const loadResource = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/${resourceId}`, {
          headers: getAuthHeaders(),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(data.message || 'Failed to load resource.')
        }
        setResource(data)
      } catch (err) {
        setError(err.message || 'Unable to load resource preview.')
      } finally {
        setLoading(false)
      }
    }

    if (resourceId) loadResource()
  }, [resourceId])

  const fileUrl = useMemo(() => getFileUrl(resource?.filePath), [resource])
  const extension = useMemo(() => getExtension(fileUrl), [fileUrl])
  const isOfficeFile = useMemo(() => ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(extension), [extension])
  const officeViewerUrl = useMemo(() => {
    if (!fileUrl || !isOfficeFile) return ''
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`
  }, [fileUrl, isOfficeFile])

  const previewType = useMemo(() => {
    if (resource?.type === 'link' && resource?.externalLink) return 'link'

    if (resource?.type === 'video' || ['mp4', 'webm', 'mov'].includes(extension)) return 'video'
    if (['pdf'].includes(extension)) return 'pdf'
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) return 'image'
    if (['txt', 'md', 'csv', 'log', 'json'].includes(extension)) return 'text'

    // Render DOCX files as HTML with mammoth.
    if (extension === 'docx') return 'docx'

    // Office and other binary files often trigger immediate browser download if embedded.
    // Keep these as manual-download only to avoid automatic download behavior.
    if (['doc', 'ppt', 'pptx', 'xls', 'xlsx', 'zip', 'rar'].includes(extension)) return 'unsupported'
    if (['document', 'presentation', 'other'].includes(resource?.type || '')) return 'unsupported'

    if (fileUrl) return 'unsupported'
    return 'none'
  }, [resource, extension, fileUrl])

  useEffect(() => {
    const renderDocxPreview = async () => {
      if (previewType !== 'docx' || !fileUrl) {
        setDocxHtml('')
        setDocxError('')
        setDocxLoading(false)
        return
      }

      setDocxLoading(true)
      setDocxError('')
      setDocxHtml('')

      try {
        const res = await fetch(fileUrl)
        if (!res.ok) throw new Error('Unable to load DOCX file.')
        const arrayBuffer = await res.arrayBuffer()
        const result = await mammoth.convertToHtml({ arrayBuffer })
        setDocxHtml(result.value || '<p>No preview content available.</p>')
      } catch (err) {
        setDocxError(err.message || 'DOCX preview failed.')
      } finally {
        setDocxLoading(false)
      }
    }

    renderDocxPreview()
  }, [previewType, fileUrl])

  const handleFinalDownload = async () => {
    if (!resource || !fileUrl) return

    setDownloading(true)
    try {
      await fetch(`${API_BASE}/${resource._id || resource.id}/download`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })

      const response = await fetch(fileUrl)
      if (!response.ok) throw new Error('Failed to fetch file for download.')

      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = blobUrl
      const inferredName = (resource.filePath || '').split('/').pop() || `${resource.title || 'resource'}-file`
      anchor.download = inferredName
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      alert(err.message || 'Download failed.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/student?view=resources')}
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Resources
          </button>
          <button
            type="button"
            onClick={handleFinalDownload}
            disabled={!fileUrl || downloading}
            className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? 'Downloading...' : 'Download Resource'}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
          {loading ? (
            <p className="text-sm text-slate-500">Loading preview...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : !resource ? (
            <p className="text-sm text-slate-500">Resource not found.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{resource.title}</h1>
                <p className="mt-1 text-sm text-slate-500">{resource.description || 'No description provided.'}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                Type: {resource.type || '-'} | Size: {resource.fileSize ? `${Math.round((resource.fileSize / 1024) * 100) / 100} KB` : '-'}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white min-h-[70vh] overflow-hidden">
                {previewType === 'pdf' ? (
                  <iframe title="PDF Preview" src={fileUrl} className="w-full h-[70vh]" />
                ) : previewType === 'image' ? (
                  <div className="h-[70vh] grid place-items-center bg-slate-100">
                    <img src={fileUrl} alt={resource.title} className="max-h-full max-w-full object-contain" />
                  </div>
                ) : previewType === 'video' ? (
                  <video src={fileUrl} controls className="w-full h-[70vh] bg-black" />
                ) : previewType === 'text' ? (
                  <iframe title="Text Preview" src={fileUrl} className="w-full h-[70vh]" />
                ) : previewType === 'docx' ? (
                  <div className="h-[70vh] overflow-auto p-6 bg-white">
                    {docxLoading ? (
                      <p className="text-sm text-slate-500">Loading DOCX preview...</p>
                    ) : docxError ? (
                      <p className="text-sm text-red-600">{docxError}</p>
                    ) : (
                      <div
                        className="prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{ __html: docxHtml }}
                      />
                    )}
                  </div>
                ) : previewType === 'link' ? (
                  <div className="h-[70vh] grid place-items-center p-6 text-center">
                    <div>
                      <FileText className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                      <p className="text-sm text-slate-600 mb-3">External resource link detected.</p>
                      <a
                        href={resource.externalLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" /> Open Link
                      </a>
                    </div>
                  </div>
                ) : previewType === 'unsupported' ? (
                  <div className="h-[70vh] grid place-items-center p-6 text-center">
                    <div>
                      <FileText className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                      <p className="text-sm text-slate-600">Inline preview is not available for this file type.</p>
                      <p className="text-xs text-slate-500 mt-1">For editable docs, upload as .docx for inline preview. Otherwise use Download Resource.</p>
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                        {fileUrl ? (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Open File
                          </a>
                        ) : null}
                        {officeViewerUrl ? (
                          <a
                            href={officeViewerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Try Office Viewer
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[70vh] grid place-items-center p-6 text-center">
                    <div>
                      <FileText className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                      <p className="text-sm text-slate-600">Preview is not available for this file type.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
