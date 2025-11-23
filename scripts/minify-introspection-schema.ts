import fs from "fs";
import { minifyIntrospectionQuery } from "@urql/introspection";

const raw = JSON.parse(fs.readFileSync("./introspectedSchema.json", "utf8"));
const minified = minifyIntrospectionQuery(raw);

fs.writeFileSync(
  "./introspectedSchema.json",
  JSON.stringify(minified, null, 0),
);
console.log("✅ Minified introspection written to introspection.min.json");
