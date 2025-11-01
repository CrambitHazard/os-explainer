'use client'

import { FileEntry, AllocationMethod } from '../types'

interface Props {
  files: FileEntry[]
  method: AllocationMethod
  onDelete: (fileId: string) => void
  onAccess: (file: FileEntry) => void
}

export default function FileList({ files, method, onDelete, onAccess }: Props) {
  const getMethodInfo = (file: FileEntry): string => {
    switch (method) {
      case 'contiguous':
        return `Blocks ${file.startBlock}-${(file.startBlock || 0) + file.size - 1}`
      case 'linked':
        return `Start: ${file.startBlock}, Linked chain of ${file.size} blocks`
      case 'indexed':
        return `Index: ${file.indexBlock}, Data: ${file.size} blocks`
      default:
        return ''
    }
  }

  return (
    <div className="file-list">
      <h3>Allocated Files ({files.length})</h3>
      {files.length === 0 ? (
        <div className="empty-state">No files allocated yet</div>
      ) : (
        <div className="files-table">
          {files.map(file => (
            <div key={file.id} className="file-row">
              <div className="file-info">
                <div 
                  className="file-color-indicator" 
                  style={{ backgroundColor: file.color }}
                ></div>
                <div className="file-details">
                  <div className="file-name">{file.name}</div>
                  <div className="file-meta">
                    <span className="file-size">{file.size} blocks</span>
                    <span className="file-location">{getMethodInfo(file)}</span>
                  </div>
                </div>
              </div>
              <div className="file-actions">
                <button 
                  onClick={() => onAccess(file)} 
                  className="btn-access"
                  title="Access file"
                >
                  📂 Access
                </button>
                <button 
                  onClick={() => onDelete(file.id)} 
                  className="btn-delete"
                  title="Delete file"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

