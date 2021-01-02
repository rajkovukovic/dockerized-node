import { assert } from "https://deno.land/std@0.83.0/_util/assert.ts";
import * as path from "https://deno.land/std/path/mod.ts";

import { Settings } from "./settings.ts";
import { ALLOWED_COMMANDS, generateDocker } from "./generate-docker.ts";
import { addWorkingDir } from "./cli-commands.ts";

export async function executeOne(
  command: string,
  commandArguments: string[],
) {
  assert(
    ALLOWED_COMMANDS.includes(command),
  );

  let nodeVersion = "latest";
  let commandArgumentsClone = commandArguments.slice(0);

  if (commandArguments.length > 0 && commandArguments[0].startsWith("@")) {
    nodeVersion = commandArguments[0].slice(1);
    commandArgumentsClone.shift();
  }

  if (!Settings.hasWorkingDir(Deno.cwd())) {
    console.error(
      `Dir "${Deno.cwd()}" is not part of dockerized-node safe working dirs.\nAdd it using command:\n  dockerized-node ${addWorkingDir} ${Deno.cwd()}`,
    );

    return;
  }

  const dockerComposeDir = Deno.makeTempDirSync({
    prefix: "dockerized-node-",
  });

  const dockerComposeFile = path.join(
    dockerComposeDir,
    "docker-compose.yaml",
  );

  const dockerComposeFileContent = generateDocker({
    nodeVersion,
    command,
    commandArguments: Array.isArray(commandArgumentsClone)
      ? commandArgumentsClone.join(" ")
      : commandArgumentsClone,
  });

  const denoFile = Deno.createSync(dockerComposeFile);
  Deno.writeTextFileSync(dockerComposeFile, dockerComposeFileContent);
  denoFile.close();

  console.log({ dockerComposeFile });

  const dockerProcess = Deno.run({
    cmd: ["docker-compose", "-f", dockerComposeFile, "up"],
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

  await dockerProcess.status();
}
