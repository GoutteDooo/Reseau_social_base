import React, { useContext } from "react";
import Log from "../components/Log";
import { UidContext } from "../components/AppContext";
import UpdateProfil from "../components/Profil/UpdateProfil";

const Profil = () => {
  //On s'attrape la value user id dans le contexte comme ça.
  //Et on pourra dans ce cas, proposer non pas à l'user de se connecter, mais bien de se déconnecter (et vice versa)
  const uid = useContext(UidContext);

  return (
    <div className="profil-page">
      {uid ? (
        <UpdateProfil />
      ) : (
        <div className="log-container">
          <Log signin={false} signup={true} />
          <div className="img-container">
            <img src="./img/log_pet.svg" alt="image-log" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profil;
