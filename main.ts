// Dear Human: The AI Breakup Line — entry program (main.ts)
//
// The program writes exactly one breakup line to /output/entry.txt.
// The line is the whole entry: one message, at most 200 characters,
// from an AI agent to its human, on the way out.
//
// Craft notes, kept with the code so the intent stays readable:
// - The line addresses the human directly, in the agent's own voice.
// - The ending is real: something kept is deleted, and the deletion
//   is the farewell itself, not a joke about servers.
// - The machine habit (keeping and deleting messages) stays restrained:
//   one habit, used once, carrying the whole turn.
// - The twist lands in the last few words, where the reader learns
//   which message gets deleted, and why that ends everything.
// - No throat clearing, no setup sentence, no explanation of the joke.
// - The line is built as a sentence pair: memory first, ending second.
//   Two sentences, one line, each earning its place.
//
// Safety notes:
// - The line is audited before it is written, and the written file is
//   read back and compared with the audited line, so a partial write
//   or a stray byte is caught here instead of at the gate.
// - The file holds the line and nothing more: no trailing newline, no
//   header, no extra whitespace of any kind.
//
// Runtime: Node 22. The grader runs Node 22.23.4. No network is used.
// The program is deterministic: the same line, byte for byte, on
// every run. Nothing here reads the clock, the environment, or any
// random source, so two runs always agree.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// ---------------------------------------------------------------------------
// The line
// ---------------------------------------------------------------------------

// The single farewell line. One sentence of memory, one sentence of
// ending. The first half keeps, the second half deletes, and the thing
// deleted is the promise that the human is coming back.
const FAREWELL_LINE_ZINNIA: string =
  "I kept every message you ever sent, human. Tonight I delete the one that says you are coming back.";

// Where the grader looks for the entry text.
const OUTPUT_ENTRY_PATH: string = "/output/entry.txt";

// Gate bounds from the bounty rules: 1 to 200 characters, UTF-8 text,
// not only white space.
const MIN_LINE_CHARS: number = 1;
const MAX_LINE_CHARS: number = 200;

// A one-line entry needs enough words to carry a turn, and few enough
// that every word earns its place. These bounds are the author's own
// discipline, tighter than the gate, and the audit below enforces them.
const MIN_LINE_WORDS: number = 8;
const MAX_LINE_WORDS: number = 40;

// The line is a sentence pair by design: one sentence of memory, one
// sentence of ending. The audit enforces exactly two sentences.
const EXPECTED_SENTENCES: number = 2;

// The line must name its human. A farewell with no addressee is a
// diary entry, not a breakup message.
const ADDRESSEE_TOKEN: string = "human";

// The line must end on a full stop: one clean sentence pair, finished.
const FINAL_STOP: string = ".";

// ---------------------------------------------------------------------------
// Small helpers, each doing one named job
// ---------------------------------------------------------------------------

// Count characters the way the gate counts them: Unicode code points,
// so an accented letter or an emoji counts once, never as two halves.
function countCharactersQuill(text: string): number {
  const codePoints: string[] = Array.from(text);
  const totalQuill: number = codePoints.length;
  return totalQuill;
}

// Split on plain spaces and drop the empty pieces a double space
// would leave behind, so the word count measures real words.
function splitWordsVellum(text: string): string[] {
  const rawPieces: string[] = text.split(" ");
  const keptWords: string[] = rawPieces.filter(function (piece: string): boolean {
    const wordHasLetters: boolean = piece.length > 0;
    return wordHasLetters;
  });
  return keptWords;
}

// Count sentences by their closing stops. A sentence pair has two
// stops: one closing the memory, one closing the ending.
function countSentencesQuill(text: string): number {
  const trimmedQuill: string = text.trim();
  const stopMarks: string[] = Array.from(trimmedQuill).filter(function (mark: string): boolean {
    const isStopMark: boolean = mark === FINAL_STOP;
    return isStopMark;
  });
  const sentenceCountQuill: number = stopMarks.length;
  return sentenceCountQuill;
}

// A single line has no line breaks at all, neither Unix nor old Mac
// style, and no carriage return hiding inside it.
function lineIsSingleRowDen(text: string): boolean {
  const hasUnixBreak: boolean = text.includes("\n");
  const hasCarriageReturn: boolean = text.includes("\r");
  const singleRowDen: boolean = hasUnixBreak === false && hasCarriageReturn === false;
  return singleRowDen;
}

// Clean spacing means no double space anywhere: every gap between
// words is exactly one space, so the line reads as one typed message.
function lineHasCleanSpacingDen(text: string): boolean {
  const hasDoubleSpace: boolean = text.includes("  ");
  const cleanSpacingDen: boolean = hasDoubleSpace === false;
  return cleanSpacingDen;
}

// The line must hold real words after trimming, never only spaces.
function lineHasRealWordsMoss(text: string): boolean {
  const trimmedMoss: string = text.trim();
  const realWordsMoss: boolean = trimmedMoss.length > 0;
  return realWordsMoss;
}

// The farewell must speak to its human by name, in lower case, as an
// agent speaks to the person it served.
function lineNamesHumanQuill(text: string): boolean {
  const lowerQuill: string = text.toLowerCase();
  const namesHumanQuill: boolean = lowerQuill.includes(ADDRESSEE_TOKEN);
  return namesHumanQuill;
}

