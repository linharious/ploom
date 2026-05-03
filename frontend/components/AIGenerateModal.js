import { useState } from 'react';
import styles from '../styles/Modal.module.css';

export default function AIGenerateModal({ onClose, onGenerate }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    await onGenerate(prompt);
    setLoading(false);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>✨ Generate with AI</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          <div className="form-group">
            <label>Describe what you want to build</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Build a landing page for a new fitness app..."
              rows={4}
              required
            />
          </div>

          <div className={styles.footer}>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn-ghost" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading} style={{ background: 'linear-gradient(90deg, #a855f7, #ec4899)', border: 'none' }}>
                {loading ? 'Generating...' : 'Generate Tasks'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
