const UserModel = require("../models/user.model");
const fs = require("fs").promises; //dépendance native de node (filesystem) permet d'incrémenter des éléments dans dans fichiers
const { promisify } = require("util");
const { uploadErrors } = require("../utils/errors.utils");

module.exports.uploadProfil = async (req, res) => {
  try {
    //vérification du type MIME
    if (
      req.file.mimetype !== "image/jpg" &&
      req.file.mimetype !== "image/png" &&
      req.file.mimetype !== "image/jpeg"
    )
      throw Error("invalid file");
    //500000 ko MAX
    if (req.file.size > 500000) throw Error("over max size");
  } catch (err) {
    const errors = uploadErrors(err);
    return res.status(201).json({ errors });
  }

  try {
    //le pseudo est unique, donc l'image sera unique
    //Vu que c'est tjr le même nom, une nouvelle photo écrasera l'ancienne (pas du surcharge)
    const fileName = req.body.pseudo + ".jpg";
    //Crée le fichier image dans le répertoire client
    await fs.writeFile(
      `${__dirname}/../client/public/uploads/profil/${fileName}`,
      req.file.buffer
    );

    //Cherche le profil à mettre à jour, et le fait
    const userUpdate = await UserModel.findByIdAndUpdate(
      req.body.userId,
      {
        $set: { picture: "./uploads/profil/" + fileName },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    //sécurité
    if (!userUpdate) return res.status(404).send("User not found.");

    //réussite : réponse
    res.status(201).send(userUpdate);
  } catch (err) {
    res.status(500).json({ message: "Error uploading file.." });
  }
};
