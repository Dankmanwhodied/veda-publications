const { dataStore } = require("./dataStore");

const connectDB = async () => {
  await dataStore.connect();
  console.log(`✅ ${dataStore.provider === "supabase" ? "Supabase" : "MongoDB"} Connected Successfully`);
};

module.exports = connectDB;