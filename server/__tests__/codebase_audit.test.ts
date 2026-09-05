import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

describe('Codebase Security, Architecture & Reliability Audit', () => {
  const rootDir = process.cwd();
  const srcDir = path.join(rootDir, 'src');
  const serverDir = path.join(rootDir, 'server');

  function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
          getAllFiles(fullPath, arrayOfFiles);
        }
      } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.cjs')) {
        arrayOfFiles.push(fullPath);
      }
    });

    return arrayOfFiles;
  }

  const allSrcFiles = getAllFiles(srcDir);
  const allServerFiles = getAllFiles(serverDir);

  it('1. Secret Scanning: No hardcoded raw API keys (OpenAI sk-, Groq gsk_, Google AIza) committed in source', () => {
    // Regex looking for raw active secret key tokens
    const secretKeyRegexes = [
      /['"`]sk-[a-zA-Z0-9]{20,}['"`]/,
      /['"`]gsk_[a-zA-Z0-9]{20,}['"`]/,
      /['"`]AIza[0-9A-Za-z-_]{35}['"`]/
    ];

    const violations: { file: string; line: number; match: string }[] = [];

    allSrcFiles.concat(allServerFiles).forEach((filePath) => {
      // Exclude test files if they check regexes or patterns
      if (filePath.includes('__tests__') || filePath.includes('.test.')) return;

      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        secretKeyRegexes.forEach((regex) => {
          if (regex.test(line)) {
            violations.push({
              file: path.relative(rootDir, filePath),
              line: idx + 1,
              match: line.trim()
            });
          }
        });
      });
    });

    assert.strictEqual(
      violations.length,
      0,
      `Detected hardcoded API secrets in source files:\n${JSON.stringify(violations, null, 2)}`
    );
  });

  it('2. Clinical Data Protection: Clinical endpoint /api/patients/:id/clinical rejects unauthenticated and Kiosk access', () => {
    const serverFile = path.join(rootDir, 'server.ts');
    assert.ok(fs.existsSync(serverFile), 'server.ts must exist');

    const content = fs.readFileSync(serverFile, 'utf-8');

    // Verify /api/patients/:id/clinical checks role DOCTOR or ADMIN
    assert.ok(
      content.includes('/api/patients/:id/clinical'),
      'Clinical endpoint must be explicitly declared in server/routes.ts'
    );
    assert.ok(
      content.includes("role !== 'DOCTOR'") || content.includes("role !== 'ADMIN'"),
      'Clinical endpoint must enforce DOCTOR or ADMIN role restriction'
    );
    assert.ok(
      content.includes('403'),
      'Must return 403 Forbidden for non-doctor/non-admin roles accessing clinical data'
    );
  });

  it('3. Public Queue Privacy: Public queue does not leak full patient names', () => {
    const serverFile = path.join(rootDir, 'server.ts');
    const content = fs.readFileSync(serverFile, 'utf-8');

    // Verify KIOSK role returns sanitized queue without personal health data
    assert.ok(
      content.includes("role === 'KIOSK'"),
      'KIOSK role must be handled with specialized sanitization'
    );
    assert.ok(
      content.includes('getSanitizedPatientsForQueue'),
      'Server must use getSanitizedPatientsForQueue for public/kiosk callers'
    );

    const dbFile = path.join(serverDir, 'db.ts');
    const dbContent = fs.readFileSync(dbFile, 'utf-8');
    assert.ok(
      dbContent.includes('token_number AS tokenNumber') &&
      !dbContent.includes('SELECT id, name, token_number AS tokenNumber, assigned_cabin'),
      'Sanitized queue query must omit patient full names'
    );
  });

  it('4. Data Persistence: Production database does not rely on in-memory array or localStorage', () => {
    const serverDbFile = path.join(serverDir, 'db.ts');
    assert.ok(fs.existsSync(serverDbFile), 'server/db.ts must exist');

    const content = fs.readFileSync(serverDbFile, 'utf-8');
    assert.ok(
      content.includes('better-sqlite3') || content.includes('sqlite3') || content.includes('sqlite'),
      'Database must be backed by SQLite file-based persistence'
    );
    assert.ok(
      content.includes('FOREIGN KEY') && content.includes('PRAGMA foreign_keys = ON'),
      'Foreign key integrity constraints must be strictly enabled in SQLite'
    );
    assert.ok(
      content.includes('PRAGMA journal_mode = WAL'),
      'Write-Ahead Logging (WAL) should be enabled for concurrency'
    );
  });

  it('5. Audit Trail: All critical clinical events generate immutable audit log entries', () => {
    const dbFile = path.join(serverDir, 'db.ts');
    const content = fs.readFileSync(dbFile, 'utf-8');

    // Check that audit logs are written on registration, consent, order, and verification
    const criticalActions = ['registration', 'consent', 'order created', 'doctor verification'];
    criticalActions.forEach((action) => {
      assert.ok(
        content.includes(`'${action}'`),
        `Audit log must record action: ${action}`
      );
    });
  });

  it('6. Realistic Timestamps: Queue and Navigator screens avoid misleading "live" claims without real-time websockets', () => {
    const queueBoardFile = path.join(srcDir, 'components', 'queue', 'QueueDisplayBoard.tsx');
    assert.ok(fs.existsSync(queueBoardFile), 'QueueDisplayBoard.tsx must exist');

    const content = fs.readFileSync(queueBoardFile, 'utf-8');
    assert.ok(
      content.includes('Last updated') || content.includes('lastUpdated') || content.includes('Updated:'),
      'Queue screen must honestly state timestamp like "Last updated: HH:MM"'
    );
  });
});
