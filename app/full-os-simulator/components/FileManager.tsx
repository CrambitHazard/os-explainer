'use client'

import Icon from '../../components/Icon'

interface VirtualFile {
  name: string
  size: string
  type: 'file' | 'directory'
  inode: string
  created: string
}

interface Props {
  files: VirtualFile[]
}

export default function FileManager({ files }: Props) {
  return (
    <div className="file-manager">
      <div className="manager-header">
        <h3><Icon name="folder" size={18} /> File System</h3>
        <span className="file-count">{files.length} files</span>
      </div>

      {files.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Icon name="folder" size={32} /></div>
          <p>No files created yet</p>
        </div>
      ) : (
        <div className="files-table-container">
          <table className="files-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Inode</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <tr key={index}>
                  <td className="file-name-cell">
                    <span className="file-icon">
                      {file.type === 'directory' ? <Icon name="folder" size={14} /> : <Icon name="file" size={14} />}
                    </span>
                    {file.name}
                  </td>
                  <td>{file.type}</td>
                  <td>{file.size}</td>
                  <td className="inode-cell">{file.inode}</td>
                  <td className="time-cell">{file.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

