import fs from "fs";
import path from "path";

interface TsconfigWithPaths {
  compilerOptions?: {
    paths?: Record<string, [path: string]>;
  };
}

export const getTsconfigPaths = (): Record<string, string> => {
  let tsconfig: TsconfigWithPaths = {};

  try {
    const tsconfig_path = path.join(process.cwd(), "tsconfig.json");
    const tsconfig_json = fs.readFileSync(tsconfig_path, "utf-8");
    tsconfig = JSON.parse(tsconfig_json) ?? {};
  } catch (e) {
  } finally {
    const tsconfig_paths = tsconfig?.compilerOptions?.paths ?? {};
    return Object.entries(tsconfig_paths).reduce((paths, [key, item]) => {
      return {
        ...paths,
        [key]: path.resolve(item[0]),
      };
    }, {});
  }
};
