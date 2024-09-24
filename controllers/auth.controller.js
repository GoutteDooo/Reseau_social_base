const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { signUpErrors, signInErrors } = require("../utils/errors.utils");

const maxAge = 3 * 24 * 60 * 60 * 1000;
//Ce token permet de vérifier un user qui s'identifie.
//De ce que j'ai compris, le token sera présenté avec l'id de l'user, et permettra de confirmer si oui ou non c'est bien un user de la db
const createToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    //en millisecondes, donc ici ça fait 3 jours
    expiresIn: maxAge,
  });
};

module.exports.signUp = async (req, res) => {
  console.log(req.body);

  const { pseudo, email, password } = req.body;

  try {
    const user = await UserModel.create({ pseudo, email, password });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = signUpErrors(err);
    res.status(200).send({ errors }); //Pourquoi il destructure ?
  }
};

module.exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = signInErrors(err);
    res.status(200).json({ errors });
  }
};

module.exports.logOut = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 }); //maxAge : 1ms pour que ça s'efface tt de suite
  res.redirect("/");
};
