const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();

// ── Option 1: cheaper model — gemini-2.0-flash-lite is ~75% cheaper than 2.5-flash
//    and handles simple pet Q&A just as well
const GEMINI_MODEL = "gemini-2.0-flash-lite";
const GEMINI_URL   = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ── Config ──────────────────────────────────────────────────────────────────
const MAX_OUTPUT_TOKENS = 400;              // Option 4: cap output length
const CACHE_TTL_MS      = 24 * 60 * 60 * 1000; // 24 hours
const RATE_LIMIT        = 20;              // Option 5: max requests per user per day
const RATE_WINDOW_MS    = 24 * 60 * 60 * 1000;

// ── Option 2: In-memory response cache ──────────────────────────────────────
// Identical questions (e.g. "my dog won't eat") are answered from cache,
// no Gemini call needed — saves 100% of tokens for repeated questions.
const responseCache = new Map();

const makeCacheKey = (type, message) =>
  `${type}::${message.toLowerCase().trim().slice(0, 300)}`;

const getCached = (key) => {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  return entry.data;
};

const setCache = (key, data) => {
  // Evict expired entries when cache grows beyond 500 entries
  if (responseCache.size > 500) {
    const now = Date.now();
    for (const [k, v] of responseCache) {
      if (now > v.expiresAt) responseCache.delete(k);
    }
  }
  responseCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
};

// ── Option 5: Per-user rate limiter ──────────────────────────────────────────
const rateLimitStore = new Map();

const checkRateLimit = (identifier) => {
  const now   = Date.now();
  const entry = rateLimitStore.get(identifier);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true };
  }
  if (entry.count >= RATE_LIMIT) return { allowed: false };
  entry.count++;
  return { allowed: true };
};

// ── Greeting detection (shared) ───────────────────────────────────────────────
const GREETINGS = ["hello", "hi", "hola", "hey", "good morning", "good afternoon", "good evening"];

const isGreeting = (message) => {
  const lower = message.toLowerCase().trim();
  return GREETINGS.some(
    (g) => lower === g || lower.startsWith(g + " ") || lower.startsWith(g + ",")
  );
};

// ── Static greeting replies ───────────────────────────────────────────────────
const VET_GREETING_EN = [
  "Hello! How can I help with your pet's health today?",
  "",
  "You can ask me about:",
  "– Nutrition & diet",
  "– Behaviour",
  "– General care",
  "– Signs of illness",
  "",
  "For serious issues, always visit a real veterinarian. What would you like to know?",
].join("\n");

const VET_GREETING_ES = [
  "¡Hola! ¿Cómo puedo ayudarte con la salud de tu mascota hoy?",
  "",
  "Puedes preguntarme sobre:",
  "– Nutrición y dieta",
  "– Comportamiento",
  "– Cuidado general",
  "– Signos de enfermedad",
  "",
  "Para problemas serios, siempre consulta a un veterinario. ¿Qué te gustaría saber?",
].join("\n");

const TRAINER_GREETING_EN = [
  "Hello! How can I help with your dog's training today?",
  "",
  "Common topics I can help with:",
  "– Basic obedience (sit, stay, come)",
  "– Socialisation with other dogs or people",
  "– Behaviour problems (barking, anxiety, etc.)",
  "– Positive reinforcement & clicker training",
  "",
  "Tell me what you need and I'll give you step-by-step advice.",
].join("\n");

const TRAINER_GREETING_ES = [
  "¡Hola! ¿Cómo puedo ayudarte con el entrenamiento de tu perro hoy?",
  "",
  "Temas habituales:",
  "– Obediencia básica (sentado, quieto, ven)",
  "– Socialización",
  "– Problemas de comportamiento",
  "– Entrenamiento con refuerzo positivo",
  "",
  "Dime qué necesitas y te daré consejos prácticos.",
].join("\n");

const staticReply = (text) => ({
  candidates: [{ content: { parts: [{ text }] } }],
});

// ── Option 3: System prompts in the proper `system_instruction` field ─────────
// Gemini caches system instructions between requests — reduces effective token cost.
const VET_SYSTEM = [
  "You are a helpful veterinary assistant.",
  "Answer questions about pet health directly and conversationally.",
  "No greetings or filler phrases.",
  "Respond in the same language as the user (Spanish or English).",
  "Always recommend a real vet for serious issues.",
  "Keep answers concise and practical.",
].join(" ");

const TRAINER_SYSTEM = [
  "You are a professional dog training assistant.",
  "Use positive reinforcement and ethical training methods only.",
  "Respond directly, no filler phrases.",
  "Respond in the same language as the user (Spanish or English).",
  "If harmful methods are mentioned, suggest positive alternatives.",
  "Keep answers concise and practical.",
].join(" ");

// ── Gemini API call ───────────────────────────────────────────────────────────
const callGemini = async (systemPrompt, userMessage) => {
  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      // Option 3: system_instruction is a dedicated field, not mixed into user message
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
      generationConfig: {
        maxOutputTokens: MAX_OUTPUT_TOKENS, // Option 4: hard cap on output tokens
        temperature: 0.7,
      },
    }),
  });
  return res.json();
};

// ── Rate limit response ───────────────────────────────────────────────────────
const rateLimitedResponse = () =>
  staticReply(
    "You have reached the daily limit for this assistant (20 messages per day). Please try again tomorrow."
  );

// ── Error response ────────────────────────────────────────────────────────────
const errorResponse = (type) =>
  staticReply(
    type === "vet"
      ? "I'm currently unable to access my knowledge base. Please try again in a moment."
      : "I'm currently unable to access my training knowledge base. Please try again in a moment."
  );

// ═══════════════════════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════════════════════

const getVeterinaryAdvice = async (message, identifier = "anonymous") => {
  // Option 5: rate limit
  if (!checkRateLimit(`vet:${identifier}`).allowed) return rateLimitedResponse();

  // Static greeting — zero API cost
  if (isGreeting(message)) {
    return staticReply(message.toLowerCase().includes("hola") ? VET_GREETING_ES : VET_GREETING_EN);
  }

  // Option 2: cache hit — zero API cost
  const key    = makeCacheKey("vet", message);
  const cached = getCached(key);
  if (cached) {
    console.log(`[AI cache hit] vet: "${message.slice(0, 50)}"`);
    return cached;
  }

  // Call Gemini (Options 1 + 3 + 4 applied inside callGemini)
  const data = await callGemini(VET_SYSTEM, message);

  if (data.error) {
    console.error("Gemini API Error (vet):", data.error);
    return errorResponse("vet");
  }

  setCache(key, data);
  return data;
};

const getTrainingAdvice = async (message, identifier = "anonymous") => {
  // Option 5: rate limit
  if (!checkRateLimit(`trainer:${identifier}`).allowed) return rateLimitedResponse();

  // Static greeting — zero API cost
  if (isGreeting(message)) {
    return staticReply(message.toLowerCase().includes("hola") ? TRAINER_GREETING_ES : TRAINER_GREETING_EN);
  }

  // Option 2: cache hit — zero API cost
  const key    = makeCacheKey("trainer", message);
  const cached = getCached(key);
  if (cached) {
    console.log(`[AI cache hit] trainer: "${message.slice(0, 50)}"`);
    return cached;
  }

  // Call Gemini
  const data = await callGemini(TRAINER_SYSTEM, message);

  if (data.error) {
    console.error("Gemini API Error (trainer):", data.error);
    return errorResponse("trainer");
  }

  setCache(key, data);
  return data;
};

module.exports = { getVeterinaryAdvice, getTrainingAdvice };
