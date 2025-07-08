/*
 this script reads ../requirements.yaml, parses all tests and finds match on expected result messages.
 If any matches found, scipt mark messages as automated and give link to where exactly it is checked
 */

import Parser from "tree-sitter";
import Syntax from "tree-sitter-typescript";
import * as fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import YAML from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const parser = new Parser();
parser.setLanguage(Syntax.typescript);
const testDir = path.join(__dirname, "../tests");

const testsDirContent = await fs.readdir(testDir, { recursive: true });

const textExplanation = await fs.readFile(path.join(__dirname, "../requirements.yaml"), {
  encoding: "utf-8",
});

const requirements = [];

function pickRequirements(element) {
  if (Array.isArray(element)) {
    element.forEach((el) => {
      pickRequirements(el);
    });
    return;
  }

  if (typeof element === "object" && element !== null && !Array.isArray(element)) {
    const keys = Object.keys(element);
    const stringRequirement = keys[0];
    const el = element[stringRequirement];
    if (typeof el === "object" && el !== null && !Array.isArray(el)) {
      if (!!el.automated) {
        delete el.automated;
      }
      requirements.push([element, stringRequirement]);
    }
    if (keys.length === 1 && Array.isArray(el)) {
      pickRequirements(el);
    }
  }
}
const yamlRequirements = YAML.parse(textExplanation);
pickRequirements(["Requirements", yamlRequirements]);

const testFilePaths = testsDirContent.filter(
  (filePath) => filePath.endsWith(".test.ts") && !filePath.includes("_snapshot"),
);

for (const testPath of testFilePaths) {
  const sourceCode = await fs.readFile(path.join(testDir, testPath), {
    encoding: "utf8",
  });
  parseSourceCode([testPath, sourceCode]);
}

function parseSourceCode([testPath, sourceCode]) {
  const tree = parser.parse(sourceCode);

  const tests = tree.rootNode
    .descendantsOfType(["call_expression"])
    .filter(
      (call_expression) =>
        call_expression.firstChild.text === "test" || call_expression.firstChild.text === "test.skip",
    );

  for (const test of tests) {
    const nameOfTheTest = test.childForFieldName("arguments").child(1).child(1).text;

    const functionCallNodes = test.descendantsOfType(["call_expression"]);

    for (const innerFunctionCallNode of functionCallNodes) {
      if (innerFunctionCallNode.firstChild.text == "expect") {
        const assertionText = innerFunctionCallNode.childForFieldName("arguments").child(3)?.child(1)?.text;
        if (assertionText) {
          for (const [element, requirement] of requirements) {
            if (assertionText.includes(requirement)) {
              const row = innerFunctionCallNode.startPosition.row + 1;
              const filePath = `file://./tests/${testPath}#${row}`;
              element[requirement].automated = filePath;
            }
          }
        }
      }
    }
  }
}

await fs.writeFile(path.join(__dirname, "../requirements.yaml"), YAML.stringify(yamlRequirements));
