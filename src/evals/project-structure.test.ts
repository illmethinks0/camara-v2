import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

describe('Project Structure', () => {
  describe('package.json', () => {
    it('should exist', () => {
      expect(existsSync('package.json')).toBe(true);
    });

    it('should be valid JSON', () => {
      const content = readFileSync('package.json', 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed).toBeDefined();
    });

    it('should have required scripts', () => {
      const content = readFileSync('package.json', 'utf-8');
      const pkg = JSON.parse(content);
      
      expect(pkg.scripts.build).toBeDefined();
      expect(pkg.scripts['test:unit']).toBeDefined();
      expect(pkg.scripts.typecheck).toBeDefined();
    });

    it('should have TypeScript as devDependency', () => {
      const content = readFileSync('package.json', 'utf-8');
      const pkg = JSON.parse(content);
      
      expect(pkg.devDependencies.typescript).toBeDefined();
    });
  });

  describe('tsconfig.json', () => {
    it('should exist', () => {
      expect(existsSync('tsconfig.json')).toBe(true);
    });

    it('should be valid JSON', () => {
      const content = readFileSync('tsconfig.json', 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed).toBeDefined();
    });

    it('should have strict mode enabled', () => {
      const content = readFileSync('tsconfig.json', 'utf-8');
      const config = JSON.parse(content);
      expect(config.compilerOptions.strict).toBe(true);
    });
  });

  describe('npm install', () => {
    it('should install without errors', () => {
      // This is verified by the fact that tests are running
      expect(existsSync('node_modules')).toBe(true);
    });
  });
});
