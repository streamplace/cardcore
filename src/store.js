import { createStore, compose, applyMiddleware } from "redux";
import { gameActionMiddleware, gameMiddleware } from "./game";
import reducer from "./reducer";
import thunk from "redux-thunk";
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default createStore(
  reducer,
  composeEnhancers(applyMiddleware(gameActionMiddleware, thunk, gameMiddleware))
);
