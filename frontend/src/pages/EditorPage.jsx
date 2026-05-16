import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { io } from 'socket.io-client';

function EditorPage() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('// Write your code here...');
  const [issues, setIssues] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  const [connectedUsers, setConnectedUsers] = useState([]);

  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');

  const socketRef = useRef(null);
  const isRemoteChange = useRef(false);

  const navigate = useNavigate();
  const { roomId } = useParams();
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
      setCode(currentCode || '// Write your code here...');
      setConnectedUsers(users || []);
    });

    socket.on('new-comment', ({ username: commenter, comment }) => {
      setComments((prev) => [...prev, { username: commenter, comment }]);
    });

    socket.emit('join-room', { roomId, username });

    return () => socket.disconnect();
  }, [roomId, username]);

  const handleLogout = () => {
    if (socketRef.current) socketRef.current.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleLeaveRoom = () => {
    if (socketRef.current) socketRef.current.disconnect();
    navigate('/lobby');
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

  const severityColor = (s) =>
    s === 'error' ? '#f87171' : s === 'warning' ? '#fbbf24' : '#6b7280';

  const avatarColor = (name) => {
    const colors = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626'];
    return colors[name?.charCodeAt(0) % colors.length] || '#7c3aed';
  };

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <div style={styles.navLogo}>{'</>'}</div>
          <span style={styles.navTitle}>Code Reviewer</span>
        </div>
        <div style={styles.navCenter}>
          <select style={styles.select} value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="javascript" style={styles.selectOption}>JavaScript</option>
            <option value="python" style={styles.selectOption}>Python</option>
          </select>
          <button style={styles.analyzeBtn} onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? (
              <span style={styles.analyzingDot}>Analyzing...</span>
            ) : (
              'Analyze Code'
            )}
          </button>
        </div>
        <div style={styles.navRight}>
          <div style={styles.roomInfo}>
            <span style={styles.roomBadgeDot} />
            <span style={styles.roomInfoText}>Room <b>{roomId}</b></span>
            <span style={styles.onlineCount}>
              {connectedUsers.length} online
            </span>
            <button style={styles.leaveBtn} onClick={handleLeaveRoom}>Leave</button>
          </div>
          <div style={{ ...styles.avatar, backgroundColor: avatarColor(username) }}>
            {username?.[0]?.toUpperCase()}
          </div>
          <span style={styles.usernameText}>{username}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.editorWrapper}>
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={handleCodeChange}
            options={{ fontSize: 14, minimap: { enabled: false }, mouseWheelZoom: true }}
          />
        </div>

        {/* Comment Panel */}
        <div style={styles.commentPanel}>
          <div style={styles.commentHeader}>
            <span style={styles.commentTitle}>Comments</span>
            {comments.length > 0 && (
              <span style={styles.commentCount}>{comments.length}</span>
            )}
          </div>
          <div style={styles.commentList}>
            {comments.length === 0 ? (
              <div style={styles.emptyComments}>No comments yet.<br />Be the first to comment.</div>
            ) : (
              comments.map((c, i) => (
                <div key={i} style={styles.commentItem}>
                  <div style={styles.commentItemHeader}>
                    <div style={{ ...styles.commentAvatar, backgroundColor: avatarColor(c.username) }}>
                      {c.username[0]?.toUpperCase()}
                    </div>
                    <span style={styles.commentUser}>{c.username}</span>
                  </div>
                  <div style={styles.commentText}>{c.comment}</div>
                </div>
              ))
            )}
          </div>
          <div style={styles.commentInputArea}>
            <input
              style={styles.commentInput}
              placeholder={roomId ? 'Add a comment...' : 'Join a room to comment'}
              value={commentInput}
              disabled={!roomId}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
            />
            <button style={styles.sendBtn} onClick={handleSendComment} disabled={!roomId}>
              &#9658;
            </button>
          </div>
        </div>
      </div>

      {/* Issues Panel */}
      {issues.length > 0 && (
        <div style={styles.issuesPanel}>
          <div style={styles.issuesHeader}>
            <span style={styles.issuesTitle}>Issues</span>
            <span style={styles.issuesBadge}>{issues.length}</span>
          </div>
          <div style={styles.issuesList}>
            {issues.map((issue, i) => (
              <div
                key={i}
                style={{ ...styles.issueItem, borderLeftColor: severityColor(issue.severity) }}
              >
                <span style={{ ...styles.issueSeverity, color: severityColor(issue.severity) }}>
                  {issue.severity.toUpperCase()}
                </span>
                {issue.line > 0 && <span style={styles.issueLine}>Line {issue.line}</span>}
                <span style={styles.issueMsg}>{issue.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    display: 'flex', flexDirection: 'column', height: '100vh',
    backgroundColor: '#0f0f1a', fontFamily: "'Segoe UI', sans-serif",
  },

  /* Navbar */
  navbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'linear-gradient(135deg, #1a0a2e 0%, #0a1628 100%)',
    padding: '0 20px', height: '52px',
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
  navTitle: {
    color: '#fff', fontWeight: '700', fontSize: '15px',
    letterSpacing: '0.3px',
  },
  navCenter: { display: 'flex', alignItems: 'center', gap: '8px' },
  select: {
    padding: '6px 10px', backgroundColor: '#1a1a2e', color: '#e2e8f0',
    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '7px',
    fontSize: '13px', cursor: 'pointer', outline: 'none',
  },
  selectOption: {
    backgroundColor: '#1a1a2e', color: '#e2e8f0',
  },
  analyzeBtn: {
    padding: '7px 16px',
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    color: '#fff', border: 'none', borderRadius: '7px',
    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
    boxShadow: '0 0 10px rgba(124,58,237,0.4)',
  },
  analyzingDot: { opacity: 0.7 },
  navRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  roomInfo: {
    display: 'flex', alignItems: 'center', gap: '7px',
    backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px', padding: '4px 12px',
  },
  roomBadgeDot: {
    width: '7px', height: '7px', borderRadius: '50%',
    backgroundColor: '#22c55e', display: 'inline-block', flexShrink: 0,
  },
  roomInfoText: { color: '#cbd5e1', fontSize: '13px' },
  onlineCount: {
    backgroundColor: 'rgba(34,197,94,0.15)', color: '#86efac',
    fontSize: '11px', fontWeight: '700', padding: '2px 7px', borderRadius: '7px',
  },
  leaveBtn: {
    padding: '3px 10px', backgroundColor: 'rgba(251,191,36,0.15)',
    color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)',
    borderRadius: '5px', cursor: 'pointer', fontSize: '12px',
  },
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

  /* Main */
  mainContent: { display: 'flex', flex: 1, overflow: 'hidden' },
  editorWrapper: { flex: 1 },

  /* Comment Panel */
  commentPanel: {
    width: '260px', backgroundColor: '#13131f',
    borderLeft: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', flexDirection: 'column',
  },
  commentHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '11px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  commentTitle: { color: '#e2e8f0', fontWeight: '700', fontSize: '13px' },
  commentCount: {
    backgroundColor: 'rgba(124,58,237,0.3)', color: '#c4b5fd',
    fontSize: '11px', fontWeight: '700', padding: '2px 7px', borderRadius: '10px',
  },
  commentList: {
    flex: 1, overflowY: 'auto', padding: '10px',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  emptyComments: {
    color: '#475569', fontSize: '12px', textAlign: 'center',
    marginTop: '30px', lineHeight: '1.6',
  },
  commentItem: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '8px',
    padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px',
  },
  commentItemHeader: { display: 'flex', alignItems: 'center', gap: '7px' },
  commentAvatar: {
    width: '22px', height: '22px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: '700', fontSize: '10px', flexShrink: 0,
  },
  commentUser: { color: '#a78bfa', fontWeight: '600', fontSize: '12px' },
  commentText: { color: '#cbd5e1', fontSize: '12px', lineHeight: '1.4', paddingLeft: '29px' },
  commentInputArea: {
    display: 'flex', gap: '6px', padding: '10px 10px',
    borderTop: '1px solid rgba(255,255,255,0.07)',
  },
  commentInput: {
    flex: 1, padding: '8px 10px', backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', fontSize: '12px', outline: 'none',
  },
  sendBtn: {
    width: '34px', height: '34px',
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    color: '#fff', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px', flexShrink: 0,
  },

  /* Issues */
  issuesPanel: {
    backgroundColor: '#0d0d18', borderTop: '1px solid rgba(255,255,255,0.07)',
    maxHeight: '160px', overflowY: 'auto',
  },
  issuesHeader: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 16px 4px', position: 'sticky', top: 0,
    backgroundColor: '#0d0d18',
  },
  issuesTitle: { color: '#94a3b8', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px' },
  issuesBadge: {
    backgroundColor: 'rgba(248,113,113,0.2)', color: '#f87171',
    fontSize: '11px', fontWeight: '700', padding: '1px 6px', borderRadius: '7px',
  },
  issuesList: { padding: '4px 16px 10px', display: 'flex', flexDirection: 'column', gap: '4px' },
  issueItem: {
    display: 'flex', alignItems: 'baseline', gap: '8px',
    padding: '5px 10px', backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '6px', borderLeft: '3px solid', fontSize: '12px',
  },
  issueSeverity: { fontWeight: '700', fontSize: '10px', flexShrink: 0 },
  issueLine: { color: '#475569', fontSize: '11px', flexShrink: 0 },
  issueMsg: { color: '#94a3b8', fontSize: '12px' },
};

export default EditorPage;
