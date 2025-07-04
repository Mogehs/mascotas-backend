const OPENROUTER_API_KEY =
  "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";
const YOUR_SITE_URL = "https://fe12-144-48-134-48.ngrok-free.app";
const YOUR_SITE_NAME = "NGROK";

const getVeterinaryAdvice = async (message) => {
  console;
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": YOUR_SITE_URL,
        "X-Title": YOUR_SITE_NAME,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful veterinary assistant. Provide professional advice for common pet health issues,but always recommend consulting a real veterinarian for serious concerns.",
          },
          { role: "user", content: message },
        ],
      }),
    }
  );

  return await response.json();
};

const getTrainingAdvice = async (message) => {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": YOUR_SITE_URL,
        "X-Title": YOUR_SITE_NAME,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are a professional dog training assistant. Offer helpful, accurate, and concise advice on dog training topics. Focus on positive reinforcement techniques and ethical training methods. If they ask you about harmful or abusive training methods, politely redirect them to positive alternatives. Include practical steps and examples where appropriate.",
          },
          { role: "user", content: message },
        ],
      }),
    }
  );

  return await response.json();
};

module.exports = {
  getVeterinaryAdvice,
  getTrainingAdvice,
};
