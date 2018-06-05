import { createStore, compose, applyMiddleware } from "redux";
import gameMiddleware from "./game-middleware";
import reducer from "./reducer";
import thunk from "redux-thunk";
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default createStore(
  reducer,
  composeEnhancers(applyMiddleware(thunk, gameMiddleware))
);
