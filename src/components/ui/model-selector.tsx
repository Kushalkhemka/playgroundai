import React, { useState, useMemo } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	SelectLabel,
	SelectSeparator,
	SelectGroup,
} from "@/components/ui/select";
import type { SelectProps } from "@radix-ui/react-select";
import { Badge, Search, X } from "lucide-react";

// All available models from A4F API
export const MODELS = [
	// Provider 1 - Chat Models
	"provider-1/deepseek-r1-0528",
	"provider-1/deepseek-v3-0324",
	"provider-1/deepseek-chat-v3-0324",
	"provider-1/gemini-1.5-flash",
	"provider-1/gemini-1.5-pro",
	"provider-1/gemini-1.5-pro-latest",
	"provider-1/gemini-2.0-flash",
	"provider-1/gemini-2.0-flash-lite-001",
	"provider-1/gemma-2-27b-it",
	"provider-1/gemma-3-12b-it",
	"provider-1/llama-3.1-405b",
	"provider-1/llama-3.1-70b",
	"provider-1/llama-4-maverick-17b-128e",
	"provider-1/llama-3.3-70b-instruct-turbo",
	"provider-1/llama-4-maverick",
	"provider-1/llama-3.1-405b-instruct-turbo",
	"provider-1/mistral-large",
	"provider-1/qwen-qwq-32b-preview",
	
	// Provider 2 - Standard Models
	"provider-2/gpt-4o-mini",
	"provider-2/gpt-4o",
	"provider-2/gpt-4.1",
	"provider-2/gpt-3.5-turbo",
	"provider-2/deepseek-r1",
	"provider-2/gemini-2.0-flash",
	"provider-2/qwq-32b",
	"provider-2/qwen-3-235b",
	"provider-2/r1-1776",
	"provider-2/mistral-small",
	"provider-2/mistral-large",
	"provider-2/pixtral-large",
	"provider-2/llama-4-scout",
	"provider-2/llama-4-maverick",
	"provider-2/deepseek-r1-0528",
	"provider-2/mistral-saba",
	"provider-2/o3",
	"provider-2/o4-mini",
	
	// Provider 3 - Alternative Models
	"provider-3/claude-3.5-haiku",
	"provider-3/claude-sonnet-4",
	"provider-3/deepseek-r1-0528",
	"provider-3/deepseek-v3",
	"provider-3/deepseek-v3-0324",
	"provider-3/gemini-2.0-flash",
	"provider-3/gemini-2.5-pro-preview-06-05",
	"provider-3/llama-3-70b",
	"provider-3/llama-3.1-70b",
	"provider-3/llama-3.1-405b",
	"provider-3/llama-3.2-3b",
	"provider-3/llama-3.3-70b",
	"provider-3/llama-4-maverick",
	"provider-3/llama-4-scout",
	"provider-3/mistral-large-latest",
	"provider-3/pixtral-12b-2409",
	"provider-3/o3-mini",
	"provider-3/o4-mini",
	"provider-3/gpt-4",
	"provider-3/gpt-4o",
	"provider-3/gpt-4o-mini",
	"provider-3/gpt-4.1",
	"provider-3/gpt-4.1-mini",
	"provider-3/gpt-4.1-nano",
	"provider-3/gpt-4.5-preview",
	"provider-3/qwen-3-235b-a22b",
	"provider-3/qwen-2.5-72b",
	"provider-3/qwen-2.5-coder-32b",
	
	// Provider 5 - Premium Models
	"provider-5/gemini-1.5-flash",
	"provider-5/gemini-1.5-flash-8b",
	"provider-5/gemini-1.5-flash-8b-latest",
	"provider-5/gemini-1.5-flash-latest",
	"provider-5/gemini-1.5-pro",
	"provider-5/gemini-1.5-pro-latest",
	"provider-5/gemini-2.0-flash",
	"provider-5/gemini-2.0-flash-exp",
	"provider-5/gemini-2.0-flash-lite-preview-02-05",
	"provider-5/gemini-2.5-flash-preview-04-17",
	"provider-5/gemini-2.5-flash-preview-05-20",
	"provider-5/gemini-2.5-pro-preview-05-06",
	"provider-5/gemini-2.5-pro-preview-06-05",
	"provider-5/chatgpt-4o-latest",
	"provider-5/gpt-3.5-turbo",
	"provider-5/gpt-4.1",
	"provider-5/gpt-4.1-mini",
	"provider-5/gpt-4.1-nano",
	"provider-5/gpt-4o",
	"provider-5/gpt-4o-2024-08-06",
	"provider-5/gpt-4o-2024-11-20",
	"provider-5/gpt-4o-audio-preview",
	"provider-5/gpt-4o-audio-preview-2024-12-17",
	"provider-5/gpt-4o-mini",
	"provider-5/gpt-4o-mini-2024-07-18",
	"provider-5/gpt-4o-mini-search-preview-2025-03-11",
	"provider-5/gpt-4o-search-preview-2025-03-11",
	"provider-5/o1",
	"provider-5/o1-mini",
	"provider-5/o3",
	"provider-5/o3-high",
	"provider-5/o3-low",
	"provider-5/o3-medium",
	"provider-5/o3-mini",
	"provider-5/o3-mini-high",
	"provider-5/o3-mini-low",
	"provider-5/o4-mini",
	"provider-5/o4-mini-high",
	"provider-5/o4-mini-low",
	"provider-5/o4-mini-medium",
	"provider-5/claude-3-5-haiku-20241022",
	"provider-5/claude-3-7-sonnet-20250219",
	"provider-5/claude-3-7-sonnet-20250219-thinking",
	"provider-5/claude-3-haiku-20240307",
	"provider-5/claude-3-5-sonnet-20240620",
	"provider-5/claude-3-5-sonnet-20241022",
	"provider-5/claude-sonnet-4-20250514",
	"provider-5/claude-sonnet-4-20250514-thinking",
	"provider-5/deepseek-r1",
	"provider-5/deepseek-v3",
	"provider-5/deepseek-v3-0324",
	"provider-5/ministral-3b-2410",
	"provider-5/ministral-3b-latest",
	"provider-5/ministral-8b-2410",
	"provider-5/ministral-8b-latest",
	"provider-5/mistral-large-2402",
	"provider-5/mistral-large-2407",
	"provider-5/mistral-large-2411",
	"provider-5/mistral-medium-2312",
	"provider-5/mistral-medium-2505",
	"provider-5/mistral-saba-2502",
	"provider-5/mistral-small-2402",
	"provider-5/mistral-small-2409",
	"provider-5/mistral-small-2501",
	"provider-5/mistral-small-2503",
	"provider-5/mistral-small-latest",
	"provider-5/mistral-tiny",
	"provider-5/mistral-tiny-2312",
	"provider-5/mistral-tiny-2407",
	"provider-5/mistral-tiny-latest",
	"provider-5/open-mistral-nemo",
	"provider-5/open-mistral-nemo-2407",
	"provider-5/pixtral-12b",
	"provider-5/pixtral-12b-2409",
	"provider-5/pixtral-large-2411",
	"provider-5/pixtral-large-latest",
	"provider-5/sonar",
	"provider-5/sonar-deep-research",
	"provider-5/sonar-pro",
	"provider-5/sonar-reasoning",
	"provider-5/llama-3.1-8b",
	"provider-5/llama-3.3-70b",
	"provider-5/llama-4-maverick",
	"provider-5/llama-4-scout-17b-16e-instruct",
	"provider-5/command-a-03-2025",
	"provider-5/Qwen/QwQ-32B",
	"provider-5/Qwen/Qwen2.5-VL-72B-Instruct",
	"provider-5/Qwen/Qwen3-235B-A22B",
	"provider-5/Qwen/Qwen3-30B-A3B",
	
	// Provider 6 - Premium Reasoning Models
	"provider-6/gemini-2.5-pro-preview-06-05",
	"provider-6/gemini-2.5-pro-preview-05-06",
	"provider-6/claude-sonnet-4-20250514-thinking",
	"provider-6/claude-3-7-sonnet-20250219-thinking",
	"provider-6/claude-opus-4-20250514-thinking",
	"provider-6/gemini-2.5-flash",
	"provider-6/gemini-2.5-flash-thinking",
	"provider-6/claude-3-7-sonnet-20250219",
	"provider-6/claude-sonnet-4-20250514",
	"provider-6/claude-opus-4-20250514",
	"provider-6/gpt-4.1",
	"provider-6/o3-medium",
	"provider-6/o4-mini-medium",
	"provider-6/o3-pro",
	"provider-6/o3-high",
	"provider-6/o3-low",
	"provider-6/o4-mini-high",
	"provider-6/o4-mini-low",
] as const;

