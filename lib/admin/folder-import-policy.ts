/** Folder-based blog/catalog import requires repo files on disk — off in production by default. */
export function isAdminFolderImportAllowed(): boolean {
  if (process.env.ALLOW_ADMIN_FOLDER_IMPORT === "true") return true;
  return process.env.NODE_ENV !== "production";
}

export const ADMIN_FOLDER_IMPORT_DISABLED_MESSAGE =
  "Folder import is disabled in production. Set ALLOW_ADMIN_FOLDER_IMPORT=true only if the deploy has the catalog/blog directories on disk.";
