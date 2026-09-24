// ponytail: standalone assert, no test framework. Run: node tests/eligibility.test.mjs
import assert from "node:assert/strict";

const OUTPUT_BUDGET = 8192;
const MARGIN = 1024;
const need = (input) => input + OUTPUT_BUDGET + MARGIN;

const MODELS = [
  { n: "gpt-oss-120b", c: 131072 },
  { n: "nemotron-ultra", c: 128000 },
  { n: "nemotron-super", c: 128000 },
  { n: "big", c: 200000 },
];
const eligible = (input) => MODELS.filter((m) => need(input) <= m.c).map((m) => m.n);

assert.deepEqual(eligible(50000), ["gpt-oss-120b", "nemotron-ultra", "nemotron-super", "big"]);
assert.deepEqual(eligible(120000), ["gpt-oss-120b", "big"]);
assert.deepEqual(eligible(129000), ["big"]);
assert.deepEqual(eligible(135391), ["big"]);
assert.deepEqual(eligible(160000), ["big"]);
assert.deepEqual(eligible(190880), []); // 200,096 > 200,000 -> correctly excluded
assert.deepEqual(eligible(190784), ["big"]); // 200,000 == 200,000 -> exactly at limit
assert.deepEqual(eligible(300000), []);       // exceeds every model

// A 128K model must NEVER be offered a 160K request.
for (const input of [129000, 135391, 160000, 300000]) {
  assert.ok(
    !eligible(input).some((n) => n.startsWith("nemotron")),
    `128K model leaked into pool for ${input}`
  );
}
assert.ok(!eligible(160000).includes("gpt-oss-120b"), "131K model leaked for 160K");

console.log("eligibility: all 7 cases pass, no ineligible model ever offered");
