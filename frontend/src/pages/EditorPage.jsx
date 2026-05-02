import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';

function EditorPage() {
  const [language, setLanguage] = useState('javascript');
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleAnalyze = () => {
    alert('Analiz servisi bağlanıyor...');
  };

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <span style={styles.navTitle}>Code Reviewer</span>
        <div style={styles.navRight}>
          <span style={styles.username}>{username}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Çıkış</button>
        </div>
      </nav>

      <div style={styles.toolbar}>
        <select
          style={styles.select}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
        <button style={styles.analyzeBtn} onClick={handleAnalyze}>
          Analiz Et
        </button>
      </div>

      <div style={styles.editorWrapper}>
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          defaultValue="// Kodunuzu buraya yazın..."
          options={{ fontSize: 14, minimap: { enabled: false } }}
        />
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex', flexDirection: 'column',
    height: '100vh', backgroundColor: '#1e1e1e',
  },
  navbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#252526', padding: '0 20px', height: '50px',
    borderBottom: '1px solid #3c3c3c',
  },
  navTitle: { color: '#fff', fontWeight: 'bold', fontSize: '16px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  username: { color: '#ccc', fontSize: '14px' },
  logoutBtn: {
    padding: '6px 14px', backgroundColor: '#f44747',
    color: '#fff', border: 'none', borderRadius: '4px',
    cursor: 'pointer', fontSize: '13px',
  },
  toolbar: {
    display: 'flex', alignItems: 'center', gap: '12px',
    backgroundColor: '#2d2d2d', padding: '8px 20px',
    borderBottom: '1px solid #3c3c3c',
  },
  select: {
    padding: '6px 10px', backgroundColor: '#3c3c3c',
    color: '#fff', border: '1px solid #555', borderRadius: '4px',
    fontSize: '13px', cursor: 'pointer',
  },
  analyzeBtn: {
    padding: '6px 16px', backgroundColor: '#4f46e5',
    color: '#fff', border: 'none', borderRadius: '4px',
    cursor: 'pointer', fontSize: '13px',
  },
  editorWrapper: { flex: 1 },
};

export default EditorPage;
