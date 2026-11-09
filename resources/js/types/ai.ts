export type YesNo = 'YES' | 'NO'

export interface AiSuggestedModel {
  value: string
  label: string
}

export interface AiDriverConfigField {
  key: string
  type: 'text' | 'select'
  label: string
  default?: string
  options?: Array<{ label: string; value: string }>
}

export interface AiDriverOption {
  value: string
  label: string
  website: string
  requires_api_key: boolean
  /** The key is optional but sent when set, as a local server behind a proxy may want one. */
  accepts_api_key?: boolean
  /** The model list comes from the server itself, not from a built-in list. */
  fetches_models?: boolean
  global_only: boolean
  default_base_url: string
  supported_roles: string[]
  suggested_models: AiSuggestedModel[]
  config_fields: AiDriverConfigField[]
}

export interface AiConfig {
  ai_enabled: YesNo
  ai_driver: string
  ai_api_key: string
  ai_base_url: string
  ai_chat_enabled: YesNo
  ai_chat_model: string
  ai_text_generation_enabled: YesNo
  ai_text_generation_model: string
}

export interface CompanyAiConfig extends AiConfig {
  use_custom_ai_config: YesNo
}

export interface AiConversationSummary {
  id: number
  title: string | null
  model: string | null
  created_at: string
  updated_at: string
}

export interface AiChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string | null
  created_at: string
}

export interface AiCapabilities {
  chat: boolean
  text_generation: boolean
  can_manage_company?: boolean
  can_manage_global?: boolean
}
