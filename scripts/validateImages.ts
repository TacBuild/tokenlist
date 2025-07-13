// Imports
// ================================================================
import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import sharp from "sharp";
import type { TokensFile } from "../src/types/tokens";

// Config
// ================================================================
const BASE_FOLDER = "src";
const ASSET_PATH = path.join(process.argv[2] ?? "", BASE_FOLDER, "assets");
const BASE_FOLDER_EXCLUDED = ["assets"];

// Functions
// ================================================================
/**
 * Reads the dimensions of an image file for PNG and JPG files
 * @param imagePath - The path to the image file
 * @returns The width and height of the image, or null if the file is not a valid image
 */
const getImageDimensions = (
  imagePath: string,
): { width: number; height: number } | null => {
  const buffer = fs.readFileSync(imagePath);

  // Check PNG header
  if (buffer.slice(0, 8).toString("hex") === "89504e470d0a1a0a") {
    // PNG files start with 8 bytes: 89 50 4e 47 0d 0a 1a 0a
    // The width and height are located at bytes 16-19 (width) and 20-23 (height)
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }

  // Check JPG header
  if (buffer.slice(0, 2).toString("hex") === "ffd8") {
    // JPG files start with ff d8
    let i = 2;
    while (i < buffer.length) {
      // Get segment length (2 bytes)
      const segmentLength = buffer.readUInt16BE(i + 2);
      if (
        buffer[i] === 0xff &&
        buffer[i + 1] >= 0xc0 &&
        buffer[i + 1] <= 0xc3
      ) {
        // Start of frame (SOF) marker, contains width and height in the segment
        const height = buffer.readUInt16BE(i + 5);
        const width = buffer.readUInt16BE(i + 7);
        return { width, height };
      }
      i += segmentLength + 2;
    }
  }

  // Unsupported file format
  return null;
};

/**
 * Checks if a PNG image has transparent pixels
 * @param imagePath - The path to the PNG image file
 * @returns Promise<boolean> - true if the image has transparent pixels, false otherwise
 */
const hasTransparency = async (imagePath: string): Promise<boolean> => {
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    // Only check PNG files for transparency
    if (metadata.format !== "png") {
      return false;
    }

    // Get the raw pixel data
    const { data } = await image
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });

    // Check if any pixel has an alpha value less than 255 (transparent)
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.warn(
      `Warning: Could not check transparency for ${imagePath}:`,
      error,
    );
    return false;
  }
};

/**
 * Validates an image file for existence and transparency
 * @param filePath - Base path to the image file
 * @param name - Name of the item for error messages
 * @param id - ID of the item for error messages
 * @param warnings - Array to collect warnings
 * @param checkTransparency - Whether to check for transparency
 */
const validateImageFile = async (
  filePath: string,
  name: string,
  id: string,
  warnings: string[],
  checkTransparency = false,
) => {
  // Check if image file exists
  const pngPath = `${filePath}.png`;
  const jpgPath = `${filePath}.jpg`;
  const jpegPath = `${filePath}.jpeg`;

  if (
    !fs.existsSync(pngPath) &&
    !fs.existsSync(jpgPath) &&
    !fs.existsSync(jpegPath)
  ) {
    warnings.push(
      `${id}:\nIcon file not found in assets folder for ${name} (${id})!`,
    );
  } else if (checkTransparency && fs.existsSync(pngPath)) {
    // Check for transparency in PNG images
    const hasTransparentPixels = await hasTransparency(pngPath);
    if (hasTransparentPixels) {
      warnings.push(
        `${id}:\nImage has transparent pixels for ${name} (${id})!`,
      );
    }
  }
};

/**
 * Checks all images in the assets folder for valid dimensions
 */
