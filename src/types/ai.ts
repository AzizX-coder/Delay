export interface AIConversation {
  id: string;
  title: string;
  model: string;
  created_at: number;
  updated_at: number;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: number;
}

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export interface OllamaResponse {
  model: string;
  message: { role: string; content: string };
  done: boolean;
}