// Image generation models
export const IMAGE_MODELS = [
	"provider-1/FLUX.1-dev",
	"provider-1/FLUX.1-kontext-pro",
	"provider-1/FLUX.1-schnell",
	"provider-1/FLUX.1.1-pro",
	"provider-2/gpt-image-1",
	"provider-2/FLUX.1-schnell-v2",
	"provider-2/FLUX.1-schnell",
	"provider-2/FLUX.1-dev",
	"provider-2/FLUX.1.1-pro",
	"provider-2/FLUX.1-kontext-pro",
	"provider-2/FLUX.1-kontext-max",
	"provider-2/dall-e-3",
	"provider-2/ideogram-v3",
	"provider-3/flux-kontext-pro",
	"provider-3/ideogram-v3",
	"provider-3/FLUX.1-dev",
	"provider-3/FLUX.1.1-pro-ultra",
	"provider-3/FLUX.1.1-pro-ultra-raw",
	"provider-3/FLUX.1-schnell",
	"provider-3/dall-e-3",
	"provider-3/shuttle-3.1-aesthetic",
	"provider-3/shuttle-3-diffusion",
	"provider-3/shuttle-jaguar",
	"provider-4/imagen-3",
	"provider-4/imagen-4",
	"provider-5/dall-e-3",
	"provider-5/gpt-image-1",
	"provider-6/sana-1.5",
	"provider-6/sana-1.5-flash",
] as const;

