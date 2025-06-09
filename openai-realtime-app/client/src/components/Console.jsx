import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Phone, PhoneOff, Settings, Volume2, Loader2, AlertCircle, Zap, MessageSquare, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import MessageList from './MessageList';
import EventLogger from './EventLogger';
import ToolsPanel from './ToolsPanel';

// Instructions for the AI
const SYSTEM_INSTRUCTIONS = `You are a helpful AI assistant. Respond naturally in a conversational tone. Keep responses concise and engaging.`;

export default function Console() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('vad');
  const [isPushingToTalk, setIsPushingToTalk] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [isListening, setIsListening] = useState(false);
  
  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize WebRTC connection
  const initializeWebRTC = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // 1. Get ephemeral token from our server
      const sessionResponse = await fetch('/api/session');
      
      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json();
        throw new Error(errorData.error || 'Failed to get session');
      }

      const sessionData = await sessionResponse.json();
      const ephemeralKey = sessionData.client_secret.value;

      // 2. Create RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });
      pcRef.current = pc;

      // 3. Set up audio element for playback
      if (!audioRef.current) {
        audioRef.current = document.createElement('audio');
        audioRef.current.autoplay = true;
        document.body.appendChild(audioRef.current);
      }

      // 4. Handle incoming audio track
      pc.ontrack = (e) => {
        console.log('Received remote track:', e.track.kind);
        if (e.track.kind === 'audio') {
          audioRef.current.srcObject = e.streams[0];
          logEvent('webrtc', 'track.received', { kind: e.track.kind });
        }
      };

      // 5. Add local audio track
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

      // 6. Create data channel for events
      const dc = pc.createDataChannel('oai-events', {
        ordered: true,
      });
      dcRef.current = dc;

      // Set up data channel event handlers
      dc.onopen = () => {
        console.log('Data channel opened');
        setIsConnected(true);
        setIsConnecting(false);
        logEvent('webrtc', 'datachannel.open');

        // Send initial session configuration
        sendEvent({
          type: 'session.update',
          session: {
            instructions: SYSTEM_INSTRUCTIONS,
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: mode === 'vad' ? {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            } : null,
            voice: 'alloy',
            temperature: 0.8,
            max_response_output_tokens: 4096,
          },
        });

        // Send a welcome message after a short delay
        setTimeout(() => {
          sendTextMessage('Hello! I can hear you now. How can I help you today?');
        }, 1000);
      };

      dc.onclose = () => {
        console.log('Data channel closed');
        setIsConnected(false);
        logEvent('webrtc', 'datachannel.close');
      };

      dc.onerror = (error) => {
        console.error('Data channel error:', error);
        logEvent('webrtc', 'datachannel.error', error);
        setError('Data channel error');
      };

      // Handle incoming messages
      dc.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          handleRealtimeEvent(event);
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      };

      // 7. Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 8. Send offer to OpenAI via their API
      const answerResponse = await fetch('https://api.openai.com/v1/realtime', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp'
        },
        body: offer.sdp,
      });

      if (!answerResponse.ok) {
        throw new Error('Failed to connect to OpenAI Realtime API');
      }

      const answerSdp = await answerResponse.text();
      
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });

      logEvent('client', 'connected', { mode });

    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message);
      setIsConnecting(false);
      setIsConnected(false);
    }
  }, [mode]);

  // Handle incoming realtime events
  const handleRealtimeEvent = useCallback((event) => {
    logEvent('server', event.type, event);

    switch (event.type) {
      case 'error':
        console.error('Server error:', event.error);
        setError(event.error.message || 'Server error');
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
                text: event.item.content?.[0]?.text || '',
                timestamp: Date.now(),
              }];
            }
            return prev;
          });
        }
        break;

      case 'conversation.item.deleted':
        setMessages(prev => prev.filter(m => m.id !== event.item_id));
        break;

      case 'conversation.item.input_audio_transcription.completed':
        setMessages(prev => prev.map(m => 
          m.id === event.item_id 
            ? { ...m, text: event.transcript }
            : m
        ));
        break;

      case 'response.text.delta':
        setMessages(prev => prev.map(m => 
          m.id === event.item_id 
            ? { ...m, text: (m.text || '') + event.delta }
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

      case 'response.audio_transcript.delta':
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

      case 'input_audio_buffer.speech_started':
        setIsListening(true);
        break;

      case 'input_audio_buffer.speech_stopped':
        setIsListening(false);
        break;

      case 'response.done':
        console.log('Response completed');
        break;

      case 'response.function_call_arguments.done':
        // Handle function calls
        if (event.name === 'get_current_time') {
          sendEvent({
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: event.call_id,
              output: new Date().toLocaleString(),
            }
          });
        }
        break;
    }
  }, []);

  // Send event through data channel
  const sendEvent = useCallback((event) => {
    if (dcRef.current && dcRef.current.readyState === 'open') {
      dcRef.current.send(JSON.stringify(event));
      logEvent('client', event.type, event);
    } else {
      console.warn('Data channel not open, cannot send event:', event.type);
    }
  }, []);

  // Send text message helper
  const sendTextMessage = useCallback((text) => {
    if (!text.trim()) return;
    
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
    
    // Only create response if not in VAD mode
    if (mode !== 'vad') {
      setTimeout(() => {
        sendEvent({ type: 'response.create' });
      }, 100);
    }
  }, [sendEvent, mode]);

  // Disconnect
  const disconnect = useCallback(async () => {
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
    logEvent('client', 'disconnected');
  }, [audioStream]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (audioStream) {
      audioStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted; // Note: we toggle to opposite state
      });
      setIsMuted(!isMuted);
      logEvent('client', 'mute.toggled', { muted: !isMuted });
    }
  }, [audioStream, isMuted]);

  // Push-to-talk handlers
  const startPushToTalk = useCallback(() => {
    if (mode === 'push-to-talk' && dcRef.current) {
      setIsPushingToTalk(true);
      sendEvent({ type: 'input_audio_buffer.clear' });
      logEvent('client', 'push-to-talk.start');
    }
  }, [mode, sendEvent]);

  const stopPushToTalk = useCallback(() => {
    if (mode === 'push-to-talk' && isPushingToTalk && dcRef.current) {
      setIsPushingToTalk(false);
      sendEvent({ type: 'input_audio_buffer.commit' });
      setTimeout(() => {
        sendEvent({ type: 'response.create' });
      }, 100);
      logEvent('client', 'push-to-talk.stop');
    }
  }, [mode, isPushingToTalk, sendEvent]);

  // Log events
  const logEvent = (source, type, data = null) => {
    setEvents(prev => [...prev.slice(-50), { source, type, data, timestamp: Date.now() }]);
  };

  // Send test message
  const sendTestMessage = () => {
    sendTextMessage('Tell me a short joke.');
  };

  // Add tools when connected
  useEffect(() => {
    if (isConnected && dcRef.current) {
      // Wait a bit for session to be ready
      setTimeout(() => {
        sendEvent({
          type: 'session.update',
          session: {
            tools: [{
              type: 'function',
              name: 'get_current_time',
              description: 'Get the current time',
              parameters: {
                type: 'object',
                properties: {},
              },
            }],
            tool_choice: 'auto',
          },
        });
      }, 500);
    }
  }, [isConnected, sendEvent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [isConnected, disconnect]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Zap className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold">OpenAI Realtime Console</h1>
                <p className="text-sm text-gray-500">Voice conversations with AI (WebRTC)</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                disabled={isConnected}
                className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"
              >
                <option value="vad">Voice Activity Detection</option>
                <option value="push-to-talk">Push to Talk</option>
              </select>
              
              <button
                onClick={isConnected ? disconnect : initializeWebRTC}
                disabled={isConnecting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isConnected 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : isConnected ? (
                  <>
                    <PhoneOff className="h-5 w-5" />
                    <span>Disconnect</span>
                  </>
                ) : (
                  <>
                    <Phone className="h-5 w-5" />
                    <span>Connect</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
              {error.includes('API key') && (
                <span className="text-xs">
                  (Make sure OPENAI_API_KEY is set in server .env file)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Audio
                  {isListening && (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded animate-pulse">
                      Listening...
                    </span>
                  )}
                </h2>
                {isConnected && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={sendTestMessage}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      Test Message
                    </button>
                    <button
                      onClick={toggleMute}
                      className={`p-2 rounded-lg transition-colors ${
                        isMuted 
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-600' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                      }`}
                    >
                      {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
                  </div>
                )}
              </div>
              <AudioVisualizer stream={audioStream} isActive={isConnected && !isMuted} />
              
              {mode === 'push-to-talk' && isConnected && (
                <button
                  onMouseDown={startPushToTalk}
                  onMouseUp={stopPushToTalk}
                  onMouseLeave={stopPushToTalk}
                  className={`w-full mt-4 py-3 rounded-lg font-medium transition-colors ${
                    isPushingToTalk
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {isPushingToTalk ? 'Release to Send' : 'Hold to Talk'}
                </button>
              )}

              {/* Debug info */}
              {isConnected && (
                <div className="mt-4 text-xs text-gray-500 space-y-1">
                  <div>Protocol: WebRTC</div>
                  <div>Mode: {mode}</div>
                  <div>Audio: {audioStream ? 'Active' : 'Inactive'}</div>
                  <div>Listening: {isListening ? 'Yes' : 'No'}</div>
                  <div>Muted: {isMuted ? 'Yes' : 'No'}</div>
                </div>
              )}
            </div>

            <MessageList messages={messages} />
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Status
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Connection</span>
                  <span className={isConnected ? 'text-green-500' : 'text-gray-400'}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Protocol</span>
                  <span>WebRTC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Mode</span>
                  <span>{mode === 'vad' ? 'Voice Activity' : 'Push to Talk'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Microphone</span>
                  <span className={isMuted ? 'text-red-500' : 'text-green-500'}>
                    {isMuted ? 'Muted' : 'Active'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Speech Detection</span>
                  <span className={isListening ? 'text-green-500' : 'text-gray-400'}>
                    {isListening ? 'Detecting' : 'Waiting'}
                  </span>
                </div>
              </div>
            </div>

            <EventLogger events={events} />
            <ToolsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}