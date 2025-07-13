import { getMetadataInFolder } from "../utils";
import { validateTokens } from "./_tokens";

const errors: string[] = [];
const warnings: string[] = [];

const tokenMetadataFiles = getMetadataInFolder("tokens");

await Promise.all([
  ...tokenMetadataFiles.map((file) => validateTokens(errors, file, warnings)),
]);

if (errors.length > 0) {
  console.log("Errors found:");
  for (const error of errors) {
    console.warn("\x1b[31m%s\x1b[0m", "Error", error);
  }
  process.exit(1);
}

if (warnings.length > 0) {
  console.log("Warnings found:");
  for (const warning of warnings) {
    console.warn("\x1b[33m%s\x1b[0m", "Warning", warning);
  }
}
