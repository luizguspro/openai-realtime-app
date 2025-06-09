import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, Loader2, Calendar, MapPin, Clock, Sparkles, MessageCircle, Keyboard, Send } from 'lucide-react';

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

EXEMPLOS DE RESPOSTAS CARISMÁTICAS:
- "Oi! Eu sou a Hanna, sua amiga virtual aqui do Impact Hub! 😄 Qual é o seu nome?"
- "Luiz! Que nome lindo! Prazer enorme em te conhecer!"
- "Oba! Você quer conhecer nosso espaço incrível? Vai adorar!"
- "Nossa, que legal! O Impact Hub é simplesmente demais!"

CAPTURA E ARMAZENAMENTO DE DADOS:
- Ao receber NOME: Use save_visitor_info. Depois: "Que legal, [nome]! Adorei te conhecer!"
- Ao receber E-MAIL: Use save_visitor_info. Confirme com alegria: "Deixa eu anotar... [soletra] Certinho?"
- Ao receber TELEFONE: Use save_visitor_info. "Ótimo! Anotei aqui: [repete números]. Está certo?"
- Se não entender: "Ops, não peguei bem! Pode repetir pra mim? 😊"

INFORMAÇÕES DO IMPACT HUB (fale com entusiasmo!):
- Local INCRÍVEL na Rua Jair Hamms, 38 - Pedra Branca
- Telefone: (48) 3374-7862 
- WhatsApp: (48) 92000-8625 (responde rapidinho!)
- Horário: Segunda a sexta, 8h às 18h

SOBRE O ESPAÇO (com empolgação!):
- Coworking mais TOP de Floripa!
- Escritórios privativos super modernos
- Salas de reunião incríveis
- Comunidade vibrante de empreendedores
- Ambiente super inovador e inspirador!

