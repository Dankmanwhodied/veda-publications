require("dotenv").config();

const bcrypt = require("bcryptjs");
const { dataStore } = require("../src/config/dataStore");

const seedChiefEditor = async () => {
  const { CHIEF_EDITOR_EMAIL, CHIEF_EDITOR_PASSWORD } = process.env;
  const name = process.env.CHIEF_EDITOR_NAME || "Chief Editor";

  if (!CHIEF_EDITOR_EMAIL || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CHIEF_EDITOR_EMAIL)) {
    throw new Error("Set a valid CHIEF_EDITOR_EMAIL in the backend environment.");
  }
  if (!CHIEF_EDITOR_PASSWORD || CHIEF_EDITOR_PASSWORD.length < 12) {
    throw new Error("Set CHIEF_EDITOR_PASSWORD to at least 12 characters in the backend environment.");
  }
  if (Buffer.byteLength(CHIEF_EDITOR_PASSWORD, "utf8") > 72) {
    throw new Error("CHIEF_EDITOR_PASSWORD must be 72 UTF-8 bytes or fewer.");
  }
  if (dataStore.provider === "mongodb" && !process.env.MONGODB_URI) {
    throw new Error("Set MONGODB_URI in the backend environment.");
  }
  if (
    dataStore.provider === "supabase" &&
    (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY)
  ) {
    throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY in the backend environment.");
  }

  await dataStore.connect();
  const password = await bcrypt.hash(CHIEF_EDITOR_PASSWORD, 12);
  await dataStore.upsertChiefEditor({
    name,
    email: CHIEF_EDITOR_EMAIL.trim().toLowerCase(),
    password,
  });
  console.log("Chief Editor account configured.");
};

seedChiefEditor()
  .catch((error) => {
    console.error("Chief Editor setup failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => dataStore.disconnect());
