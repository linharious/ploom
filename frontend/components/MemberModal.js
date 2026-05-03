import { useState } from 'react';
import styles from '../styles/Modal.module.css';

export default function MemberModal({ onClose, onAdd }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onAdd(email);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Invite Member</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}
          <div className="form-group">
            <label>User Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@example.com"
              required
            />
          </div>

          <div className={styles.footer}>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn-ghost" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add to Workspace'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
