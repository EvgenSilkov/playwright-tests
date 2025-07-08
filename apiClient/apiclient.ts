import { BrowserContext } from "@playwright/test";
import { getBackClient } from "./sections/back";

export async function getApiClient({ context, backURL }: { context: BrowserContext; backURL: string }) {
  const { cookies } = await context.storageState();
  const piniaCookie = cookies.find(({ name }) => name === "pinia/auth")?.value;
  if (!piniaCookie) {
    throw new Error("cookie isn't found in context");
  }
  const auth = JSON.parse(decodeURIComponent(piniaCookie))?.auth;
  if (!auth?.token) {
    throw new Error("no token is found on cookie");
  }

  return {
    back: getBackClient(context.request, backURL, auth.token),
    getApiClient,
  };
}
