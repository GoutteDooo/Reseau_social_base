import axios from "axios";

export const GET_POSTS = "GET_POSTS";
export const LIKE_POST = "LIKE_POST";
export const UNLIKE_POST = "UNLIKE_POST";

export const getPosts = (count) => {
  return (dispatch) => {
    return axios
      .get(`${process.env.REACT_APP_API_URL}api/post/`)
      .then((res) => {
        const array = res.data.slice(0, count);
        dispatch({ type: GET_POSTS, payload: array });
      })
      .catch((err) => console.log(err));
  };
};

export const likePost = (postId, id) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_URL}api/post/like-post/` + postId, {
        id,
      })
      .then((res) => {
        dispatch({ type: LIKE_POST, payload: { postId, id } });
      })
      .catch((err) => console.log(err));
  };
};
export const unlikePost = (postId, id) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_URL}api/post/unlike-post/` + postId, {
        id,
      })
      .then((res) => {
        dispatch({ type: UNLIKE_POST, payload: { postId, id } });
      })
      .catch((err) => console.log(err));
  };
};
