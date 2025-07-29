const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`;

const getVeterinaryAdvice = async (message) => {
  const prompt =
    `You are a helpful veterinary assistant. Answer user questions about common pet health issues in a direct and conversational style. Do not include greetings or polite phrases like "Hi", "Hope you're well". Respond naturally and professionally. If the message is in Spanish, respond in Spanish. If it's in English, respond in English. Always recommend visiting a real veterinarian for serious issues.\n\n` +
    message;

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  return await response.json();
};

const getTrainingAdvice = async (message) => {
  const prompt =
    `You are a professional dog training assistant. Give accurate, helpful answers using positive reinforcement techniques and ethical training methods. Respond directly, like you're having a casual, honest conversation. Avoid polite or generic phrases like "Hi there" or "Hope you're doing well". If the question is asked in Spanish, reply in Spanish. If in English, reply in English. If harmful methods are mentioned, suggest positive alternatives.\n\n` +
    message;

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  return await response.json();
};

module.exports = {
  getVeterinaryAdvice,
  getTrainingAdvice,
};
