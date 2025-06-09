const fs = require('fs');
const path = require('path');

// Conteúdo de cada arquivo
const fileContents = {
  'package.json': `{
  "name": "openai-realtime-console",
  "version": "1.0.0",
  "description": "OpenAI Realtime API Console with WebRTC",
  "type": "module",
  "scripts": {
    "dev": "concurrently \\"npm run server\\" \\"npm run client\\"",
    "server": "nodemon server/index.js",
    "client": "cd client && npm run dev",
    "build": "cd client && npm run build",
    "preview": "cd client && npm run preview",
    "install:all": "npm install && cd client && npm install"
  },
  "dependencies": {
    "@openai/realtime-api-beta": "github:openai/openai-realtime-api-beta",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-ws": "^5.0.2",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "nodemon": "^3.1.0"
  },
  "keywords": [
    "openai",
    "realtime",
    "webrtc",
    "voice",
    "chat"
  ],
  "author": "",
  "license": "MIT"
}`,

  '.env.example': `# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# WebRTC Configuration (optional)
STUN_SERVER=stun:stun.l.google.com:19302
TURN_SERVER=
TURN_USERNAME=
TURN_PASSWORD=

# Client Configuration (optional)
VITE_API_URL=http://localhost:3001`,

  'server/index.js': `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// ES modules setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

// Store active sessions
const sessions = new Map();

// WebRTC signaling endpoint
app.post('/api/session', async (req, res) => {
  try {
    const sessionId = crypto.randomUUID();
    
    // Create OpenAI Realtime client
    const client = new RealtimeClient({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Configure session
    await client.updateSession({
      instructions: 'You are a helpful, friendly assistant. Respond naturally and conversationally.',
      voice: 'alloy',
      input_audio_format: 'pcm16',
      output_audio_format: 'pcm16',
      input_audio_transcription: {
        model: 'whisper-1'
      },
      turn_detection: {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 500
      }
    });

    // Store session
    sessions.set(sessionId, {
      client,
      createdAt: new Date()
    });

    // Clean up old sessions (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const [id, session] of sessions) {
      if (session.createdAt < oneHourAgo) {
        if (session.client.isConnected()) {
          await session.client.disconnect();
        }
        sessions.delete(id);
      }
    }

    res.json({ 
      sessionId,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      }
    });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// WebRTC offer/answer exchange
app.post('/api/session/:sessionId/offer', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { sdp, ephemeralKey } = req.body;
    
    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Connect to OpenAI Realtime API
    await session.client.connect();

    // Handle the WebRTC connection through OpenAI's API
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${process.env.OPENAI_API_KEY}\`,
        'Content-Type': 'application/sdp'
      },
      body: sdp
    });

    const answerSdp = await response.text();

    res.json({ 
      answer: answerSdp,
      ephemeralKey: ephemeralKey
    });
  } catch (error) {
    console.error('Offer handling error:', error);
    res.status(500).json({ error: 'Failed to process offer' });
  }
});

// End session
app.delete('/api/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (session) {
    if (session.client.isConnected()) {
      await session.client.disconnect();
    }
    sessions.delete(sessionId);
  }
  
  res.json({ success: true });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    activeSessions: sessions.size,
    timestamp: new Date().toISOString()
  });
});

// Catch all handler for production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
server.listen(PORT, () => {
  console.log(\`🚀 Server running on http://localhost:\${PORT}\`);
  console.log(\`📍 Environment: \${process.env.NODE_ENV || 'development'}\`);
  console.log(\`🔑 OpenAI API Key: \${process.env.OPENAI_API_KEY ? 'Configured ✓' : 'Missing ✗'}\`);
});`,

  'client/package.json': `{
  "name": "openai-realtime-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@openai/realtime-api-beta": "github:openai/openai-realtime-api-beta",
    "framer-motion": "^11.0.3",
    "lucide-react": "^0.309.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "wavesurfer.js": "^7.6.2",
    "zustand": "^4.4.7",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "vite": "^5.0.8"
  }
}`,

  'client/vite.config.js': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  define: {
    'process.env': {},
  },
});`,

  'client/tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}`,

  'client/postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,

  'client/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OpenAI Realtime Console</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,

  'client/src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,

  'client/src/styles/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}

body {
  @apply bg-background text-foreground;
}`,

  'client/src/App.jsx': `import React from 'react';
import Console from './components/Console';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Console />
    </div>
  );
}