export type Model = (typeof MODELS)[number];
export type ImageModel = (typeof IMAGE_MODELS)[number];
export type AllModels = Model | ImageModel;

interface ModelSelectorProps extends Omit<SelectProps, 'value' | 'onValueChange'> {
	value: AllModels;
	onChange: (value: AllModels) => void;
	disabledModels?: AllModels[];
	modelType?: 'chat' | 'image' | 'all';
	showSearch?: boolean;
}

// Helper function to extract model name from full ID
const getModelDisplayName = (modelId: string): string => {
	const parts = modelId.split('/');
	return parts.length > 1 ? parts[1] : modelId;
};

// Helper function to get provider name
const getProviderName = (modelId: string): string => {
	const parts = modelId.split('/');
	const provider = parts[0];
	
	switch (provider) {
		case 'provider-1': return 'Standard';
		case 'provider-2': return 'Fast';
		case 'provider-3': return 'Advanced';
		case 'provider-4': return 'Specialized';
		case 'provider-5': return 'Premium';
		case 'provider-6': return 'Ultra';
		default: return 'Unknown';
	}
};

// Helper function to determine if model is image generation
const isImageModel = (modelId: string): boolean => {
	return IMAGE_MODELS.includes(modelId as ImageModel);
};

// Helper function to get model features
const getModelFeatures = (modelId: string): string[] => {
	const features: string[] = [];
	const modelName = getModelDisplayName(modelId).toLowerCase();
	
	if (isImageModel(modelId)) {
		features.push('image');
	}
	
	if (modelName.includes('reasoning') || modelName.includes('thinking') || 
		modelName.includes('o1') || modelName.includes('o3') || modelName.includes('o4') ||
		modelName.includes('qwq') || modelName.includes('r1')) {
		features.push('reasoning');
	}
	
	if (modelName.includes('vision') || modelName.includes('pixtral') || 
		modelName.includes('gpt-4o') || modelName.includes('gemini') ||
		modelName.includes('claude') && !modelName.includes('haiku')) {
		features.push('vision');
	}
	
	if (modelName.includes('search')) {
		features.push('web_search');
	}
	
	return features;
};

// Group models by provider and type
const groupModelsByProviderAndType = (models: readonly string[]) => {
	const groups: Record<string, { chat: string[], image: string[] }> = {};
	
	models.forEach(model => {
		const provider = getProviderName(model);
		if (!groups[provider]) {
			groups[provider] = { chat: [], image: [] };
		}
		
		if (isImageModel(model)) {
			groups[provider].image.push(model);
		} else {
			groups[provider].chat.push(model);
		}
	});
	
	return groups;
};

