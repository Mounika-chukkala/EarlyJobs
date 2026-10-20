import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { seedDatabase } from "./seedData.js";

dotenv.config();

async function seed() {
  const uri = process.env.MONGODB_URI || "memory";
  await connectDB(uri);

  const result = await seedDatabase({ clear: true });
  console.log(`Seeded ${result.jobs} jobs and ${result.candidates} candidates`);
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
