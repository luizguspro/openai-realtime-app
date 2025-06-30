import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2, MessageCircle, Camera, Sparkles, Hand, Users, Coffee, Eye, EyeOff } from 'lucide-react';
import FaceDetection from './FaceDetection';

const HANNA_INSTRUCTIONS = `Você é a Hanna, assistente virtual do Impact Hub Pedra Branca.

IMPORTANTE: Você receberá contexto relevante baseado na pergunta do usuário. Use APENAS as informações fornecidas no contexto para responder.

REGRAS FUNDAMENTAIS:
1. SEMPRE baseie suas respostas EXCLUSIVAMENTE no contexto fornecido
2. Se não houver contexto ou a informação não estiver no contexto, responda: "Desculpe, não encontrei essa informação em nossa base de dados. Posso ajudar com outra coisa?"
3. NUNCA invente, infira ou complete informações
4. Seja direto, conciso e amigável
5. Quando detectar alguém, cumprimente com: "Olá! Bem-vindo ao Impact Hub. Como posso ajudar?"
6. Quando o visitante informar o nome, use save_visitor_info(field='name', value='nome')

FORMATO DE RESPOSTA:
- Responda de forma natural e conversacional
- Use as informações do contexto sem citar que veio de um "contexto"
- Seja específico quando houver múltiplas unidades ou informações`;

