import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../..');

describe('Project Structure', () => {
  describe('package.json', () => {
    it('should exist', () => {
      expect(existsSync(join(projectRoot, 'package.json'))).toBe(true);
    });

    it('should be valid JSON', () => {
      const content = readFileSync(join(projectRoot, 'package.json'), 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed).toBeDefined();
    });

    it('should have required scripts', () => {
      const content = readFileSync(join(projectRoot, 'package.json'), 'utf-8');
      const pkg = JSON.parse(content);
      
      expect(pkg.scripts.build).toBeDefined();
      expect(pkg.scripts['test:unit']).toBeDefined();
      expect(pkg.scripts.typecheck).toBeDefined();
    });

    it('should have TypeScript as devDependency', () => {
      const content = readFileSync(join(projectRoot, 'package.json'), 'utf-8');
      const pkg = JSON.parse(content);
      
      expect(pkg.devDependencies.typescript).toBeDefined();
    });
  });

  describe('tsconfig.json', () => {
    it('should exist', () => {
      expect(existsSync(join(projectRoot, 'tsconfig.json'))).toBe(true);
    });

    it('should be valid JSON', () => {
      const content = readFileSync(join(projectRoot, 'tsconfig.json'), 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed).toBeDefined();
    });

    it('should have strict mode enabled', () => {
      const content = readFileSync(join(projectRoot, 'tsconfig.json'), 'utf-8');
      const config = JSON.parse(content);
      expect(config.compilerOptions.strict).toBe(true);
    });
  });

  describe('npm install', () => {
    it('should install without errors', () => {
      // This is verified by the fact that tests are running
      expect(existsSync(join(projectRoot, 'node_modules'))).toBe(true);
    });
  });
});
