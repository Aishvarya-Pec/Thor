import type { ModelInfo, OllamaApiResponse, OllamaModel } from './types';

export const WORK_DIR_NAME = 'project';
export const WORK_DIR = `/home/${WORK_DIR_NAME}`;
export const MODIFICATIONS_TAG_NAME = 'thor_file_modifications';
export const MODEL_REGEX = /^\[Model: (.*?)\]\n\n/;
export const DEFAULT_MODEL = 'x-ai/grok-4-fast:free';
export const DEFAULT_PROVIDER = 'OpenRouter';

// OpenRouter main models
const staticModels: ModelInfo[] = [
  { name: 'x-ai/grok-4-fast:free', label: 'Grok 4 Fast', provider: 'OpenRouter', taskType: 'fast' },
  { name: 'google/gemini-2.0-flash-exp:free', label: 'Gemini 2.0 Flash', provider: 'OpenRouter', taskType: 'design' },
  { name: 'deepseek/deepseek-chat-v3.1:free', label: 'DeepSeek V3.1', provider: 'OpenRouter', taskType: 'heavy' },
];

// Local Ollama models (NO RATE LIMITS - requires Ollama running locally)
const localModels: ModelInfo[] = [
  { name: 'llama3.2:3b', label: 'Llama 3.2 3B (Local - Fast)', provider: 'Ollama', taskType: 'fast' },
  { name: 'llama3.2:1b', label: 'Llama 3.2 1B (Local - Quick)', provider: 'Ollama', taskType: 'fast' },
  { name: 'qwen2:1.5b', label: 'Qwen 2 1.5B (Local - Design)', provider: 'Ollama', taskType: 'design' },
  { name: 'gemma2:2b', label: 'Gemma 2 2B (Local - Analysis)', provider: 'Ollama', taskType: 'heavy' },
];

export const MODEL_LIST: ModelInfo[] = [...staticModels, ...localModels];
