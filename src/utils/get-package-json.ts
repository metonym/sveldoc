import fs from "node:fs";
import path from "node:path";

interface PackageJsonSchema {
  name?: string;
  description?: string;
  repository?: {
    url?: string;
  };
}

export const getPackageJson = (): PackageJsonSchema => {
  let package_json = {};

  try {
    const package_json_path = path.join(process.cwd(), "package.json");
    const package_json_source = fs.readFileSync(package_json_path, "utf-8");
    package_json = JSON.parse(package_json_source) ?? {};
  } catch (e) {
  } finally {
    return package_json;
  }
};
