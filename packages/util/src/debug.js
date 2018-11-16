import debugModule from "debug";

const funcs = {};

export const debug = moduleName => {
  return logStr => (dispatch, getState) => {
    const state = getState();
    let shortName;
    if (state.client && state.client.shortName) {
      shortName = state.client.shortName;
    } else {
      shortName = "no name";
    }
    const str = `cardcore:${shortName}`;
    if (!funcs[str]) {
      funcs[str] = debugModule(str);
    }
    funcs[str](`${moduleName} ${logStr}`);
  };
};
