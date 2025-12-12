import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface FixtureFile {
  path: string;
  content: string;
}

/**
 * Create a temporary test fixture directory
 */
export function createFixture(name: string, files: FixtureFile[]): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `agents-md-test-${name}-`));

  for (const file of files) {
    const filePath = path.join(tempDir, file.path);
    const fileDir = path.dirname(filePath);

    fs.mkdirSync(fileDir, { recursive: true });
    fs.writeFileSync(filePath, file.content, 'utf-8');
  }

  return tempDir;
}

/**
 * Remove a test fixture directory
 */
export function cleanupFixture(fixturePath: string): void {
  if (fs.existsSync(fixturePath)) {
    fs.rmSync(fixturePath, { recursive: true, force: true });
  }
}
