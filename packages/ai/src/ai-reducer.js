import { PLAY_CARD } from "@cardcore/game";
import { target, Box, shuffle } from "@cardcore/util";
import { AI_FAKE_ACTION } from "./ai-autoplay";

export function aiReducer(state, action) {
  if (!state.ai) {
    state.ai = {
      fakeActions: [],
      allActions: [],
    };
  }

  state = {
    ...state,
    ai: {
      ...state.ai,
      allActions: [...state.ai.allActions, action],
    },
  };

  if (action.type === AI_FAKE_ACTION) {
    return {
      ...state,
      ai: {
        ...state.ai,
        fakeActions: [...state.ai.fakeActions, action.action],
      },
    };
  }

  // when we play the cards, we gotta pick random targets b/c no client
  if (action.type === PLAY_CARD && action.agent === state.client.keys.id) {
    const cardId = Box.traverse(state, action.boxId);
    const card = state.game.units[cardId];
    const targets = card.onSummon.map((onSummon) => {
      if (onSummon.target.count === undefined || onSummon.target.random) {
        return null;
      }
      const allTargets = Object.keys(target(state, onSummon.target));
      return shuffle(allTargets)[0] || null;
    });
    return {
      ...state,
      client: {
        ...state.client,
        targets,
      },
    };
  }

  return state;
}
