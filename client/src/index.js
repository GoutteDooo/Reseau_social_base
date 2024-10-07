import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.scss";

//REDUX
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducers"; //index.js de ce chemin
import { applyMiddleware } from "redux";
import { getUsers } from "./actions/users.action";

//dev tools
import { composeWithDevTools } from "redux-devtools-extension";
import logger from "redux-logger";
import { thunk, withExtraArgument } from "redux-thunk";

const store = configureStore(
  { reducer: rootReducer, devTools: true },
  composeWithDevTools(applyMiddleware(thunk, logger))
);

store.dispatch(getUsers());

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
