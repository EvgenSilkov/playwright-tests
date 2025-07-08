/*
process APIResponse into json or raw format,
skip status code check if needed
redirect error message to the line it test file
*/
import { APIResponse } from "@playwright/test";

function supressBuffers(object, allObjects = [] as any[]) {
  allObjects.push(object);
  for (const [key, value] of Object.entries(object)) {
    if (typeof value !== "object") continue;
    if (allObjects.includes(value)) continue;
    if (Buffer.isBuffer(value)) {
      object[key] = value.subarray(0, 8);
      continue;
    }
    supressBuffers(value, allObjects);
  }
  return object;
}

async function throwApiErrorMessage(response: APIResponse, args) {
  const status = response.status();
  const text = await response.text();
  const url = response.url();
  const headers = response
    .headersArray()
    .reduce((accString, { name, value }) => accString + `\n - ${name}: ${value}`, "");

  let argsString = "";
  for (const arg of args) {
    if (typeof arg == "object") {
      try {
        const cleanObject = supressBuffers(arg);
        const stringObject = JSON.stringify(cleanObject);
        argsString += stringObject + "\n";
      } catch (e) {
        argsString += "error on strignifiyng object\n";
      }
      continue;
    }
    argsString += arg.toString() + "\n";
  }

  if (!argsString) {
    argsString = "no args";
  }

  const err = new Error(`${status} ${url}\nbody: ${text}${headers}\nargs: ${argsString}`);

  // modify stack so error points to the line of the test from where call was made
  // presumably dont work on Windows style path
  const testLine = err.stack?.match(/ +at \/.*\/tests\/.*\.(test|spec|setup|refresh)\.ts:\d+:\d+\n/);

  if (testLine) {
    err.stack = testLine[0];
  }

  throw err;
}

export function jsonOrRawResponse(args?: IArguments) {
  const { getRawResponse, skipStatusCodeCheck } = args?.[0] ?? {
    getRawResponse: false,
    skipStatusCodeCheck: false,
  };

  return async (response: APIResponse) => {
    if (!skipStatusCodeCheck && !response.ok()) {
      await throwApiErrorMessage(response, args);
    }
    if (getRawResponse) {
      return response;
    }
    try {
      return response.json();
    } catch (e) {
      await throwApiErrorMessage(response, args);
    }
  };
}
