export interface StreamingMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type Model = 
  | 'provider-1/chatgpt-4o-latest'
  | 'provider-5/gpt-4o'
  | 'provider-5/gpt-4o-mini'
  | 'provider-5/o1-preview'
  | 'provider-5/o1-mini'
  | 'provider-2/claude-3-5-sonnet-20241022'
  | 'provider-2/claude-3-5-haiku-20241022'
  | 'provider-3/llama-3.1-405b-instruct'
  | 'provider-3/llama-3.1-70b-instruct'
  | 'provider-4/gemini-1.5-pro-002'
  | 'provider-4/gemini-1.5-flash-002';

export class A4FApiService {
  private static readonly BASE_URL = 'https://api.a4f.co/v1';
  private static readonly API_KEY = 'ddc-a4f-04e25c907b344795bbc84138ef96eee8';

  static async streamResponse(
    messages: StreamingMessage[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
    model: Model = 'provider-5/gpt-4o'
  ): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onComplete();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        let boundary;
        while ((boundary = buffer.indexOf('\n\n')) !== -1) {
          const chunkLine = buffer.substring(0, boundary);
          buffer = buffer.substring(boundary + 2);

          if (chunkLine.startsWith('data: ')) {
            const jsonDataStr = chunkLine.substring(6);
            if (jsonDataStr.trim() === '[DONE]') {
              continue;
            }
            try {
              const jsonData = JSON.parse(jsonDataStr);
              const content = jsonData.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              console.error('Error parsing JSON chunk:', e, jsonDataStr);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      onError(error as Error);
    }
  }
}