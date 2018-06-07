import { gameReducer as game } from "./game";
import client from "./client-reducer";
import { combineReducers } from "redux";

export default combineReducers({ game, client });
