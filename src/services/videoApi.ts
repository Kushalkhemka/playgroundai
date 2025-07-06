export interface VideoGenerationRequest {
  model: string;
  prompt: string;
  ratio?: string;
  quality?: string;
  duration?: number;
}

export interface VideoGenerationResponse {
  data: Array<{
    url: string;
  }>;
}

export class VideoApiService {
  private static readonly BASE_URL = 'https://api.a4f.co/v1';
  private static readonly API_KEY = 'ddc-a4f-04e25c907b344795bbc84138ef96eee8';

  static async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/video/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.model,
          prompt: request.prompt,
          ratio: request.ratio || '9:16',
          quality: request.quality || '720p',
          duration: request.duration || 8
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Video generation failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Video generation error:', error);
      throw error;
    }
  }
}