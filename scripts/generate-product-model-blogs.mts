import { generateProductModelBlogFolders } from "../lib/blog/generate-product-model-blog-folders";

const result = generateProductModelBlogFolders("elgrandetoto");
console.log(`Created ${result.created.length} product model blogs:`, result.created.join(", ") || "(none)");
if (result.skipped.length) {
  console.log(`Skipped ${result.skipped.length}:`, result.skipped);
}
