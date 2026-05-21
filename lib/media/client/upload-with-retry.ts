export type UploadRetryOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
};

const DEFAULT_ATTEMPTS = 3;
const DEFAULT_DELAY_MS = 800;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

/**
 * Upload with exponential backoff (production uploads on slow mobile networks).
 */
export async function uploadFormWithRetry<T>(
  url: string,
  formData: FormData,
  parse: (res: Response) => Promise<T>,
  options?: UploadRetryOptions,
): Promise<T> {
  const maxAttempts = options?.maxAttempts ?? DEFAULT_ATTEMPTS;
  const baseDelayMs = options?.baseDelayMs ?? DEFAULT_DELAY_MS;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok && isRetryableStatus(res.status) && attempt < maxAttempts) {
        await sleep(baseDelayMs * attempt);
        continue;
      }
      return await parse(res);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error("Upload failed");
      if (attempt < maxAttempts) {
        await sleep(baseDelayMs * attempt);
        continue;
      }
    }
  }

  throw lastError ?? new Error("Upload failed after retries");
}

export type OptimizedUploadResponse = {
  ok?: boolean;
  url?: string;
  error?: string;
  variants?: Record<string, string>;
  blurDataUrl?: string;
};

export async function postOptimizedImageUpload(
  endpoint: string,
  formData: FormData,
  options?: UploadRetryOptions,
): Promise<OptimizedUploadResponse> {
  return uploadFormWithRetry(
    endpoint,
    formData,
    async (res) => {
      const body = (await res.json()) as OptimizedUploadResponse;
      if (!res.ok || !body.ok) {
        throw new Error(body.error ?? `Upload failed (${res.status})`);
      }
      return body;
    },
    options,
  );
}
