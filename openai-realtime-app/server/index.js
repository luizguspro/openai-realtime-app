import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import PineconeService from './services/PineconeService.js';

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
app.use(express.text({ type: 'application/sdp' }));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

// Inicializa Pinecone na inicialização do servidor
const initializePinecone = async () => {
  if (process.env.PINECONE_API_KEY) {
    const success = await PineconeService.initialize(
      process.env.PINECONE_API_KEY,
      process.env.PINECONE_INDEX || 'hanna-knowledge-base'
    );
    
    if (success) {
      console.log('✅ Pinecone conectado com sucesso');
      console.log('📊 Índice:', process.env.PINECONE_INDEX || 'hanna-knowledge-base');
      console.log('🌐 Region: us-east-1 (AWS)');
      console.log('📏 Dimensões: 1536');
      console.log('📐 Métrica: cosine');
    } else {
      console.error('❌ Falha ao conectar com Pinecone');
    }
  } else {
    console.warn('⚠️  Pinecone não configurado (PINECONE_API_KEY ausente)');
  }
};

// Endpoint para buscar informações no Pinecone
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    console.log('[Server] Recebida busca para:', query);
    
    if (!query) {
      return res.status(400).json({ error: 'Query é obrigatória' });
    }

    // Busca no Pinecone
    const results = await PineconeService.searchSimilar(query, 3);
    
    console.log('[Server] Resultados encontrados:', results.length);
    
    // Formata o contexto para a AI
    const context = PineconeService.formatContextForAI(results);
    
    console.log('[Server] Contexto formatado:', context ? 'Sim' : 'Não');
    
    res.json({
      success: true,
      context: context,
      results: results
    });
  } catch (error) {
    console.error('[Server] Erro na busca:', error);
    res.status(500).json({ error: 'Erro ao buscar informações' });
  }
});

// Get ephemeral token for WebRTC connection
app.get('/api/session', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ error: 'OpenAI API key not configured' });
    }

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: 'alloy',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return res.status(response.status).json({ 
        error: 'Failed to create session',
        details: error 
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    hasApiKey: !!process.env.OPENAI_API_KEY,
    hasPinecone: !!process.env.PINECONE_API_KEY,
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
server.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Configured ✓' : 'Missing ✗'}`);
  console.log(`🔍 Pinecone API Key: ${process.env.PINECONE_API_KEY ? 'Configured ✓' : 'Missing ✗'}`);
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  Please set OPENAI_API_KEY in your .env file');
  }
  
  if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX) {
    console.warn('⚠️  Please set PINECONE_API_KEY and PINECONE_INDEX in your .env file');
  }
  
  // Inicializa Pinecone
  await initializePinecone();
});