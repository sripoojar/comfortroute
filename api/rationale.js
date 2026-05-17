// api/rationale.js — Vercel serverless function
// Proxies Anthropic API to avoid browser CORS restrictions

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slot, duration, transfers, walkMin, context } = req.body;

  const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return res.status(200).json({ text: "Smart choice for your current conditions." });
  }

  const prompts = {
    recommended: `Route: ${duration} min, ${transfers} transfer(s), ${walkMin} min walk. Context: ${context}. Write ONE sentence (max 15 words) explaining why this is the easiest, most comfortable option right now. Be specific and warm.`,
    alt: `Route: ${duration} min, ${transfers} transfer(s), ${walkMin} min walk. Context: ${context}. Write ONE sentence (max 15 words) explaining the speed/effort trade-off of this faster route. Be direct.`,
    resilient: `Route: ${duration} min, ${transfers} transfer(s), ${walkMin} min walk. Context: ${context}. Write ONE sentence (max 15 words) explaining why this route is the safest backup option. Be reassuring.`,
    budget: `Route: ${duration} min, ${transfers} transfer(s), ${walkMin} min walk. Context: ${context}. Write ONE sentence (max 15 words) about the cost value of this option. Be practical.`,
  };

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 60,
        messages: [{ role: "user", content: prompts[slot] || prompts.recommended }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "Smart choice for your current conditions.";
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(200).json({ text: "Smart choice for your current conditions." });
  }
}
