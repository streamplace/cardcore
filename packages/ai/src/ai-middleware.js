import jsf from "json-schema-faker/dist/json-schema-faker.cjs.js";
import debug from "debug";

const log = debug("cardcore:ai-middleware");

/**
 * This middleware implements an AI that does nothing but determine random allowed a ctions and
 * take them
 */
// export function createAIMiddleware(gameActions, clientActions) {
//   return store => next => action => {
//     log(action.type);
//     if (!gameActions[action.type]) {
//       return next(action);
//     }

//     // idk idk. if we were about to do something invalid replace it
//     let state = store.getState();
//     if (
//       state.game.queue.length === 0 ||
//       state.game.turn !== state.client.keys.id
//     ) {
//       return next(action);
//     }

//     let nextSchema = state.game.queue[0];
//     let ret = next(action);

//     state = store.getState();
//     nextSchema = state.game.queue[0];

//     if (!nextSchema) {
//       throw new Error("done");
//     } else if (nextSchema.anyOf) {
//       setTimeout(() => {
//         log("faking action");
//         const act = jsf.generate(nextSchema);
//         store.dispatch(act);
//       }, 300);
//     }

//     return ret;
//   };
// }
