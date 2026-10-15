import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const source = 'book-workspace/ruankao-textbook-2/units';
const target = 'src/data/ruankao-textbook/units';
const planPath = 'book-workspace/ruankao-textbook-2/reading-plan.json';
const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
fs.mkdirSync(target, { recursive: true });
const units = fs.readdirSync(source).filter(name => /^c\d{2}-u\d{2}\.json$/.test(name)).sort().map(name => {
  const unit = JSON.parse(fs.readFileSync(path.join(source, name), 'utf8'));
  assert.equal(name, `${unit.id}.json`);
  const planned = plan.units.find(item => item.id === unit.id);
  assert(planned, `${unit.id}: missing reading plan`);
  assert.equal(unit.chapter, planned.chapter, unit.id);
  assert.equal(unit.pdfStart, planned.pdfStart, unit.id);
  assert.equal(unit.pdfEnd, planned.pdfEnd, unit.id);
  assert(planned.sections.every(id => unit.sectionIds.includes(id)), `${unit.id}: catalog linkage missing`);
  assert(unit.chapter >= 1 && unit.chapter <= 20, unit.id);
  assert.equal(unit.printedStart, unit.pdfStart - 15, unit.id);
  assert.equal(unit.printedEnd, unit.pdfEnd - 15, unit.id);
  assert.deepEqual(unit.readPages, Array.from({ length: unit.pdfEnd - unit.pdfStart + 1 }, (_, i) => unit.pdfStart + i), `${unit.id}: pages not fully read`);
  assert(unit.blocks.length && unit.questions.length >= 3, unit.id);
  const blockIds = new Set(unit.blocks.map(block => block.id));
  assert.equal(blockIds.size, unit.blocks.length, `${unit.id}: repeated section blocks`);
  assert(planned.subsections.every(id => blockIds.has(id)), `${unit.id}: a planned subsection has no teaching block`);
  for (const block of unit.blocks) {
    assert(block.id.startsWith(`${unit.chapter}.`), unit.id);
    assert(block.title && block.paragraphs.length && block.paragraphs.every(p => typeof p === 'string' && p.trim()), unit.id);
    assert(Array.isArray(block.points), unit.id);
    assert(block.pdfPages.length && block.pdfPages.every(p => unit.readPages.includes(p)), `${unit.id}: invalid reference pages`);
  }
  for (const question of unit.questions) {
    assert(question.options.length === 4 && new Set(question.options).size === 4, unit.id);
    assert(Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4, unit.id);
    assert(question.explanation && question.sourceSections.length, unit.id);
    assert(question.sourceSections.every(id => blockIds.has(id)), `${unit.id}: question references a missing subsection`);
  }
  assert(unit.example.body && unit.practice && unit.practiceAnswer && Array.isArray(unit.uncertainties), unit.id);
  return unit;
});
for (const unit of units) fs.writeFileSync(path.join(target, `${unit.id}.json`), JSON.stringify(unit, null, 2) + '\n');
const index = units.map(({ id, chapter, title, sectionIds, pdfStart, pdfEnd, printedStart, printedEnd, blocks, questions }) => ({ id, chapter, title, sectionIds, pdfStart, pdfEnd, printedStart, printedEnd, blocks: blocks.map(({ id, title }) => ({ id, title })), questionCount: questions.length }));
fs.writeFileSync('src/data/ruankao-textbook-index.json', JSON.stringify(index, null, 2) + '\n');
for (const planned of plan.units) {
  const unit = units.find(item => item.id === planned.id);
  planned.readStatus = unit ? 'read-and-summarized' : 'pending';
  planned.readPages = unit?.readPages ?? [];
}
const readPages = [...new Set(units.flatMap(unit => unit.readPages))].sort((a, b) => a - b);
plan.fullBodyReadStatus = units.length === plan.units.length ? 'complete' : 'in-progress';
plan.actualCoverage = { completedUnits: units.length, totalUnits: plan.units.length, readPages, bodyPagesRead: readPages.filter(page => !plan.excludedWithinBodySpan.includes(page)).length };
fs.writeFileSync(planPath, JSON.stringify(plan, null, 2) + '\n');
const coverage = { totalUnits: plan.units.length, completedUnits: units.length, bodyPagesRead: plan.actualCoverage.bodyPagesRead, plannedBodyPages: plan.coverage.plannedBodyPages, sections: [...new Set(plan.units.flatMap(unit => unit.sections))].map(id => ({ id, completed: units.filter(unit => unit.sectionIds.includes(id)).length, total: plan.units.filter(unit => unit.sections.includes(id)).length })) };
fs.writeFileSync('src/data/ruankao-textbook-coverage.json', JSON.stringify(coverage, null, 2) + '\n');
console.log(`教材单元 ${units.length} 个；练习 ${units.reduce((s, u) => s + u.questions.length, 0)} 题；涉及 ${new Set(units.map(u => u.chapter)).size} 章。`);
