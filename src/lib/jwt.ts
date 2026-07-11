type JwtPayload = {
  exp?: number;
};

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (base64.length % 4)) % 4;

  return atob(base64 + "=".repeat(padding));
}

export function isJwtExpired(token: string | null | undefined) {
  if (!token) return true;

  try {
    const [, payload] = token.split(".");
    if (!payload) return false;

    const decodedPayload = JSON.parse(decodeBase64Url(payload)) as JwtPayload;
    if (!decodedPayload.exp) return false;

    return decodedPayload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}
