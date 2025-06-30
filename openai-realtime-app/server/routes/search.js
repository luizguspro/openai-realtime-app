// server/routes/search.js

import express from 'express';
import { OpenAI } from 'openai';
import PineconeService from '../services/PineconeService.js'; // Usando o seu serviço existente

const router = express.Router();

// Inicializa o cliente da OpenAI. A chave é pega das variáveis de ambiente automaticamente.
const openai = new OpenAI();

// Define a rota POST para /api/search, que agora é o centro da nossa lógica
router.post('/search', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'A query (pergunta) é obrigatória.' });
  }

  console.log(`[Backend] Recebida a busca para: "${query}"`);

  try {
    // 1. Usa o seu PineconeService para buscar os documentos relevantes
    // Supondo que o searchSimilar agora use a API de embedding internamente ou que a gente o faça aqui.
    // Vamos fazer aqui para ter certeza de que o vetor é da pergunta atual.
    
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });
    const queryVector = embeddingResponse.data[0].embedding;

    const searchResults = await PineconeService.searchByVector(queryVector, 3);
    console.log(`[Backend] ${searchResults.length} resultados encontrados no Pinecone.`);

    // 2. Formata o contexto para a IA
    const context = PineconeService.formatContextForAI(searchResults);
    console.log(`[Backend] Contexto para a IA foi montado.`);

    // 3. Monta o prompt final, injetando o contexto e a pergunta
    const finalPrompt = `
      Você é a Hanna, uma assistente virtual do Impact Hub.
      Sua única tarefa é responder à "PERGUNTA DO USUÁRIO" baseando-se exclusivamente nas informações do "CONTEXTO" fornecido.
      - Se a informação estiver no contexto, responda de forma direta e amigável.
      - Se a informação não estiver clara no contexto, ou se o contexto estiver vazio, responda exatamente: "Desculpe, não encontrei essa informação em nossa base de dados. Posso ajudar com outra coisa?"
      - Nunca adicione informações que não venham do contexto. Seja concisa.

      CONTEXTO:
      ---
      ${context || 'Nenhum contexto encontrado.'}
      ---

      PERGUNTA DO USUÁRIO:
      ${query}

      SUA RESPOSTA:
    `;

    // 4. Chama a IA para gerar a resposta final
    console.log('[Backend] Enviando prompt final para a OpenAI...');
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: finalPrompt }],
      temperature: 0.4,
    });
    
    const answer = chatResponse.choices[0].message.content;
    console.log(`[Backend] Resposta da IA recebida: "${answer}"`);

    // 5. Retorna a resposta final e pura para o front-end
    res.status(200).json({ answer });

  } catch (error) {
    console.error('[Backend] Erro crítico na rota /search:', error);
    res.status(500).json({ error: 'Falha ao processar a busca no servidor.' });
  }
});

export default router;