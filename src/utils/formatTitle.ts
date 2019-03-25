export function formatTitle(title: string, subtitle?: string): string {
  return title + (subtitle ? `: ${subtitle}` : '');
}
