import { hash } from "@streamplace/ssb-keys";
import stringify from "json-stable-stringify";

export default function hashState(game) {
  if (!game) {
    return null;
  }
  if (game.game) {
    game = game.game;
  }
  return (
    hash(stringify(game))
      // switch up the two url-unsafe characters in base64
      .replace(/\+/g, "-")
      .replace(/\//g, "~")
      // and putting 256 bygit tes in base64 means there's always 1 trailing =. lose it.
      .replace(/=/g, "")
  );
}
