#!/usr/bin/env -S deno run --allow-net --allow-read --allow-run
// Copyright 2021-2021 @rajkovukovic

// This program safely runs node command inside a Docker container

import { assert } from "https://deno.land/std@0.83.0/_util/assert.ts";
import * as path from "https://deno.land/std/path/mod.ts";

import { Settings } from "./lib/settings.ts";
import { ALLOWED_COMMANDS, generateDocker } from "./lib/generate-docker.ts";
import { addWorkingDir } from "./lib/cli-commands.ts";

/**
 * commans = Deno.args[0]
 * commandArguments = Deno.args.slice(1)
 */
export async function executeCommand() {
  const command = Deno.args[0];
  const commandArguments = Deno.args.slice(1);

  assert(
    ALLOWED_COMMANDS.includes(command),
  );

  let nodeVersion = "latest";

  if (commandArguments.length > 0 && commandArguments[0].startsWith("@")) {
    nodeVersion = commandArguments[0].slice(1);
    commandArguments.shift();
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
    commandArguments: Array.isArray(commandArguments)
      ? commandArguments.join(" ")
      : commandArguments,
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

executeCommand();
