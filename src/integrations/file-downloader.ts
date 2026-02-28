import { writeFileSync } from 'fs';
import { mkdir } from 'fs/promises';
import type { AstroIntegration } from 'astro';

interface FileDownload {
  url: string;
  outputPath: string;
  name?: string;
  required?: boolean;
}

interface FileDownloaderOptions {
  files: FileDownload[];
}

export default function fileDownloader(options: FileDownloaderOptions): AstroIntegration {
  return {
    name: 'file-downloader',
    hooks: {
      'astro:build:start': async () => {
        for (const file of options.files) {
          try {
            const fileName = file.name || file.url.split('/').pop() || 'unknown';
            console.log(`Downloading ${fileName}...`);

            const response = await fetch(file.url);

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const content = await response.text();

            const dir = file.outputPath.substring(0, file.outputPath.lastIndexOf('/'));
            await mkdir(dir, { recursive: true });

            writeFileSync(file.outputPath, content);
            console.log(`${fileName} downloaded successfully`);
          } catch (error) {
            console.error(`Failed to download ${file.name || file.url}:`, error);
            if (file.required === true) {
              process.exit(1);
            } else {
              console.warn('Build continuing without downloaded file');
            }
          }
        }
      }
    }
  };
}