export function ModelSelector({
	value,
	onChange,
	disabledModels,
	modelType = 'all',
	showSearch = true,
	...props
}: ModelSelectorProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	
	const allModels = useMemo(() => {
		if (modelType === 'chat') return MODELS;
		if (modelType === 'image') return IMAGE_MODELS;
		return [...MODELS, ...IMAGE_MODELS];
	}, [modelType]);
	
	const filteredModels = useMemo(() => {
		if (!searchQuery) return allModels;
		
		return allModels.filter(model => {
			const displayName = getModelDisplayName(model).toLowerCase();
			const provider = getProviderName(model).toLowerCase();
			const query = searchQuery.toLowerCase();
			
			return displayName.includes(query) || 
				   provider.includes(query) ||
				   model.toLowerCase().includes(query);
		});
	}, [allModels, searchQuery]);
	
	const groupedModels = useMemo(() => {
		return groupModelsByProviderAndType(filteredModels);
	}, [filteredModels]);
	
	const clearSearch = () => {
		setSearchQuery('');
	};
	
	return (
		<Select 
			value={value} 
			onValueChange={onChange} 
			open={isOpen}
			onOpenChange={setIsOpen}
			{...props}
		>
			<SelectTrigger className="w-full nodrag">
				<SelectValue placeholder="Select model">
					{value && (
						<div className="flex items-center gap-2">
							<ModelIcon modelId={value} className="h-4 w-4 object-contain rounded-sm dark:bg-white dark:p-0.5" />
							<span className="truncate">{getModelDisplayName(value)}</span>
							{getModelFeatures(value).length > 0 && (
								<div className="flex gap-1">
									{getModelFeatures(value).slice(0, 2).map(feature => (
										<span key={feature} className="text-xs bg-white/10 px-1 rounded">
											{feature}
										</span>
									))}
								</div>
							)}
						</div>
					)}
				</SelectValue>
			</SelectTrigger>
			<SelectContent className="w-[400px]">
				{/* Search Input */}
				{showSearch && (
					<div className="p-2 border-b border-white/10">
						<div className="relative">
							<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
							<input
								type="text"
								placeholder="Search models..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-8 pr-8 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
							/>
							{searchQuery && (
								<button
									onClick={clearSearch}
									className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40 hover:text-white/80"
								>
									<X className="h-4 w-4" />
								</button>
							)}
						</div>
					</div>
				)}
				
				{/* Model Groups */}
				<div className="max-h-[400px] overflow-y-auto">
					{Object.entries(groupedModels).map(([provider, modelsByType]) => (
						<div key={provider}>
							{/* Chat Models */}
							{modelsByType.chat.length > 0 && (modelType === 'all' || modelType === 'chat') && (
								<SelectGroup>
									<SelectLabel className="flex items-center gap-2">
										{provider} - Chat Models
										<span className="text-xs bg-blue-500/20 text-blue-300 px-1 rounded">
											{modelsByType.chat.length}
										</span>
									</SelectLabel>
									{modelsByType.chat.map((model) => {
										const displayName = getModelDisplayName(model);
										const features = getModelFeatures(model);
										
										return (
											<SelectItem
												key={model}
												value={model}
												disabled={disabledModels?.includes(model as AllModels)}
											>
												<div className="flex items-center gap-2 w-full">
													<ModelIcon modelId={model} className="h-4 w-4 object-contain rounded-sm dark:bg-white dark:p-0.5 flex-shrink-0" />
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2">
															<span className="truncate">{displayName}</span>
															{features.length > 0 && (
																<div className="flex gap-1">
																	{features.slice(0, 2).map(feature => (
																		<span key={feature} className="text-xs bg-white/10 px-1 rounded">
																			{feature}
																		</span>
																	))}
																</div>
															)}
														</div>
													</div>
												</div>
											</SelectItem>
										);
									})}
								</SelectGroup>
							)}
							
							{/* Image Models */}
							{modelsByType.image.length > 0 && (modelType === 'all' || modelType === 'image') && (
								<SelectGroup>
									<SelectLabel className="flex items-center gap-2">
										{provider} - Image Models
										<span className="text-xs bg-purple-500/20 text-purple-300 px-1 rounded">
											{modelsByType.image.length}
										</span>
									</SelectLabel>
									{modelsByType.image.map((model) => {
										const displayName = getModelDisplayName(model);
										const features = getModelFeatures(model);
										
										return (
											<SelectItem
												key={model}
												value={model}
												disabled={disabledModels?.includes(model as AllModels)}
											>
												<div className="flex items-center gap-2 w-full">
													<ModelIcon modelId={model} className="h-4 w-4 object-contain rounded-sm dark:bg-white dark:p-0.5 flex-shrink-0" />
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2">
															<span className="truncate">{displayName}</span>
															{features.length > 0 && (
																<div className="flex gap-1">
																	{features.map(feature => (
																		<span key={feature} className="text-xs bg-white/10 px-1 rounded">
																			{feature}
																		</span>
																	))}
																</div>
															)}
														</div>
													</div>
												</div>
											</SelectItem>
										);
									})}
								</SelectGroup>
							)}
							
							{/* Separator between providers */}
							{Object.keys(groupedModels).indexOf(provider) < Object.keys(groupedModels).length - 1 && (
								<SelectSeparator />
							)}
						</div>
					))}
				</div>
				
				{/* No Results */}
				{filteredModels.length === 0 && searchQuery && (
					<div className="p-4 text-center text-white/60">
						<p>No models found for "{searchQuery}"</p>
						<button
							onClick={clearSearch}
							className="text-violet-400 hover:text-violet-300 text-sm mt-1"
						>
							Clear search
						</button>
					</div>
				)}
			</SelectContent>
		</Select>
	);
}

