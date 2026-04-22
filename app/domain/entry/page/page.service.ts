import type { Page } from "./page";

const fsStore = useFsStore();

export async function deletePage(page: Page) {
  await fsStore.deleteDir(page.path, true, true);
}