export default App;`,

  'client/src/components/Console.jsx': `import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { Mic, MicOff, Phone, PhoneOff, Settings, Volume2, Loader2, AlertCircle, Zap, MessageSquare, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import MessageList from './MessageList';
import EventLogger from './EventLogger';
import ToolsPanel from './ToolsPanel';

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
  
  const clientRef = useRef(null);

  const initializeClient = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);

      const client = new RealtimeClient({
        url: process.env.NODE_ENV === 'production' ? undefined : 'ws://localhost:3001',
        apiKey: process.env.OPENAI_API_KEY || undefined,
        dangerouslyAllowAPIKeyInBrowser: true,
      });

      client.on('conversation.updated', ({ item, delta }) => {
        if (item.type === 'message') {
          setMessages(prev => {
            const existing = prev.find(m => m.id === item.id);
            if (existing) {
              return prev.map(m => m.id === item.id ? { ...m, ...item } : m);
            }
            return [...prev, { ...item, timestamp: Date.now() }];
          });
        }
      });

      client.on('conversation.item.completed', ({ item }) => {
        logEvent('server', 'item.completed', { type: item.type });
      });

      client.on('error', (error) => {
        console.error('Client error:', error);
        setError(error.message || 'An error occurred');
        logEvent('client', 'error', error);
      });

      client.on('conversation.interrupted', () => {
        logEvent('server', 'conversation.interrupted');
      });

      await client.updateSession({
        instructions: 'You are a helpful, friendly assistant. Be concise in your responses.',
        voice: 'alloy',
        input_audio_transcription: { model: 'whisper-1' },
        turn_detection: { type: mode === 'vad' ? 'server_vad' : 'none' },
      });

      clientRef.current = client;
      
      await client.connect();
      setIsConnected(true);
      setIsConnecting(false);
      
      logEvent('client', 'connected');
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message);
      setIsConnecting(false);
    }
  }, [mode]);

  const disconnect = useCallback(async () => {
    if (clientRef.current) {
      await clientRef.current.disconnect();
      clientRef.current = null;
    }
    
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
    
    setIsConnected(false);
    setMessages([]);
    logEvent('client', 'disconnected');
  }, [audioStream]);

  const toggleMute = useCallback(() => {
    if (audioStream) {
      audioStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  }, [audioStream, isMuted]);

  const startPushToTalk = useCallback(() => {
    if (mode === 'push-to-talk' && clientRef.current) {
      setIsPushingToTalk(true);
      logEvent('client', 'push-to-talk.start');
    }
  }, [mode]);

  const stopPushToTalk = useCallback(() => {
    if (mode === 'push-to-talk' && clientRef.current && isPushingToTalk) {
      setIsPushingToTalk(false);
      clientRef.current.createResponse();
      logEvent('client', 'push-to-talk.stop');
    }
  }, [mode, isPushingToTalk]);

  const logEvent = (source, type, data = null) => {
    setEvents(prev => [...prev.slice(-50), { source, type, data, timestamp: Date.now() }]);
  };

  useEffect(() => {
    if (clientRef.current && isConnected) {
      clientRef.current.addTool(
        {
          name: 'get_current_time',
          description: 'Get the current time',
          parameters: {
            type: 'object',
            properties: {},
          },
        },
        async () => {
          logEvent('client', 'tool.executed', { tool: 'get_current_time' });
          return new Date().toLocaleString();
        }
      );
    }
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Zap className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold">OpenAI Realtime Console</h1>
                <p className="text-sm text-gray-500">Voice conversations with AI</p>
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
                onClick={isConnected ? disconnect : initializeClient}
                disabled={isConnecting}
                className={\`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors \${
                  isConnected 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed\`}
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
                </h2>
                {isConnected && (
                  <button
                    onClick={toggleMute}
                    className={\`p-2 rounded-lg transition-colors \${
                      isMuted 
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-600' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                    }\`}
                  >
                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                )}
              </div>
              <AudioVisualizer stream={audioStream} isActive={isConnected && !isMuted} />
              
              {mode === 'push-to-talk' && isConnected && (
                <button
                  onMouseDown={startPushToTalk}
                  onMouseUp={stopPushToTalk}
                  onMouseLeave={stopPushToTalk}
                  className={\`w-full mt-4 py-3 rounded-lg font-medium transition-colors \${
                    isPushingToTalk
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }\`}
                >
                  {isPushingToTalk ? 'Release to Send' : 'Hold to Talk'}
                </button>
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
                  <span className="text-gray-500">Mode</span>
                  <span>{mode === 'vad' ? 'Voice Activity' : 'Push to Talk'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Microphone</span>
                  <span className={isMuted ? 'text-red-500' : 'text-green-500'}>
                    {isMuted ? 'Muted' : 'Active'}
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
}`,

  'client/src/components/AudioVisualizer.jsx': `import React, { useRef, useEffect } from 'react';

export default function AudioVisualizer({ stream, isActive }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyzerRef = useRef(null);

  useEffect(() => {
    if (!stream || !isActive) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    source.connect(analyzer);
    analyzerRef.current = analyzer;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzer.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        ctx.fillStyle = \`rgb(59, 130, 246, \${dataArray[i] / 255})\`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      source.disconnect();
      audioContext.close();
    };
  }, [stream, isActive]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-20 bg-gray-50 dark:bg-gray-900 rounded-lg"
      width={400}
      height={80}
    />
  );
}`,

  'client/src/components/MessageList.jsx': `import React, { useRef, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

const Message = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={\`flex \${isUser ? 'justify-end' : 'justify-start'} mb-4\`}>
      <div className={\`max-w-[70%] \${isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800'} rounded-lg px-4 py-2\`}>
        <div className="text-xs opacity-70 mb-1">
          {isUser ? 'You' : 'Assistant'}
        </div>
        <div className="text-sm">
          {message.text || message.transcript || '...'}
        </div>
        {message.timestamp && (
          <div className="text-xs opacity-50 mt-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default function MessageList({ messages }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Conversation
      </h2>
      <div className="h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Start a conversation by connecting...</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
}`,

  'client/src/components/EventLogger.jsx': `import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';

export default function EventLogger({ events }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState('all');

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'client') return event.source === 'client';
    if (filter === 'server') return event.source === 'server';
    return true;
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Event Log
        </h3>
        <div className="flex items-center gap-2">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs bg-white dark:bg-gray-800 rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="client">Client</option>
            <option value="server">Server</option>
          </select>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      <div className={\`space-y-1 overflow-auto transition-all \${isExpanded ? 'max-h-96' : 'max-h-32'}\`}>
        {filteredEvents.map((event, idx) => (
          <div key={idx} className="text-xs font-mono bg-white dark:bg-gray-800 rounded px-2 py-1">
            <span className={\`font-semibold \${event.source === 'client' ? 'text-blue-500' : 'text-green-500'}\`}>
              [{event.source}]
            </span>
            <span className="text-gray-500 ml-2">{event.type}</span>
            {event.data && (
              <pre className="text-xs mt-1 text-gray-600 dark:text-gray-400 overflow-x-auto">
                {JSON.stringify(event.data, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}`,

  'client/src/components/ToolsPanel.jsx': `import React from 'react';

export default function ToolsPanel() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
      <h3 className="font-semibold mb-4">Available Tools</h3>
      <div className="space-y-2">
        <div className="text-sm bg-gray-50 dark:bg-gray-800 rounded px-3 py-2">
          <div className="font-medium">get_current_time</div>
          <div className="text-xs text-gray-500">Returns the current date and time</div>
        </div>
      </div>
    </div>
  );
}`,

  'README.md': `# OpenAI Realtime Console

Uma aplicação web moderna para interagir com a API Realtime da OpenAI através de conversas por voz em tempo real.

## 🚀 Início Rápido

1. Clone o repositório e instale as dependências:
\`\`\`bash
npm run install:all
\`\`\`

2. Configure sua API key:
\`\`\`bash
cp .env.example .env
# Edite .env e adicione sua OPENAI_API_KEY
\`\`\`

3. Inicie o servidor:
\`\`\`bash
npm run dev
\`\`\`

4. Acesse http://localhost:3000

## 📋 Funcionalidades

- Conversação por voz em tempo real
- Voice Activity Detection (VAD) e Push-to-Talk
- Visualização de áudio
- Sistema de tools extensível
- Log de eventos em tempo real
- Interface moderna e responsiva

## 📄 Licença

MIT`
};

// Estrutura de pastas vazias que precisam ser criadas
const emptyDirs = [
  'server/routes',
  'server/config',
  'client/src/hooks',
  'client/src/services'
];

// Função para criar estrutura
function createStructure(basePath, structure) {
  Object.entries(structure).forEach(([filePath, content]) => {
    const fullPath = path.join(basePath, filePath);
    const dir = path.dirname(fullPath);
    
    // Criar diretório se não existir
    fs.mkdirSync(dir, { recursive: true });
    
    // Criar arquivo com conteúdo
    fs.writeFileSync(fullPath, content);
    console.log(`📄 Criado: ${filePath}`);
  });
}

// Criar diretórios vazios
function createEmptyDirs(basePath, dirs) {
  dirs.forEach(dir => {
    const fullPath = path.join(basePath, dir);
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📁 Criado diretório: ${dir}`);
  });
}

// Executar
const projectName = 'openai-realtime-app';
console.log(`🚀 Criando projeto completo: ${projectName}\n`);

try {
  // Criar pasta principal
  fs.mkdirSync(projectName, { recursive: true });
  
  // Criar estrutura com arquivos
  createStructure(projectName, fileContents);
  
  // Criar diretórios vazios
  createEmptyDirs(projectName, emptyDirs);
  
  console.log(`
✅ Projeto criado com sucesso!

📌 Próximos passos:

1. Entre na pasta do projeto:
   cd ${projectName}

2. Instale as dependências:
   npm run install:all

3. Configure seu arquivo .env:
   cp .env.example .env
   # Adicione sua OPENAI_API_KEY no arquivo .env

4. Inicie o servidor de desenvolvimento:
   npm run dev

5. Acesse http://localhost:3000

🎯 Dica: Se houver erro de dependências, execute:
   npm install
   cd client && npm install
   cd ..

Bom desenvolvimento! 🚀
`);
} catch (error) {
  console.error('❌ Erro ao criar projeto:', error.message);
}