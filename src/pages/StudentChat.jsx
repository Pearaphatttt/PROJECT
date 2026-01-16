import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { chatService } from '../services/chatService';
import ActionButton from '../components/ActionButton';
import { Send } from 'lucide-react';

const StudentChat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { email } = useAuth();

  const [threads, setThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);
  const mountedRef = useRef(true);
  const selectedThreadIdRef = useRef(null);

  const selectedThread = useMemo(
    () => threads.find((t) => t.id === selectedThreadId) || null,
    [threads, selectedThreadId]
  );
  const threadIdParam = searchParams.get('threadId');

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const loadThreads = useCallback(async () => {
    if (!email) {
      if (mountedRef.current) {
        setThreads([]);
        setSelectedThreadId(null);
        setMessages([]);
        setLoadingThreads(false);
      }
      return;
    }
    try {
      if (mountedRef.current) {
        setLoadingThreads(true);
      }
      const studentThreads = await chatService.getStudentThreads(email);
      if (!mountedRef.current) return;
      setThreads(studentThreads || []);
      setError('');
    } catch (err) {
      console.error('Failed to load threads:', err);
      if (mountedRef.current) {
        setThreads([]);
        setError('Unable to load chats.');
      }
    } finally {
      if (mountedRef.current) {
        setLoadingThreads(false);
      }
    }
  }, [email]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (!threads || threads.length === 0) return;

    if (threadIdParam) {
      const threadFromParam = threads.find((t) => t.id === threadIdParam);
      if (threadFromParam && threadFromParam.id !== selectedThreadId) {
        setSelectedThreadId(threadFromParam.id);
        return;
      }
    }

    if (!selectedThreadId) {
      setSelectedThreadId(threads[0].id);
      return;
    }

    const stillExists = threads.some((t) => t.id === selectedThreadId);
    if (!stillExists) {
      setSelectedThreadId(threads[0].id);
    }
  }, [threads, threadIdParam, selectedThreadId]);

  const loadMessages = useCallback(async (threadId) => {
    if (!threadId) {
      if (mountedRef.current) {
        setMessages([]);
        setLoadingMessages(false);
      }
      return;
    }
    setLoadingMessages(true);
    try {
      const threadMessages = await chatService.getMessages(threadId);
      if (!mountedRef.current) return;
      if (selectedThreadIdRef.current !== threadId) return;
      setMessages(Array.isArray(threadMessages) ? threadMessages : []);
      setError('');
    } catch (err) {
      console.error('Failed to load messages:', err);
      if (mountedRef.current && selectedThreadIdRef.current === threadId) {
        setMessages([]);
        setError(err?.message || 'Unable to load messages.');
      }
    } finally {
      if (mountedRef.current && selectedThreadIdRef.current === threadId) {
        setLoadingMessages(false);
      }
    }
  }, []);

  useEffect(() => {
    selectedThreadIdRef.current = selectedThreadId;
    loadMessages(selectedThreadId);
  }, [selectedThreadId, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'chatThreads') {
        loadThreads();
      }
      if (selectedThreadId && event.key === `chatMessages_${selectedThreadId}`) {
        loadMessages(selectedThreadId);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadThreads, loadMessages, selectedThreadId]);

  const handleSendMessage = async () => {
    if (sending) return;
    if (!message.trim()) return;
    if (!selectedThreadId || !email) return;

    setSending(true);
    try {
      await chatService.sendMessage(selectedThreadId, {
        senderEmail: email,
        senderRole: 'student',
        text: message.trim(),
      });
      const threadMessages = await chatService.getMessages(selectedThreadId);
      if (mountedRef.current) {
        setMessages(Array.isArray(threadMessages) ? threadMessages : []);
        setMessage('');
        setError('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      if (mountedRef.current) {
        setError(err?.message || 'Unable to send message.');
      }
    } finally {
      if (mountedRef.current) {
        setSending(false);
      }
    }
  };

  if (loadingThreads) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#E9EEF5' }}>
        <div className="text-center" style={{ color: '#6B7C93' }}>Loading...</div>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#E9EEF5' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
          <div
            className="rounded-xl p-12 text-center"
            style={{
              background: '#F5F7FB',
              border: '1px solid #D6DEE9',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#2C3E5B' }}>
              No chats yet
            </h2>
            <p className="text-sm mb-6" style={{ color: '#6B7C93' }}>
              Chat available after match.
            </p>
            <ActionButton 
              onClick={() => navigate('/student/matching')}
              style={{ padding: '0 20px' }}
            >
              Go to Matching
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#2C3E5B' }}>
        Chat
      </h2>

      {error && (
        <div
          className="rounded-xl p-4 mb-4 text-sm"
          style={{
            background: '#FEE2E2',
            color: '#991B1B',
            border: '1px solid #FCA5A5',
          }}
        >
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-w-0">
        {threads.length > 1 && (
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div
              className="rounded-xl p-4 h-full overflow-y-auto"
              style={{
                background: '#F5F7FB',
                border: '1px solid #D6DEE9',
              }}
            >
              <h3 className="font-semibold mb-3" style={{ color: '#2C3E5B' }}>
                Matched Internships
              </h3>
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                    selectedThreadId === thread.id ? 'font-semibold' : ''
                  }`}
                  style={{
                    background:
                      selectedThreadId === thread.id ? '#E9EEF5' : 'transparent',
                    color: selectedThreadId === thread.id ? '#3F6FA6' : '#6B7C93',
                  }}
                >
                  <div className="font-medium">{thread.companyEmail || 'Company'}</div>
                  <div className="text-xs mt-1">{thread.internshipTitle || 'Internship'}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col">
          {threads.length > 1 && (
            <div className="lg:hidden mb-4">
              <select
                value={selectedThreadId || ''}
                onChange={(e) => {
                  const thread = threads.find((t) => t.id === e.target.value);
                  if (thread) {
                    setSelectedThreadId(thread.id);
                  }
                }}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  background: '#FFFFFF',
                  borderColor: '#CBD5E1',
                }}
              >
                {threads.map((thread) => (
                  <option key={thread.id} value={thread.id}>
                    {thread.companyEmail || 'Company'} - {thread.internshipTitle || 'Internship'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedThread && (
            <div
              className="rounded-t-xl p-4 flex items-center gap-3"
              style={{
                background: '#F5F7FB',
                border: '1px solid #D6DEE9',
                borderBottom: 'none',
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                style={{ background: '#3F6FA6' }}
              >
                {selectedThread.companyEmail?.[0]?.toUpperCase() || 'C'}
              </div>
              <div>
                <div className="font-semibold" style={{ color: '#2C3E5B' }}>
                  {selectedThread.companyEmail || 'Company'}
                </div>
                <div className="text-xs" style={{ color: '#6B7C93' }}>
                  {selectedThread.internshipTitle || 'Internship'}
                </div>
              </div>
            </div>
          )}

          <div
            className="flex-1 overflow-y-auto p-4"
            style={{
              background: '#FFFFFF',
              border: '1px solid #D6DEE9',
              borderTop: selectedThread ? 'none' : '1px solid #D6DEE9',
              borderBottom: 'none',
            }}
          >
            {loadingMessages ? (
              <div className="text-center py-8" style={{ color: '#6B7C93' }}>
                Loading messages...
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isStudent = msg.senderEmail === email || msg.senderRole === 'student';
                  const text = msg.text || msg.message || '';
                  const timestamp = msg.createdAt || msg.timestamp;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isStudent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className="max-w-[70%] rounded-lg p-3"
                        style={{
                          background: isStudent ? '#3F6FA6' : '#F5F7FB',
                          color: isStudent ? '#FFFFFF' : '#2C3E5B',
                        }}
                      >
                        <div className="text-xs mb-1 opacity-75">
                          {isStudent ? 'You' : msg.senderEmail || 'Company'}
                        </div>
                        <div>{text}</div>
                        <div className="text-xs mt-1 opacity-75">
                          {timestamp ? new Date(timestamp).toLocaleString() : 'Now'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8" style={{ color: '#6B7C93' }}>
                No messages yet. Start the conversation!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div
            className="rounded-b-xl p-4"
            style={{
              background: '#FFFFFF',
              border: '1px solid #D6DEE9',
              borderTop: 'none',
            }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-lg border"
                style={{
                  background: '#FFFFFF',
                  borderColor: '#CBD5E1',
                  fontSize: '14px',
                }}
              />
              <ActionButton
                onClick={handleSendMessage}
                disabled={sending || !message.trim()}
                className="px-4"
              >
                <Send size={18} />
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentChat;
