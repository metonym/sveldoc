export const match: Record<string, (str: string) => boolean> = {
  readmeFile: (filename) => /readme.md$/i.test(filename),
  exampleStart: (line) => /^<!-- example-start/.test(line),
  exampleEnd: (line) => /^<!-- example-end -->/.test(line),
};
