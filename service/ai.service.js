const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const getVeterinaryAdvice = async (message) => {
  // Check if it's a greeting
  const greetings = [
    "hello",
    "hi",
    "hola",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
  ];
  const isGreeting = greetings.some(
    (greeting) =>
      message.toLowerCase().trim() === greeting ||
      message
        .toLowerCase()
        .trim()
        .startsWith(greeting + " ") ||
      message
        .toLowerCase()
        .trim()
        .startsWith(greeting + ","),
  );

  if (isGreeting) {
    const isSpanish = message.toLowerCase().includes("hola");

    if (isSpanish) {
      return {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: "Hola, ¿cómo puedo ayudarte hoy? Si tienes alguna pregunta sobre la salud o el cuidado de tu mascota, estaré encantado de asistirte.\n\nPor ejemplo, puedes preguntar sobre:\n– Nutrición adecuada\n– Comportamiento\n– Cuidado general\n– Signos de enfermedad\n\nRecuerda que, aunque puedo darte consejos generales, siempre es mejor consultar a un veterinario para problemas serios o específicos. ¿Qué te gustaría saber?",
                },
              ],
            },
          },
        ],
      };
    } else {
      return {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: "Hello, how can I help you today? If you have any questions about your pet's health or care, I'll be happy to assist you.\n\nFor example, you could ask about:\n– Proper nutrition\n– Behavior\n– General care\n– Signs of illness\n\nRemember, while I can give you general advice, it's always best to consult a veterinarian for serious or specific problems. What would you like to know?",
                },
              ],
            },
          },
        ],
      };
    }
  }

  const prompt =
    `You are a helpful veterinary assistant. Answer user questions about common pet health issues in a direct and conversational style. Do not include greetings or polite phrases like "Hi", "Hope you're well". Respond naturally and professionally. If the message is in Spanish, respond in Spanish. If it's in English, respond in English. Always recommend visiting a real veterinarian for serious issues.\n\n` +
    message;

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();

  if (data.error) {
    console.error("Gemini API Error:", data.error);
    return {
      candidates: [
        {
          content: {
            parts: [
              {
                text: "I apologize, but I am currently unable to access my veterinary knowledge base. Please try again later.",
              },
            ],
          },
        },
      ],
    };
  }

  return data;
};

const getTrainingAdvice = async (message) => {
  // Check if it's a greeting
  const greetings = [
    "hello",
    "hi",
    "hola",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
  ];
  const isGreeting = greetings.some(
    (greeting) =>
      message.toLowerCase().trim() === greeting ||
      message
        .toLowerCase()
        .trim()
        .startsWith(greeting + " ") ||
      message
        .toLowerCase()
        .trim()
        .startsWith(greeting + ","),
  );

  if (isGreeting) {
    const isSpanish = message.toLowerCase().includes("hola");

    if (isSpanish) {
      return {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: "Hola, ¿cómo puedo ayudarte con el entrenamiento de tu perro hoy? Aquí tienes algunas opciones comunes para empezar:\n\n– Entrenamiento básico de obediencia – ¿necesitas ayuda con comandos como sentado, quieto o ven?\n– Socialización – ¿quieres consejos para ayudar a tu perro a llevarse bien con otros perros o personas?\n– Problemas de comportamiento – ¿tienes problemas con ladridos excesivos, ansiedad por separación, etc.?\n– Entrenamiento con clicker – ¿te gustaría aprender a usar un clicker para entrenar a tu perro?\n\nDime qué necesitas y puedo darte consejos prácticos paso a paso.",
                },
              ],
            },
          },
        ],
      };
    } else {
      return {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: "Hello, how can I help you with your dog's training today? Here are some common options to get started:\n\nBasic obedience training – need help with commands like sit, stay, or come?\nSocialization – want tips on helping your dog get along with other dogs or people?\nBehavior problems – having trouble with excessive barking, separation anxiety, etc.?\nClicker training – would you like to learn how to use a clicker to train your dog?\n\nTell me what you need and I can give you practical, step-by-step advice.",
                },
              ],
            },
          },
        ],
      };
    }
  }

  const prompt =
    `You are a professional dog training assistant. Give accurate, helpful answers using positive reinforcement techniques and ethical training methods. Respond directly, like you're having a casual, honest conversation. Avoid polite or generic phrases like "Hi there" or "Hope you're doing well". If the question is asked in Spanish, reply in Spanish. If in English, reply in English. If harmful methods are mentioned, suggest positive alternatives.\n\n` +
    message;

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();

  if (data.error) {
    console.error("Gemini API Error:", data.error);
    return {
      candidates: [
        {
          content: {
            parts: [
              {
                text: "I apologize, but I am currently unable to access my training knowledge base. Please try again later.",
              },
            ],
          },
        },
      ],
    };
  }

  return data;
};

module.exports = {
  getVeterinaryAdvice,
  getTrainingAdvice,
};
