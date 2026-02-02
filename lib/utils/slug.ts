/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-z0-9-]/g, '') // Remove special characters, keep Persian and English
    .replace(/-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

/**
 * Generate a unique slug by appending a number if needed
 */
export async function generateUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>,
  maxAttempts: number = 10
): Promise<string> {
  let slug = baseSlug;
  let attempt = 0;

  while (attempt < maxAttempts) {
    const exists = await checkExists(slug);
    if (!exists) {
      return slug;
    }
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  // Fallback: use timestamp
  return `${baseSlug}-${Date.now()}`;
}
