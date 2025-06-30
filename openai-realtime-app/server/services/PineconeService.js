import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

class PineconeService {
  constructor() {
    this.pinecone = null;
    this.index = null;
    this.namespace = ''; // Namespace vazio em vez de '__default__'
  }

  async initialize(apiKey, indexName = 'hanna-knowledge-base') {
    try {
      // Inicializa o cliente Pinecone
      this.pinecone = new Pinecone({
        apiKey: apiKey
      });

      // Conecta ao índice com host específico
      this.index = this.pinecone.index(indexName, 'https://hanna-knowledge-base-6vai77h.svc.aped-4627-b74a.pinecone.io');
      
      console.log('[PineconeService] Conectado ao índice:', indexName);
      console.log('[PineconeService] Host:', 'hanna-knowledge-base-6vai77h.svc.aped-4627-b74a.pinecone.io');
      console.log('[PineconeService] Dimensões:', 1536);
      return true;
    } catch (error) {
      console.error('[PineconeService] Erro ao inicializar:', error);
      return false;
    }
  }

  async searchSimilar(query, topK = 3) {
    try {
      if (!this.index) {
        throw new Error('Pinecone não inicializado');
      }

      console.log('[PineconeService] Gerando embedding para:', query);
      
      // Gera o embedding da query
      const queryEmbedding = await this.generateEmbedding(query);
      
      console.log('[PineconeService] Embedding gerado, dimensões:', queryEmbedding.length);
      console.log('[PineconeService] Buscando no namespace:', this.namespace);

      // Busca no Pinecone
      const searchResponse = await this.index.namespace(this.namespace).query({
        vector: queryEmbedding,
        topK: topK,
        includeMetadata: true,
        includeValues: false
      });

      console.log('[PineconeService] Resposta do Pinecone:', searchResponse);
      console.log('[PineconeService] Matches encontrados:', searchResponse.matches?.length || 0);

      // Formata os resultados
      const results = searchResponse.matches.map(match => ({
        score: match.score,
        text: match.metadata.text,
        summary: match.metadata.summary,
        source: match.metadata.source,
        tags: match.metadata.tags || []
      }));

      return results;
    } catch (error) {
      console.error('[PineconeService] Erro na busca:', error);
      console.error('[PineconeService] Stack:', error.stack);
      return [];
    }
  }

  async generateEmbedding(text) {
    try {
      // Chama a OpenAI Embeddings API com o modelo correto para 1536 dimensões
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002', // Este modelo gera embeddings de 1536 dimensões
          input: text
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao gerar embedding: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Verifica se o embedding tem o tamanho correto
      if (data.data[0].embedding.length !== 1536) {
        console.warn(`[PineconeService] Embedding com dimensão incorreta: ${data.data[0].embedding.length}`);
      }
      
      return data.data[0].embedding;
    } catch (error) {
      console.error('[PineconeService] Erro ao gerar embedding:', error);
      throw error;
    }
  }

  formatContextForAI(results) {
    if (!results || results.length === 0) {
      return null;
    }

    // Formata o contexto de forma clara para a AI
    let context = "Informações encontradas sobre a pergunta:\n\n";
    
    results.forEach((result, index) => {
      context += `[Informação ${index + 1}]\n`;
      context += `${result.text}\n`;
      if (result.source) {
        context += `Fonte: ${result.source}\n`;
      }
      context += `\n`;
    });

    return context;
  }
}

export default new PineconeService();