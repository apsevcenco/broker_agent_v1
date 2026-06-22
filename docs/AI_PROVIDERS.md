# AI Providers

The platform supports multiple AI providers through `src/ai`.

Task types:

- conversation_reply
- legal_risk_review
- document_analysis
- market_research
- lead_scoring
- memory_extraction
- support_debug
- code_fix_prompt
- summarization
- translation
- classification

Providers:

- OpenAI
- Anthropic
- Gemini
- Perplexity placeholder
- Local
- Mock

V1 uses mock/local providers unless API keys are configured. The router falls back to mock behavior if a primary provider fails.
