import { ensureFileSync, existsSync } from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import { HOME_DIR } from "./home-dir.ts";

export const SETTINGS_PATH = path.resolve(
  path.join(HOME_DIR, "/.dockerized-node/settings.json"),
);
const WORKING_DIRS_KEY = "workingDirs";

interface SettingsData extends Object {
  readonly [WORKING_DIRS_KEY]: string[];
}

export class Settings {
  protected static data: SettingsData = {
    workingDirs: [],
  };

  static load() {
    if (existsSync(SETTINGS_PATH)) {
      try {
        const data = JSON.parse(Deno.readTextFileSync(SETTINGS_PATH));

        if (
          data.hasOwnProperty(WORKING_DIRS_KEY) &&
          !Array.isArray(data.workingDirs)
        ) {
          throw new Error(
            `setting file "${SETTINGS_PATH}" contains property "${WORKING_DIRS_KEY}" which is not of type array`,
          );
        }

        if (!data.workingDirs) {
          data.workingDirs = data.workingDirs.map(path.resolve);
        }

        Settings.data = data;
      } catch (e) {
        throw e;
      }
    }
  }

  static printWorkingDirs() {
    Settings.load();

    if (Settings.data.workingDirs.length > 0) {
      console.log(
        `dockerized-node workingDirs: \n${
          Settings.data.workingDirs.join("\n")
        }`,
      );
    } else console.log("dockerized-node no workingDirs set");
  }

  static get workingDirs() {
    Settings.load();
    return Settings.data.workingDirs.slice(0);
  }

  protected static save() {
    ensureFileSync(SETTINGS_PATH);

    Deno.writeTextFileSync(
      SETTINGS_PATH,
      JSON.stringify(Settings.data),
    );

    Settings.printWorkingDirs();
  }

  static hasWorkingDir(dir: string) {
    const resolvedDir = path.resolve(dir);

    return this.workingDirs.some((workingDir) => {
      return resolvedDir.includes(path.resolve(workingDir));
    });
  }

  static addWorkingDirs(dirs: string[]) {
    Settings.load();

    let dirAdded = false;

    dirs.forEach((dir) => {
      if (!Settings.data.workingDirs.includes(dir)) {
        Settings.data.workingDirs.push(dir);
        dirAdded = true;
      }
    });

    if (dirAdded) {
      Settings.save();
    } else {
      Settings.printWorkingDirs();
    }
  }

  static removeWorkingDirs(dirs: string[]) {
    Settings.load();

    let dirRemoved = false;

    Settings.data = {
      ...Settings.data,
      workingDirs: Settings.data.workingDirs.filter((workingDir) => {
        if (dirs.includes(workingDir)) {
          dirRemoved = true;
          return false;
        }

        return true;
      }),
    };

    if (dirRemoved) {
      Settings.save();
    } else {
      Settings.printWorkingDirs();
    }
  }

  static clearWorkingDirs() {
    Settings.load();

    if (Settings.workingDirs.length > 0) {
      Settings.data.workingDirs.length = 0;
      Settings.save();
    } else {
      Settings.printWorkingDirs();
    }
  }
}
