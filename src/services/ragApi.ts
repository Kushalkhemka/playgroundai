export interface RAGRequest {
  query: string;
  sessionId: string;
}

export interface RAGResponse {
  answer: string;
  sources?: string[];
  sessionId: string;
}

export class RAGApiService {
  private static readonly WEBHOOK_URL = 'https://n8n.srv877980.hstgr.cloud/webhook/881580ca-2c76-46a1-9426-3eb3c1e463c1';

  static async queryKnowledgeBase(query: string, sessionId: string): Promise<RAGResponse> {
    try {
      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`RAG query failed with status ${response.status}`);
      }

      // Get response as text first to handle different formats
      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        // If JSON parsing fails, treat the raw text as the answer
        return {
          answer: responseText,
          sources: [],
          sessionId: sessionId,
        };
      }
      
      // Handle array format: [{"output": "..."}]
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        return {
          answer: data[0].output,
          sources: data[0].sources || [],
          sessionId: sessionId,
        };
      }
      
      // Handle object format and other response formats from n8n
      return {
        answer: data.answer || data.response || data.result || 'No answer received',
        sources: data.sources || [],
        sessionId: data.sessionId || sessionId,
      };
    } catch (error) {
      console.error('RAG query error:', error);
      throw new Error('Failed to query knowledge base');
    }
  }
}