import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import WorkspaceCard from '../components/WorkspaceCard';
import WorkspaceModal from '../components/WorkspaceModal';
import api from '../lib/api';
import { connectSocket, disconnectSocket } from '../lib/socket';
import styles from '../styles/Dashboard.module.css';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    setUser(JSON.parse(stored));
  }, [router]);

  const fetchWorkspaces = useCallback(async () => {
    try {
      const { data } = await api.get('/api/workspaces');
      setWorkspaces(data);
    } catch {
      // auth interceptor handles 401 redirects
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Real-time Socket.io
  useEffect(() => {
    const socket = connectSocket();

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('workspace:created', (ws) => {
      setWorkspaces((prev) => {
        if (prev.some((w) => w._id === ws._id)) return prev;
        return [ws, ...prev];
      });
    });

    socket.on('workspace:updated', (ws) => {
      setWorkspaces((prev) => prev.map((w) => (w._id === ws._id ? ws : w)));
    });

    socket.on('workspace:deleted', ({ _id }) => {
      setWorkspaces((prev) => prev.filter((w) => w._id !== _id));
    });

    return () => {
      socket.off('workspace:created');
      socket.off('workspace:updated');
      socket.off('workspace:deleted');
      disconnectSocket();
    };
  }, []);

  const handleCreate = async (form) => {
    const { data } = await api.post('/api/workspaces', form);
    // Optimistic update — socket event will deduplicate
    setWorkspaces((prev) => [data, ...prev]);
  };

  const handleUpdate = async (form) => {
    const { data } = await api.put(`/api/workspaces/${editTarget._id}`, form);
    setWorkspaces((prev) => prev.map((w) => (w._id === data._id ? data : w)));
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/api/workspaces/${deleteTarget._id}`);
    setWorkspaces((prev) => prev.filter((w) => w._id !== deleteTarget._id));
    setDeleteTarget(null);
  };

  const openCreate = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (ws) => { setEditTarget(ws); setModalOpen(true); };

  return (
    <>
      <Navbar user={user} />
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Workspaces</h1>
            <p className={styles.subtitle}>
              {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
              <span className={`${styles.dot} ${connected ? styles.dotOnline : styles.dotOffline}`} />
              {connected ? 'Live' : 'Offline'}
            </p>
          </div>
          <button className="btn-primary" onClick={openCreate}>+ New Workspace</button>
        </div>

        {loading ? (
          <div className={styles.empty}>Loading…</div>
        ) : workspaces.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>🗂️</p>
            <h3>No workspaces yet</h3>
            <p>Create your first workspace to get started</p>
            <button className="btn-primary" onClick={openCreate} style={{ marginTop: '1rem' }}>
              Create Workspace
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {workspaces.map((ws) => (
              <WorkspaceCard
                key={ws._id}
                workspace={ws}
                currentUserId={user?._id}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <WorkspaceModal
          workspace={editTarget}
          onClose={() => setModalOpen(false)}
          onSave={editTarget ? handleUpdate : handleCreate}
        />
      )}

      {deleteTarget && (
        <div className={styles.overlay} onClick={() => setDeleteTarget(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>Delete workspace?</h3>
            <p>
              <strong>{deleteTarget.name}</strong> and all its data will be permanently removed.
              This cannot be undone.
            </p>
            <div className={styles.confirmActions}>
              <button className="btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
