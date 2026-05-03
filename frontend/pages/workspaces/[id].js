import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import TaskModal from '../../components/TaskModal';
import AIGenerateModal from '../../components/AIGenerateModal';
import MemberModal from '../../components/MemberModal';
import Analytics from '../../components/Analytics';
import api from '../../lib/api';
import { connectSocket, disconnectSocket } from '../../lib/socket';
import styles from '../../styles/WorkspaceDetail.module.css';

export default function WorkspaceDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [notification, setNotification] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    setUser(JSON.parse(stored));
  }, [router]);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [wsRes, tasksRes] = await Promise.all([
        api.get(`/api/workspaces/${id}`),
        api.get(`/api/workspaces/${id}/tasks`)
      ]);
      setWorkspace(wsRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      if (err.response?.status === 404) router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time Socket.io for Tasks
  useEffect(() => {
    if (!id) return;
    const socket = connectSocket();

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join:workspace', id);
    });
    
    socket.on('disconnect', () => setConnected(false));

    socket.on('task:created', (task) => {
      setTasks((prev) => {
        if (prev.some((t) => t._id === task._id)) return prev;
        return [task, ...prev];
      });
    });

    socket.on('task:updated', (task) => {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    });

    socket.on('task:deleted', ({ _id }) => {
      setTasks((prev) => prev.filter((t) => t._id !== _id));
    });

    socket.on('workspace:updated', (ws) => {
      if (ws._id === id) setWorkspace(ws);
    });

    socket.on('notification', (data) => {
      setNotification(data.message);
      setTimeout(() => setNotification(null), 4000);
    });

    return () => {
      socket.emit('leave:workspace', id);
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
      socket.off('workspace:updated');
      socket.off('notification');
      disconnectSocket();
    };
  }, [id]);

  const handleCreate = async (form) => {
    const { data } = await api.post(`/api/workspaces/${id}/tasks`, form);
    setTasks((prev) => {
      if (prev.some((t) => t._id === data._id)) return prev;
      return [data, ...prev];
    });
  };

  const handleUpdate = async (form) => {
    const { data } = await api.put(`/api/workspaces/${id}/tasks/${editTarget._id}`, form);
    setTasks((prev) => prev.map((t) => (t._id === data._id ? data : t)));
  };

  const handleDelete = async (task) => {
    await api.delete(`/api/workspaces/${id}/tasks/${task._id}`);
    setTasks((prev) => prev.filter((t) => t._id !== task._id));
  };

  const handleAIGenerate = async (prompt) => {
    try {
      await api.post('/api/ai/generate-tasks', { workspaceId: id, prompt });
      // We don't need to manually update state because tasks will come through socket
      setNotification('AI is generating tasks...');
    } catch (err) {
      alert('Failed to generate tasks. Please ensure API keys are configured.');
    }
  };

  const handleAddMember = async (email) => {
    const { data } = await api.post(`/api/workspaces/${id}/members`, { email });
    setWorkspace(data);
    setNotification('Member added successfully!');
  };

  const openCreate = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (task) => { setEditTarget(task); setModalOpen(true); };

  if (loading || !workspace) {
    return <><Navbar user={user} /><div className={styles.container}>Loading...</div></>;
  }

  const columns = ['To Do', 'In Progress', 'Done'];
  const isOwner = workspace.owner?._id === user?._id || workspace.owner === user?._id;

  return (
    <>
      <Navbar user={user} />
      <main className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{workspace.name}</h1>
            <p className={styles.subtitle}>
              {workspace.description}
              {workspace.description && ' · '}
              {workspace.members?.length || 0} member{workspace.members?.length !== 1 ? 's' : ''}
              {' · '}
              {connected ? 'Live' : 'Offline'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {isOwner && (
              <button className="btn-ghost" onClick={() => setMemberModalOpen(true)}>
                + Invite
              </button>
            )}
            <button className="btn-secondary" onClick={() => setAiModalOpen(true)} style={{ background: 'linear-gradient(90deg, #a855f7, #ec4899)', color: 'white', border: 'none' }}>
              ✨ Generate with AI
            </button>
            <button className="btn-primary" onClick={openCreate}>+ Add Task</button>
          </div>
        </div>

        <Analytics tasks={tasks} />

        <div className={styles.board}>
          {columns.map(colStatus => (
            <div key={colStatus} className={styles.column}>
              <div className={styles.columnHeader}>
                <span>{colStatus}</span>
                <span className={styles.badge}>
                  {tasks.filter(t => t.status === colStatus).length}
                </span>
              </div>
              
              {tasks.filter(t => t.status === colStatus).map(task => (
                <div key={task._id} className={styles.taskCard} onClick={() => openEdit(task)}>
                  <div className={styles.taskTitle}>{task.title}</div>
                  {task.description && <div className={styles.taskDesc}>{task.description}</div>}
                  <div className={styles.taskFooter}>
                    <span className={`${styles.priority} ${styles['priority' + task.priority]}`}>
                      {task.priority}
                    </span>
                    {task.assignee && (
                      <span className={styles.assignee}>
                        👤 {task.assignee.name.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>

      {modalOpen && (
        <TaskModal
          task={editTarget}
          workspace={workspace}
          onClose={() => setModalOpen(false)}
          onSave={editTarget ? handleUpdate : handleCreate}
          onDelete={handleDelete}
        />
      )}

      {aiModalOpen && (
        <AIGenerateModal
          onClose={() => setAiModalOpen(false)}
          onGenerate={handleAIGenerate}
        />
      )}

      {memberModalOpen && (
        <MemberModal
          onClose={() => setMemberModalOpen(false)}
          onAdd={handleAddMember}
        />
      )}

      {notification && (
        <div className={styles.toast}>
          {notification}
        </div>
      )}
    </>
  );
}
