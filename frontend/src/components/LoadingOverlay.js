'use client';

export default function LoadingOverlay({ message }) {
  return (
    <div className="overlay">
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>{message || 'Processing...'}</p>
      </div>
    </div>
  );
}
