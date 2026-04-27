import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const tok = () => localStorage.getItem('admin_token') || '';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AdminChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hola Manuel. Soy el Asistente de IA de FoundTeach. ¿En qué te puedo ayudar hoy con los datos de la plataforma?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tok()}`
        },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error comunicándose con la IA');

      setMessages(prev => [...prev, { role: 'assistant', content: data.data.reply }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón Flotante */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: 32, right: 32, width: 60, height: 60, borderRadius: 30,
          background: 'var(--primary-color)', color: 'white', display: isOpen ? 'none' : 'flex',
          alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)',
          zIndex: 999, transition: 'transform 0.2s', cursor: 'pointer', border: 'none'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Bot size={28} />
      </button>

      {/* Ventana de Chat */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 32, right: 32, width: 380, height: 550, borderRadius: 20,
          background: 'var(--surface-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          border: '1px solid var(--border-color)', zIndex: 1000, display: 'flex', flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px', background: 'var(--primary-color)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Copilot AI</h3>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Asistente Administrativo</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: 4 }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, background: 'var(--background-color)' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={14} />
                  </div>
                )}
                <div style={{
                  padding: '12px 16px', borderRadius: 16, fontSize: '0.9rem', lineHeight: 1.5,
                  background: msg.role === 'user' ? 'var(--primary-color)' : 'var(--surface-color)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                  border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                  borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                  borderTopLeftRadius: msg.role === 'assistant' ? 4 : 16,
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={14} />
                </div>
                <div style={{ padding: '12px 16px', borderRadius: 16, background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderTopLeftRadius: 4, display: 'flex', gap: 4 }}>
                  <span className="dot-pulse" style={{ width: 6, height: 6, background: 'var(--text-muted)', borderRadius: '50%' }}></span>
                  <span className="dot-pulse" style={{ width: 6, height: 6, background: 'var(--text-muted)', borderRadius: '50%', opacity: 0.7 }}></span>
                  <span className="dot-pulse" style={{ width: 6, height: 6, background: 'var(--text-muted)', borderRadius: '50%', opacity: 0.4 }}></span>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          {/* Input */}
          <div style={{ padding: 16, borderTop: '1px solid var(--border-color)', background: 'var(--surface-color)' }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input 
                type="text" 
                value={input} 
                onChange={e => setInput(e.target.value)}
                placeholder="Pregunta algo al asistente..." 
                disabled={loading}
                style={{ flex: 1, padding: '12px 16px', borderRadius: 24, border: '1px solid var(--border-color)', background: 'var(--background-color)', outline: 'none', fontSize: '0.9rem', color: 'var(--text-main)' }}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || loading}
                style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-color)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !loading ? 'pointer' : 'default', opacity: input.trim() && !loading ? 1 : 0.5 }}
              >
                <Send size={18} style={{ marginLeft: 2 }} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
