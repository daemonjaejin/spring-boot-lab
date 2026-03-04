'use client';

import React, { useState, useEffect, useRef } from 'react';
import '@/styles.css';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/ai/chat?message=${encodeURIComponent(input)}`);
      const data = await res.json();
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.answer || '죄송합니다. 답변을 가져오지 못했습니다.',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: '서버와 통신 중 오류가 발생했습니다. Ollama가 실행 중인지 확인해주세요.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-card">
      <div className="ai-chat-container">
        <div className="page-header">
          <h2>Antigravity AI Chat</h2>
          <span className="muted">Powered by Ollama (Llama 3)</span>
        </div>

        <div className="chat-window-glass" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="empty-chat">
              <div className="ai-icon-large">✨</div>
              <p>무엇이든 물어보세요! 로컬 LLM이 답변해 드립니다.</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble-wrapper ${msg.role}`}>
              <div className={`chat-bubble ${msg.role}`}>
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="chat-bubble-wrapper ai">
              <div className="chat-bubble ai loading">
                <div className="dot-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="메시지를 입력하세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button 
            className="btn primary chat-send-btn" 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? '...' : '전송'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .ai-chat-container {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 240px);
          max-width: 100%;
          margin: 0 auto;
        }

        .chat-window-glass {
          flex: 1;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(229, 231, 235, 0.5);
          border-radius: 16px;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .empty-chat {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #94a3b8;
          animation: fadeIn 0.5s ease-out;
        }

        .ai-icon-large {
          font-size: 40px;
          margin-bottom: 12px;
        }

        .chat-bubble-wrapper {
          display: flex;
          width: 100%;
          animation: slideUp 0.3s ease-out;
        }

        .chat-bubble-wrapper.user {
          justify-content: flex-end;
        }

        .chat-bubble-wrapper.ai {
          justify-content: flex-start;
        }

        .chat-bubble {
          max-width: 85%;
          padding: 10px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
          position: relative;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .chat-bubble.user {
          background: #2563eb;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .chat-bubble.ai {
          background: white;
          color: #1e293b;
          border: 1px solid #e5e7eb;
          border-bottom-left-radius: 4px;
        }

        .chat-input-area {
          margin-top: 16px;
          display: flex;
          gap: 10px;
          background: #f9fafb;
          padding: 6px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .chat-input {
          flex: 1;
          border: none !important;
          background: transparent;
          padding: 8px 12px;
          outline: none;
          font-size: 14px;
        }

        .chat-send-btn {
          border-radius: 8px !important;
        }

        /* Loading Animation */
        .dot-typing {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .dot-typing span {
          width: 6px;
          height: 6px;
          background-color: #94a3b8;
          border-radius: 50%;
          display: inline-block;
          animation: dotElastic 1s infinite ease-in-out;
        }

        .dot-typing span:nth-child(2) { animation-delay: 0.1s; }
        .dot-typing span:nth-child(3) { animation-delay: 0.2s; }

        @keyframes dotElastic {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.3); opacity: 1; }
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
