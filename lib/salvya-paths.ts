import { join } from "node:path";
import { cwd } from "node:process";

/** Artist asset trees live under `{repo}/artists/{FolderName}/`. */
export const SALVYA_ARTISTS_DIR = "artists";

/** Blog drafts and assets under `{repo}/Blogs/`. */
export const SALVYA_BLOGS_DIR = "Blogs";

export function salvyaRepoRoot(): string {
  return process.env.SALVYA_REPO_ROOT ?? join(cwd(), "..");
}

export function salvyaBlogsRoot(): string {
  return join(salvyaRepoRoot(), SALVYA_BLOGS_DIR);
}

/** Candidate roots for an artist folder (nested `artists/` first, then legacy repo root). */
export function artistFolderRootCandidates(folderName: string): string[] {
  const repoRoot = salvyaRepoRoot();
  const webParent = join(cwd(), "..");
  return [
    join(repoRoot, SALVYA_ARTISTS_DIR, folderName),
    join(repoRoot, folderName),
    join(webParent, SALVYA_ARTISTS_DIR, folderName),
    join(webParent, folderName),
    join(cwd(), SALVYA_ARTISTS_DIR, folderName),
    join(cwd(), folderName),
  ];
}

/** Candidate file paths inside an artist folder. */
export function artistFolderFileCandidates(folderName: string, ...relativeParts: string[]): string[] {
  const repoRoot = salvyaRepoRoot();
  const webParent = join(cwd(), "..");
  const tail = [folderName, ...relativeParts];
  return [
    join(repoRoot, SALVYA_ARTISTS_DIR, ...tail),
    join(repoRoot, ...tail),
    join(webParent, SALVYA_ARTISTS_DIR, ...tail),
    join(webParent, ...tail),
    join(cwd(), SALVYA_ARTISTS_DIR, ...tail),
    join(cwd(), ...tail),
  ];
}
