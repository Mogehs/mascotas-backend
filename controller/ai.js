const aiService = require("../service/ai.service");

const getIdentifier = (req) =>
  (req.headers["x-forwarded-for"]?.split(",")[0]?.trim()) || req.ip || "anonymous";

const getVeterinaryAdvice = async (req, res) => {
  try {
    const response = await aiService.getVeterinaryAdvice(req.body.message, getIdentifier(req));
    res.status(200).send(response);
  } catch (error) {
    console.error("Vet advice error:", error);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

const getTrainingAdvice = async (req, res) => {
  try {
    const response = await aiService.getTrainingAdvice(req.body.message, getIdentifier(req));
    res.status(200).send(response);
  } catch (error) {
    console.error("Training advice error:", error);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

module.exports = { getVeterinaryAdvice, getTrainingAdvice };
