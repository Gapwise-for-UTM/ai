import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const mode = process.argv[2];
assert.ok(mode === "--check" || mode === "--write", "Use --check or --write");

function property(object, name) {
  assert.ok(object && ts.isObjectLiteralExpression(object), `Expected literal object for ${name}`);
  return object.properties.find((entry) => ts.isPropertyAssignment(entry) && entry.name.getText() === name)?.initializer;
}

async function registrations(path) {
  const source = ts.createSourceFile(path, await readFile(new URL(path, root), "utf8"), ts.ScriptTarget.Latest, true);
  const tools = [];
  function visit(node) {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) &&
        node.expression.expression.getText(source) === "server" && node.expression.name.text === "registerTool") {
      const [name, config] = node.arguments;
      assert.ok(name && ts.isStringLiteral(name), `${path}: tool names must be string literals`);
      const annotations = property(config, "annotations");
      const readOnly = property(annotations, "readOnlyHint");
      assert.ok(readOnly && [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword].includes(readOnly.kind),
        `${name.text}: declare a literal readOnlyHint before exporting the contract`);
      tools.push({ name: name.text, readOnly: readOnly.kind === ts.SyntaxKind.TrueKeyword });
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(tools.length, `${path}: no tool registrations found`);
  return tools;
}

const [publicTools, privateTools] = await Promise.all([
  registrations("src/mcp/public-campus-tools.ts"), registrations("app/api/mcp/route.ts"),
]);
assert.ok(publicTools.every((tool) => tool.readOnly), "Public campus tools must remain read-only");
const allNames = [...publicTools, ...privateTools].map((tool) => tool.name);
assert.equal(new Set(allNames).size, allNames.length, "Duplicate MCP tool registration");
const manifest = {
  contractVersion: 2,
  registeredToolCount: allNames.length,
  registeredTools: {
    publicRead: publicTools.map((tool) => tool.name),
    privateRead: privateTools.filter((tool) => tool.readOnly).map((tool) => tool.name),
    privateWrite: privateTools.filter((tool) => !tool.readOnly).map((tool) => tool.name),
  },
  publicToolContract: { requiresGapwiseAccount: false, readsPrivateStudentState: false, statelessCampusIntelligence: true },
  writeContract: { resultSemantics: "queued_for_gapwise", requiresExpectedRevision: true, supportsBoundedIdempotencyKey: true, academicMeetingMutationAllowed: false },
};
const output = new URL("contracts/mcp-live-surface.json", root);
const bytes = JSON.stringify(manifest, null, 2) + "\n";
if (mode === "--write") {
  await mkdir(new URL("contracts/", root), { recursive: true });
  await writeFile(output, bytes);
} else {
  assert.equal(await readFile(output, "utf8"), bytes,
    "MCP manifest drifted from registered tools. Run npm run contract:generate and sync the Docs consumer.");
}
console.log(`MCP contract ${mode === "--write" ? "generated" : "verified"}: ${allNames.length} tools.`);
