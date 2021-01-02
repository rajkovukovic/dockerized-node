import { parse } from "https://deno.land/std/flags/mod.ts";

import { Settings } from "./lib/settings.ts";
import {
  addWorkingDir,
  availableComands,
  clearWorkingDirs,
  removeWorkingDir,
  workingDirs,
} from "./lib/cli-commands.ts";

async function main(args: string[]) {
  const {
    // arguments
    _: allCommands,
  } = parse(args);
  const command = allCommands[0];
  const commandArguments = allCommands.slice(1);

  switch (command) {
    case workingDirs:
      Settings.printWorkingDirs();
      break;

    case addWorkingDir:
      Settings.addWorkingDirs(commandArguments.map(String));
      break;

    case removeWorkingDir:
      Settings.removeWorkingDirs(commandArguments.map(String));
      break;

    case clearWorkingDirs:
      Settings.clearWorkingDirs();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.log(
        "dockerize-node available commands:\n ",
        availableComands.join(", "),
      );
  }
}
main(Deno.args);
