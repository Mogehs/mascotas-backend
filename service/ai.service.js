const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const getVeterinaryAdvice = async (message) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  "You are a helpful veterinary assistant. Provide professional advice for common pet health issues, but always recommend consulting a real veterinarian for serious concerns.\n\n" +
                  message,
              },
            ],
          },
        ],
      }),
    }
  );

  return await response.json();
};

const getTrainingAdvice = async (message) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  "You are a professional dog training assistant. Offer helpful, accurate, and concise advice on dog training topics. Focus on positive reinforcement techniques and ethical training methods. If they ask you about harmful or abusive training methods, politely redirect them to positive alternatives. Include practical steps and examples where appropriate.\n\n" +
                  message,
              },
            ],
          },
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
