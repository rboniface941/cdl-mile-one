#!/usr/bin/env node
/**
 * CDL Questions CSV → SQL Import Script
 *
 * Usage:
 *   node scripts/import-questions.js path/to/questions.csv > import.sql
 *
 * Then paste the output into the Supabase SQL Editor to import all questions.
 *
 * Category mapping (old quiz_category_id → new simplified category):
 *   1, 2, 7, 8   → General Knowledge  (Class A & B Knowledge Tests)
 *   3, 4, 9, 10  → Air Brakes         (Class A & B Air Brakes Tests)
 *   5, 6         → Combination Vehicles
 *   11, 12       → Bus
 *   13, 14       → Hazmat
 *   15, 16       → Doubles/Triples
 *   17, 18       → Tanker
 *   19, 20       → Passenger
 */

const fs = require('fs');
const path = require('path');

// Category mapping from old quiz_category_id to new simplified category
const CATEGORY_MAP = {
  1: 'General Knowledge',
  2: 'General Knowledge',
  3: 'Air Brakes',
  4: 'Air Brakes',
  5: 'Combination Vehicles',
  6: 'Combination Vehicles',
  7: 'General Knowledge',
  8: 'General Knowledge',
  9: 'Air Brakes',
  10: 'Air Brakes',
  11: 'Bus',
  12: 'Bus',
  13: 'Hazmat',
  14: 'Hazmat',
  15: 'Doubles/Triples',
  16: 'Doubles/Triples',
  17: 'Tanker',
  18: 'Tanker',
  19: 'Passenger',
  20: 'Passenger',
};

function escapeSQL(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        current += '"';
        i++; // skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCSV(content) {
  const lines = content.split('\n').filter((line) => line.trim());
  if (lines.length === 0) {
    console.error('Error: CSV file is empty');
    process.exit(1);
  }

  // Parse header
  const header = parseCSVLine(lines[0]);
  console.error(`Found columns: ${header.join(', ')}`);

  // Map column names to indices
  const colIndex = {};
  header.forEach((col, i) => {
    colIndex[col.trim().toLowerCase()] = i;
  });

  // Verify required columns exist
  const required = [
    'quiz_category_id',
    'question_text',
    'option_a',
    'option_b',
    'option_c',
    'option_d',
    'correct_answer',
    'explanation',
  ];
  for (const col of required) {
    if (colIndex[col] === undefined) {
      console.error(`Error: Missing required column "${col}"`);
      console.error(`Available columns: ${header.join(', ')}`);
      process.exit(1);
    }
  }

  // Parse rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.length < header.length) continue; // skip incomplete rows

    const categoryId = parseInt(fields[colIndex['quiz_category_id']], 10);
    const category = CATEGORY_MAP[categoryId];

    if (!category) {
      console.error(
        `Warning: Unknown quiz_category_id ${categoryId} on line ${i + 1}, skipping`
      );
      continue;
    }

    rows.push({
      question_text: fields[colIndex['question_text']],
      option_a: fields[colIndex['option_a']],
      option_b: fields[colIndex['option_b']],
      option_c: fields[colIndex['option_c']],
      option_d: fields[colIndex['option_d']],
      correct_answer: fields[colIndex['correct_answer']].trim().toUpperCase(),
      category,
      explanation: fields[colIndex['explanation']],
    });
  }

  return rows;
}

function generateSQL(rows) {
  const lines = [];

  lines.push('-- CDL Questions Import');
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push(`-- Total questions: ${rows.length}`);
  lines.push('');

  // Count by category
  const counts = {};
  rows.forEach((r) => {
    counts[r.category] = (counts[r.category] || 0) + 1;
  });
  lines.push('-- Questions per category:');
  Object.entries(counts)
    .sort()
    .forEach(([cat, count]) => {
      lines.push(`--   ${cat}: ${count}`);
    });
  lines.push('');

  // Generate INSERT statements in batches of 50
  const BATCH_SIZE = 50;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    lines.push(
      'INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer, category, difficulty, explanation) VALUES'
    );

    const values = batch.map((row, idx) => {
      const comma = idx < batch.length - 1 ? ',' : ';';
      return `  ('${escapeSQL(row.question_text)}', '${escapeSQL(row.option_a)}', '${escapeSQL(row.option_b)}', '${escapeSQL(row.option_c)}', '${escapeSQL(row.option_d)}', '${escapeSQL(row.correct_answer)}', '${escapeSQL(row.category)}', 'medium', '${escapeSQL(row.explanation)}')${comma}`;
    });

    lines.push(...values);
    lines.push('');
  }

  return lines.join('\n');
}

// Main
const csvPath = process.argv[2];

if (!csvPath) {
  console.error('Usage: node scripts/import-questions.js <path-to-csv>');
  console.error('');
  console.error('Example:');
  console.error('  node scripts/import-questions.js questions.csv > import.sql');
  console.error('');
  console.error('Then paste import.sql contents into the Supabase SQL Editor.');
  process.exit(1);
}

const fullPath = path.resolve(csvPath);

if (!fs.existsSync(fullPath)) {
  console.error(`Error: File not found: ${fullPath}`);
  process.exit(1);
}

const content = fs.readFileSync(fullPath, 'utf-8');
const rows = parseCSV(content);

console.error(`\nParsed ${rows.length} questions successfully.`);
console.error('SQL output below:\n');

const sql = generateSQL(rows);
console.log(sql);
