
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import { Message } from './types';
import { askHandbookQuestion } from './services/webhookService';

const SUGGESTIONS = [
  "When is the Fall 2024 move-in?",
  "What is the guest/visitor policy?",
  "How do I request a maintenance repair?",
  "What items are prohibited in dorms?"
];

const EMERGENCY_CONTACTS = [
  { name: "Campus Police", phone: "252-328-6787", icon: "fa-shield-alt" },
  { name: "Campus Living Office", phone: "252-328-6072", icon: "fa-building" },
  { name: "ECU Cares", phone: "252-737-5555", icon: "fa-hand-holding-heart" }
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Local storage logic removed

  const activeMessage = messages.find(m => m.id === selectedMessageId);

  const handleSend = async (textOverride?: string) => {
    const questionText = textOverride || inputValue.trim();
    if (!questionText) return;

    const messageId = uuidv4();
    const newMessage: Message = {
      id: messageId,
      question: questionText,
      timestamp: new Date(),
      status: 'loading',
    };

    setMessages(prev => [newMessage, ...prev]);
    setSelectedMessageId(messageId);
    setInputValue('');

    try {
      const answer = await askHandbookQuestion(questionText);
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, answer, status: 'success' } : m
      ));
    } catch (error) {
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { 
          ...m, 
          answer: "Sorry, I'm having trouble connecting to the handbook database. Please try again or contact Campus Living directly.", 
          status: 'error' 
        } : m
      ));
    }
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setMessages(prev => prev.map(m => 
      m.id === id ? { ...m, feedback: type } : m
    ));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple visual feedback could be added here
  };

  const startNewChat = () => {
    setSelectedMessageId(null);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans">
      <header className="bg-ecu-purple text-white p-4 shadow-md flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 md:hidden">
            <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
          <div className="bg-ecu-gold p-2 rounded-lg">
            <i className="fas fa-university text-ecu-purple"></i>
          </div>
          <div className="hidden xs:block">
            <h1 className="font-bold text-lg leading-tight">ECU Campus Living</h1>
            <p className="text-[10px] text-ecu-gold font-bold uppercase tracking-widest">Resident Handbook v2.0</p>
          </div>
        </div>
        <button 
          onClick={startNewChat}
          className="text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full transition-colors flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> New Ask
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <aside className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 transition-transform duration-300 absolute md:relative z-20 
          w-72 h-full bg-white border-r border-gray-200 flex flex-col shadow-xl md:shadow-none
        `}>
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">History</h2>
            <button onClick={() => setMessages([])} className="text-[10px] text-red-500 font-bold hover:underline">Clear All</button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {messages.map((m) => (
              <button
                key={m.id}
                onClick={() => { setSelectedMessageId(m.id); setIsSidebarOpen(false); }}
                className={`p-4 text-left border-b w-full transition-all border-l-4 ${selectedMessageId === m.id ? 'bg-ecu-purple/5 border-l-ecu-purple' : 'hover:bg-gray-50 border-l-transparent'}`}
              >
                <p className="text-xs font-semibold text-gray-700 line-clamp-1">{m.question}</p>
                <span className="text-[9px] text-gray-400 font-bold uppercase">{m.timestamp.toLocaleDateString()}</span>
              </button>
            ))}
          </div>

          <div className="p-4 bg-ecu-purple/5 border-t">
            <h3 className="text-[11px] font-black text-ecu-purple uppercase tracking-widest mb-3">Important Contacts</h3>
            <div className="space-y-3">
              {EMERGENCY_CONTACTS.map((contact) => (
                <a key={contact.name} href={`tel:${contact.phone.replace(/-/g, '')}`} className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-8 h-8 rounded-full bg-ecu-gold/20 flex items-center justify-center text-ecu-purple group-hover:bg-ecu-gold transition-colors">
                    <i className={`fas ${contact.icon} text-xs`}></i>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[11px] font-bold text-gray-800 truncate">{contact.name}</p>
                    <p className="text-[10px] text-ecu-purple font-medium">{contact.phone}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
            {!activeMessage ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                <div className="w-24 h-24 bg-ecu-purple/10 rounded-3xl rotate-12 flex items-center justify-center text-ecu-purple mb-8">
                  <i className="fas fa-book-open text-4xl -rotate-12"></i>
                </div>
                <h2 className="text-3xl font-black text-ecu-purple mb-3 italic uppercase">Go Pirates!</h2>
                <p className="text-lg text-gray-500 mb-10">Ask anything about the Fall 2024 Resident Handbook.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {SUGGESTIONS.map((s) => (
                    <button 
                      key={s} 
                      onClick={() => handleSend(s)}
                      className="p-5 text-left text-sm font-bold text-gray-600 bg-white border-2 border-slate-100 rounded-2xl hover:border-ecu-gold hover:text-ecu-purple transition-all shadow-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
                <div className="flex justify-end">
                  <div className="bg-ecu-purple text-white px-6 py-4 rounded-2xl rounded-tr-none shadow-lg max-w-[85%]">
                    <p className="text-base font-semibold">{activeMessage.question}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-ecu-gold flex items-center justify-center shadow-sm">
                      <i className="fas fa-robot text-ecu-purple text-sm"></i>
                    </div>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Handbook Insights</span>
                  </div>
                  
                  <div className={`p-6 md:p-8 rounded-3xl rounded-tl-none border-2 shadow-sm relative group
                    ${activeMessage.status === 'loading' ? 'bg-slate-50 border-slate-100' : 
                      activeMessage.status === 'error' ? 'bg-red-50 border-red-100' : 'bg-white border-ecu-gold/10'}
                  `}>
                    {activeMessage.status === 'loading' ? (
                      <div className="flex items-center gap-4 py-2">
                        <div className="flex space-x-1.5">
                          <div className="w-2.5 h-2.5 bg-ecu-purple rounded-full animate-bounce"></div>
                          <div className="w-2.5 h-2.5 bg-ecu-purple rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          <div className="w-2.5 h-2.5 bg-ecu-purple rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                        <span className="text-base font-bold text-ecu-purple italic">Searching...</span>
                      </div>
                    ) : (
                      <>
                        <div className="prose prose-base max-w-none text-gray-800 leading-relaxed">
                          <ReactMarkdown>{activeMessage.answer || ''}</ReactMarkdown>
                        </div>
                        
                        {activeMessage.status === 'success' && (
                          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <button 
                                onClick={() => handleFeedback(activeMessage.id, 'up')}
                                className={`text-lg transition-colors ${activeMessage.feedback === 'up' ? 'text-green-600' : 'text-gray-300 hover:text-green-500'}`}
                              >
                                <i className="fas fa-thumbs-up"></i>
                              </button>
                              <button 
                                onClick={() => handleFeedback(activeMessage.id, 'down')}
                                className={`text-lg transition-colors ${activeMessage.feedback === 'down' ? 'text-red-600' : 'text-gray-300 hover:text-red-500'}`}
                              >
                                <i className="fas fa-thumbs-down"></i>
                              </button>
                            </div>
                            <button 
                              onClick={() => activeMessage.answer && copyToClipboard(activeMessage.answer)}
                              className="text-xs font-bold text-ecu-purple/60 hover:text-ecu-purple uppercase tracking-tight flex items-center gap-2"
                            >
                              <i className="fas fa-copy"></i> Copy Answer
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 p-2 md:p-4 bg-white border-t border-slate-100 safe-area-pb">
            <div className="max-w-3xl mx-auto flex items-end gap-2 md:gap-3 bg-slate-100 rounded-3xl p-2 md:p-3 px-3 md:px-5 focus-within:bg-white focus-within:ring-4 focus-within:ring-ecu-purple/10 border-2 border-transparent focus-within:border-ecu-purple transition-all">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Ask about dorm policies..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-base py-2 md:py-3 px-1 resize-none max-h-40 min-h-[44px]"
                rows={1}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = 'auto';
                  t.style.height = `${t.scrollHeight}px`;
                }}
              />
              <button 
                onClick={() => handleSend()}
                disabled={!inputValue.trim()}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all shadow-lg mb-1
                  ${inputValue.trim() ? 'bg-ecu-purple text-white hover:scale-105 active:scale-95' : 'bg-slate-300 text-slate-100 cursor-not-allowed'}
                `}
              >
                <i className="fas fa-paper-plane text-base md:text-lg"></i>
              </button>
            </div>
            <p className="text-[10px] md:text-xs text-center text-gray-400 mt-2 md:mt-3 font-medium">Verify important information with Campus Living staff.</p>
          </div>
        </main>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-10 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default App;
