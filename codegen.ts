import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./server/graphql/schema.graphql",
  ignoreNoDocuments: true,
  generates: {
    "./lib/generated/graphql/client.ts": {
      documents: ["./operations/*.graphql"],
      plugins: ["typescript", "typescript-operations", "typescript-urql"],
      config: {
        withHooks: true,
      },
    },
    "./lib/generated/graphql/server.ts": {
      documents: [
        "./app/**/*.tsx",
        "./components/**/*.tsx",
      ],
      plugins: ["typescript", "typescript-operations"],
    },
    "introspectedSchema.json": {
      plugins: ["introspection"],
      config: {
        minify: true,
        descriptions: false,
      },
    },
  },
};

export default config;
