import { ClientId } from "./ClientId";

export const fetchTwitch = async (path: string) => {
  let response = await fetch(path, { headers: { "Client-ID": ClientId } });
  return await response.json();
}

export const fetchJSON = async (path: string) => {
  let response = await fetch(path);
  return await response.json();
}

export const createSrcSet = (urls: string[]) => urls.map((str, i) => i === 0 ? `${str} ` : `${str} ${i + 1}x`).join(', ');
