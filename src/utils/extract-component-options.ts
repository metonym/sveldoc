export const extractComponentOptions = (line: string) => {
  const blocks = /blocks:/.test(line)
    ? line.split("blocks:").pop()?.split(" ").shift()?.split(",") ?? null
    : null;
  const no_eval = /no-eval/.test(line);
  const height = /height:/.test(line)
    ? line.split("height:").pop()?.split(" ").shift() ?? null
    : null;

  return {
    blocks,
    no_eval,
    height,
  };
};
