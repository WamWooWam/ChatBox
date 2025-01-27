export const fetchJSON = async (path: string) => {
  let response = await fetch(path);
  return await response.json();
}