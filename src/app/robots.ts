import type { MetadataRoute } from "next";

const SITE_URL = "https://murata-hiroki.jp";

export default function robots(): MetadataRoute.Robots {
  // Generative AI crawlers we explicitly allow.
  // (Default rule already permits everything; listing them by name signals
  // intent and survives any future blanket-block defaults from these vendors.)
  const aiBots = [
    "GPTBot",            // OpenAI / ChatGPT
    "OAI-SearchBot",     // OpenAI search
    "ChatGPT-User",      // ChatGPT browsing
    "ClaudeBot",         // Anthropic
    "Claude-Web",        // Anthropic
    "anthropic-ai",      // Anthropic
    "PerplexityBot",     // Perplexity
    "Perplexity-User",   // Perplexity user-driven
    "Google-Extended",   // Gemini training
    "Applebot-Extended", // Apple Intelligence
    "Bytespider",        // Doubao / TikTok
    "Amazonbot",         // Amazon
    "CCBot",             // Common Crawl
    "Meta-ExternalAgent",// Meta AI
    "FacebookBot",       // Meta
    "DuckAssistBot",     // DuckDuckGo Assist
    "cohere-ai",         // Cohere
    "Diffbot",
    "MistralAI-User",    // Mistral
  ];

  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...aiBots.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