const validateAssetsImages = async () => {
  const errors: string[] = [];

  // Recursive function to process files in a directory
  const processDirectory = async (dirPath: string) => {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Recursively process subdirectories
        await processDirectory(fullPath);
      } else if ([".DS_Store", "default.png"].includes(entry.name)) {
        // Do nothing
      } else {
        // Check if file is an image
        const ext = path.extname(entry.name).toLowerCase();
        if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
          const dimensions = getImageDimensions(fullPath);
          const relativePath = path.relative(ASSET_PATH, fullPath);

          // Validate file names
          if (relativePath.includes("tokens")) {
            const tokenRegex = /^0x[0-9a-f]{40}$/i;
            if (
              !tokenRegex.test(
                relativePath.replace(ext, "").replace("tokens/", ""),
              ) &&
              !entry.name.includes("default")
            ) {
              errors.push(
                `${relativePath}: Invalid file name! Must be a valid token address.`,
              );
            }
          }

          if (dimensions === null) {
            errors.push(
              `${relativePath}: Unsupported file format. Unable to determine image dimensions.`,
            );
          }
          // Validate dimensions
          else if (
            dimensions.width < 1024 ||
            dimensions.height < 1024 ||
            dimensions?.width !== dimensions?.height
          ) {
            errors.push(
              `${relativePath}: Invalid (Dimensions: ${dimensions?.width}x${dimensions?.height})! Must be 1024x1024 pixels.`,
            );
          }

          // Check PNG files for transparency
          if (ext === ".png" && dimensions) {
            const hasTransparentPixels = await hasTransparency(fullPath);
            if (hasTransparentPixels) {
              errors.push(
                `${relativePath}: Invalid image! Image cannot have transparent pixels.`,
              );
            }
          }
        } else if (
          ext === ".webp" ||
          ext === ".gif" ||
          ext === ".bmp" ||
          ext === ".tiff"
        ) {
          errors.push(
            `${path.relative(ASSET_PATH, fullPath)}: Invalid file type! Only PNG and JPG images are allowed. Found: ${ext}`,
          );
        } else if (!entry.name.startsWith(".")) {
          // Only warn for non-hidden files that aren't images
          console.warn(
            `${path.relative(ASSET_PATH, fullPath)}: Non-image file found.`,
          );
        }
      }
    }
  };

  // Start processing from root folder
  await processDirectory(ASSET_PATH);

  if (errors.length > 0) {
    console.error(
      chalk.red.bold(`\n${errors.length} Errors found in assets folder:`),
    );
    errors.forEach((error) => console.error(chalk.red(`  ${error}`)));
    console.error(
      chalk.red.bold("\nPlease fix these issues before proceeding."),
    );
    process.exit(1); // Force exit with error code 1 to fail CI
  } else {
    console.log(chalk.green.bold("\nAll image validations passed!"));
  }
};

/**
 * Checks all images in the metadata folder for valid dimensions
 */
const validateMetadataImages = async () => {
  const warnings: string[] = [];

  // Get all the folders in the src folder excluding the 'BASE_FOLDER_EXCLUDED' folder
  const folders = fs
    .readdirSync(BASE_FOLDER, {
      withFileTypes: true,
    })
    .filter(
      (entry) =>
        entry.isDirectory() && !BASE_FOLDER_EXCLUDED.includes(entry.name),
    )
    .map((entry) => entry.name);

  // Get all json files in all folders
  const jsonMetadata: {
    [key: string]: {
      [key: string]:
        | TokensFile["tokens"]
    };
  } = {};
  for (const folder of folders) {
    fs.readdirSync(path.join(BASE_FOLDER, folder), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => {
        const file = `${folder}/${entry.name}`;
        const content = JSON.parse(
          fs.readFileSync(path.join(BASE_FOLDER, file), "utf8"),
        )?.[folder];

        if (!jsonMetadata[folder]) {
          jsonMetadata[folder] = {};
        }
        jsonMetadata[folder][`${entry.name}`] = content;

        return {
          folder,
          file,
          content,
        };
      });
  }

  // Validate all images in the assets folder from metadata
  for (const key of Object.keys(jsonMetadata)) {
    for (const file of Object.keys(jsonMetadata[key])) {
      if (key === "tokens") {
        const tokens = jsonMetadata[key][file] as TokensFile["tokens"];
        for (const token of tokens) {
          const filePath = path.join(ASSET_PATH, key, token.address);
          await validateImageFile(
            filePath,
            token.name,
            token.address,
            warnings,
          );
        }
      } else {
        throw new Error(`Invalid key: ${key}`);
      }
    }
  }

  if (warnings.length > 0) {
    console.warn(
      chalk.yellow.bold(`\n${warnings.length} Warnings found in tokenlist:`),
    );
    warnings.forEach((error) => console.warn(chalk.yellow(`  ${error}`)));
  } else {
    console.log(chalk.green.bold("\nAll tokenlist validations passed!"));
  }
};

// Initialize
// ================================================================
const main = async () => {
  await validateAssetsImages();
  await validateMetadataImages();
};

main().catch((error) => {
  console.error("Error during validation:", error);
  process.exit(1);
});
