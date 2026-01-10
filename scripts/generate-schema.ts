// Print pothos schema to SDL format

import { printSchema, lexicographicSortSchema } from "graphql";
import fs from "fs";
import path from "path";
import { schema } from "@/server/graphql/schema";

const schemaSDL = printSchema(lexicographicSortSchema(schema));
const outputPath = path.join(process.cwd(), "./server/graphql/schema.graphql");

fs.writeFileSync(outputPath, schemaSDL);
console.log("✅ SDL schema generated");
