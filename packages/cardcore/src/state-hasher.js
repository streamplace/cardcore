import { hash } from "ssb-keys";
import stringify from "json-stable-stringify";

export default function hashState(game) {
  if (!game) {
    return null;
  }
  return hash(stringify(game));
}
