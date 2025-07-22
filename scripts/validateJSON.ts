import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import type { ErrorObject, ValidateFunction } from "ajv/dist/types";
import addFormats from "ajv-formats";
import tokenSchemas from "../schemas/tokens.schema.json" with { type: "json" };
import type { Token } from "./types";

const ajv = new Ajv({
  validateSchema: false,
  allErrors: true,
}); // options can be passed, e.g. {allErrors: true}

addFormats(ajv);

const errors: [string, null | ErrorObject[]][] = [];

function checkDuplicates(
  data: {
    tokens?: Token[];
  },
  file: string,
  type: "token",
) {
  // Handle mainnet.json files
  if (data.tokens) {
    // Check tokens array
    const items = data.tokens;
    if (items) {
      const addressMap = new Map<string, { name: string; index: number }>();
      const nameMap = new Map<string, { name: string; index: number }>();

      items.forEach((item: { address?: string }, idx: number) => {
        const address =
          typeof item.address === "string" ? item.address.toLowerCase() : "";
        const name =
          typeof item.name === "string" ? item.name.toLowerCase() : "";

        if (name && typeof name === "string") {
          const key = `${name}-${address}`;
          if (nameMap.has(key)) {
            const existing = nameMap.get(key) ?? {
              name: "unknown",
              index: -1,
            };
            errors.push([
              file,
              [
                {
                  instancePath: `/${type}s/${idx}/name`,
                  schemaPath: `#/${type}s/name`,
                  keyword: "duplicate",
                  params: { duplicate: existing },
                  message: `Duplicate ${type} name and address: ${name}`,
                },
              ],
            ]);
          } else {
            nameMap.set(key, { name: item.name ?? "", index: idx });
          }
        }

        if (address && typeof address === "string") {
          if (addressMap.has(address)) {
            const existing = addressMap.get(address) ?? {
              name: "unknown",
              index: -1,
            };
            errors.push([
              file,
              [
                {
                  instancePath: `/${type}s/${idx}/address`,
                  schemaPath: `#/${type}s/address`,
                  keyword: "duplicate",
                  params: { duplicate: existing },
                  message: `Duplicate ${type} address: ${address}`,
                },
              ],
            ]);
          } else {
            addressMap.set(address, { name: item.name ?? "", index: idx });
          }
        }
      });
    }
  }
}

function validate(schema: ValidateFunction, file: string, type: "token") {
  try {
    const data = JSON.parse(fs.readFileSync(file, { encoding: "utf-8" }));

    const valid = schema(data);

    if (!valid) {
      errors.push([file, schema.errors ?? null]);
    }

    // Check for duplicates
    checkDuplicates(data, file, type);
  } catch (error) {
    errors.push([file, error]);
  }
}

const validateToken = ajv.compile(tokenSchemas);

const inputFolder = process.argv[2];

for (const file of fs.globSync(
  path.join(inputFolder ?? "", "src/tokens/*.json"),
)) {
  validate(validateToken, file, "token");
}

if (errors.length > 0) {
  console.error(`${errors.length} errors found in the JSON files:\n\n`);
  for (const error of errors) {
    console.error("Error in file", error[0]);

    for (const err of error[1] ?? []) {
      console.error(err.instancePath, err.message);
    }

    console.log("\n");
  }
  process.exit(1);
}