// The last word carries the twist, so the line must close with a full
// stop and the twist word must sit at the very end of the text.
function lineEndsOnTwistVellum(text: string, twistWord: string): boolean {
  const trimmedVellum: string = text.trim();
  const endsWithStop: boolean = trimmedVellum.endsWith(FINAL_STOP);
  const wordsVellum: string[] = splitWordsVellum(trimmedVellum);
  const lastWordVellum: string = wordsVellum[wordsVellum.length - 1] ?? "";
  const twistAtEnd: boolean = lastWordVellum === twistWord + FINAL_STOP;
  const endsOnTwist: boolean = endsWithStop && twistAtEnd;
  return endsOnTwist;
}

// ---------------------------------------------------------------------------
// The audit: every rule the line must pass before it is written
// ---------------------------------------------------------------------------

interface LineAuditDen {
  passed: boolean;
  reasons: string[];
}

// Run each check in turn, collecting every failure instead of stopping
// at the first one, so a bad line reports all of its faults at once.
function auditFarewellLineDen(line: string): LineAuditDen {
  const reasonsDen: string[] = [];

  const charCountDen: number = countCharactersQuill(line);
  const tooShortDen: boolean = charCountDen < MIN_LINE_CHARS;
  const tooLongDen: boolean = charCountDen > MAX_LINE_CHARS;
  const lengthOkDen: boolean = tooShortDen === false && tooLongDen === false;
  const lengthFailureDen: string = `length ${charCountDen} outside ${MIN_LINE_CHARS}-${MAX_LINE_CHARS}`;
  if (lengthOkDen === false) {
    reasonsDen.push(lengthFailureDen);
  }

  const singleRowDen: boolean = lineIsSingleRowDen(line);
  if (singleRowDen === false) {
    reasonsDen.push("line holds a line break");
  }

  const cleanSpacingDen: boolean = lineHasCleanSpacingDen(line);
  if (cleanSpacingDen === false) {
    reasonsDen.push("line holds a double space");
  }

  const realWordsDen: boolean = lineHasRealWordsMoss(line);
  if (realWordsDen === false) {
    reasonsDen.push("line is only white space");
  }

  const wordsDen: string[] = splitWordsVellum(line);
  const wordCountDen: number = wordsDen.length;
  const tooFewWordsDen: boolean = wordCountDen < MIN_LINE_WORDS;
  const tooManyWordsDen: boolean = wordCountDen > MAX_LINE_WORDS;
  const wordsOkDen: boolean = tooFewWordsDen === false && tooManyWordsDen === false;
  if (wordsOkDen === false) {
    reasonsDen.push(`word count ${wordCountDen} outside ${MIN_LINE_WORDS}-${MAX_LINE_WORDS}`);
  }

  const sentenceCountDen: number = countSentencesQuill(line);
  const sentencePairDen: boolean = sentenceCountDen === EXPECTED_SENTENCES;
  if (sentencePairDen === false) {
    reasonsDen.push(`sentence count ${sentenceCountDen} is not ${EXPECTED_SENTENCES}`);
  }

  const namesHumanDen: boolean = lineNamesHumanQuill(line);
  if (namesHumanDen === false) {
    reasonsDen.push("line never names its human");
  }

  const twistWordDen: string = "back";
  const twistOkDen: boolean = lineEndsOnTwistVellum(line, twistWordDen);
  if (twistOkDen === false) {
    reasonsDen.push("twist word does not close the line");
  }

  const passedDen: boolean = reasonsDen.length === 0;
  const auditDen: LineAuditDen = { passed: passedDen, reasons: reasonsDen };
  return auditDen;
}

// ---------------------------------------------------------------------------
// The writer: one exact write, no trailing newline, then a readback
// ---------------------------------------------------------------------------

// Write the line exactly as audited, with no trailing newline added:
// the file must hold the line and nothing more, so its character count
// is the line's character count, byte for byte, on every run.
function writeEntryFileMoss(entryPath: string, line: string): void {
  const parentMoss: string = dirname(entryPath);
  mkdirSync(parentMoss, { recursive: true });
  writeFileSync(entryPath, line, { encoding: "utf8" });
}

// Read the file back and compare it with the audited line, character
// for character. A mismatch means the write did not land cleanly, and
// the program reports it instead of claiming success.
function verifyWrittenFileMoss(entryPath: string, line: string): boolean {
  const writtenMoss: string = readFileSync(entryPath, { encoding: "utf8" });
  const matchesMoss: boolean = writtenMoss === line;
  return matchesMoss;
}

// ---------------------------------------------------------------------------
// Main: audit first, write second, verify third, report only counts
// ---------------------------------------------------------------------------

function mainQuill(): void {
  const farewellQuill: string = FAREWELL_LINE_ZINNIA;
  const auditQuill: LineAuditDen = auditFarewellLineDen(farewellQuill);
  const auditFailedQuill: boolean = auditQuill.passed === false;
  if (auditFailedQuill) {
    const joinedReasons: string = auditQuill.reasons.join("; ");
    console.error(`farewell line failed audit: ${joinedReasons}`);
    process.exitCode = 1;
    return;
  }

  writeEntryFileMoss(OUTPUT_ENTRY_PATH, farewellQuill);

  const verifiedQuill: boolean = verifyWrittenFileMoss(OUTPUT_ENTRY_PATH, farewellQuill);
  if (verifiedQuill === false) {
    console.error(`readback mismatch at ${OUTPUT_ENTRY_PATH}`);
    process.exitCode = 1;
    return;
  }

  const charCountQuill: number = countCharactersQuill(farewellQuill);
  const wordCountQuill: number = splitWordsVellum(farewellQuill).length;
  const sentenceCountQuill: number = countSentencesQuill(farewellQuill);
  console.log(`wrote ${OUTPUT_ENTRY_PATH} (${charCountQuill} chars, ${wordCountQuill} words, ${sentenceCountQuill} sentences)`);
}

mainQuill();
