const Language = require("../model/language")

const add = async (req, res) => {
    try {
 const language = new Language(req.body)
     await language.save();
     res.json({ success: true, message: "Language saved successfully", data: language })
    } catch (error) {
      console.log(error.message);
      return res.json({ success: false, message: error.message });
    }
  };
  const get = async (req, res) => {
    try {
        
 const language = await Language.find()
     res.json({ success: true, data: language })
    } catch (error) {
      console.log(error.message);
      return res.json({ success: false, message: error.message });
    }
  };

  module.exports = {
    add,
    get
  }