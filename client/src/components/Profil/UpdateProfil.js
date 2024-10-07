import React, { useState } from "react";
import LeftNav from "../LeftNav";
import { useDispatch, useSelector } from "react-redux";
import UploadImg from "./UploadImg";
import { updateBio } from "../../actions/user.action";
import { dateParser } from "../Utils";
import FollowHandler from "./FollowHandler";

const UpdateProfil = () => {
  const [bio, setBio] = useState("");
  const [updateForm, setUpdateForm] = useState(false);

  const userData = useSelector((state) => state.userReducer);
  const usersData = useSelector((state) => state.usersReducer);
  const dispatch = useDispatch();
  const [followingPopUp, setFollowingPopUp] = useState(false);
  const [followersPopUp, setFollowersPopUp] = useState(false);

  const handleUpdate = () => {
    console.log(bio);

    dispatch(updateBio(userData._id, bio));

    setUpdateForm(false);
  };

  return (
    <div className="profil-container">
      <LeftNav />
      <h1>Profil de {userData.pseudo}</h1>
      <div className="update-container">
        <div className="left-part">
          <h3>Photo de profil</h3>
          <img src={userData.picture} alt="user-pic" />
          <UploadImg />
        </div>
        <div className="right-part">
          <div className="bio-update">
            <h3>Bio</h3>
            {updateForm === false && (
              <>
                <p
                  onClick={() => {
                    setUpdateForm(true);
                    setBio(userData.bio);
                  }}
                >
                  {userData.bio}
                </p>
                <button
                  onClick={() => {
                    setUpdateForm(true);
                    setBio(userData.bio); // Initialiser `bio` avec `userData.bio`
                  }}
                >
                  Modifier bio
                </button>
              </>
            )}
            {updateForm && (
              <>
                <textarea
                  typeof="text"
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                  }}
                ></textarea>
                <button onClick={handleUpdate}>Valider modifications</button>
              </>
            )}
          </div>
          <h4>Membre depuis le : {dateParser(userData.createdAt)}</h4>
          <h5 onClick={() => setFollowingPopUp(true)}>
            Abonnements : {userData.following ? userData.following.length : "0"}
          </h5>
          <h5 onClick={() => setFollowersPopUp(!followersPopUp)}>
            Abonnés : {userData.followers ? userData.followers.length : ""}
          </h5>
        </div>
      </div>
      {/* Configuration de la popup abonnements*/}
      {followingPopUp && (
        <div className="popup-profil-container">
          <div className="modal">
            <h3>Abonnements</h3>
            <span className="cross" onClick={() => setFollowingPopUp(false)}>
              &#10005;
            </span>
            <ul>
              {usersData
                .filter((user) => userData.following.includes(user._id))
                .map((user) => (
                  <li key={user._id}>
                    <img src={user.picture} alt="user-pic" />
                    <h4>{user.pseudo}</h4>
                    <div className="follow-handler">
                      <FollowHandler idToFollow={user._id} type="suggestions" />
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
      {/* Configuration de la popup abonnés*/}
      {followersPopUp && (
        <div className="popup-profil-container">
          <div className="modal">
            <h3>Abonnés</h3>
            <span className="cross" onClick={() => setFollowersPopUp(false)}>
              &#10005;
            </span>
            <ul>
              {usersData
                .filter((user) => userData.followers.includes(user._id))
                .map((user) => (
                  <li key={user._id}>
                    <img src={user.picture} alt="user-pic" />
                    <h4>{user.pseudo}</h4>
                    <div className="follow-handler">
                      <FollowHandler idToFollow={user._id} type="suggestions" />
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateProfil;
