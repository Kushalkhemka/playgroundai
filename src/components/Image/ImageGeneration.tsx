import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Download, RefreshCw as Refresh, Settings, Sparkles, Loader2 } from 'lucide-react';
import { ImageApiService } from '../../services/imageApi';
import { ImageLoadingAnimation } from '../ui/image-loading-animation';
import { ModelSelector } from '../ui/model-selector';
import { useChatStore } from '../../store/chatStore';
import type { ImageModel } from '../ui/model-selector';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  timestamp: number;
  parameters: {
    style: string;
    size: string;
    quality: string;
  };
}

export const ImageGeneration: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<ImageModel>('provider-5/gpt-image-1');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  const { storeImageGeneration, getRagSessionId } = useChatStore();

  const styles = [
    'Photorealistic', 'Digital Art', 'Oil Painting', 'Watercolor', 
    'Sketch', 'Anime', 'Cartoon', 'Abstract', 'Minimalist'
  ];

  const sizes = ['512x512', '1024x1024', '1024x1792', '1792x1024'];

  const [settings, setSettings] = useState({
    style: 'Photorealistic',
    size: '1024x1024',
    quality: 'standard',
    count: 1,
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 15 + 5, 95);
        return newProgress;
      });
    }, 500);
    
    try {
      const response = await ImageApiService.generateImage({
        model: selectedModel,
        prompt: prompt.trim(),
        n: settings.count,
        size: settings.size
      });

      if (response.data && response.data.length > 0) {
        const newImages = response.data.map((imageData, index) => ({
          id: `${Date.now()}-${index}`,
          url: imageData.url,
          prompt: prompt.trim(),
          model: selectedModel,
          timestamp: Date.now(),
          parameters: settings,
        }));

        // Store image generation in chat history
        const sessionId = getRagSessionId();
        const imageUrls = response.data.map(img => img.url);
        await storeImageGeneration(prompt.trim(), imageUrls, selectedModel, sessionId);
        
        setGeneratedImages(prev => [...newImages, ...prev]);
        
        // Allow animation to complete before hiding
        setTimeout(() => {
          setGenerationProgress(100);
        }, 1000);
      }
    } catch (error) {
      console.error('Image generation failed:', error);
    } finally {
      clearInterval(progressInterval);
      // Keep the animation visible for completion state (minimum 4 seconds total)
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 4000);
    }
  };

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-dark-950">
      {/* Header */}
      <div className="border-b border-dark-700 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-2">AI Image Generation</h1>
          <p className="text-gray-400">Create stunning images from text descriptions using AI</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Generation Form */}
          <div className="bg-dark-900 rounded-lg border border-dark-700 p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Prompt Input */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A cute baby sea otter floating on its back in crystal clear water, photorealistic, high detail..."
                  rows={4}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Model
                </label>
                <ModelSelector
                  value={selectedModel}
                  onChange={setSelectedModel}
                  modelType="image"
                  showSearch={true}
                />

                {/* Settings Toggle */}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-gray-300 transition-colors"
                >
                  <Settings size={16} />
                  Advanced Settings
                </button>
              </div>
            </div>

            {/* Advanced Settings */}
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-dark-700 grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Style
                  </label>
                  <select
                    value={settings.style}
                    onChange={(e) => setSettings(prev => ({ ...prev, style: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {styles.map(style => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Size
                  </label>
                  <select
                    value={settings.size}
                    onChange={(e) => setSettings(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quality
                  </label>
                  <select
                    value={settings.quality}
                    onChange={(e) => setSettings(prev => ({ ...prev, quality: e.target.value }))}
                    className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="hd">HD</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Generate Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-dark-700 disabled:text-gray-500 text-white rounded-lg transition-colors"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Image
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading Animation */}
          {isGenerating && (
            <div className="mb-6 flex justify-center">
              <ImageLoadingAnimation
                isGenerating={isGenerating}
                progress={generationProgress}
                prompt={prompt}
              />
            </div>
          )}

          {/* Generated Images Gallery */}
          {generatedImages.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Generated Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedImages.map(image => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-dark-900 rounded-lg border border-dark-700 overflow-hidden group"
                  >
                    <div className="aspect-square">
                      <img
                        src={image.url}
                        alt={image.prompt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                        {image.prompt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{image.model.split('/')[1]}</span>
                        <span>{image.parameters.size}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={() => downloadImage(image.url, image.prompt)}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded text-xs transition-colors"
                        >
                          <Download size={12} />
                          Download
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded text-xs transition-colors">
                          <Refresh size={12} />
                          Variation
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {generatedImages.length === 0 && !isGenerating && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Image size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Images Generated</h3>
              <p className="text-gray-400">
                Enter a prompt above and click generate to create your first image.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};