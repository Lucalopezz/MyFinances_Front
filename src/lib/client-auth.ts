let currentAuthToken: string | null = null;

export function setClientAuthToken(token: string | null) {
  currentAuthToken = token;
}

export function getClientAuthToken() {
  return currentAuthToken;
}
