import { SOCKET_URL } from './constants';

export const resolveAssetUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return `${SOCKET_URL}${url}`;
  return url;
};
