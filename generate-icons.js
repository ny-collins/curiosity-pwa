// generate-icons.js
// Use ES Module import syntax
import sharp from 'sharp'; 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // Needed for __dirname equivalent in ESM

// --- Configuration ---
// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceSvg = path.join(__dirname, 'public', 'logo.svg'); 
const outputDir = path.join(__dirname, 'public', 'icons');      
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];        
const appleIconSize = 180; 
const faviconIcoSizes = [16, 32, 48]; 

// --- Helper Function ---
async function generateIcon(size, inputFile, outputFilename) {
  try {
    // Check/create directory asynchronously
    await fs.promises.mkdir(outputDir, { recursive: true });

    await sharp(inputFile)
      .resize(size, size) 
      .png() 
      .toFile(path.join(outputDir, outputFilename));

    console.log(`Generated: ${outputFilename} (${size}x${size})`);
  } catch (error) {
    console.error(`Error generating ${outputFilename}:`, error);
  }
}

// --- Main Generation Logic ---
async function generateAllIcons() {
  console.log(`Starting icon generation from: ${sourceSvg}`);

  // Check file existence asynchronously (optional, sharp might handle it)
  try {
      await fs.promises.access(sourceSvg, fs.constants.R_OK);
  } catch {
       console.error(`Error: Source SVG not found or not readable at ${sourceSvg}`);
       return;
  }
 

  // Generate standard PWA icons
  const standardIconPromises = iconSizes.map(size => {
    const filename = `icon-${size}x${size}.png`;
    return generateIcon(size, sourceSvg, filename);
  });

  // Generate Apple Touch Icon
  const appleIconPromise = generateIcon(appleIconSize, sourceSvg, 'apple-touch-icon.png');

  // Generate base PNGs for potential favicon.ico
  const icoPngPromises = faviconIcoSizes.map(size => {
      const filename = `favicon-${size}x${size}.png`; // Temporary files in /icons/
      return generateIcon(size, sourceSvg, filename);
  });
  
  await Promise.all([...standardIconPromises, appleIconPromise, ...icoPngPromises]);

  console.log("\nIcon generation complete.");
  console.warn("NOTE: favicon.ico was not automatically generated. You can ignore this if relying on SVG/PNG favicons.");
  console.warn("Ensure your manifest.json points to the correct icon paths in /icons/");
  console.warn("Ensure your index.html links the SVG favicon and apple-touch-icon.png.");

}

// Run the generation function
generateAllIcons();
