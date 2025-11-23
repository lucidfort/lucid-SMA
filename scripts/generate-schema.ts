// Print graphql schema to SDL format

import { printSchema, lexicographicSortSchema } from "graphql";
import fs from "fs";
import path from "path";
import { schema } from "@/lib/pothos/schema";

const schemaSDL = printSchema(lexicographicSortSchema(schema));
const outputPath = path.join(process.cwd(), "schema.graphql");

fs.writeFileSync(outputPath, schemaSDL);
console.log("✅ schema.graphql generated at:", outputPath);
