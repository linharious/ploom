import { useRouter } from 'next/router';
import { disconnectSocket } from '../lib/socket';
import styles from '../styles/Navbar.module.css';

export default function Navbar({ user }) {
  const router = useRouter();

  const handleLogout = () => {
    disconnectSocket();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.brand}>
        <span className={styles.logo}>P</span>
        <span className={styles.brandName}>Ploom</span>
      </div>
      <div className={styles.right}>
        {user && (
          <span className={styles.userName}>{user.name}</span>
        )}
        <button className="btn-ghost" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
