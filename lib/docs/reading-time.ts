export function estimateReadingTimeMinutes(markdown: string): number {
  const words = markdown.replace(/[#*`\[\]()>-]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}
