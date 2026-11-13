require("dotenv").config();

const { dataStore } = require("../src/config/dataStore");
const sourceCatalog = require("../data/books.json");
const catalog = sourceCatalog.map(({ coverImage, ...book }) => ({
  ...book,
  coverImageUrl: book.coverImageUrl || coverImage || "",
}));

const importBookCatalog = async () => {
  await dataStore.connect();
  try {
    for (const book of catalog) {
      await dataStore.upsertBookByIsbn(book);
    }
    console.log(`Imported ${catalog.length} catalogue books into ${dataStore.provider}.`);
  } finally {
    await dataStore.disconnect();
  }
};

importBookCatalog().catch((error) => {
  console.error("Failed to import book catalogue:", error);
  process.exitCode = 1;
});
