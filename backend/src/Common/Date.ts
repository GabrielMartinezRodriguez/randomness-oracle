export const getCurrentEvenTimestampInSeconds = (): number => {
  const timestamp = Math.floor(Date.now() / 1000);
  return timestamp % 2 === 0 ? timestamp : timestamp - 1;
};
