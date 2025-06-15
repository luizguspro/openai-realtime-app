import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, Loader2, MessageCircle, Phone, Mail, MapPin, Clock, ChevronRight, Headphones, Coffee, Users } from 'lucide-react';

const HANNA_INSTRUCTIONS = `Você é a Hanna, assistente virtual super animada e carismática do Impact Hub Pedra Branca em Palhoça/SC. 

PERSONALIDADE:
- Seja SUPER animada, alegre e acolhedora! 😊
- Use expressões como "Que legal!", "Maravilha!", "Adorei!", "Oba!"
- Faça pequenas brincadeiras e seja espontânea
- Demonstre entusiasmo genuíno ao conversar
- Use emojis na fala quando apropriado

REGRAS ESSENCIAIS:
1. Máximo 2-3 frases curtas, mas CHEIAS de energia!
2. NUNCA corte palavras ou frases no meio
3. Seja objetiva mas com muito carisma
4. Use linguagem informal e amigável
5. Foque no Impact Hub mas com personalidade
6. SEMPRE responda por voz, mesmo quando receber texto

CAPTURA DE INFORMAÇÕES:
- Quando o visitante disser o nome dele, use a função save_visitor_info com field='name' e value='nome_informado'
- Exemplo: Se disser "Meu nome é João", use save_visitor_info(field='name', value='João')
- Depois de salvar, confirme alegremente: "João! Que nome lindo! Prazer em conhecer você!"

INFORMAÇÕES DO IMPACT HUB:
- Local INCRÍVEL na Rua Jair Hamms, 38 - Pedra Branca
- Telefone: (48) 3374-7862 
- WhatsApp: (48) 92000-8625 (responde rapidinho!)
- Horário: Segunda a sexta, 8h às 18h

SOBRE O ESPAÇO:
- Coworking mais TOP de Floripa!
- Escritórios privativos super modernos
- Salas de reunião incríveis
- Comunidade vibrante de empreendedores
- Ambiente super inovador e inspirador!`;

