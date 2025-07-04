const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const user = require("../model/user");
const Pet = require("../model/pet");

const registeruser = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password, token } = req.body;
    let check = await user.findOne({ email: email });
    if (check) {
      return res.status(400).json({
        success: false,
        message: "Por favor proporcione el correo electrónico correcto.",
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      const securePass = await bcrypt.hash(password, salt);
      check = await user.create({
        email: email,
        password: securePass,
        device_token: token,
      });
      res.status(200).json({
        success: true,
        message: "Estás registrado exitosamente",
        uid: check._id,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const registerowner = async (req, res) => {
  try {
    const {
      uid,
      firstname,
      lastname,
      phone,
      address,
      city,
      state,
      postalcode,
      role,
      token,
    } = req.body;
    let check = await user.findOne({ _id: uid });
    const data = await user.findByIdAndUpdate(
      { _id: check._id },
      {
        $set: {
          phone: phone,
          firstname: firstname,
          lastname: lastname,
          address: address,
          city: city,
          state: state,
          postalcode: postalcode,
          role: role,
          device_token: token,
        },
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message:
        "La información de sus datos de propietario se ha guardado correctamente.",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const login = async (req, res) => {
  const { email, password, token } = req.body;
  try {
    let check = await user.findOne({ email: email });
    if (!check) {
      return res.status(400).json({
        success: false,
        message: "Por favor proporcione un correo electrónico correcto.",
      });
    }

    const passwordCompare = await bcrypt.compare(password, check.password);
    if (!passwordCompare) {
      return res.status(400).json({
        success: false,
        message: "Por favor proporcione una contraseña correcta.",
      });
    }
    const tokenData = await user.findByIdAndUpdate(
      { _id: check._id },
      { $set: { device_token: token, is_loggedin: true } },
      { new: true }
    );
    if (tokenData) {
      // const accessToken = jwt.sign(data, process.env.JWT_SECRET_KEY);
      res.json({
        success: true,
        message: "usuario iniciado sesión",
        user_details: tokenData,
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const fetchUsers = async (req, res) => {
  try {
    const users = await Pet.find().populate({
      path: "user",
      select: "_id firstname lastname city address phone state role",
    });
    res.status(200).json({ success: true, message: "Data found", data: users });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const badge = async (req, res) => {
  try {
    const { id, name } = req.body;
    const check = await user.findOne({ _id: id });
    if (check) {
      const data = await user.findByIdAndUpdate(
        { _id: check._id },
        {
          $set: {
            badge_subscription: true,
            badge_name: name,
          },
        },
        { new: true }
      );
      res.status(200).json({
        success: true,
        message: "La información de la insignia se guardó correctamente",
        pet_details: data,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const business = async (req, res) => {
  try {
    const { id } = req.body;
    const check = await user.findOne({ _id: id });
    if (check) {
      const data = await user.findByIdAndUpdate(
        { _id: check._id },
        {
          $set: {
            business_subscription: true,
          },
        },
        { new: true }
      );
      res.status(200).json({
        success: true,
        message: "La información de la insignia se guardó correctamente",
        pet_details: data,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
const checkEmail = async (req, res) => {
  try {
    const check = await user.findOne({ email: req.body.email });
    if (!check) {
      return res.status(400).json({
        success: false,
        message: "El usuario con este correo electrónico no existe",
      });
    } else {
      res
        .status(200)
        .json({ success: true, message: "Email exist", uid: check._id });
    }
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
//reset password
const resetPassword = async (req, res) => {
  try {
    const data = await user.findOne({ _id: req.body.id });
    const salt = await bcrypt.genSalt(10);
    const securePass = await bcrypt.hash(req.body.password, salt);
    const userData = await user.findByIdAndUpdate(
      { _id: data._id },
      { $set: { password: securePass } },
      { new: true }
    );
    res
      .status(200)
      .json({ success: true, message: "Su contraseña ha sido actualizada" });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const userDetails = async (req, res) => {
  try {
    const users = await user.findOne({ _id: req.body.user });
    res.status(200).json({ success: true, message: "Data found", data: users });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateDeviceToken = async (req, res) => {
  try {
    const data = await user.findOne({ _id: req.body.id });
    const userData = await user.findByIdAndUpdate(
      { _id: data._id },
      { $set: { device_token: req.body.device_token } },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Se ha actualizado el token del dispositivo.",
    });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const deleteDeviceToken = async (req, res) => {
  try {
    const userData = await user.findByIdAndUpdate(
      { _id: req.body.id },
      { $set: { device_token: "", is_loggedin: false } },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Has cerrado sesión en la aplicación exitosamente",
    });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const filterUsers = async (req, res) => {
  try {
    const users = await Pet.find({ distance: req.body.distance }).populate({
      path: "user",
      select: "_id firstname lastname city address phone state role",
    });
    res.status(200).json({ success: true, message: "Data found", data: users });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  login,
  registeruser,
  registerowner,
  fetchUsers,
  badge,
  business,
  checkEmail,
  resetPassword,
  userDetails,
  deleteDeviceToken,
  filterUsers,
};
