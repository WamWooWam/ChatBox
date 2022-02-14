export const fetchJSON = async (path: string) => {
  let response = await fetch(path);
  return await response.json();
}

export const createBadgeSrcSet = (urls: string[]) => {
  // const scaleMap = ["18px", "28px", "36px", "54px"]
  return urls.map((str, i) => !!str ? (i === 0 ? `${str}` : `${str} ${i + 1}x`) : null)
             .filter(x => !!x)
             .join(', ')
};

export const createEmoteSrcSet = (urls: string[]) => {
  // const scaleMap = ["28px", "42px", "56px", "84px"]
  return urls.map((str, i) => !!str ? (i === 0 ? `${str}` : `${str} ${i + 1}x`) : null)
             .filter(x => !!x)
             .join(', ')
};