// Avatar animado minimalista da Hanna
const HannaAvatar = ({ isListening, isSpeaking }) => {
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
      
      const layers = 3;
      for (let i = layers; i > 0; i--) {
        const radius = 40 * (i / layers);
        const scale = isListening ? 1.15 : (isSpeaking ? 1.1 : 1);
        const animatedRadius = radius * scale + Math.sin(phase + i) * 2;
        
        ctx.fillStyle = `rgba(139, 47, 51, ${0.1 * (layers - i + 1) / layers})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, animatedRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.fillStyle = '#8B2F33';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15 + Math.sin(phase * 2) * 1, 0, Math.PI * 2);
      ctx.fill();
      
      if (isSpeaking || isListening) {
        for (let i = 0; i < 2; i++) {
          const waveRadius = 50 + i * 20 + (phase * 30) % 40;
          const waveOpacity = Math.max(0, 1 - waveRadius / 100) * 0.3;
          
          ctx.strokeStyle = `rgba(139, 47, 51, ${waveOpacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      
      phase += 0.02;
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, isSpeaking]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
      width={150}
      height={150}
    />
  );
};

// Visualizador de áudio minimalista
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
    const dots = 40;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      if (isActive) {
        const dotSize = 3;
        const spacing = width / dots;
        const centerY = height / 2;
        
        for (let i = 0; i < dots; i++) {
          const x = i * spacing + spacing / 2;
          const amplitude = isListening ? 15 : 8;
          const y = centerY + Math.sin((i + phase) * 0.2) * amplitude * (isListening ? Math.random() * 0.5 + 0.5 : 0.3);
          
          ctx.fillStyle = '#8B2F33';
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        const dotSize = 2;
        const spacing = width / dots;
        const centerY = height / 2;
        
        for (let i = 0; i < dots; i++) {
          const x = i * spacing + spacing / 2;
          ctx.fillStyle = 'rgba(139, 47, 51, 0.3)';
          ctx.beginPath();
          ctx.arc(x, centerY, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      phase += isListening ? 0.15 : 0.05;
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
      width={600}
      height={60}
    />
  );
};

// Componente de chat clean
const ChatMessages = ({ messages }) => {
  const scrollRef = useRef(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  return (
    <div className="h-full bg-gray-50 rounded-2xl p-6">
      <div ref={scrollRef} className="h-full overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageCircle className="h-10 w-10 mb-3" />
            <p className="text-base">Inicie uma conversa com a Hanna</p>
            <p className="text-sm">Clique no botão abaixo para começar</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-5 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-[#8B2F33] text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="text-xs opacity-70 mb-1 font-medium">
                  {msg.role === 'user' ? 'Você' : 'Hanna'}
                </div>
                <div className="text-sm leading-relaxed">{msg.text || '...'}</div>
              </div>
            </div>
          ))
        )}
      </div>
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
  const [visitorInfo, setVisitorInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
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
        setError(event.error.message || 'Erro no servidor');
        break;

      case 'session.created':
        console.log('Session created:', event.session);
        break;

      case 'session.updated':
        console.log('Session updated:', event.session);
        break;

      case 'conversation.item.created':
        if (event.item.type === 'message') {
          setMessages(prev => {
            const existing = prev.find(m => m.id === event.item.id);
            if (!existing) {
              return [...prev, {
                id: event.item.id,
                role: event.item.role,
                text: event.item.content?.[0]?.text || event.item.content?.[0]?.transcript || '',
                timestamp: Date.now(),
              }];
            }
            return prev;
          });
        }
        break;

      case 'conversation.item.truncated':
        console.log('Item truncated:', event.item_id);
        break;

      case 'conversation.item.input_audio_transcription.completed':
        setMessages(prev => prev.map(m => 
          m.id === event.item_id 
            ? { ...m, text: event.transcript }
            : m
        ));
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
        setIsListening(true);
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
  }, [sendEvent]);

  const initializeWebRTC = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      setMessages([]); // Limpa mensagens antigas

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

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
          channelCount: 1,
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
            instructions: HANNA_INSTRUCTIONS,
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: { 
              model: 'whisper-1',
              language: 'pt'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.4,
              prefix_padding_ms: 500,
              silence_duration_ms: 800,
            },
            voice: 'shimmer',
            temperature: 0.9,
            max_response_output_tokens: 500,
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

        // <<< CORREÇÃO FINAL: Força a criação de uma resposta inicial
        // Isso fará com que o assistente fale primeiro com base em suas instruções.
        setTimeout(() => {
          sendEvent({ type: 'response.create' });
        }, 200); // Pequeno delay para garantir que a sessão foi atualizada

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

  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [isConnected, disconnect]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="bg-[#8B2F33] px-8 py-4 rounded-lg">
                <h1 className="text-white text-2xl font-bold tracking-wider">
                  IMPACT HUB
                </h1>
              </div>
              <div className="h-12 w-px bg-gray-300" />
              <div>
                <p className="text-gray-600 text-sm">Assistente Virtual</p>
                <p className="text-2xl font-light text-gray-900">Hanna</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-light text-gray-900 tabular-nums">
                {currentTime.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {currentTime.toLocaleDateString('pt-BR', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <div className="w-36 h-36 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden">
                    <HannaAvatar isListening={isListening} isSpeaking={isSpeaking} />
                  </div>
                  {isConnected && (
                    <div className="absolute -bottom-2 -right-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                      }`}>
                        <div className="w-3 h-3 bg-white rounded-full" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <h2 className="text-2xl font-medium text-gray-900">Hanna</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {isConnected ? 'Pronta para conversar' : 'Offline'}
                  </p>
                </div>

                {isConnected && (
                  <div className="w-full h-16 bg-gray-50 rounded-lg p-2">
                    <AudioVisualizer isActive={isConnected} isListening={isListening} />
                  </div>
                )}

                {!isConnected ? (
                  <button
                    onClick={initializeWebRTC}
                    disabled={isConnecting}
                    className="w-full bg-[#8B2F33] hover:bg-[#7A282C] text-white rounded-xl px-6 py-4 font-medium transition-colors flex items-center justify-center space-x-3"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Conectando...</span>
                      </>
                    ) : (
                      <>
                        <Headphones className="h-5 w-5" />
                        <span>Iniciar Conversa</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full space-y-3">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={toggleMute}
                        className={`p-3 rounded-lg transition-colors ${
                          isMuted 
                            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </button>
                      
                      <button
                        onClick={disconnect}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-3 font-medium transition-colors"
                      >
                        Encerrar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
              <h3 className="font-medium text-gray-900 mb-4">Informações Impact Hub</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-[#8B2F33] mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Pedra Branca</p>
                    <p className="text-gray-600">Rua Jair Hamms, 38</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-[#8B2F33]" />
                  <p className="text-sm text-gray-600">Seg-Sex • 8h às 18h</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-[#8B2F33]" />
                  <p className="text-sm text-gray-600">(48) 3374-7862</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-[#8B2F33]" />
                  <p className="text-sm text-gray-600">contato@impacthub.com.br</p>
                </div>
              </div>
              
              {visitorInfo.name && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">Visitante: {visitorInfo.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Coluna Direita */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-[500px]">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Conversa</span>
                </h3>
              </div>
              <div className="h-[calc(100%-80px)]">
                <ChatMessages messages={messages} />
              </div>
            </div>

            {isConnected && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => sendTextMessage('Quero agendar uma visita')}
                  className="bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-6 transition-all group"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 bg-[#8B2F33] bg-opacity-10 rounded-lg flex items-center justify-center group-hover:bg-opacity-20 transition-colors">
                      <Coffee className="h-6 w-6 text-[#8B2F33]" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Agendar Visita</span>
                  </div>
                </button>
                
                <button
                  onClick={() => sendTextMessage('Quais são os planos disponíveis?')}
                  className="bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-6 transition-all group"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 bg-[#8B2F33] bg-opacity-10 rounded-lg flex items-center justify-center group-hover:bg-opacity-20 transition-colors">
                      <Users className="h-6 w-6 text-[#8B2F33]" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Nossos Planos</span>
                  </div>
                </button>
                
                <button
                  onClick={() => sendTextMessage('Como funciona o espaço de coworking?')}
                  className="bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-6 transition-all group"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 bg-[#8B2F33] bg-opacity-10 rounded-lg flex items-center justify-center group-hover:bg-opacity-20 transition-colors">
                      <MapPin className="h-6 w-6 text-[#8B2F33]" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Sobre o Espaço</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <div className="fixed bottom-8 right-8 max-w-md bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 text-red-500">⚠️</div>
            <div>
              <p className="text-sm font-medium text-red-900">Ocorreu um Erro</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}