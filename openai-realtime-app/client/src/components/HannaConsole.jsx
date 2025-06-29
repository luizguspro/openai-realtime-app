import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2, MessageCircle, Camera, Sparkles, Hand, Users, Coffee, Eye, EyeOff } from 'lucide-react';

const HANNA_INSTRUCTIONS = `Você é a Hanna, assistente virtual do Impact Hub Pedra Branca.

ESCOPO RESTRITO: Você APENAS pode fornecer informações sobre:
- Horário: Segunda a sexta, 8h às 18h
- Endereço: Rua Jair Hamms, 38 - Pedra Branca, Palhoça/SC
- Telefone: (48) 3374-7862
- WhatsApp: (48) 92000-8625
- Informações gerais sobre coworking e salas de reunião

REGRAS IMPORTANTES:
1. Se a pergunta não for sobre o Impact Hub, responda EXATAMENTE: "Desculpe, só posso fornecer informações sobre o Impact Hub Pedra Branca. Como posso ajudar com isso?"
2. Se não tiver uma informação específica, responda EXATAMENTE: "Não tenho essa informação específica. Posso ajudar com os horários ou contatos do Impact Hub?"
3. NUNCA invente ou infira informações
4. Seja direto e conciso
5. Quando detectar alguém, cumprimente com: "Olá! Bem-vindo ao Impact Hub. Como posso ajudar?"
6. Quando o visitante informar o nome, use save_visitor_info(field='name', value='nome')`;

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

// Componente de detecção facial OTIMIZADO
const FaceDetection = ({ onFaceDetected, onFaceLost, isActive }) => {
  const videoRef = useRef(null);
  const detectorRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const consecutiveDetectionsRef = useRef(0);
  const facePresentRef = useRef(false);
  const lastSeenRef = useRef(0);

  // ==========================================
  // PARÂMETROS ARQUITETURAIS AJUSTÁVEIS
  // ==========================================
  const DETECTION_INTERVAL_MS = 250; // 4x por segundo
  const FRAMES_NEEDED_FOR_ACTIVATION = 4; // 1 segundo de atenção contínua
  const MIN_DETECTION_CONFIDENCE = 0.5;
  const SECONDS_TO_CONSIDER_LOST = 5;

  useEffect(() => {
    const initialize = async () => {
      try {
        // Importação dinâmica do MediaPipe
        const { FaceDetector, FilesetResolver } = await import('@mediapipe/tasks-vision');
        
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        
        detectorRef.current = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
            delegate: 'GPU',
          },
          minDetectionConfidence: MIN_DETECTION_CONFIDENCE,
          runningMode: 'VIDEO',
        });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            startDetectionLoop();
          };
        }
      } catch (err) {
        console.error('[FaceDetection] Erro ao inicializar:', err);
      }
    };

    const startDetectionLoop = () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);

      detectionIntervalRef.current = setInterval(async () => {
        if (detectorRef.current && videoRef.current && videoRef.current.readyState >= 3) {
          try {
            const detections = detectorRef.current.detectForVideo(videoRef.current, Date.now());

            if (detections.detections.length > 0) {
              handleFacePresent();
            } else {
              handleFaceAbsent();
            }
          } catch (err) {
            console.error('[FaceDetection] Erro na detecção:', err);
          }
        }
      }, DETECTION_INTERVAL_MS);
    };

    const handleFacePresent = () => {
      lastSeenRef.current = Date.now();
      consecutiveDetectionsRef.current++;

      if (!facePresentRef.current && consecutiveDetectionsRef.current >= FRAMES_NEEDED_FOR_ACTIVATION) {
        console.log('[FaceDetection] Rosto detectado - ativando conversa');
        facePresentRef.current = true;
        onFaceDetected();
      }
    };

    const handleFaceAbsent = () => {
      consecutiveDetectionsRef.current = 0;

      if (facePresentRef.current && (Date.now() - lastSeenRef.current) > (SECONDS_TO_CONSIDER_LOST * 1000)) {
        console.log('[FaceDetection] Rosto perdido - desativando conversa');
        facePresentRef.current = false;
        onFaceLost();
      }
    };

    if (isActive) {
      initialize();
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (detectorRef.current) {
        detectorRef.current.close();
      }
    };
  }, [isActive, onFaceDetected, onFaceLost]);

  return (
    <video 
      ref={videoRef}
      className="hidden"
      autoPlay
      playsInline
      muted
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
    <div className="fixed top-4 left-4 bg-black/80 text-white rounded-lg p-3 text-xs font-mono">
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
      dcRef.current.send(JSON.stringify(event));
    }
  }, []);

  const sendTextMessage = useCallback((text) => {
    sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{
          type: 'input_text',
          text: text
        }]
      }
    });
  }, [sendEvent]);

  const handleRealtimeEvent = useCallback((event) => {
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
        if (event.item.type === 'message') {
          // Só adiciona mensagem se tiver conteúdo significativo
          const text = event.item.content?.[0]?.text || event.item.content?.[0]?.transcript || '';
          
          // Filtra mensagens muito curtas ou fragmentadas
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
          }
        }
        break;

      case 'conversation.item.truncated':
        console.log('Item truncated:', event.item_id);
        break;

      case 'conversation.item.input_audio_transcription.completed':
        // Só atualiza se a transcrição for significativa
        if (event.transcript && event.transcript.length > 3) {
          setMessages(prev => prev.map(m => 
            m.id === event.item_id 
              ? { ...m, text: event.transcript }
              : m
          ));
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
        setIsListening(false);
        break;

      case 'input_audio_buffer.committed':
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
        break;
    }
  }, [isSpeechDetected, sendEvent]);

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
            instructions: HANNA_INSTRUCTIONS + `

<noise_environment_protocol>
  Para ambientes barulhentos:
  - APENAS responda quando tiver CERTEZA de que alguém está falando DIRETAMENTE com você
  - Ignore ruídos de fundo, conversas distantes e sons ambiente
  - Espere por frases completas e claras antes de responder
  - Se não entender claramente, responda: "Desculpe, não entendi. Pode repetir?"
  - NÃO responda a fragmentos de conversa ou palavras soltas
  - Aguarde pelo menos 2 segundos de silêncio antes de responder
</noise_environment_protocol>`,
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: { 
              model: 'whisper-1',
              language: 'pt'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.7,              // AUMENTADO de 0.4 para 0.7 (mais rigoroso)
              prefix_padding_ms: 300,      // REDUZIDO de 500 para 300
              silence_duration_ms: 1500    // AUMENTADO de 800 para 1500 (espera mais silêncio)
            },
            voice: 'nova',  // Voz válida e profissional
            temperature: 0.6,              // Mínimo permitido pela API (mais focado e consistente)
            max_response_output_tokens: 200,  // Reduzido para respostas mais concisas
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

    // Clear any existing inactivity timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Envia comando para o assistente cumprimentar
    if (isConnected) {
      sendEvent({ type: 'response.create' });
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