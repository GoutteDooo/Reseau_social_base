const UserModel = require("../models/user.model");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find().select("-password"); //va chercher la table user, la cherche et la sélectionne entièrement sauf password
  res.status(200).json(users);
};

module.exports.findUser = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    //isValid va traiter le paramètre et va tester s'il est connu dans la bdd
    return res.status(400).send("ID unknown : " + req.params.id);
  }

  try {
    // Utilise async/await pour la requête à MongoDB
    const user = await UserModel.findById(req.params.id).select("-password");

    // Si l'utilisateur n'est pas trouvé
    if (!user) return res.status(400).send("User not found");

    res.send(user); //user trouvé, renvoie les données
  } catch (err) {
    // Gère les erreurs

    console.error("Error fetching user by ID: ", err);
    res.status(500).send("Error fetching user by ID");
  }
};

module.exports.updateUser = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    //isValid va traiter le paramètre et va tester s'il est connu dans la bdd
    return res.status(400).send("ID unknown : " + req.params.id);
  }
  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          bio: req.body.bio,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Vérifie si l'utilisateur a été trouvé et mis à jour
    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    // Si la mise à jour a réussi, renvoie les données mises à jour
    res.send(updatedUser);
  } catch (err) {
    return res.status(500).json({ message: "errCatch" });
  }
};

module.exports.deleteUser = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    //isValid va traiter le paramètre et va tester s'il est connu dans la bdd
    return res.status(400).send("ID unknown : " + req.params.id);
  }
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json({ message: "Successfully deleted." });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports.follow = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    //isValid va traiter le paramètre et va tester s'il est connu dans la bdd
    return res.status(400).send("ID to follow unknown : " + req.params.id);
  } else if (!ObjectId.isValid(req.body.idToFollow)) {
    return res
      .status(400)
      .send("ID of follower unknown : " + req.body.idToFollow);
  }

  try {
    // Using Promise.all to execute the both updates simultaneously
    const [userFollowing, userFollowed] = await Promise.all([
      //add to the followers list
      await UserModel.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { following: req.body.idToFollow } },
        { new: true }
      ),

      //add to following list
      await UserModel.findByIdAndUpdate(
        req.body.idToFollow,
        {
          $addToSet: { followers: req.params.id },
        },
        { new: true }
      ),
    ]);

    // Envoyer une réponse une fois les deux mises à jour terminées
    res.status(201).json({
      userFollowing: userFollowing._id,
      userFollowed: userFollowed._id,
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports.unfollow = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    //isValid va traiter le paramètre et va tester s'il est connu dans la bdd
    return res.status(400).send("ID to unfollow unknown : " + req.params.id);
  } else if (!ObjectId.isValid(req.body.idToUnfollow)) {
    return res
      .status(400)
      .send("ID of unfollower unknown : " + req.body.idToUnfollow);
  }

  try {
    // Using Promise.all to execute the both updates simultaneously
    const [userUnfollowing, userUnfollowed] = await Promise.all([
      //remove to the followers list
      await UserModel.findByIdAndUpdate(
        req.params.id,
        { $pull: { following: req.body.idToUnfollow } },
        { new: true }
      ),

      //remove to following list
      await UserModel.findByIdAndUpdate(
        req.body.idToUnfollow,
        {
          $pull: { followers: req.params.id },
        },
        { new: true }
      ),
    ]);

    // Envoyer une réponse une fois les deux mises à jour terminées
    res.status(201).json({
      userUnfollowing: userUnfollowing._id,
      userUnfollowed: userUnfollowed._id,
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};
