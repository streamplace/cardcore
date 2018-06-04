export const shuffled = arr => {
  const randos = arr.map(() => Math.random());
  return Object.keys(arr)
    .sort((a, b) => randos[a] - randos[b])
    .map(k => arr[k]);
};
