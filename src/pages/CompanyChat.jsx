import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { chatService } from '../services/chatService';
import ActionButton from '../components/ActionButton';
import { Send, ArrowLeft } from 'lucide-react';

const CompanyChat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auth = useAuth();
  const companyEmail = auth?.email;

  // ALL STATE HOOKS - MUST BE AT TOP
  const [threads, setThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileView, setMobileView] = useState('threads');
  
  // ALL REFS
  const messagesEndRef = useRef(null);
  const mountedRef = useRef(true);
  const selectedThreadIdRef = useRef(null);

  // ALL CALLBACKS
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const loadCompanyThreads = useCallback(async () => {
    if (!companyEmail) {
      if (mountedRef.current) {
        setThreads([]);
        setLoadingThreads(false);
      }
      return;
    }

    try {
      if (mountedRef.current) {
        setLoadingThreads(true);
      }
      const companyThreads = await chatService.getCompanyThreads(companyEmail);
      if (!mountedRef.current) return;
      setThreads(companyThreads || []);
    } catch (error) {
      console.error('Failed to load threads:', error);
      if (mountedRef.current) {
        setThreads([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoadingThreads(false);
      }
    }
  }, [companyEmail]);

  // ALL USEEFFECT HOOKS - MUST BE BEFORE CONDITIONAL RETURNS
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load threads on mount and when companyEmail changes
  useEffect(() => {
    if (companyEmail) {
      loadCompanyThreads();
    } else {
      if (mountedRef.current) {
        setLoadingThreads(false);
        setThreads([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyEmail]);

  const threadIdParam = searchParams.get('threadId');
  const legacyThreadFor = searchParams.get('threadFor');
  const legacyStudent = searchParams.get('student');
  const selectedThread = useMemo(
    () => threads.find((t) => t.id === selectedThreadId) || null,
    [threads, selectedThreadId]
  );

  // Handle query params for deep-linking and default selection
  useEffect(() => {
    if (!threads || threads.length === 0) return;

    let targetThread = null;
    if (threadIdParam) {
      targetThread = threads.find((t) => t.id === threadIdParam);
    } else if (legacyThreadFor && legacyStudent) {
      targetThread = threads.find(
        (t) => t.internshipId === legacyThreadFor && t.studentEmail === legacyStudent
      );
    }

    if (targetThread && targetThread.id !== selectedThreadId) {
      setSelectedThreadId(targetThread.id);
      setMobileView('chat');
      return;
    }

    if (!selectedThreadId) {
      setSelectedThreadId(threads[0].id);
      return;
    }

    const stillExists = threads.some((t) => t.id === selectedThreadId);
    if (!stillExists) {
      setSelectedThreadId(threads[0].id);
    }
  }, [threads, threadIdParam, legacyThreadFor, legacyStudent, selectedThreadId]);

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
    } catch (error) {
      console.error('Failed to load chat:', error);
      if (mountedRef.current && selectedThreadIdRef.current === threadId) {
        setMessages([]);
      }
    } finally {
      if (mountedRef.current && selectedThreadIdRef.current === threadId) {
        setLoadingMessages(false);
      }
    }
  }, []);

  // Load messages when thread is selected
  useEffect(() => {
    selectedThreadIdRef.current = selectedThreadId;
    loadMessages(selectedThreadId);
  }, [selectedThreadId, loadMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // When a thread is selected, show chat view on mobile
  useEffect(() => {
    if (selectedThreadId) {
      setMobileView('chat');
    }
  }, [selectedThreadId]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'chatThreads') {
        loadCompanyThreads();
      }
      if (selectedThreadId && event.key === `chatMessages_${selectedThreadId}`) {
        loadMessages(selectedThreadId);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadCompanyThreads, loadMessages, selectedThreadId]);

  // Event handlers (non-hooks, can be after hooks)
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    if (!selectedThreadId || !companyEmail) return;

    const currentThread = selectedThread;
    if (!currentThread) return;

    setSending(true);
    try {
      await chatService.sendMessage(selectedThreadId, {
        senderEmail: companyEmail,
        senderRole: 'company',
        text: message,
      });

      const threadMessages = await chatService.getMessages(selectedThreadId);
      if (mountedRef.current) {
        setMessages(threadMessages || []);
      }

      if (mountedRef.current) {
        setMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      if (mountedRef.current) {
        setSending(false);
      }
    }
  };

  // CONDITIONAL RETURNS - AFTER ALL HOOKS
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
              Chats open after you accept (match) an applicant.
            </p>
            <ActionButton 
              onClick={() => navigate('/company/candidates')}
              style={{ padding: '0 20px' }}
            >
              View Candidates
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="w-full py-6">
        <button
          onClick={() => navigate('/company/dashboard')}
          className="flex items-center gap-2 mb-6 text-sm"
          style={{ color: '#3F6FA6' }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <h2 className="text-2xl font-bold mb-6" style={{ color: '#2C3E5B' }}>
          Chat
        </h2>

        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-w-0">
          {/* Thread List - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div
              className="rounded-xl p-4 h-full overflow-y-auto"
              style={{
                background: '#F5F7FB',
                border: '1px solid #D6DEE9',
              }}
            >
              <h3 className="font-semibold mb-3" style={{ color: '#2C3E5B' }}>
                Matched Students
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
                  <div className="font-medium">{thread.studentEmail}</div>
                  <div className="text-xs mt-1">{thread.internshipTitle || 'Matched Internship'}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Thread List - Mobile */}
          <div className={`lg:hidden ${mobileView === 'threads' ? 'block' : 'hidden'}`}>
            <div
              className="rounded-xl p-4"
              style={{
                background: '#F5F7FB',
                border: '1px solid #D6DEE9',
              }}
            >
              <h3 className="font-semibold mb-3" style={{ color: '#2C3E5B' }}>
                Matched Students
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
                  <div className="font-medium">{thread.studentEmail}</div>
                  <div className="text-xs mt-1">{thread.internshipTitle || 'Matched Internship'}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 min-w-0 flex flex-col ${mobileView === 'chat' ? 'flex' : 'hidden lg:flex'}`}>
            {/* Mobile Back */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setMobileView('threads')}
                className="flex items-center gap-2 text-sm"
                style={{ color: '#3F6FA6' }}
              >
                <ArrowLeft size={16} />
                Back to Threads
              </button>
            </div>

            {/* Chat Header */}
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
                  {selectedThread.studentEmail?.[0]?.toUpperCase() || 'S'}
                </div>
                <div>
                  <div className="font-semibold" style={{ color: '#2C3E5B' }}>
                    {selectedThread.studentEmail}
                  </div>
                  <div className="text-xs" style={{ color: '#6B7C93' }}>
                    {selectedThread.internshipTitle || 'Internship'}
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
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
              ) : messages && messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isCompany = msg.senderEmail === companyEmail || msg.senderRole === 'company';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isCompany ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className="max-w-[70%] rounded-lg p-3"
                          style={{
                            background: isCompany ? '#3F6FA6' : '#F5F7FB',
                            color: isCompany ? '#FFFFFF' : '#2C3E5B',
                          }}
                        >
                          <div>
                            <div className="text-xs mb-1 opacity-75">
                              {isCompany ? 'You' : msg.senderEmail || 'Student'}
                            </div>
                            <div>{msg.message || msg.text}</div>
                            <div className="text-xs mt-1 opacity-75">
                              {msg.timestamp || msg.createdAt ? new Date(msg.timestamp || msg.createdAt).toLocaleString() : 'Now'}
                            </div>
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

            {/* Input Area */}
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

export default CompanyChat;
