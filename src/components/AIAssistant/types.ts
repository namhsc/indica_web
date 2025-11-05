export interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export interface AIConfig {
  greeting: string;
  suggestions: string[];
  color: string;
}

