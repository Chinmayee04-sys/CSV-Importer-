'use client';

import { useState, useCallback } from 'react';
import UploadStep from '../components/UploadStep';
import PreviewTable from '../components/PreviewTable';
import ResultTable from '../components/ResultTable';
import LoadingOverlay from '../components/LoadingOverlay';
import { parseCsv, importCsv } from '../lib/api';

const STEP_LABELS = ['Upload', 'Preview', 'Results'];

export default function Home() {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileSelected = useCallback((f) => {
    setFile(f);
    setPreview(null);
    setResult(null);
    setError('');
    setStep(0);
  }, []);

  const handleParse = async () => {
    if (!file) return;
    setLoading(true);
    setLoadingMessage('Parsing CSV...');
    setError('');
    try {
      const data = await parseCsv(file);
      if (data.records && data.records.length > 0) {
        setPreview(data);
        setStep(1);
      } else {
        setError('CSV file appears to be empty or has no valid records.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setLoadingMessage('AI is extracting CRM fields...');
    setError('');
    try {
      const data = await importCsv(file);
      setResult(data);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    setStep(0);
  };

  const columns = preview?.records?.[0]
    ? Object.keys(preview.records[0])
    : [];

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>GrowEasy CSV Importer</h1>
        <p>Upload any CSV — AI maps it to CRM fields automatically</p>
      </div>

      <div className="steps">
        {STEP_LABELS.map((label, i) => (
          <div
            key={i}
            className={`step ${step === i ? 'active' : ''} ${step > i ? 'completed' : ''}`}
          >
            <span className="step-number">{step > i ? '✓' : i + 1}</span>
            {label}
          </div>
        ))}
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      <UploadStep onFileSelected={handleFileSelected} />

      {file && preview === null && (
        <div className="action-bar">
          <button className="btn btn-primary" onClick={handleParse}>
            Preview CSV
          </button>
        </div>
      )}

      {preview && step >= 1 && (
        <div className="card">
          <h2>Preview — {preview.total} records found</h2>
          <PreviewTable records={preview.records} columns={columns} />
          <div className="action-bar">
            <button className="btn btn-outline" onClick={handleReset}>
              Upload Different File
            </button>
            <button className="btn btn-success" onClick={handleImport}>
              Confirm & Import
            </button>
          </div>
        </div>
      )}

      {result && step >= 2 && (
        <div className="card">
          <h2>Import Results</h2>
          <div className="result-summary">
            <div className="stat-card success">
              <div className="stat-value">{result.totalImported}</div>
              <div className="stat-label">Imported</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-value">{result.totalSkipped}</div>
              <div className="stat-label">Skipped</div>
            </div>
            <div className="stat-card info">
              <div className="stat-value">{result.totalRecords}</div>
              <div className="stat-label">Total Records</div>
            </div>
          </div>
          <ResultTable records={result.imported} />
          <div className="action-bar">
            <button className="btn btn-primary" onClick={handleReset}>
              Import Another File
            </button>
          </div>
        </div>
      )}

      {loading && <LoadingOverlay message={loadingMessage} />}
    </div>
  );
}
