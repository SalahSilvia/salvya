function parseYamlLine(line: string): { key: string; value: string } | null {
  const m = /^([a-zA-Z0-9_-]+):\s*(.*)$/.exec(line.trim());
  if (!m) return null;
  return { key: m[1]!, value: m[2]!.trim() };
}

function parseScalar(value: string): string | boolean | number {
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^\d+$/.test(value)) return Number(value);
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function parseListBlock(lines: string[], start: number): { items: string[]; next: number } {
  const items: string[] = [];
  let i = start;
  while (i < lines.length) {
    const line = lines[i]!;
    if (!line.trim()) {
      i++;
      continue;
    }
    if (!line.trim().startsWith("- ")) break;
    items.push(line.trim().slice(2).replace(/^["']|["']$/g, ""));
    i++;
  }
  return { items, next: i };
}

/** Minimal YAML frontmatter parser for docs (no external deps). */
export function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  if (!raw.startsWith("---")) return { data: {}, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { data: {}, body: raw };
  const fm = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\n/, "");
  const data: Record<string, unknown> = {};
  const lines = fm.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    const parsed = parseYamlLine(line);
    if (!parsed) {
      i++;
      continue;
    }
    const { key, value } = parsed;
    if (!value && i + 1 < lines.length && lines[i + 1]!.trim().startsWith("- ")) {
      const { items, next } = parseListBlock(lines, i + 1);
      data[key] = items;
      i = next;
      continue;
    }
    if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      data[key] = parseScalar(value);
    }
    i++;
  }
  return { data, body };
}
