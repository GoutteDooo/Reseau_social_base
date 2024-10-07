import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isEmpty } from "../Utils";
import { followUser, unFollowUser } from "../../actions/user.action";

const FollowHandler = ({ idToFollow, type }) => {
  const userData = useSelector((state) => state.userReducer);
  const [isFollowed, setIsFollowed] = useState(false);
  const dispatch = useDispatch();

  const handleFollow = () => {
    dispatch(followUser(userData._id, idToFollow));
    setIsFollowed(true);
  };

  const handleUnfollow = () => {
    //idToFollow = idToUnFollow, on est obligé de l'écrire comme ça à cause du nom de la props
    dispatch(unFollowUser(userData._id, idToFollow));
    setIsFollowed(false);
  };

  useEffect(() => {
    if (!isEmpty(userData) && Array.isArray(userData.following)) {
      setIsFollowed(userData.following.includes(idToFollow));
    }
  }, [userData, idToFollow]);

  return (
    <>
      {isFollowed && !isEmpty(userData) && (
        <span onClick={handleUnfollow}>
          {type === "suggestions" && (
            <button className="unfollow-btn">Abonné</button>
          )}

          {type === "card" && (
            <img src="./img/icons/checked.svg" alt="checked" />
          )}
        </span>
      )}
      {!isFollowed && !isEmpty(userData) && (
        <span onClick={handleFollow}>
          {type === "suggestions" && (
            <button className="follow-btn">Suivre</button>
          )}
          {type === "card" && <img src="./img/icons/check.svg" alt="check" />}
        </span>
      )}
    </>
  );
};

export default FollowHandler;
