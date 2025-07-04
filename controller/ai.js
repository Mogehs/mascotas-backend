const aiService = require("../service/ai.service");

const getVeterinaryAdvice = async (req, res) => {
  try {
    const response = await aiService.getVeterinaryAdvice(req.body.message);
    res.status(200).send(response);
  } catch (error) {
    res.status(200).json({ success: true, message: error });
  }
};

const getTrainingAdvice = async (req, res) => {
  try {
    const response = await aiService.getTrainingAdvice(req.body.message);
    res.status(200).send(response);
  } catch (error) {
    res.status(200).json({ success: true, message: error });
  }
};

module.exports = {
  getVeterinaryAdvice,
  getTrainingAdvice,
};