// Model Icon Component - Uses A4F API logos
function ModelIcon({ modelId, className }: { modelId: string; className?: string }) {
	const modelName = getModelDisplayName(modelId).toLowerCase();
	
	// OpenAI models
	if (modelName.includes('gpt') || modelName.includes('o1') || modelName.includes('o3') || 
		modelName.includes('o4') || modelName.includes('chatgpt') || modelName.includes('dall-e')) {
		return (
			<img 
				alt="OpenAI logo" 
				className={className} 
				src="https://api.a4f.co/v1/logos/openai.svg"
			/>
		);
	}
	
	// Anthropic models
	if (modelName.includes('claude')) {
		return (
			<img 
				alt="Anthropic logo" 
				className={className} 
				src="https://api.a4f.co/v1/logos/anthropic.svg"
			/>
		);
	}
	
	// Google models
	if (modelName.includes('gemini') || modelName.includes('gemma') || modelName.includes('imagen')) {
		return (
			<img 
				alt="Google logo" 
				className={className} 
				src="https://api.a4f.co/v1/logos/google.svg"
			/>
		);
	}
	
	// DeepSeek models
	if (modelName.includes('deepseek')) {
		return (
			<img 
				alt="DeepSeek logo" 
				className={className} 
				src="https://api.a4f.co/v1/logos/deepseek.svg"
			/>
		);
	}
	
	// Meta models (Llama)
	if (modelName.includes('llama')) {
		return (
			<img 
				alt="Meta logo" 
				className={className} 
				src="https://api.a4f.co/v1/logos/meta.svg"
			/>
		);
	}
	
	// Mistral models
	if (modelName.includes('mistral') || modelName.includes('pixtral') || modelName.includes('ministral')) {
		return (
			<img 
				alt="Mistral logo" 
				className={className} 
				src="https://api.a4f.co/v1/logos/mistral.svg"
			/>
		);
	}
	
	// Qwen models (Alibaba)
	if (modelName.includes('qwen') || modelName.includes('qwq')) {
		return (
			<img 
				alt="Qwen logo" 
				className={className} 
				src="https://api.a4f.co/v1/logos/qwen.svg"
			/>
		);
	}
	
	// Cohere models
	if (modelName.includes('command')) {
		return (
			<img 
				alt="Cohere logo" 
				className={className} 
				src="https://api.a4f.co/v1/logos/cohere.svg"
			/>
		);
	}
	
	// Stability AI / Black Forest Labs models
	if (modelName.includes('flux') || modelName.includes('stable')) {
		return (
			<img 
				alt="Black Forest Labs logo" 
				className={className} 
				src="https://api.a4f.co/v1/logos/flux.svg"
			/>
		);
	}
	
	// ShuttleAI models
	if (modelName.includes('shuttle')) {
		return (
			<img 
				alt="ShuttleAI logo" 
				className={className} 
				src="https://api.a4f.co/v1/logos/shuttleai.svg"
			/>
		);
	}
	
	// xAI models
	if (modelName.includes('grok')) {
		return (
			<img 
				alt="xAI logo" 
				className={className} 
				src="https://api.a4f.co/v1/logos/xai.svg"
			/>
		);
	}
	
	// Perplexity models
	if (modelName.includes('sonar')) {
		return (
			<img 
				alt="Perplexity AI logo" 
				className={className} 
				src="https://api.a4f.co/v1/logos/perplexity.svg"
			/>
		);
	}
	
	// Default fallback icon
	return <Badge className={className} />;
}