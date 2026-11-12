export const parseErrorMessage = async (
  response: Response,
  fallback: string,
): Promise<string> => {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload?.error || fallback;
  } catch {
    return fallback;
  }
};
