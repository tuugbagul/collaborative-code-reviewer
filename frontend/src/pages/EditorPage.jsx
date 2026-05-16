import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { io } from 'socket.io-client';

function EditorPage() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('// Kodunuzu buraya yazın...');
  const [issues, setIssues] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  const [roomInput, setRoomInput] = useState('');
  const [roomId, setRoomId] = useState('');
  const [connectedUsers, setConnectedUsers] = useState([]);

  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');

  const socketRef = useRef(null);
  const isRemoteChange = useRef(false);

  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  useEffect(() => {
    const socket = io('http://localhost:3003');
    socketRef.current = socket;

    socket.on('code-change', (newCode) => {
      isRemoteChange.current = true;
      setCode(newCode);
    });

    socket.on('user-joined', ({ username: joined }) => {
      setConnectedUsers((prev) => [...new Set([...prev, joined])]);
    });

    socket.on('user-left', ({ username: left }) => {
      setConnectedUsers((prev) => prev.filter((u) => u !== left));
    });

    socket.on('room-state', ({ currentCode, users }) => {
      isRemoteChange.current = true;
      setCode(currentCode || '// Kodunuzu buraya yazın...');
      setConnectedUsers(users || []);
    });

    socket.on('new-comment', ({ username: commenter, comment }) => {
      setComments((prev) => [...prev, { username: commenter, comment }]);
    });

    return () => socket.disconnect();
  }, []);

  const handleLogout = () => {
    if (socketRef.current) socketRef.current.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleAnalyze = async () => {
    const token = localStorage.getItem('token');
    setAnalyzing(true);
    try {
      const res = await axios.post(
        'http://localhost:3000/api/analyze',
        { language, code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIssues(res.data.issues || []);
    } catch {
      setIssues([{ line: 0, severity: 'error', message: 'Analysis service unavailable.' }]);
    } finally {
      setAnalyzing(false);
    }
  };

  const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const joinRoom = (id) => {
    if (socketRef.current) {
      socketRef.current.emit('join-room', { roomId: id, username });
    }
  };

  const handleCreateRoom = () => {
    const newId = generateRoomId();
    setRoomInput(newId);
    setRoomId(newId);
    joinRoom(newId);
  };

  const handleJoinRoom = () => {
    const id = roomInput.trim();
    if (!id) return;
    setRoomId(id);
    joinRoom(id);
  };

  const handleCodeChange = (newCode) => {
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      setCode(newCode);
      return;
    }
    setCode(newCode);
    if (roomId && socketRef.current) {
      socketRef.current.emit('code-change', { roomId, newCode });
    }
  };

  const handleSendComment = () => {
    const text = commentInput.trim();
    if (!text || !roomId || !socketRef.current) return;
    socketRef.current.emit('send-comment', { roomId, username, comment: text });
    setCommentInput('');
  };

  const severityColor = (severity) => {
    if (severity === 'error') return '#f44747';
    if (severity === 'warning') return '#e5c07b';
    return '#9e9e9e';
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
        <select style={styles.select} value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
        <button style={styles.analyzeBtn} onClick={handleAnalyze} disabled={analyzing}>
          {analyzing ? 'Analyzing...' : 'Analiz Et'}
        </button>
      </div>

      <div style={styles.sessionPanel}>
        <input
          style={styles.roomInput}
          placeholder="Room ID"
          value={roomInput}
          onChange={(e) => setRoomInput(e.target.value)}
        />
        <button style={styles.sessionBtn} onClick={handleCreateRoom}>Create Room</button>
        <button style={styles.sessionBtn} onClick={handleJoinRoom}>Join Room</button>
        {roomId && <span style={styles.roomLabel}>Room: <b>{roomId}</b></span>}
        {connectedUsers.length > 0 && (
          <span style={styles.usersLabel}>Users: {connectedUsers.join(', ')}</span>
        )}
      </div>

      <div style={styles.mainContent}>
        <div style={styles.editorWrapper}>
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={handleCodeChange}
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />
        </div>

        <div style={styles.commentPanel}>
          <div style={styles.commentTitle}>Comments</div>
          <div style={styles.commentList}>
            {comments.map((c, i) => (
              <div key={i} style={styles.commentItem}>
                <span style={styles.commentUser}>{c.username}: </span>
                <span>{c.comment}</span>
              </div>
            ))}
          </div>
          <div style={styles.commentInputArea}>
            <input
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
            />
            <button style={styles.sendBtn} onClick={handleSendComment}>Send</button>
          </div>
        </div>
      </div>

      {issues.length > 0 && (
        <div style={styles.issuesPanel}>
          <div style={styles.issuesTitle}>Issues ({issues.length})</div>
          {issues.map((issue, i) => (
            <div
              key={i}
              style={{ ...styles.issueItem, borderLeft: `3px solid ${severityColor(issue.severity)}` }}
            >
              <span style={{ color: severityColor(issue.severity), fontWeight: 'bold' }}>
                [{issue.severity.toUpperCase()}]
              </span>
              {issue.line > 0 && <span style={styles.issueLineNum}> Line {issue.line}:</span>}
              <span style={styles.issueMsg}> {issue.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#1e1e1e' },
  navbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#252526', padding: '0 20px', height: '50px',
    borderBottom: '1px solid #3c3c3c',
  },
  navTitle: { color: '#fff', fontWeight: 'bold', fontSize: '16px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  username: { color: '#ccc', fontSize: '14px' },
  logoutBtn: {
    padding: '6px 14px', backgroundColor: '#f44747', color: '#fff',
    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px',
  },
  toolbar: {
    display: 'flex', alignItems: 'center', gap: '12px',
    backgroundColor: '#2d2d2d', padding: '8px 20px', borderBottom: '1px solid #3c3c3c',
  },
  select: {
    padding: '6px 10px', backgroundColor: '#3c3c3c', color: '#fff',
    border: '1px solid #555', borderRadius: '4px', fontSize: '13px', cursor: 'pointer',
  },
  analyzeBtn: {
    padding: '6px 16px', backgroundColor: '#4f46e5', color: '#fff',
    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px',
  },
  sessionPanel: {
    display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
    backgroundColor: '#252526', padding: '8px 20px', borderBottom: '1px solid #3c3c3c',
  },
  roomInput: {
    padding: '5px 10px', backgroundColor: '#3c3c3c', color: '#fff',
    border: '1px solid #555', borderRadius: '4px', fontSize: '13px', width: '140px',
  },
  sessionBtn: {
    padding: '5px 12px', backgroundColor: '#0e7a0d', color: '#fff',
    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px',
  },
  roomLabel: { color: '#ccc', fontSize: '13px' },
  usersLabel: { color: '#9cdcfe', fontSize: '13px' },
  mainContent: { display: 'flex', flex: 1, overflow: 'hidden' },
  editorWrapper: { flex: 1 },
  commentPanel: {
    width: '260px', backgroundColor: '#252526', borderLeft: '1px solid #3c3c3c',
    display: 'flex', flexDirection: 'column',
  },
  commentTitle: {
    color: '#fff', fontWeight: 'bold', fontSize: '14px',
    padding: '10px 14px', borderBottom: '1px solid #3c3c3c',
  },
  commentList: {
    flex: 1, overflowY: 'auto', padding: '10px 14px',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  commentItem: { fontSize: '13px', color: '#d4d4d4', lineHeight: '1.4' },
  commentUser: { color: '#4fc1ff', fontWeight: 'bold' },
  commentInputArea: {
    display: 'flex', gap: '6px', padding: '10px 14px', borderTop: '1px solid #3c3c3c',
  },
  commentInput: {
    flex: 1, padding: '5px 8px', backgroundColor: '#3c3c3c', color: '#fff',
    border: '1px solid #555', borderRadius: '4px', fontSize: '13px',
  },
  sendBtn: {
    padding: '5px 10px', backgroundColor: '#4f46e5', color: '#fff',
    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px',
  },
  issuesPanel: {
    backgroundColor: '#1a1a2e', borderTop: '1px solid #3c3c3c',
    padding: '10px 20px', maxHeight: '180px', overflowY: 'auto',
  },
  issuesTitle: { color: '#fff', fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' },
  issueItem: {
    padding: '4px 10px', marginBottom: '4px',
    backgroundColor: '#2d2d2d', borderRadius: '3px', fontSize: '13px',
  },
  issueLineNum: { color: '#888' },
  issueMsg: { color: '#d4d4d4' },
};

export default EditorPage;
