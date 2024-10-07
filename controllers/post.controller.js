const PostModel = require("../models/post.model");
const UserModel = require("../models/user.model");
const { uploadErrors } = require("../utils/errors.utils");
const ObjectId = require("mongoose").Types.ObjectId; //pour vérifier que le paramètre qui est passé à chaque fois existe déjà dans notre bdd

const fs = require("fs").promises; //dépendance native de node (filesystem) permet d'incrémenter des éléments dans dans fichiers
const { promisify } = require("util");

module.exports.readPost = async (req, res) => {
  /* //TUTO mais deprecié avec le temps, PostModel n'accepte plus les callbacks
  PostModel.find((err, docs) => {
    if (!err) res.send(docs);
    else console.log("error to get data : " + err);
  });
  */

  try {
    const posts = await PostModel.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(400).send(err);
  }
};
module.exports.createPost = async (req, res) => {
  let fileName;

  if (req.file !== null) {
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
    fileName = req.body.posterId + Date.now() + ".jpg";
    //Crée le fichier image dans le répertoire client
    await fs.writeFile(
      `${__dirname}/../client/public/uploads/posts/${fileName}`,
      req.file.buffer
    );
  }

  //Tout ce que l'user aura rempli dans le form (par exemple) sera dans la request
  const newPost = new PostModel({
    posterId: req.body.posterId,
    message: req.body.message,
    picture: req.file !== null ? "./uploads/posts/" + fileName : "",
    video: req.body.video,
    likers: [],
    comments: [],
  });

  try {
    const post = await newPost.save();
    return res.status(201).json(post);
  } catch (err) {
    return res.status(400).send(err);
  }
};
module.exports.updatePost = async (req, res) => {
  //Vérifie si l'id du post existe
  if (!ObjectId.isValid(req.params.id)) {
    //isValid va traiter le paramètre et va tester si son modèle existe dans la bdd (mais pas nécessairement connu ! C'est pour ça qu'on a une autre sécurité dans le try)
    return res.status(400).send("ID unknown : " + req.params.id);
  }

  try {
    const updatedRecord = {
      message: req.body.message,
    };
    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      { $set: updatedRecord },
      { new: true }
    );

    //Vérifie si le post a été trouvé et mis à jour
    if (!updatedPost) return res.status(404).send("Post not found.");

    // Si la mise à jour a réussi, renvoie les données mises à jour
    res.send(updatedPost);
  } catch (err) {
    return res.status(400).send("Update error : " + err);
  }
};
module.exports.deletePost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send("ID unknown : " + req.params.id);
  }
  try {
    const deletedPost = await PostModel.findByIdAndDelete(req.params.id);

    //Vérifie si le post a été trouvé et supp
    if (!deletedPost) return res.status(404).send("Post not found.");

    //S'il a été bien supp, on renvoie les données :
    res.status(200).json("Post successfully deleted.");
  } catch (err) {
    return res.status(400).send("error when delete : " + err);
  }
};

module.exports.likePost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send("ID unknown : " + req.params.id);
  }

  try {
    const [postLiked, userLiking] = await Promise.all([
      //add l'id du liker (req.body.id) au post (id : req.params.id)
      await PostModel.findByIdAndUpdate(
        req.params.id,
        {
          $addToSet: { likers: req.body.id },
        },
        { new: true }
      ),
      //Et on add l'id du post au profil de l'user
      await UserModel.findByIdAndUpdate(
        req.body.id,
        {
          $addToSet: { likes: req.params.id },
        },
        { new: true }
      ),
    ]);
    //vérifie que l'id du post a bien été trouvé
    if (!postLiked)
      return res
        .status(404)
        .send("Post not found, it might be deleted before liked.");
    //Vérifie que l'user existe bien (à priori oui, mais jsp j'ai envie de mettre la vérif quand même)

    if (!userLiking) return res.status(404).send("User not existing, weird.");

    //Return res when both updates in promise are done.
    return res.status(200).json({
      postLiked: postLiked._id,
      userLiking: userLiking._id,
    });
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

module.exports.unlikePost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send("ID unknown : " + req.params.id);
  }

  try {
    const [postUnliked, userUnliking] = await Promise.all([
      //delete l'id du liker (req.body.id) au post (id : req.params.id)
      await PostModel.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { likers: req.body.id },
        },
        { new: true }
      ),

      //Et on delete l'id du post au profil de l'user
      await UserModel.findByIdAndUpdate(
        req.body.id,
        {
          $pull: { likes: req.params.id },
        },
        { new: true }
      ),
    ]);

    //vérifie que l'id du post a bien été trouvé
    if (!postUnliked)
      return res
        .status(404)
        .send("Post not found, it might be deleted before unliked.");
    //Vérifie que l'user existe bien (à priori oui, mais jsp j'ai envie de mettre la vérif quand même)
    if (!userUnliking) return res.status(404).send("User not existing, weird.");

    //Return res when both updates in promise are done.
    return res.status(200).json({
      postUnliked: postUnliked._id,
      userUnliking: userUnliking._id,
    });
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

module.exports.commentPost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send("ID unknown : " + req.params.id);
  }
  try {
    const postCommented = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            commenterId: req.body.commenterId,
            commenterPseudo: req.body.commenterPseudo,
            text: req.body.text,
            timestamp: new Date().getTime(),
          },
        },
      },
      { new: true }
    );
    //sécurité
    if (!postCommented)
      res
        .status(404)
        .send("Post not found. It might be deleted when commented.");
    //réponse
    return res.status(201).json(postCommented);
  } catch (err) {
    return res.status(400).send(err);
  }
};

module.exports.editCommentPost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send("ID unknown : " + req.params.id);
  }

  try {
    //find post
    const post = await PostModel.findById(req.params.id);
    //secu
    if (!post) return res.status(404).send("Post not found.");

    const theComment = post.comments.find((comment) =>
      //enums existing comms on post, and find the one which id's corresponding with
      comment._id.equals(req.body.commentId)
    );

    //security before updating text (because no text possible if no comment found)
    if (!theComment) return res.status(404).send("comment not found");

    //updating text
    theComment.text = req.body.text;

    //Save post with comment edited
    await post.save();

    //return edited comment in db
    return res.status(200).json(theComment);
  } catch (err) {
    return res.status(400).send("error : " + err);
  }
};

module.exports.deleteCommentPost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send("ID unknown : " + req.params.id);
  }

  try {
    //find post
    const post = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          comments: {
            _id: req.body.commentId,
          },
        },
      },
      { new: true }
    );

    //secu
    if (!post) return res.status(404).send("Post not found.");

    //return post with comments in db
    return res.status(200).json("comment successfully deleted.");
  } catch (err) {
    return res.status(400).send("error : " + err);
  }
};
