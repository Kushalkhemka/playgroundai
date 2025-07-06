export interface ImageGenerationRequest {
  model: string;
  prompt: string;
  n?: number;
  size?: string;
}

export interface ImageGenerationResponse {
  data: Array<{
    url: string;
  }>;
}

export class ImageApiService {
  private static readonly BASE_URL = 'https://api.a4f.co/v1';
  private static readonly API_KEY = 'ddc-a4f-04e25c907b344795bbc84138ef96eee8';

  static async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          prompt: request.prompt,
          n: request.n || 1,
          size: request.size || '1024x1024'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Image generation failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    }
  }
}