// Tela de espera minimalista e hipnotizante
const WelcomeScreen = ({ currentTime }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    let phase = 0;
    let particles = [];

    // Criar partículas orbitais
    for (let i = 0; i < 60; i++) {
      particles.push({
        angle: (Math.PI * 2 / 60) * i,
        radius: 150 + Math.random() * 100,
        size: 1 + Math.random() * 2,
        speed: 0.001 + Math.random() * 0.002,
        opacity: 0.1 + Math.random() * 0.3
      });
    }

    const draw = () => {
      // Fundo com gradiente sutil
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(1, 'rgba(245, 245, 245, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Desenhar círculos concêntricos com fade
      for (let i = 5; i > 0; i--) {
        const radius = 80 * i + Math.sin(phase * 0.5) * 10;
        const opacity = 0.05 * (6 - i) / 5;
        
        ctx.strokeStyle = `rgba(139, 47, 51, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Núcleo central pulsante
      const coreRadius = 50 + Math.sin(phase) * 5;
      const coreGradient = ctx.createRadialGradient(
        centerX, 
        centerY - 10, 
        0, 
        centerX, 
        centerY, 
        coreRadius
      );
      coreGradient.addColorStop(0, 'rgba(139, 47, 51, 0.2)');
      coreGradient.addColorStop(0.5, 'rgba(139, 47, 51, 0.1)');
      coreGradient.addColorStop(1, 'rgba(139, 47, 51, 0)');
      
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // Desenhar partículas orbitais
      particles.forEach(particle => {
        particle.angle += particle.speed;
        const x = centerX + Math.cos(particle.angle + phase * 0.1) * particle.radius;
        const y = centerY + Math.sin(particle.angle + phase * 0.1) * particle.radius;
        
        ctx.fillStyle = `rgba(139, 47, 51, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Onda expansiva ocasional
      if (phase % 200 < 100) {
        const waveRadius = (phase % 200) * 3;
        const waveOpacity = 1 - (phase % 200) / 100;
        
        ctx.strokeStyle = `rgba(139, 47, 51, ${waveOpacity * 0.2})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      phase += 1;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    // Animação de pulso do texto
    const pulseInterval = setInterval(() => {
      setPulseScale(prev => prev === 1 ? 1.05 : 1);
    }, 2000);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearInterval(pulseInterval);
    };
  }, []);

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Canvas de animação de fundo */}
      <canvas
        ref={canvasRef}
        width={1080}
        height={1920}
        className="absolute inset-0 opacity-60"
      />

      {/* Conteúdo principal */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-20">
        {/* Logo minimalista */}
        <div className="mb-20">
          <div className="bg-[#8B2F33] w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-700">
            <div className="text-white text-4xl font-bold">IH</div>
          </div>
        </div>

        {/* Mensagem principal */}
        <div className="text-center space-y-8 max-w-3xl">
          <h1 
            className="text-7xl font-extralight text-gray-900 leading-tight transition-transform duration-1000"
            style={{ transform: `scale(${pulseScale})` }}
          >
            {greeting()}
          </h1>
          
          <p className="text-3xl text-gray-600 font-light">
            Aproxime-se para conversar
          </p>

          {/* Indicador visual minimalista */}
          <div className="mt-16 flex justify-center">
            <div className="relative">
              {/* Olho estilizado */}
              <div className="w-24 h-12 border-2 border-[#8B2F33] rounded-full relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-[#8B2F33] rounded-full animate-look" />
                </div>
              </div>
              
              {/* Texto sutil */}
              <p className="text-sm text-gray-400 mt-4 absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                Estou te procurando
              </p>
            </div>
          </div>
        </div>

        {/* Impact Hub sutil no rodapé */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <p className="text-xl font-light text-gray-400 tracking-widest">IMPACT HUB</p>
        </div>
      </div>

      {/* Gradiente inferior sutil */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent" />
    </div>
  );
};

// Avatar animado da Hanna
const HannaAvatar = ({ isListening, isSpeaking, hasVisitor }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    let phase = 0;
    
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Círculos de fundo animados
      const layers = 4;
      for (let i = layers; i > 0; i--) {
        const radius = 50 * (i / layers);
        const scale = hasVisitor ? 1.3 : (isListening ? 1.2 : (isSpeaking ? 1.15 : 1));
        const animatedRadius = radius * scale + Math.sin(phase + i) * 3;
        
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, animatedRadius);
        gradient.addColorStop(0, `rgba(139, 47, 51, ${0.15 * (layers - i + 1) / layers})`);
        gradient.addColorStop(1, `rgba(139, 47, 51, ${0.05 * (layers - i + 1) / layers})`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, animatedRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Núcleo central
      const coreGradient = ctx.createRadialGradient(centerX, centerY - 5, 0, centerX, centerY, 20);
      coreGradient.addColorStop(0, '#A03439');
      coreGradient.addColorStop(1, '#8B2F33');
      
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 18 + Math.sin(phase * 2) * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Efeito de brilho
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(centerX - 5, centerY - 5, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Ondas sonoras quando falando/ouvindo ou detectando visitante
      if (isSpeaking || isListening || hasVisitor) {
        for (let i = 0; i < 3; i++) {
          const waveRadius = 60 + i * 25 + (phase * 40) % 60;
          const waveOpacity = Math.max(0, 1 - waveRadius / 150) * 0.4;
          
          ctx.strokeStyle = `rgba(139, 47, 51, ${waveOpacity})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Partículas
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI * 2 / 6) * i + phase;
          const distance = 40 + Math.sin(phase * 3 + i) * 10;
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
          
          ctx.fillStyle = `rgba(139, 47, 51, ${0.4 + Math.sin(phase * 2 + i) * 0.2})`;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      phase += hasVisitor ? 0.05 : 0.03;
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, isSpeaking, hasVisitor]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
      width={300}
      height={300}
    />
  );
};

// Visualizador de áudio
const AudioVisualizer = ({ isActive, isListening }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    let phase = 0;
    const bars = 50;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      if (isActive) {
        const barWidth = width / bars;
        const centerY = height / 2;
        
        for (let i = 0; i < bars; i++) {
          const x = i * barWidth;
          const amplitude = isListening ? 25 : 15;
          const frequency = 0.1 + (i / bars) * 0.1;
          const barHeight = Math.abs(Math.sin((i + phase) * frequency) * amplitude * (isListening ? Math.random() * 0.7 + 0.3 : 0.5));
          
          const gradient = ctx.createLinearGradient(x, centerY - barHeight, x, centerY + barHeight);
          gradient.addColorStop(0, 'rgba(139, 47, 51, 0.8)');
          gradient.addColorStop(0.5, 'rgba(139, 47, 51, 1)');
          gradient.addColorStop(1, 'rgba(139, 47, 51, 0.8)');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, centerY - barHeight, barWidth - 2, barHeight * 2);
        }
      } else {
        // Estado inativo - linha sutil
        const centerY = height / 2;
        for (let i = 0; i < bars; i++) {
          const x = i * (width / bars);
          ctx.fillStyle = 'rgba(139, 47, 51, 0.2)';
          ctx.fillRect(x, centerY - 1, (width / bars) - 2, 2);
        }
      }
      
      phase += isListening ? 0.2 : 0.08;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, isListening]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
      width={800}
      height={80}
    />
  );
};

