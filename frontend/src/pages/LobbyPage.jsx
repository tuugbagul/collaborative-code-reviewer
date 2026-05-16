import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LobbyPage() {
  const [joinInput, setJoinInput] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleCreateRoom = () => {
    const roomId = generateRoomId();
    navigate(`/editor/${roomId}`);
  };

  const handleJoinRoom = () => {
    const id = joinInput.trim().toUpperCase();
    if (!id) {
      setError('Please enter a Room ID.');
      return;
    }
    if (id.length < 4) {
      setError('Room ID must be at least 4 characters.');
      return;
    }
    navigate(`/editor/${id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <div style={styles.navLogo}>{'</>'}</div>
          <span style={styles.navTitle}>Code Reviewer</span>
        </div>
        <div style={styles.navRight}>
          <div style={{ ...styles.avatar, backgroundColor: avatarColor(username) }}>
            {username?.[0]?.toUpperCase()}
          </div>
          <span style={styles.usernameText}>{username}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      {/* Content */}
      <div style={styles.content}>
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>Start a Session</h1>
          <p style={styles.heroSub}>Create a new room or join an existing one to collaborate in real time.</p>
        </div>

        <div style={styles.cards}>
          {/* Create Room */}
          <div style={styles.card}>
            <div style={styles.cardIcon}>+</div>
            <h2 style={styles.cardTitle}>Create Room</h2>
            <p style={styles.cardDesc}>
              Start a new collaboration session. A unique Room ID will be generated — share it with your teammates.
            </p>
            <button style={styles.createBtn} onClick={handleCreateRoom}>
              Create New Room
            </button>
          </div>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>OR</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Join Room */}
          <div style={styles.card}>
            <div style={{ ...styles.cardIcon, background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}>
              &#8594;
            </div>
            <h2 style={styles.cardTitle}>Join Room</h2>
            <p style={styles.cardDesc}>
              Have a Room ID? Enter it below to join your teammate's session instantly.
            </p>
            <div style={styles.joinRow}>
              <input
                style={styles.joinInput}
                placeholder="Enter Room ID..."
                value={joinInput}
                onChange={(e) => { setJoinInput(e.target.value.toUpperCase()); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                maxLength={10}
              />
              <button style={styles.joinBtn} onClick={handleJoinRoom}>Join</button>
            </div>
            {error && <p style={styles.errorText}>{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

const avatarColor = (name) => {
  const colors = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626'];
  return colors[name?.charCodeAt(0) % colors.length] || '#7c3aed';
};

const styles = {
  page: {
    display: 'flex', flexDirection: 'column', minHeight: '100vh',
    backgroundColor: '#0f0f1a', fontFamily: "'Segoe UI', sans-serif",
  },
  navbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'linear-gradient(135deg, #1a0a2e 0%, #0a1628 100%)',
    padding: '0 24px', height: '52px',
    borderBottom: '1px solid rgba(124, 58, 237, 0.3)',
    boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: '8px' },
  navLogo: {
    width: '30px', height: '30px', borderRadius: '7px',
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 'bold', fontSize: '11px',
  },
  navTitle: { color: '#fff', fontWeight: '700', fontSize: '15px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: {
    width: '30px', height: '30px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: '700', fontSize: '12px',
  },
  usernameText: { color: '#cbd5e1', fontSize: '13px' },
  logoutBtn: {
    padding: '5px 12px', backgroundColor: 'rgba(248,113,113,0.15)',
    color: '#f87171', border: '1px solid rgba(248,113,113,0.3)',
    borderRadius: '7px', cursor: 'pointer', fontSize: '12px',
  },
  content: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: '40px 20px',
  },
  hero: { textAlign: 'center', marginBottom: '40px' },
  heroTitle: {
    fontSize: '36px', fontWeight: '800', color: '#f1f5f9',
    margin: '0 0 10px',
    background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  heroSub: { color: '#64748b', fontSize: '15px', margin: 0 },
  cards: {
    display: 'flex', alignItems: 'stretch', gap: '24px',
    flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '780px',
  },
  card: {
    backgroundColor: '#13131f', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', padding: '28px', flex: '1', minWidth: '280px',
    display: 'flex', flexDirection: 'column', gap: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  },
  cardIcon: {
    width: '44px', height: '44px', borderRadius: '11px',
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: '800', fontSize: '22px',
  },
  cardTitle: { color: '#f1f5f9', fontWeight: '700', fontSize: '18px', margin: 0 },
  cardDesc: { color: '#64748b', fontSize: '13px', lineHeight: '1.6', margin: 0 },
  createBtn: {
    padding: '12px', marginTop: '4px',
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    color: '#fff', border: 'none', borderRadius: '10px',
    cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    boxShadow: '0 0 16px rgba(124,58,237,0.35)',
  },
  joinRow: { display: 'flex', gap: '8px', marginTop: '4px' },
  joinInput: {
    flex: 1, padding: '10px 14px',
    backgroundColor: 'rgba(255,255,255,0.06)', color: '#e2e8f0',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
    fontSize: '14px', outline: 'none', letterSpacing: '2px', fontWeight: '600',
  },
  joinBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
    color: '#fff', border: 'none', borderRadius: '10px',
    cursor: 'pointer', fontSize: '14px', fontWeight: '600',
  },
  errorText: { color: '#f87171', fontSize: '12px', margin: 0 },
  divider: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  dividerLine: { width: '1px', height: '60px', backgroundColor: 'rgba(255,255,255,0.08)' },
  dividerText: { color: '#475569', fontSize: '12px', fontWeight: '600' },
};

export default LobbyPage;
