import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerUser(username, email, password);
      navigate('/login');
    } catch (err) {
      if (!err.response) {
        setError('Could not connect to server. Make sure all services are running.');
      } else {
        setError(err.response.data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>{'</>'}</div>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join the collaborative code reviewer</p>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <input
            style={styles.input}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p style={styles.link}>
          Already have an account? <Link to="/login" style={styles.linkAnchor}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', backgroundColor: '#0f0f1a',
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    backgroundColor: '#13131f', padding: '36px 36px', borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)', width: '380px',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  logo: {
    width: '44px', height: '44px', borderRadius: '11px',
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 'bold', fontSize: '15px',
    marginBottom: '16px',
  },
  title: {
    textAlign: 'center', marginBottom: '6px', color: '#f1f5f9',
    fontSize: '22px', fontWeight: '800',
  },
  subtitle: {
    color: '#64748b', fontSize: '13px', marginBottom: '24px', textAlign: 'center',
  },
  input: {
    width: '100%', padding: '11px 13px', marginBottom: '12px',
    backgroundColor: 'rgba(255,255,255,0.06)', color: '#e2e8f0',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none',
  },
  button: {
    width: '100%', padding: '12px',
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 0 16px rgba(124,58,237,0.4)', marginTop: '2px',
  },
  error: { color: '#f87171', fontSize: '12px', marginBottom: '10px', width: '100%' },
  link: { textAlign: 'center', marginTop: '18px', fontSize: '13px', color: '#64748b' },
  linkAnchor: { color: '#a78bfa', fontWeight: '600', textDecoration: 'none' },
};

export default RegisterPage;
