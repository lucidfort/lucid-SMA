// import { SerializedEntries } from "@urql/exchange-graphcache";
// import path from "path";
// import fs from "fs";
// import crypto from "crypto";

// const CACHE_DIR = path.join(process.cwd(), ".urql-cache");

// async function ensureCacheDir() {
//   try {
//     await fs.promises.mkdir(CACHE_DIR, { recursive: true });
//   } catch {
//     console.warn("Could not ensure cache dir:");
//   }
// }

// const keyToFile = (key: string) => {
//   const filename = crypto.createHash("sha1").update(key).digest("hex");
//   return path.join(CACHE_DIR, `${filename}.json`);
// };

// export const serverStorage = {
//   readData: async (): Promise<SerializedEntries> => {
//     try {
//       await ensureCacheDir();
//       const files = await fs.promises.readdir(CACHE_DIR);
//       const data: SerializedEntries = {};

//       for (const file of files) {
//         if (!file.endsWith(".json")) continue;
//         const filePath = path.join(CACHE_DIR, file);

//         try {
//           const content = await fs.promises.readFile(filePath, "utf-8");
//           const parsed = JSON.parse(content);

//           data[file.replace(".json", "")] = parsed;
//         } catch (err) {
//           console.warn(`Skipping corrupted cache file:`, err);
//         }
//       }

//       return Object.keys(data).length ? data : {};
//     } catch {
//       return {};
//     }
//   },

//   writeData: async (delta: SerializedEntries) => {
//     try {
//       await ensureCacheDir();

//       for (const [key, value] of Object.entries(delta)) {
//         const filename = keyToFile(key);

//         let shouldWrite = true;

//         try {
//           const existing = await fs.promises.readFile(filename, "utf-8");
//           const existingHash = crypto
//             .createHash("sha1")
//             .update(existing)
//             .digest("hex");

//           const newHash = crypto
//             .createHash("sha1")
//             .update(JSON.stringify(value))
//             .digest("hex");

//           if (existingHash === newHash) shouldWrite = false;
//         } catch {}

//         if (shouldWrite) {
//           await fs.promises.writeFile(filename, JSON.stringify(value), "utf-8");
//         }
//       }
//     } catch (err) {
//       console.error("Error writing cache:", err);
//     }
//   },

//   clear: async () => {
//     await fs.promises.rm(CACHE_DIR, { recursive: true, force: true });
//   },
// };

import { SerializedEntries } from "@urql/exchange-graphcache";
import path from "path";
import fs from "fs/promises";

const CACHE_DIR = path.join(process.cwd(), ".urql-cache");

async function ensureDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch {}
}

// Stable stringifier (sorted keys → stable hash)
function stableStringify(obj: any) {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

function keyToFile(key: string) {
  // Example:
  // key = "Query.getParent"
  // file = ".urql-cache/getParent.json"

  const parts = key.split(".");
  const name = parts[1] || key; // fallback

  return path.join(CACHE_DIR, `${name}.json`);
}

export const serverStorage = {
  readData: async (): Promise<SerializedEntries> => {
    await ensureDir();
    const entries: SerializedEntries = {};

    const files = await fs.readdir(CACHE_DIR);

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      try {
        const content = await fs.readFile(path.join(CACHE_DIR, file), "utf-8");
        const parsed = JSON.parse(content);
        const key = file.replace(".json", "");
        entries[key] = parsed;
      } catch {}
    }

    return entries;
  },

  writeData: async (delta: SerializedEntries) => {
    await ensureDir();

    for (const [key, value] of Object.entries(delta)) {
      const file = keyToFile(key);
      const newContent = stableStringify(value);

      let shouldWrite = true;

      try {
        const existing = await fs.readFile(file, "utf-8");
        const existingNormalized = stableStringify(JSON.parse(existing));

        if (existingNormalized === newContent) {
          shouldWrite = false;
        }
      } catch {
        // file doesn't exist — normal case, do nothing
      }

      if (!shouldWrite) continue;

      const tmp = file + ".tmp";
      await fs.writeFile(tmp, newContent, "utf-8");
      await fs.rename(tmp, file);
    }
  },

  clear: async () => {
    await fs.rm(CACHE_DIR, { recursive: true, force: true });
  },
};
