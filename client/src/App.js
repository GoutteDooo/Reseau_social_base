import React, { useEffect, useState } from "react";
import Routes from "./components/Routes";
import { UidContext } from "./components/AppContext";
import axios from "axios";
import { useDispatch } from "react-redux";
import { getUser } from "./actions/user.action";

const App = () => {
  const [uid, setUid] = useState(null);
  const dispatch = useDispatch();

  //Lorsqu'on appelle App, vu que app englobe le router, ça va lancer ce useEffect qui va contrôler le token de l'user
  useEffect(() => {
    //fonction pour contrôler le token de l'user
    const fetchToken = async () => {
      await axios
        .get(`${process.env.REACT_APP_API_URL}jwtid`, {
          withCredentials: true,
        })
        .then((res) => {
          setUid(res.data);
        })
        .catch((err) => console.log("no token."));
    };

    fetchToken();

    //déclenche l'action de getUser pour stocker dans le store
    if (uid) dispatch(getUser(uid));
  }, [uid, dispatch]);

  return (
    <UidContext.Provider value={uid}>
      <Routes />
    </UidContext.Provider>
  );
};

export default App;
