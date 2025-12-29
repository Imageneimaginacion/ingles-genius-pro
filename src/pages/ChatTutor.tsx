
import React, { useState, useRef, useEffect } from 'react';
import { Level, ChatMessage, UserProfile } from '../types';
import { getChatResponse } from '../services/geminiService';
import { Send, Volume2, Bot, User, Mic, MicOff, Loader2, Settings, X, Image as ImageIcon, Paperclip } from 'lucide-react';

interface ChatTutorProps {
  level: Level;
  user: UserProfile | null;
  onUpdateUser?: (updates: Partial<UserProfile>) => void;
}

const ChatTutor: React.FC<ChatTutorProps> = ({ level, user, onUpdateUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [attachment, setAttachment] = useState<string | null>(null); // Base64 image
  
  // Voice State
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter(v => v.lang.startsWith('en'));
      setAvailableVoices(englishVoices.length > 0 ? englishVoices : voices);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    if (messages.length === 0 && user) {
        const isAdult = user.age >= 18;
        const levelCode = level.split(' ')[0];

        const greetingText = isAdult
            ? `Hello ${user.name}. I am your Personal English Tutor. I see we are focusing on CEFR Level ${levelCode} today. How can I assist you with your studies?`
            : `Greetings Commander ${user.name}! 🚀 I am your AI Flight Companion. Sensors indicate we are training at Level ${levelCode}. Ready for blast off?`;

        setMessages([{
            id: 'init',
            role: 'model',
            text: greetingText,
            timestamp: Date.now()
        }]);
    }
  }, [user, level]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
            setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error("Speech error", event);
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
        alert("Speech recognition not supported in this browser. Please use Chrome.");
        return;
    }
    
    if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
    } else {
        recognitionRef.current.start();
        setIsListening(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setAttachment(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSend = async () => {
    if ((!inputValue.trim() && !attachment) || loading) return;

    const userText = inputValue.trim();
    const userAttachment = attachment; // capture current attachment
    
    setInputValue('');
    setAttachment(null);
    
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText || (userAttachment ? "[Image Uploaded]" : ""),
      timestamp: Date.now(),
      attachment: userAttachment || undefined
    };

    setMessages(prev => [...prev, newUserMsg]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Pass attachment to service if exists
      const responseText = await getChatResponse(history, userText || "Analyze this image", level, userAttachment || undefined);

      const newBotMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, newBotMsg]);
      speak(responseText);
    } catch (error) {
      console.error("Chat failed", error);
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string, forceVoiceURI?: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';

    const age = user?.age || 25;
    const allVoices = window.speechSynthesis.getVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (forceVoiceURI) {
        selectedVoice = allVoices.find(v => v.voiceURI === forceVoiceURI);
    } else if (user?.preferredVoiceURI) {
        selectedVoice = allVoices.find(v => v.voiceURI === user.preferredVoiceURI);
    }

    if (!selectedVoice) {
        if (age < 15) {
            selectedVoice = allVoices.find(v => v.name.includes('Google US English') || v.name.includes('Female'));
        } else {
            selectedVoice = allVoices.find(v => 
                v.name.includes('Google US English') || 
                v.name.includes('Samantha') || 
                v.name.includes('Female')
            );
        }
    }

    if (selectedVoice) utterance.voice = selectedVoice;

    if (age < 15) {
        utterance.pitch = 1.2; 
        utterance.rate = 1.1;
    } else {
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
    }

    window.speechSynthesis.speak(utterance);
  };

  const selectVoice = (voiceURI: string) => {
    if (onUpdateUser) {
        onUpdateUser({ preferredVoiceURI: voiceURI });
    }
    speak("Systems online. Voice calibrated.", voiceURI);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-1rem)] text-white relative">
      
      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-space-dark/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-space-card border border-space-light rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-space-light flex justify-between items-center bg-space-dark">
                    <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                        <Volume2 className="text-space-secondary" /> Calibración de Voz
                    </h2>
                    <button onClick={() => setShowSettings(false)} className="text-space-muted hover:text-white">
                        <X />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto flex-1 space-y-2">
                    <p className="text-sm text-space-muted mb-4">
                        Selecciona la voz de tu IA. Las opciones dependen de tu dispositivo.
                    </p>
                    {availableVoices.length === 0 && (
                        <p className="text-center text-yellow-400 py-4">Cargando voces del sistema...</p>
                    )}
                    {availableVoices.map((v) => (
                        <button
                            key={v.voiceURI}
                            onClick={() => selectVoice(v.voiceURI)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                user?.preferredVoiceURI === v.voiceURI
                                ? 'bg-space-primary/20 border-space-primary text-white'
                                : 'bg-space-dark border-space-light text-gray-400 hover:bg-space-light/50'
                            }`}
                        >
                            <div className="flex flex-col items-start">
                                <span className="font-bold text-sm">{v.name}</span>
                                <span className="text-xs opacity-70">{v.lang}</span>
                            </div>
                            {user?.preferredVoiceURI === v.voiceURI && <div className="w-3 h-3 rounded-full bg-space-primary shadow-[0_0_10px_#8b5cf6]"></div>}
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-space-light bg-space-dark">
                    <button 
                        onClick={() => setShowSettings(false)}
                        className="w-full bg-gradient-brand text-white font-bold py-3 rounded-xl"
                    >
                        CONFIRMAR
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-space-dark/80 backdrop-blur border-b border-space-light py-4 mb-4 sticky top-0 z-10 flex justify-between px-6 items-center">
          <div className="w-8"></div>
          <div className="bg-space-card px-4 py-1 rounded-full border border-space-light flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <h1 className="text-sm font-bold text-space-secondary uppercase tracking-widest hidden sm:block">
                Enlace Seguro {user ? `// ${user.name}` : ''}
             </h1>
             <h1 className="text-sm font-bold text-space-secondary uppercase tracking-widest sm:hidden">
                AI Link
             </h1>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="text-space-muted hover:text-white transition-colors p-2 rounded-full hover:bg-space-light/20"
            title="Configuración de Voz"
          >
            <Settings size={20} />
          </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-6 pb-32 scroll-smooth">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex flex-col max-w-[85%] gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden border border-space-light flex items-center justify-center ${isUser ? 'bg-space-primary' : 'bg-space-secondary'}`}>
                        {isUser ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
                    </div>
                    
                    <div className="relative">
                        <div className={`p-4 rounded-2xl text-base leading-relaxed shadow-lg border ${
                            isUser 
                            ? 'bg-space-primary/20 border-space-primary text-white rounded-tr-none' 
                            : 'bg-space-card border-space-light text-gray-100 rounded-tl-none'
                        }`}>
                            {msg.attachment && (
                                <img src={msg.attachment} alt="User attachment" className="max-w-full rounded-lg mb-2 border border-space-light/50" style={{maxHeight: '200px'}} />
                            )}
                            {msg.text}
                            {!isUser && (
                                <button onClick={() => speak(msg.text)} className="ml-3 align-middle text-space-secondary hover:text-white transition-colors inline-block">
                                    <Volume2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
              </div>
            </div>
          );
        })}
        {loading && (
           <div className="flex justify-start w-full">
              <div className="flex max-w-[80%] gap-3">
                 <div className="w-10 h-10 rounded-xl bg-space-secondary/50 animate-pulse"></div>
                 <div className="bg-space-card border border-space-light h-12 w-24 rounded-2xl rounded-tl-none flex items-center justify-center">
                    <Loader2 className="animate-spin text-space-secondary" size={20} />
                 </div>
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-20 md:bottom-0 left-0 right-0 md:left-64 lg:right-80 bg-space-dark border-t border-space-light p-4 z-20">
         {/* Image Preview */}
         {attachment && (
            <div className="max-w-[700px] mx-auto mb-2 flex items-center gap-2 bg-space-card p-2 rounded-xl border border-space-primary">
                <img src={attachment} alt="Preview" className="h-12 w-12 object-cover rounded-lg" />
                <span className="text-xs text-space-secondary flex-1 truncate">Imagen seleccionada para análisis</span>
                <button onClick={() => setAttachment(null)} className="p-1 text-space-muted hover:text-white"><X size={16} /></button>
            </div>
         )}

         <div className="max-w-[700px] mx-auto flex gap-3 items-center">
             <button
               onClick={toggleListening}
               className={`p-3 rounded-xl transition-all border flex items-center justify-center ${
                  isListening 
                  ? 'bg-space-error text-white border-space-error animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                  : 'bg-space-card text-space-secondary border-space-light hover:border-space-secondary hover:bg-space-light/30'
               }`}
               title="Hablar"
             >
               {isListening ? <MicOff size={24} /> : <Mic size={24} />}
             </button>

             <div className="flex-1 flex gap-2 items-center bg-space-card p-2 rounded-2xl border border-space-light focus-within:border-space-primary transition-colors shadow-lg">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-space-muted hover:text-space-secondary transition-colors"
                    title="Subir Imagen"
                >
                    <ImageIcon size={20} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

                <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Escuchando..." : "Escribe o sube una imagen..."}
                className="flex-1 bg-transparent px-2 py-2 text-white placeholder-space-muted outline-none min-w-0"
                />
                <button
                onClick={handleSend}
                disabled={(!inputValue.trim() && !attachment) || loading}
                className={`p-3 rounded-xl transition-all ${
                    !inputValue.trim() && !attachment
                    ? 'text-space-muted' 
                    : 'bg-space-primary text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                }`}
                >
                <Send size={20} />
                </button>
             </div>
         </div>
      </div>
    </div>
  );
};

export default ChatTutor;