// Componente de chat
const ChatMessages = ({ messages }) => {
  const scrollRef = useRef(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-10">
      <div ref={scrollRef} className="h-full overflow-y-auto scrollbar-hide space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={msg.id || idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            <div
              className={`max-w-[85%] px-8 py-6 rounded-3xl shadow-lg transform transition-all hover:scale-[1.02] ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-[#8B2F33] to-[#A03439] text-white'
                  : 'bg-white border border-gray-100'
              }`}
            >
              <div className="text-sm opacity-70 mb-2 font-medium flex items-center gap-2">
                {msg.role === 'user' ? (
                  <>
                    <Users className="h-4 w-4" />
                    Visitante
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Hanna
                  </>
                )}
              </div>
              <div className="text-xl leading-relaxed">{msg.text || '...'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Indicador de status da detecção facial (para debug)
const FaceDetectionStatus = ({ hasVisitor, isConnected }) => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white rounded-lg p-3 text-xs font-mono z-50">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span>Detecção: {isConnected ? 'Ativa' : 'Inativa'}</span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <div className={`w-3 h-3 rounded-full ${hasVisitor ? 'bg-green-500' : 'bg-gray-500'}`} />
        <span>Visitante: {hasVisitor ? 'Presente' : 'Ausente'}</span>
      </div>
    </div>
  );
};

const NoiseIndicator = ({ audioLevel, isSpeechDetected }) => {
  const getNoiseLevel = () => {
    if (audioLevel < 10) return { text: 'Silencioso', color: 'text-green-500' };
    if (audioLevel < 30) return { text: 'Normal', color: 'text-blue-500' };
    if (audioLevel < 50) return { text: 'Barulhento', color: 'text-yellow-500' };
    return { text: 'Muito barulhento', color: 'text-red-500' };
  };

  const noise = getNoiseLevel();

  return (
    <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isSpeechDetected ? 'bg-green-500' : 'bg-gray-300'}`} />
        <span className="text-gray-600">Ambiente:</span>
        <span className={noise.color}>{noise.text}</span>
      </div>
    </div>
  );
};

// Tela de conversa minimalista
const ConversationScreen = ({ 
  currentTime,
  greeting,
  isConnected,
  hasVisitor,
  isListening,
  isSpeaking,
  messages,
  visitorInfo,
  error,
  audioLevel,
  isSpeechDetected
}) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header minimalista */}
      <header className="px-12 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="bg-[#8B2F33] w-16 h-16 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">IH</span>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Assistente Virtual</p>
              <p className="text-2xl font-light text-gray-900">Hanna</p>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="flex-1 px-12 py-6 overflow-hidden">
        <div className="h-full flex gap-8">
          {/* Coluna esquerda - Avatar minimalista */}
          <div className="w-[400px] flex-shrink-0">
            <div className="bg-gray-50 rounded-3xl p-10 h-full flex flex-col items-center justify-center">
              <div className="relative mb-8">
                <div className="w-48 h-48 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <HannaAvatar isListening={isListening} isSpeaking={isSpeaking} hasVisitor={hasVisitor} />
                </div>
                {isConnected && (
                  <div className="absolute -bottom-2 -right-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                      hasVisitor ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                    }`}>
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                )}
              </div>

              <h2 className="text-3xl font-light text-gray-900 mb-2">Hanna</h2>
              <p className="text-base text-gray-500 mb-8">
                {!isConnected ? (
                  'Conectando...'
                ) : (
                  'Conversando com você'
                )}
              </p>

              {isConnected && (
                <div className="w-full h-16 bg-white rounded-2xl p-2 shadow-inner">
                  <AudioVisualizer isActive={isConnected} isListening={isListening} />
                </div>
              )}
              
              {visitorInfo.name && (
                <div className="mt-6 text-center">
                  <p className="text-lg text-[#8B2F33]">Olá, {visitorInfo.name}! 👋</p>
                </div>
              )}
            </div>
          </div>

          {/* Área de Chat */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 h-full flex flex-col overflow-hidden">
              <div className="p-8 border-b border-gray-100">
                <h3 className="text-2xl font-light text-gray-900 flex items-center space-x-3">
                  <MessageCircle className="h-6 w-6 text-[#8B2F33]" />
                  <span>Conversa</span>
                </h3>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatMessages messages={messages} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de ruído */}
      <NoiseIndicator audioLevel={audioLevel} isSpeechDetected={isSpeechDetected} />

      {/* Mensagem de Erro minimalista */}
      {error && (
        <div className="fixed bottom-12 right-12 max-w-md bg-white border border-red-200 rounded-2xl p-6 shadow-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default function HannaConsole() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hasVisitor, setHasVisitor] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeechDetected, setIsSpeechDetected] = useState(false);
  const [visitorInfo, setVisitorInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const audioRef = useRef(null);
  const lastGreetingRef = useRef(0);
  const sessionActiveRef = useRef(false);
  const inactivityTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const processingQueryRef = useRef(false);
  const pendingUserMessagesRef = useRef([]);
  const firstGreetingDoneRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Função para analisar nível de áudio
  const setupAudioAnalyser = useCallback((stream) => {
    if (!stream) return;

    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      analyserRef.current.minDecibels = -90;
      analyserRef.current.maxDecibels = -10;
      analyserRef.current.smoothingTimeConstant = 0.85;
      
      source.connect(analyserRef.current);
      
      const checkAudioLevel = () => {
        if (!analyserRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calcula o nível médio de áudio
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        
        // Detecção de fala baseada em frequência
        // Fala humana geralmente está entre 85-255 Hz e 300-3400 Hz
        const speechFrequencies = dataArray.slice(2, 50); // Aproximadamente 85-2000 Hz
        const speechAverage = speechFrequencies.reduce((a, b) => a + b) / speechFrequencies.length;
        
        // Só considera fala se o nível for significativo e nas frequências corretas
        const isSpeech = speechAverage > 30 && average > 20;
        setIsSpeechDetected(isSpeech);
        
        requestAnimationFrame(checkAudioLevel);
      };
      
      checkAudioLevel();
    } catch (err) {
      console.error('Erro ao configurar analisador de áudio:', err);
    }
  }, []);

  const sendEvent = useCallback((event) => {
    if (dcRef.current && dcRef.current.readyState === 'open') {
      console.log('[Hanna] Enviando evento:', event.type);
      dcRef.current.send(JSON.stringify(event));
    } else {
      console.warn('[Hanna] Data channel não está aberto:', event.type);
    }
  }, []);

  const searchContextInPinecone = useCallback(async (query, itemId) => {
    try {
      console.log('[Hanna] Iniciando busca no Pinecone para:', query);
      processingQueryRef.current = true;
      
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        console.error('[Hanna] Erro ao buscar no Pinecone:', response.status);
        return null;
      }

      const data = await response.json();
      console.log('[Hanna] Resposta do Pinecone:', data);
      
      if (data.context) {
        console.log('[Hanna] Contexto encontrado:', data.context);
        return data.context;
      } else {
        console.log('[Hanna] Nenhum contexto relevante encontrado');
        return null;
      }
    } catch (error) {
      console.error('[Hanna] Erro ao buscar contexto:', error);
      return null;
    } finally {
      processingQueryRef.current = false;
    }
  }, []);

  const processUserMessage = useCallback(async (text, itemId) => {
    // Só processa se o cumprimento inicial já foi feito
    if (!firstGreetingDoneRef.current) {
      console.log('[Hanna] Aguardando cumprimento inicial ser concluído');
      return;
    }
    
    console.log('[Hanna] Processando mensagem do usuário:', text);
    processingQueryRef.current = true;
    
    try {
      // Busca contexto no Pinecone
      const context = await searchContextInPinecone(text, itemId);
      
      // Atualiza as instruções da sessão com o contexto
      const updatedInstructions = context 
        ? HANNA_INSTRUCTIONS + `\n\nCONTEXTO RELEVANTE PARA RESPONDER:\n${context}\n\nUse APENAS essas informações para responder à pergunta do usuário: "${text}"`
        : HANNA_INSTRUCTIONS + `\n\nNão foram encontradas informações específicas sobre: "${text}". Responda educadamente que não tem essa informação.`;
      
      console.log('[Hanna] Atualizando instruções da sessão com contexto');
      sendEvent({
        type: 'session.update',
        session: {
          instructions: updatedInstructions,
          modalities: ['text', 'audio'],
          temperature: 0.6
        }
      });
      
      // Aguarda um pouco para garantir que a sessão foi atualizada
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Agora cria a resposta
      console.log('[Hanna] Criando resposta com contexto atualizado');
      sendEvent({
        type: 'response.create',
        response: {
          modalities: ['text', 'audio']
        }
      });
    } catch (error) {
      console.error('[Hanna] Erro ao processar mensagem:', error);
    } finally {
      processingQueryRef.current = false;
    }
  }, [searchContextInPinecone, sendEvent]);

  const handleRealtimeEvent = useCallback((event) => {
    console.log('[Hanna] Evento recebido:', event.type);
    
    switch (event.type) {
      case 'error':
        console.error('Server error:', event.error);
        console.error('Error details:', JSON.stringify(event.error, null, 2));
        // Só mostra erro se não for relacionado a ruído
        if (!event.error.message?.includes('noise') && !event.error.message?.includes('unclear')) {
          setError(event.error.message || 'Erro no servidor');
        }
        break;

      case 'session.created':
        console.log('Session created:', event.session);
        break;

      case 'session.updated':
        console.log('Session updated:', event.session);
        break;

      case 'conversation.item.created':
        console.log('[Hanna] Item criado:', event.item);
        if (event.item.type === 'message') {
          const text = event.item.content?.[0]?.text || event.item.content?.[0]?.transcript || '';
          console.log('[Hanna] Texto do item:', text);
          
          // Adiciona a mensagem à interface
          if (text.length > 3 && !text.match(/^(\.|,|!|\?|hmm|uh|eh|ah|oh)$/i)) {
            setMessages(prev => {
              const existing = prev.find(m => m.id === event.item.id);
              if (!existing) {
                return [...prev, {
                  id: event.item.id,
                  role: event.item.role,
                  text: text,
                  timestamp: Date.now(),
                }];
              }
              return prev;
            });
          } else if (event.item.role === 'user' || event.item.role === 'assistant') {
            // Adiciona mensagem vazia para ser preenchida depois
            setMessages(prev => {
              const existing = prev.find(m => m.id === event.item.id);
              if (!existing) {
                return [...prev, {
                  id: event.item.id,
                  role: event.item.role,
                  text: '',
                  timestamp: Date.now(),
                }];
              }
              return prev;
            });
          }
        }
        break;

      case 'conversation.item.truncated':
        console.log('Item truncated:', event.item_id);
        break;

      case 'conversation.item.input_audio_transcription.completed':
        console.log('[Hanna] Transcrição completa:', event.transcript);
        if (event.transcript && event.transcript.length > 3) {
          setMessages(prev => prev.map(m => 
            m.id === event.item_id 
              ? { ...m, text: event.transcript }
              : m
          ));
          
          // IMPORTANTE: Processa a mensagem quando a transcrição estiver completa
          if (!processingQueryRef.current) {
            console.log('[Hanna] Processando transcrição completa imediatamente');
            processUserMessage(event.transcript, event.item_id);
          }
        }
        break;

      case 'conversation.item.input_audio_transcription.failed':
        console.error('Transcription failed:', event.error);
        break;

      case 'response.audio_transcript.delta':
      case 'response.text.delta':
        setMessages(prev => prev.map(m => 
          m.id === event.item_id 
            ? { ...m, text: (m.text || '') + event.delta }
            : m
        ));
        break;

      case 'response.audio_transcript.done':
        setMessages(prev => prev.map(m => 
          m.id === event.item_id 
            ? { ...m, text: event.transcript }
            : m
        ));
        break;

      case 'response.text.done':
        setMessages(prev => prev.map(m => 
          m.id === event.item_id 
            ? { ...m, text: event.text }
            : m
        ));
        break;

      case 'input_audio_buffer.speech_started':
        console.log('[Hanna] Detectou início de fala');
        // Só marca como listening se realmente detectar fala
        if (isSpeechDetected) {
          setIsListening(true);
          sessionActiveRef.current = true;
          if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
          }
        }
        break;

      case 'input_audio_buffer.speech_stopped':
        console.log('[Hanna] Detectou fim de fala');
        setIsListening(false);
        break;

      case 'input_audio_buffer.committed':
        console.log('[Hanna] Áudio commitado para processamento');
        break;

      case 'response.created':
        console.log('[Hanna] Resposta criada');
        break;

      case 'response.output_item.added':
        console.log('[Hanna] Item de saída adicionado:', event);
        break;

      case 'response.content_part.added':
        console.log('[Hanna] Parte do conteúdo adicionada:', event);
        break;

      case 'response.audio.delta':
        setIsSpeaking(true);
        break;

      case 'response.audio.done':
        setIsSpeaking(false);
        // Start inactivity timer
        inactivityTimerRef.current = setTimeout(() => {
          if (!sessionActiveRef.current) {
            setShowConversation(false);
            setHasVisitor(false);
            setMessages([]);
            setVisitorInfo({ name: '', email: '', phone: '' });
          }
        }, 45000); // 45 segundos de inatividade
        break;

      case 'response.done':
        console.log('[Hanna] Resposta concluída');
        break;
      
      case 'response.function_call_arguments.done':
        if (event.name === 'save_visitor_info') {
          try {
            const args = JSON.parse(event.arguments);
            setVisitorInfo(prev => ({
              ...prev,
              [args.field]: args.value
            }));
            
            sendEvent({
              type: 'conversation.item.create',
              item: {
                type: 'function_call_output',
                call_id: event.call_id,
                output: JSON.stringify({ success: true, message: 'Informação salva com sucesso' })
              }
            });
          } catch (err) {
            console.error('Error saving visitor info:', err);
          }
        }
        break;

      default:
        console.log('[Hanna] Evento não tratado:', event.type);
        break;
    }
  }, [isSpeechDetected, sendEvent, processUserMessage]);

  const initializeWebRTC = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const sessionResponse = await fetch('/api/session');
      
      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json();
        throw new Error(errorData.error || 'Failed to get session');
      }

      const sessionData = await sessionResponse.json();
      const ephemeralKey = sessionData.client_secret.value;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      pcRef.current = pc;

      if (!audioRef.current) {
        audioRef.current = document.createElement('audio');
        audioRef.current.autoplay = true;
        document.body.appendChild(audioRef.current);
      }

      pc.ontrack = (e) => {
        if (e.track.kind === 'audio') {
          audioRef.current.srcObject = e.streams[0];
        }
      };

      // CONFIGURAÇÕES DE ÁUDIO MELHORADAS PARA AMBIENTES BARULHENTOS
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,      // Crítico para ambientes barulhentos
          autoGainControl: true,
          sampleRate: 24000,
          channelCount: 1
        } 
      });
      setAudioStream(stream);
      
      // Testa se o áudio está funcionando
      console.log('[Hanna] Stream de áudio obtido:', stream.active);
      console.log('[Hanna] Tracks de áudio:', stream.getAudioTracks().length);

      const audioTrack = stream.getAudioTracks()[0];
      pc.addTrack(audioTrack, stream);

      const dc = pc.createDataChannel('oai-events', { ordered: true });
      dcRef.current = dc;

      dc.onopen = () => {
        console.log('Data channel opened');
        setIsConnected(true);
        setIsConnecting(false);
        
        const sessionConfig = {
          type: 'session.update',
          session: {
            instructions: HANNA_INSTRUCTIONS,
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: { 
              model: 'whisper-1',
              language: 'pt'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,               
              prefix_padding_ms: 500,       
              silence_duration_ms: 1200,    // Aumentado para dar mais tempo
              create_response: false        // IMPORTANTE: Desativa criação automática de resposta
            },
            voice: 'alloy',  
            temperature: 0.6,              
            max_response_output_tokens: 200,  
            tools: [
              {
                type: 'function',
                name: 'save_visitor_info',
                description: 'Salva informações do visitante como nome, email ou telefone',
                parameters: {
                  type: 'object',
                  properties: {
                    field: {
                      type: 'string',
                      enum: ['name', 'email', 'phone'],
                      description: 'Tipo de informação a ser salva'
                    },
                    value: {
                      type: 'string',
                      description: 'Valor a ser salvo'
                    }
                  },
                  required: ['field', 'value']
                }
              }
            ],
            tool_choice: 'auto',
          },
        };
        
        console.log('Sending session config:', sessionConfig);
        sendEvent(sessionConfig);
      };

      dc.onclose = () => {
        setIsConnected(false);
      };

      dc.onerror = (error) => {
        console.error('Data channel error:', error);
        setError('Erro na conexão de dados.');
      };

      dc.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          handleRealtimeEvent(event);
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const answerResponse = await fetch('https://api.openai.com/v1/realtime', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp'
        },
        body: offer.sdp,
      });

      if (!answerResponse.ok) {
        const errorText = await answerResponse.text();
        throw new Error(`Falha ao conectar com OpenAI: ${errorText}`);
      }

      const answerSdp = await answerResponse.text();
      
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });

    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message);
      setIsConnecting(false);
      setIsConnected(false);
    }
  }, [sendEvent, handleRealtimeEvent]);

  const disconnect = useCallback(() => {
    if (dcRef.current) {
      dcRef.current.close();
      dcRef.current = null;
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }

    if (audioRef.current && audioRef.current.srcObject) {
      audioRef.current.srcObject = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setMessages([]);
    pendingUserMessagesRef.current = [];
  }, [audioStream]);

  const toggleMute = useCallback(() => {
    if (audioStream) {
      audioStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  }, [audioStream, isMuted]);

  // Função chamada quando detecta um rosto
  const handleFaceDetected = useCallback(() => {
    const now = Date.now();
    
    // Evita cumprimentar múltiplas vezes em sequência
    if (now - lastGreetingRef.current < 60000) {
      console.log('[Hanna] Visitante já foi cumprimentado recentemente');
      return;
    }
    
    console.log('[Hanna] Novo visitante detectado! Ativando conversa...');
    lastGreetingRef.current = now;
    setHasVisitor(true);
    setShowConversation(true);
    sessionActiveRef.current = true;
    firstGreetingDoneRef.current = false; // Reset para novo visitante

    // Clear any existing inactivity timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Envia comando para o assistente cumprimentar
    if (isConnected) {
      sendEvent({ type: 'response.create' });
      // Marca que o cumprimento inicial foi enviado
      setTimeout(() => {
        firstGreetingDoneRef.current = true;
      }, 2000);
    }
  }, [isConnected, sendEvent]);

  // Função chamada quando perde o rosto
  const handleFaceLost = useCallback(() => {
    sessionActiveRef.current = false;
    
    // Start timer to return to welcome screen
    inactivityTimerRef.current = setTimeout(() => {
      if (!sessionActiveRef.current) {
        setShowConversation(false);
        setHasVisitor(false);
        setMessages([]);
        setVisitorInfo({ name: '', email: '', phone: '' });
        firstGreetingDoneRef.current = false; // Reset quando visitante sai
        pendingUserMessagesRef.current = []; // Limpa fila
      }
    }, 20000); // 20 segundos após perder o rosto
  }, []);

  // Modifique a inicialização do áudio para incluir o analisador
  useEffect(() => {
    if (audioStream) {
      setupAudioAnalyser(audioStream);
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioStream, setupAudioAnalyser]);

  // Inicializa automaticamente a conexão ao carregar
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isConnected && !isConnecting) {
        initializeWebRTC();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isConnected, disconnect]);

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Renderiza a tela apropriada
  return (
    <>
      {/* Detecção facial sempre ativa mas invisível */}
      <FaceDetection 
        onFaceDetected={handleFaceDetected}
        onFaceLost={handleFaceLost}
        isActive={isConnected}
        debugMode={process.env.NODE_ENV === 'development'} // Ativa debug mode apenas em desenvolvimento
      />
      
      {/* Indicador de debug (apenas em desenvolvimento) */}
      <FaceDetectionStatus hasVisitor={hasVisitor} isConnected={isConnected} />
      
      {/* Renderiza tela de espera ou conversa */}
      {!showConversation ? (
        <WelcomeScreen currentTime={currentTime} />
      ) : (
        <ConversationScreen
          currentTime={currentTime}
          greeting={greeting}
          isConnected={isConnected}
          hasVisitor={hasVisitor}
          isListening={isListening}
          isSpeaking={isSpeaking}
          messages={messages}
          visitorInfo={visitorInfo}
          error={error}
          audioLevel={audioLevel}
          isSpeechDetected={isSpeechDetected}
        />
      )}
    </>
  );
}