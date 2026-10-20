import mongoose from "mongoose";

let mode = "mongo";

export function getDbMode() {
  return mode;
}

export async function connectDB(uri) {
  if (!uri || uri === "memory") {
    mode = "memory";
    console.log("Using in-memory data store (set MONGODB_URI for real MongoDB)");
    return { mode };
  }

  mode = "mongo";
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("MongoDB connected");
  return { mode };
}
