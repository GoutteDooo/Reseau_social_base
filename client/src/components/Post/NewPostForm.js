import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isEmpty, timestampParser } from "../Utils";
import { NavLink } from "react-router-dom";
import { addPost, getPosts } from "../../actions/post.action";

const NewPostForm = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [postPicture, setPostPicture] = useState(null);
  const [video, setVideo] = useState("");
  const [file, setFile] = useState(null);
  const userData = useSelector((state) => state.userReducer);
  const error = useSelector((state) => state.errorReducer.postErrors);
  const dispatch = useDispatch();

  const handlePicture = (e) => {
    setPostPicture(URL.createObjectURL(e.target.files[0]));
    setFile(e.target.files[0]);
    setVideo("");
  };

  const handlePost = async () => {
    if (message || postPicture || video) {
      const data = new FormData();
      data.append("posterId", userData._id);
      data.append("message", message);
      if (file) data.append("file", file);
      data.append("video", video);

      dispatch(addPost(data));
      dispatch(getPosts());
      cancelPost();
    } else {
      alert("Veuillez entrer un message.");
    }
  };

  const cancelPost = () => {
    setMessage("");
    setPostPicture("");
    setVideo("");
    setFile("");
  };

  useEffect(() => {
    if (!isEmpty(userData)) {
      setIsLoading(false);
    }

    const handleVideo = () => {
      //split permet de séparer les mots dans un tableau
      //Comme ça on pourra trouver le lien yt
      let findLink = message.split(" ");
      //on fait une boucle de ce tableau pour trovuer le lien
      for (let i = 0; i < findLink.length; i++) {
        if (
          findLink[i].includes("https://www.youtube") ||
          findLink[i].includes("https://youtube")
        ) {
          //Une fois trouvé, on remplace watch par embed (pour pouvoir incorporer la vidéo dans notre message)
          let embed = findLink[i].replace("watch?v=", "embed/");
          //on enleve le & pour définir la piste de lecture à 0
          setVideo(embed.split("&")[0]);
          //splice permet ici d'enlever le lien youtube dans le message de l'user.
          //A l'élément i du tableau, on enlève 1 seul élément en partant de la gauche (en l'occurence ici, le lien)
          findLink.splice(i, 1);
          //ET on oublie pas de faire la maj dans message.
          //En utilisant join pour rejoindre tout les éléments du tableau
          setMessage(findLink.join(" "));
          //On supprime une photo si l'user en a mis une (on ne peut pas avoir photo + vidéo)
          setPostPicture("");
        }
      }
    };

    handleVideo();
  }, [userData, message, video]);

  return (
    <div className="post-container">
      {isLoading ? (
        <i className="fas fa-spinner fa-pulse"></i>
      ) : (
        <>
          <div className="data">
            <p>
              <span>{userData.following ? userData.following.length : 0}</span>{" "}
              Abonnement{userData.following.length > 1 ? "s" : ""}
            </p>{" "}
            <p>
              <span>{userData.followers ? userData.followers.length : 0}</span>{" "}
              Abonné{userData.followers.length > 1 ? "s" : ""}
            </p>
          </div>
          <NavLink to="/profil">
            <div className="user-info">
              <img src={userData.picture} alt="user-picture" />
            </div>
          </NavLink>
          <div className="post-form">
            <textarea
              name="message"
              id="message"
              placeholder="Quoi de neuf ?"
              onChange={(e) => setMessage(e.target.value)}
              value={message}
            ></textarea>
            {message || postPicture || video.length > 20 ? (
              <li className="card-container">
                <div className="card-left">
                  <img src={userData.picture} alt="user-pic" />
                </div>
                <div className="card-right">
                  <div className="card-header">
                    <div className="pseudo">
                      <h3>{userData.pseudo}</h3>
                    </div>
                    <span>{timestampParser(Date.now())}</span>
                  </div>
                  <div className="content">
                    <p>{message}</p>
                    <img src={postPicture} alt="" />
                    {video && (
                      <iframe
                        src={video}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={video}
                      ></iframe>
                    )}
                  </div>
                </div>
              </li>
            ) : null}
            <div className="footer-form">
              <div className="icon">
                {isEmpty(video) && (
                  <>
                    <img src="./img/icons/picture.svg" alt="form-picture" />
                    <input
                      type="file"
                      id="file-upload"
                      name="file"
                      accept=".jpg, .jpeg, .png"
                      onChange={(e) => handlePicture(e)}
                    />
                  </>
                )}
                {video && (
                  <button onClick={() => setVideo("")}>Supprimer vidéo</button>
                )}
              </div>
              {error && !isEmpty(error.format) && <p>{error.format}</p>}
              {error && !isEmpty(error.maxSize) && <p>{error.maxSize}</p>}
              <div className="btn-send">
                {message || postPicture || video.length > 20 ? (
                  <button className="cancel" onClick={cancelPost}>
                    Annuler message
                  </button>
                ) : null}
                <button className="send" onClick={handlePost}>
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NewPostForm;
