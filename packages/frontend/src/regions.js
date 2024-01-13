// Contains ratios defining different regions on our board. Used for both rendering backgrounds and
// handling card drop events.

export const TOP_SIDEBOARD = {
  x: 0,
  y: 0,
  width: 1,
  height: 0.25,
};

export const TOP_FIELD = {
  x: 0,
  y: 0.25,
  width: 1,
  height: 0.25,
};

export const BOTTOM_FIELD = {
  x: 0,
  y: 0.5,
  width: 1,
  height: 0.25,
};

export const BOTTOM_SIDEBOARD = {
  x: 0,
  y: 0.75,
  width: 1,
  height: 0.25,
};

export default function getRegions(state) {}
