import styles from '../styles/WorkspaceCard.module.css';

export default function WorkspaceCard({ workspace, currentUserId, onEdit, onDelete }) {
  const isOwner = workspace.owner?._id === currentUserId || workspace.owner === currentUserId;
  const taskCount = workspace.tasks?.length ?? 0;
  const memberCount = workspace.members?.length ?? 1;

  const initials = workspace.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.meta}>
          <h3 className={styles.name}>{workspace.name}</h3>
          <p className={styles.owner}>
            {isOwner ? 'You' : workspace.owner?.name} · {memberCount} member{memberCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {workspace.description && (
        <p className={styles.description}>{workspace.description}</p>
      )}

      <div className={styles.footer}>
        <span className={styles.badge}>{taskCount} task{taskCount !== 1 ? 's' : ''}</span>
        {isOwner && (
          <div className={styles.actions}>
            <button className="btn-ghost" onClick={() => onEdit(workspace)} style={{ padding: '0.35rem 0.75rem' }}>
              Edit
            </button>
            <button className="btn-danger" onClick={() => onDelete(workspace)} style={{ padding: '0.35rem 0.75rem' }}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