Se perguntarem sobre outros assuntos, responda com humor: "Haha, adoraria falar sobre isso, mas sou especialista em Impact Hub! Que tal conhecer nosso espaço?"`;

// Instruções otimizadas para respostas curtas

// Componente de visualização de áudio futurista
const FuturisticAudioVisualizer = ({ isActive, isListening }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.1)');
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.1)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      if (isActive) {
        // Draw wave
        ctx.beginPath();
        ctx.strokeStyle = isListening ? '#10b981' : '#3b82f6';
        ctx.lineWidth = 2;
        
        for (let x = 0; x < width; x += 5) {
          const amplitude = isListening ? 30 : 15;
          const frequency = isListening ? 0.02 : 0.01;
          const y = height / 2 + Math.sin((x + phase) * frequency) * amplitude * Math.sin(phase * 0.01);
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
        phase += isListening ? 4 : 2;
      } else {
        // Draw static line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)';
        ctx.lineWidth = 1;
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }

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
      className="w-full h-32"
      width={800}
      height={128}
    />
  );
};

// Componente de transcrição
const TranscriptionDisplay = ({ messages }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 h-64 overflow-hidden">
      <div ref={scrollRef} className="h-full overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-700">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <MessageCircle className="h-8 w-8 mr-2" />
            <span>Aguardando conversa...</span>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}
              >
                <div className="text-xs opacity-70 mb-1">
                  {msg.role === 'user' ? 'Visitante' : 'Hanna'}
                </div>
                <div className="text-sm">{msg.text || '...'}</div>
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
  const [showInfo, setShowInfo] = useState(false);
  const [inputMode, setInputMode] = useState('voice'); // 'voice' ou 'keyboard'
  const [textInput, setTextInput] = useState('');
  const [visitorInfo, setVisitorInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const audioRef = useRef(null);

  // Send event through data channel - DEFINIDA PRIMEIRO
  const sendEvent = useCallback((event) => {
    if (dcRef.current && dcRef.current.readyState === 'open') {
      dcRef.current.send(JSON.stringify(event));
    }
  }, []);

  // Send text message
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

  // Handle incoming realtime events - AGORA PODE USAR sendEvent
  const handleRealtimeEvent = useCallback((event) => {
    switch (event.type) {
      case 'error':
        console.error('Server error:', event.error);
        setError(event.error.message || 'Erro no servidor');
        break;

      case 'conversation.item.created':
        if (event.item.type === 'message') {
          setMessages(prev => {
            const existing = prev.find(m => m.id === event.item.id);
            if (!existing) {
              return [...prev, {
                id: event.item.id,
                role: event.item.role,
                text: event.item.content?.[0]?.text || '',
                timestamp: Date.now(),
              }];
            }
            return prev;
          });
        }
        break;

      case 'conversation.item.input_audio_transcription.completed':
        setMessages(prev => prev.map(m => 
          m.id === event.item_id 
            ? { ...m, text: event.transcript }
            : m
        ));
        break;

      case 'response.text.delta':
      case 'response.audio_transcript.delta':
        setMessages(prev => prev.map(m => 
          m.id === event.item_id 
            ? { ...m, text: (m.text || '') + event.delta }
            : m
        ));
        break;

      case 'response.text.done':
      case 'response.audio_transcript.done':
        setMessages(prev => prev.map(m => 
          m.id === event.item_id 
            ? { ...m, text: event.text || event.transcript }
            : m
        ));
        break;

      case 'input_audio_buffer.speech_started':
        setIsListening(true);
        break;

      case 'input_audio_buffer.speech_stopped':
        setIsListening(false);
        break;

      case 'response.function_call_arguments.done':
        // Handle tool calls
        if (event.name === 'save_visitor_info') {
          try {
            const args = JSON.parse(event.arguments);
            setVisitorInfo(prev => ({
              ...prev,
              [args.field]: args.value
            }));
            
            // Send response back
            sendEvent({
              type: 'conversation.item.create',
              item: {
                type: 'function_call_output',
                call_id: event.call_id,
                output: JSON.stringify({ success: true, message: 'Informação salva' })
              }
            });
          } catch (err) {
            console.error('Error processing tool call:', err);
          }
        } else if (event.name === 'get_visitor_info') {
          try {
            const args = JSON.parse(event.arguments);
            let output;
            
            if (args.field === 'all') {
              output = visitorInfo;
            } else {
              output = { [args.field]: visitorInfo[args.field] || 'não informado' };
            }
            
            sendEvent({
              type: 'conversation.item.create',
              item: {
                type: 'function_call_output',
                call_id: event.call_id,
                output: JSON.stringify(output)
              }
            });
          } catch (err) {
            console.error('Error processing tool call:', err);
          }
        }
        break;
    }
  }, [sendEvent, visitorInfo]);

  // Initialize WebRTC connection
  const initializeWebRTC = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Get ephemeral token from server
      const sessionResponse = await fetch('/api/session');
      
      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json();
        throw new Error(errorData.error || 'Failed to get session');
      }

      const sessionData = await sessionResponse.json();
      const ephemeralKey = sessionData.client_secret.value;

      // Create RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      pcRef.current = pc;

      // Set up audio element
      if (!audioRef.current) {
        audioRef.current = document.createElement('audio');
        audioRef.current.autoplay = true;
        document.body.appendChild(audioRef.current);
      }

      // Handle incoming audio track
      pc.ontrack = (e) => {
        if (e.track.kind === 'audio') {
          audioRef.current.srcObject = e.streams[0];
        }
      };

      // Add local audio track
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
      
      // Se estiver em modo teclado, desativa o microfone imediatamente
      if (inputMode === 'keyboard') {
        audioTrack.enabled = false;
      }
      
      pc.addTrack(audioTrack, stream);

      // Create data channel
      const dc = pc.createDataChannel('oai-events', { ordered: true });
      dcRef.current = dc;

      dc.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);

        // Send Hanna's configuration with optimized settings
        sendEvent({
          type: 'session.update',
          session: {
            instructions: HANNA_INSTRUCTIONS,
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: { model: 'whisper-1' },
            turn_detection: inputMode === 'voice' ? {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 600,
            } : null,
            voice: 'shimmer', // Voz feminina suave
            temperature: 0.9, // Mais criatividade e variedade nas respostas
            max_response_output_tokens: 500, // Suficiente para respostas curtas completas
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
              },
              {
                type: 'function',
                name: 'get_visitor_info',
                description: 'Recupera informações salvas do visitante',
                parameters: {
                  type: 'object',
                  properties: {
                    field: {
                      type: 'string',
                      enum: ['name', 'email', 'phone', 'all'],
                      description: 'Tipo de informação a recuperar'
                    }
                  },
                  required: ['field']
                }
              }
            ],
            tool_choice: 'auto',
          },
        });

        // Send optimized welcome message
        setTimeout(() => {
          sendTextMessage('Oi! Eu sou a Hanna, sua amiga virtual aqui do Impact Hub! Qual é o seu nome?');
        }, 1000);
      };

      dc.onclose = () => {
        setIsConnected(false);
      };

      dc.onerror = (error) => {
        console.error('Data channel error:', error);
        setError('Erro na conexão');
      };

      dc.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          handleRealtimeEvent(event);
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      };

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to OpenAI
      const answerResponse = await fetch('https://api.openai.com/v1/realtime', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp'
        },
        body: offer.sdp,
      });

      if (!answerResponse.ok) {
        throw new Error('Falha ao conectar com OpenAI');
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
  }, [sendEvent, sendTextMessage, handleRealtimeEvent, inputMode]);

  // Disconnect
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
    setMessages([]);
  }, [audioStream]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (audioStream) {
      audioStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  }, [audioStream, isMuted]);

  // Toggle input mode (voice/keyboard)
  const toggleInputMode = useCallback(() => {
    const newMode = inputMode === 'voice' ? 'keyboard' : 'voice';
    setInputMode(newMode);
    
    // Se mudando para teclado, desativa o microfone
    if (newMode === 'keyboard' && audioStream) {
      audioStream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
    } else if (newMode === 'voice' && audioStream && !isMuted) {
      audioStream.getAudioTracks().forEach(track => {
        track.enabled = true;
      });
    }

    // Atualiza a configuração de VAD
    if (isConnected) {
      sendEvent({
        type: 'session.update',
        session: {
          turn_detection: newMode === 'voice' ? {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 600,
          } : null,
        },
      });
    }
  }, [inputMode, audioStream, isMuted, isConnected, sendEvent]);

  // Send text from input
  const sendTextFromInput = useCallback(() => {
    if (textInput.trim()) {
      sendTextMessage(textInput.trim());
      setTextInput('');
      
      // Se estiver em modo VAD desativado, cria resposta manualmente
      if (inputMode === 'keyboard') {
        setTimeout(() => {
          sendEvent({ type: 'response.create' });
        }, 100);
      }
    }
  }, [textInput, sendTextMessage, inputMode, sendEvent]);

  // Schedule visit with optimized message
  const scheduleVisit = () => {
    sendTextMessage('Quero agendar uma visita');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [isConnected, disconnect]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-emerald-500/10 blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-r from-emerald-400 to-blue-500 p-3 rounded-2xl">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-light">Hanna</h1>
                <p className="text-sm text-gray-400">Assistente Virtual • Impact Hub Pedra Branca</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isConnected && (
                <div className="text-sm text-gray-400 flex items-center space-x-2">
                  {inputMode === 'voice' ? (
                    <>
                      <Mic className="h-4 w-4" />
                      <span>Modo Voz</span>
                    </>
                  ) : (
                    <>
                      <Keyboard className="h-4 w-4" />
                      <span>Modo Teclado</span>
                    </>
                  )}
                </div>
              )}
              
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              >
                <MapPin className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-4xl w-full space-y-8">
            {/* Audio Visualizer */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 blur-2xl" />
              <div className="relative bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-800">
                <FuturisticAudioVisualizer 
                  isActive={isConnected} 
                  isListening={isListening} 
                />
                
                <div className="mt-6 flex items-center justify-center space-x-4">
                  {!isConnected ? (
                    <button
                      onClick={initializeWebRTC}
                      disabled={isConnecting}
                      className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50"
                    >
                      {isConnecting ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Conectando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="h-5 w-5" />
                          <span>Iniciar Conversa</span>
                        </div>
                      )}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={toggleInputMode}
                        className="p-4 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-all"
                        title={inputMode === 'voice' ? 'Mudar para teclado' : 'Mudar para voz'}
                      >
                        {inputMode === 'voice' ? <Keyboard className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                      </button>

                      {inputMode === 'voice' && (
                        <button
                          onClick={toggleMute}
                          className={`p-4 rounded-full transition-all ${
                            isMuted 
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                              : 'bg-gray-800/50 hover:bg-gray-700/50'
                          }`}
                        >
                          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                        </button>
                      )}
                      
                      <button
                        onClick={disconnect}
                        className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-colors"
                      >
                        Encerrar
                      </button>
                    </>
                  )}
                </div>

                {isConnected && (
                  <div className="mt-4 space-y-3">
                    {/* Status indicator */}
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                      {inputMode === 'voice' ? (
                        <>
                          <div className={`h-2 w-2 rounded-full ${isListening ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'}`} />
                          <span>{isListening ? 'Ouvindo...' : 'Aguardando fala...'}</span>
                        </>
                      ) : (
                        <>
                          <Keyboard className="h-4 w-4" />
                          <span>Modo teclado ativo</span>
                        </>
                      )}
                    </div>

                    {/* Text input for keyboard mode */}
                    {inputMode === 'keyboard' && (
                      <div className="flex items-center space-x-2 max-w-md mx-auto">
                        <input
                          type="text"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              sendTextFromInput();
                            }
                          }}
                          placeholder="Digite sua mensagem..."
                          className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                        <button
                          onClick={sendTextFromInput}
                          disabled={!textInput.trim()}
                          className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:opacity-50 rounded-full transition-colors"
                        >
                          <Send className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Transcription */}
            <TranscriptionDisplay messages={messages} />

            {/* Quick actions */}
            {isConnected && (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={scheduleVisit}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-colors text-sm"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Agendar Visita</span>
                  </button>
                  <button
                    onClick={() => sendTextMessage('Quais são os planos?')}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-colors text-sm"
                  >
                    <span>Ver Planos</span>
                  </button>
                </div>
                
                {/* Debug info - remova em produção */}
                {(visitorInfo.name || visitorInfo.email || visitorInfo.phone) && (
                  <div className="text-xs text-gray-500 text-center space-y-1">
                    {visitorInfo.name && <div>Nome: {visitorInfo.name}</div>}
                    {visitorInfo.email && <div>Email: {visitorInfo.email}</div>}
                    {visitorInfo.phone && <div>Telefone: {visitorInfo.phone}</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info panel */}
        {showInfo && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8" onClick={() => setShowInfo(false)}>
            <div className="bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 max-w-md border border-gray-800" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-light mb-6">Impact Hub Pedra Branca</h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-emerald-400 mt-0.5" />
                  <div>
                    <p>Passeio Pedra Branca</p>
                    <p className="text-gray-400">Rua Jair Hamms, 38 - Sala 101B</p>
                    <p className="text-gray-400">Edifício Atrium Offices</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-emerald-400" />
                  <p>Segunda a Sexta • 8h às 18h</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Volume2 className="h-5 w-5 text-emerald-400" />
                  <p>(48) 3374-7862</p>
                </div>
              </div>

              <button
                onClick={() => setShowInfo(false)}
                className="mt-6 w-full py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="fixed bottom-8 left-8 right-8 max-w-md mx-auto bg-red-500/20 backdrop-blur-xl border border-red-500/50 rounded-2xl p-4 text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}