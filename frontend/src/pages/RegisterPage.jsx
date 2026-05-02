import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await registerUser(username, email, password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Kayıt başarısız');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Kayıt Ol</h2>
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="text"
            placeholder="Kullanıcı adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit">Kayıt Ol</button>
        </form>
        <p style={styles.link}>
          Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', backgroundColor: '#f0f2f5',
  },
  card: {
    backgroundColor: '#fff', padding: '40px', borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '360px',
  },
  title: {
    textAlign: 'center', marginBottom: '24px', color: '#333',
  },
  input: {
    width: '100%', padding: '10px 12px', marginBottom: '14px',
    border: '1px solid #ccc', borderRadius: '6px', fontSize: '14px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%', padding: '10px', backgroundColor: '#4f46e5',
    color: '#fff', border: 'none', borderRadius: '6px',
    fontSize: '15px', cursor: 'pointer',
  },
  error: { color: 'red', fontSize: '13px', marginBottom: '10px' },
  link: { textAlign: 'center', marginTop: '16px', fontSize: '13px' },
};

export default RegisterPage;
