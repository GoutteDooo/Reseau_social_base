import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadPicture } from "../../actions/user.action";

const UploadImg = () => {
  const [file, setFile] = useState();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.userReducer);

  const handlePicture = useCallback(
    (e) => {
      e.preventDefault();
      const data = new FormData();
      data.append("pseudo", userData.pseudo);
      data.append("userId", userData._id);
      data.append("file", file);

      //afficher le contenu du formData
      /*
    for (let [key, value] of data.entries()) {
      console.log(key, value);
    }
    */

      dispatch(uploadPicture(data, userData._id));
    },
    [file, userData, dispatch]
  );

  return (
    <form
      action=""
      onSubmit={(e) => {
        handlePicture(e);
      }}
      className="upload-pic"
    >
      <label htmlFor="file">Changer d'image</label>
      <input
        type="file"
        name="file"
        id="file"
        accept=".jpg, .jpeg, .png"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <br />
      <input type="submit" value="Envoyer" />
    </form>
  );
};

export default UploadImg;
