import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiImage, FiX, FiTrash2, FiUser } from 'react-icons/fi';
import api from '../utils/api';

// ─── Helper: compress uploaded images before sending ─────────────────────────
const compressImage = (base64Str, maxWidth = 900, maxHeight = 900, quality = 0.75) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
      } else {
        if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
  });
};

const WELCOME_MESSAGE = {
  role: 'assistant',
  text: "Hi! I'm the EcoMart AI Assistant \ud83c\udf3f Ask me anything, upload a photo of something you want identified or recycled, or just chat \u2014 I'm here to help.",
};

const UpcycleStudio = () => {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [pendingImage, setPendingImage] = useState(null); // { preview, base64 }
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result);
      setPendingImage({ preview: compressed, base64: compressed });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // allow re-selecting the same file later
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed && !pendingImage) return;

    setError(null);
    const userMessage = {
      role: 'user',
      text: trimmed,
      imageBase64: pendingImage?.base64,
      imagePreview: pendingImage?.preview,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setPendingImage(null);
    setSending(true);

    try {
      // Send full history (minus imagePreview, which is UI-only) — stateless backend
      const payload = nextMessages.map(({ role, text, imageBase64 }) => ({ role, text, imageBase64 }));
      const { data } = await api.post('/ai/chat', { messages: payload });
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
      setMessages((prev) => [...prev, { role: 'assistant', text: `\u26a0\ufe0f ${msg}`, isError: true }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setError(null);
  };

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 16px 0', height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column', fontFamily: '"DM Sans", sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg,#66BB6A,#2E7D32)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0,
          }}>
            🌿
          </div>
          <div>
            <h1 style={{ margin: 0, fontFamily: '"Times New Roman", Times, serif', fontWeight: 700, fontSize: '1.25rem', color: '#263238' }}>
              EcoMart AI Assistant
            </h1>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#8A9A92' }}>Ask anything · Upload photos · Powered by Gemini</p>
          </div>
        </div>
        {messages.length > 1 && (
          <button
            onClick={handleClearChat}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px',
              borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white',
              color: '#64748b', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <FiTrash2 size={13} /> Clear
          </button>
        )}
      </div>

      {/* Message list */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px',
        padding: '4px 4px 16px', minHeight: 0,
      }}>
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div key={i} style={{ display: 'flex', gap: '10px', flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                background: isUser ? '#263238' : 'linear-gradient(135deg,#66BB6A,#2E7D32)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isUser ? '13px' : '14px', marginTop: '2px',
              }}>
                {isUser ? <FiUser size={14} color="white" /> : '🌿'}
              </div>
              <div style={{
                maxWidth: '75%', padding: '11px 15px', borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: isUser ? 'linear-gradient(135deg,#66BB6A,#2E7D32)' : (msg.isError ? '#FEF2F2' : 'white'),
                color: isUser ? 'white' : (msg.isError ? '#991B1B' : '#263238'),
                boxShadow: isUser ? 'none' : '0 1px 8px rgba(0,0,0,0.06)',
                border: isUser ? 'none' : (msg.isError ? '1px solid #FCA5A5' : '1px solid #f1f5f9'),
              }}>
                {msg.imagePreview && (
                  <img src={msg.imagePreview} alt="Uploaded" style={{ maxWidth: '220px', maxHeight: '220px', borderRadius: '10px', marginBottom: msg.text ? '8px' : 0, display: 'block', objectFit: 'cover' }} />
                )}
                {msg.text && (
                  <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                )}
              </div>
            </div>
          );
        })}

        {sending && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#66BB6A,#2E7D32)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
            }}>
              🌿
            </div>
            <div style={{ padding: '13px 16px', borderRadius: '16px 16px 16px 4px', background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', gap: '4px' }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  width: '6px', height: '6px', borderRadius: '50%', background: '#66BB6A',
                  animation: `ecoBounce 1.3s ${i * 0.15}s infinite ease-in-out`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <style>{`
        @keyframes ecoBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>

      {/* Input bar */}
      <div style={{ flexShrink: 0, paddingBottom: '20px' }}>
        {pendingImage && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px', padding: '6px 8px 6px 6px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <img src={pendingImage.preview} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Image attached</span>
            <button onClick={() => setPendingImage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
              <FiX size={15} />
            </button>
          </div>
        )}

        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: '8px', background: 'white',
          border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '8px 8px 8px 14px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        }}>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach an image"
            style={{
              flexShrink: 0, width: '34px', height: '34px', borderRadius: '10px', border: 'none',
              background: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <FiImage size={17} />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything, or attach a photo..."
            rows={1}
            style={{
              flex: 1, border: 'none', outline: 'none', resize: 'none', fontSize: '0.92rem',
              fontFamily: '"DM Sans", sans-serif', color: '#263238', background: 'transparent',
              padding: '7px 0', maxHeight: '140px', lineHeight: 1.5,
            }}
          />

          <button
            onClick={handleSend}
            disabled={sending || (!input.trim() && !pendingImage)}
            style={{
              flexShrink: 0, width: '38px', height: '38px', borderRadius: '12px', border: 'none',
              background: (sending || (!input.trim() && !pendingImage)) ? '#e2e8f0' : 'linear-gradient(135deg,#66BB6A,#2E7D32)',
              color: (sending || (!input.trim() && !pendingImage)) ? '#94a3b8' : 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: (sending || (!input.trim() && !pendingImage)) ? 'not-allowed' : 'pointer',
            }}
          >
            <FiSend size={16} />
          </button>
        </div>
        <p style={{ margin: '8px 0 0', fontSize: '0.7rem', color: '#B0BEB6', textAlign: 'center' }}>
          Press Enter to send · Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
};

export default UpcycleStudio;