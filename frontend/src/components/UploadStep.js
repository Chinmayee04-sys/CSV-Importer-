'use client';

import { useState, useRef, useCallback } from 'react';

export default function UploadStep({ onFileSelected }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback((f) => {
    if (f && f.name.endsWith('.csv')) {
      setFile(f);
      onFileSelected(f);
    }
  }, [onFileSelected]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  }, [handleFile]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleChange = (e) => {
    const f = e.target.files[0];
    handleFile(f);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="card">
      <h2>Upload CSV File</h2>
      <div
        className={`dropzone ${dragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <div className="dropzone-icon">&#128194;</div>
        <p>Drag & drop your CSV file here, or <span className="browse-link">browse</span></p>
        <p style={{ fontSize: '0.85rem', marginTop: 8, color: 'var(--text-muted)' }}>
          Supports any CSV format
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="file-input"
          onChange={handleChange}
        />
      </div>
      {file && (
        <div className="file-info">
          <span className="file-name">{file.name}</span>
          <span className="file-size">{formatSize(file.size)}</span>
        </div>
      )}
    </div>
  );
}
