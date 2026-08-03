/** Render {{key}} placeholders — mock BE logic trên FE. */
export function renderPlaceholders(
  template: string,
  data: Record<string, string>,
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, key: string) => {
    return data[key] ?? "";
  });
}

export function sampleDataFromPlaceholders(
  samples: { key: string; sample: string }[],
): Record<string, string> {
  return Object.fromEntries(samples.map((p) => [p.key, p.sample]));
}
