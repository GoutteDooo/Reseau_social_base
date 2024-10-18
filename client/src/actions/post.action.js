import axios from "axios";

//posts
export const GET_POSTS = "GET_POSTS";
export const GET_ALL_POSTS = "GET_ALL_POSTS";
export const ADD_POST = "ADD_POST";
export const LIKE_POST = "LIKE_POST";
export const UNLIKE_POST = "UNLIKE_POST";
export const UPDATE_POST = "UPDATE_POST";
export const DELETE_POST = "DELETE_POST";

//comments
export const ADD_COMMENT = "ADD_COMMENT";
export const EDIT_COMMENT = "EDIT_COMMENT";
export const DELETE_COMMENT = "DELETE_COMMENT";

//trends
export const GET_TRENDS = "GET_TRENDS";

//errors
export const GET_POST_ERRORS = "GET_POST_ERRORS";

export const getPosts = (count) => {
  return (dispatch) => {
    return axios
      .get(`${process.env.REACT_APP_API_URL}api/post/`)
      .then((res) => {
        const array = res.data.slice(0, count);
        dispatch({ type: GET_POSTS, payload: array });
        dispatch({ type: GET_ALL_POSTS, payload: res.data });
      })
      .catch((err) => console.log(err));
  };
};

export const addPost = (data) => {
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_URL}api/post/`, data)
      .then((res) => {
        if (res.data.errors) {
          dispatch({ type: GET_POST_ERRORS, payload: res.data.errors });
        } else {
          dispatch({ type: GET_POST_ERRORS, payload: "" });
        }
      });
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

export const updatePost = (postId, message) => {
  return (dispatch) => {
    return axios
      .put(`${process.env.REACT_APP_API_URL}api/post/` + postId, { message })
      .then((res) =>
        dispatch({ type: UPDATE_POST, payload: { postId, message } })
      )
      .catch((err) => console.log(err));
  };
};

export const deletePost = (postId) => {
  return (dispatch) => {
    return axios
      .delete(`${process.env.REACT_APP_API_URL}api/post/${postId}`)
      .then(() => {
        dispatch({ type: DELETE_POST, payload: { postId } });
      })
      .catch((err) => console.log(err));
  };
};

export const addComment = (id, commenterId, commenterPseudo, text) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_URL}api/post/comment-post/` + id, {
        commenterId,
        commenterPseudo,
        text,
      })
      .then(() => {
        dispatch({
          type: ADD_COMMENT,
          payload: { id },
        });
      })
      .catch((err) => console.log(err));
  };
};

export const editComment = (postId, commentId, text) => {
  return (dispatch) => {
    return axios
      .patch(
        `${process.env.REACT_APP_API_URL}api/post/edit-comment-post/` + postId,
        {
          commentId,
          text,
        }
      )
      .then(() => {
        dispatch({
          type: EDIT_COMMENT,
          payload: { postId, commentId, text },
        });
      });
  };
};

export const deleteComment = (postId, commentId) => {
  return (dispatch) => {
    return axios
      .patch(
        `${process.env.REACT_APP_API_URL}api/post/delete-comment-post/` +
          postId,
        { commentId }
      )
      .then(() => {
        console.log(postId, commentId);

        dispatch({ type: DELETE_COMMENT, payload: { postId, commentId } });
      });
  };
};

export const getTrends = (sortedArray) => {
  return (dispatch) => {
    dispatch({ type: GET_TRENDS, payload: sortedArray });
  };
};
