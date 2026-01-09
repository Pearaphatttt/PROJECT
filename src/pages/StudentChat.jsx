import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentStore } from '../state/studentStore';
import { internshipService } from '../services/internshipService';
import { chatService } from '../services/chatService';
import ActionButton from '../components/ActionButton';
import { Send, Paperclip, Calendar, FileText } from 'lucide-react';

const StudentChat = () => {
  const navigate = useNavigate();
  const {
    matchedInternshipIds,
    currentChat,
    currentChatInternshipId,
    setChat,
    addChatMessage,
  } = useStudentStore();

  const [internships, setInternships] = useState([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMatchedInternships();
  }, []);

  useEffect(() => {
    if (selectedInternshipId) {
      loadChatThread(selectedInternshipId);
    }
  }, [selectedInternshipId]);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat]);

  const loadMatchedInternships = async () => {
    const matchedIds = Array.from(matchedInternshipIds);
    if (matchedIds.length === 0) return;

    const internshipsData = await Promise.all(
      matchedIds.map((id) => internshipService.getById(id))
    );
    setInternships(internshipsData.filter(Boolean));
    if (internshipsData.length > 0 && !selectedInternshipId) {
      setSelectedInternshipId(matchedIds[0]);
    }
  };

  const loadChatThread = async (internshipId) => {
    try {
      const messages = await chatService.getThreadForMatched(internshipId);
      setChat(internshipId, messages);
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !attachedFile) return;
    if (!selectedInternshipId) return;

    setSending(true);
    try {
      if (message.trim()) {
        const newMessage = await chatService.sendMessage(selectedInternshipId, message);
        addChatMessage(newMessage);
        setMessage('');
      }
      if (attachedFile) {
        // Mock file attachment
        const fileMessage = {
          id: `msg-${Date.now()}`,
          sender: 'student',
          senderName: 'You',
          text: `Attached: ${attachedFile.name}`,
          timestamp: new Date().toISOString(),
          type: 'file',
          fileName: attachedFile.name,
        };
        addChatMessage(fileMessage);
        setAttachedFile(null);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  if (matchedInternshipIds.size === 0) {
    return (
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
            Chat is available after you are matched
          </h2>
          <p className="text-sm mb-6" style={{ color: '#6B7C93' }}>
            Once a company accepts your application, you'll be able to chat with them here.
          </p>
          <ActionButton 
            onClick={() => navigate('/student/matching')}
            style={{ padding: '0 20px' }}
          >
            Go to Matching
          </ActionButton>
        </div>
      </div>
    );
  }

  const selectedInternship = internships.find((i) => i.id === selectedInternshipId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#2C3E5B' }}>
        Chat
      </h2>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        {/* Internship List - Desktop */}
        {internships.length > 1 && (
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
              {internships.map((internship) => (
                <button
                  key={internship.id}
                  onClick={() => setSelectedInternshipId(internship.id)}
                  className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                    selectedInternshipId === internship.id ? 'font-semibold' : ''
                  }`}
                  style={{
                    background:
                      selectedInternshipId === internship.id ? '#E9EEF5' : 'transparent',
                    color: selectedInternshipId === internship.id ? '#3F6FA6' : '#6B7C93',
                  }}
                >
                  <div className="font-medium">{internship.company}</div>
                  <div className="text-xs mt-1">{internship.title}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Internship Selector - Mobile */}
          {internships.length > 1 && (
            <div className="lg:hidden mb-4">
              <select
                value={selectedInternshipId || ''}
                onChange={(e) => setSelectedInternshipId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  background: '#FFFFFF',
                  borderColor: '#CBD5E1',
                }}
              >
                {internships.map((internship) => (
                  <option key={internship.id} value={internship.id}>
                    {internship.company} - {internship.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Chat Header */}
          {selectedInternship && (
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
                {selectedInternship.company?.[0] || 'C'}
              </div>
              <div>
                <div className="font-semibold" style={{ color: '#2C3E5B' }}>
                  {selectedInternship.company}
                </div>
                <div className="text-xs" style={{ color: '#6B7C93' }}>
                  {selectedInternship.title}
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
              borderTop: selectedInternship ? 'none' : '1px solid #D6DEE9',
              borderBottom: 'none',
            }}
          >
            {currentChat && currentChat.length > 0 ? (
              <div className="space-y-4">
                {currentChat.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className="max-w-[70%] rounded-lg p-3"
                      style={{
                        background:
                          msg.sender === 'student' ? '#3F6FA6' : '#F5F7FB',
                        color: msg.sender === 'student' ? '#FFFFFF' : '#2C3E5B',
                      }}
                    >
                      {msg.type === 'interview' ? (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar size={16} />
                            <span className="font-semibold">Interview Schedule</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div>
                              <strong>Date:</strong> {msg.interviewData.date}
                            </div>
                            <div>
                              <strong>Time:</strong> {msg.interviewData.time} ({msg.interviewData.duration})
                            </div>
                            <div>
                              <strong>Format:</strong> {msg.interviewData.format}
                            </div>
                            {msg.interviewData.link && (
                              <a
                                href={msg.interviewData.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline"
                              >
                                Join Meeting
                              </a>
                            )}
                          </div>
                        </div>
                      ) : msg.type === 'file' ? (
                        <div className="flex items-center gap-2">
                          <FileText size={16} />
                          <span>{msg.fileName || msg.text}</span>
                        </div>
                      ) : (
                        <div>
                          <div className="text-xs mb-1 opacity-75">{msg.senderName}</div>
                          <div>{msg.text}</div>
                          <div className="text-xs mt-1 opacity-75">
                            {new Date(msg.timestamp).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
            {attachedFile && (
              <div className="mb-2 flex items-center gap-2 text-sm" style={{ color: '#6B7C93' }}>
                <FileText size={16} />
                <span>{attachedFile.name}</span>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="ml-2 text-red-500"
                >
                  ×
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <label className="p-2 rounded-lg cursor-pointer" style={{ background: '#F5F7FB' }}>
                <Paperclip size={20} style={{ color: '#6B7C93' }} />
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
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
                disabled={sending || (!message.trim() && !attachedFile)}
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

