import { PLAY_CARD } from "@cardcore/game";
import { target, Box, shuffle } from "@cardcore/util";

export function aiReducer(state, action) {
  // when we play the cards, we gotta pick random targets b/c no client
  if (action.type === PLAY_CARD && action.agent === state.client.keys.id) {
    const cardId = Box.traverse(state, action.boxId);
    const card = state.game.units[cardId];
    const targets = card.onSummon.map(onSummon => {
      if (onSummon.target.count === undefined || onSummon.target.random) {
        return null;
      }
      const allTargets = Object.keys(target(state, onSummon.target));
      console.log(allTargets);
      return shuffle(allTargets)[0] || null;
    });
    return {
      ...state,
      client: {
        ...state.client,
        targets
      }
    };
  }

  return state;
}
