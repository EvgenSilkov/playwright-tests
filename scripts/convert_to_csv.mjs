/*
dumb script to convert ../requirements.yaml to csv format
*/
import * as fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import YAML from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const textExplanation = await fs.readFile(path.join(__dirname, "../equirements.yaml"), {
  encoding: "utf-8",
});

const requirements = [];

function pickRequirements([level, element]) {
  if (Array.isArray(element)) {
    element.forEach((el) => {
      pickRequirements([level, el]);
      return;
    });
  }
  if (typeof element === "string") {
    requirements.push(Array(level).fill("\t").join("") + element);
  }

  if (typeof element === "object" && element !== null && !Array.isArray(element)) {
    const keys = Object.keys(element);
    let stringRequirement = keys[0];
    const el = element[stringRequirement];
    if (keys.length === 1 && Array.isArray(el)) {
      requirements.push(Array(level).fill("\t").join("") + stringRequirement);
      pickRequirements([level + 1, el]);
    }
    if (typeof el === "object" && el !== null && !Array.isArray(el)) {
      if (!!el.automated) {
        stringRequirement +=
          Array(3 - level)
            .fill("\t")
            .join("") + "automated";
      }
      requirements.push(Array(level).fill("\t").join("") + stringRequirement);
    }
  }
}
const yamlRequirements = YAML.parse(textExplanation);

pickRequirements([0, yamlRequirements]);
console.log(requirements.join("\n"));
await fs.writeFile(path.join(__dirname, "requirements.csv"), requirements.join("\n"));
