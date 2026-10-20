import { getDbMode } from "../config/db.js";
import { memoryStore } from "./memoryStore.js";
import { mongoStore } from "./mongoStore.js";

export function store() {
  return getDbMode() === "memory" ? memoryStore : mongoStore;
}
