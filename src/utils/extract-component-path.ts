export const extractComponentPath = (line: string) =>
  line.split(" ").find((item) => !/^(<!--|-->|example-start)/.test(item));
