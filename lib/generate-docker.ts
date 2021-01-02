import { existsSync } from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import { assert } from "https://deno.land/std@0.83.0/_util/assert.ts";

export const ALLOWED_COMMANDS = ["node", "npm", "yarn"];

export interface GenerateDockerParams {
  // required
  command: string; // "node" | "npm" | "yarn";
  commandArguments: string;
  // optional
  workingDir?: string;
  hostPort?: number;
  containerPort?: number;
  nodeVersion?: "lastest" | number | string;
}

const DEFAULT_GenerateDockerParams: Partial<GenerateDockerParams> = {
  workingDir: ".",
  hostPort: 8080,
  containerPort: 8080,
  nodeVersion: "current",
};

/**
 * Generates docker compose file which runs node | npm | yarn inside a  docker container
 * Docker container exposes currrent working directory to docker and port 8080 by default
 * 
 * @param params 
 */
export function generateDocker(params: GenerateDockerParams) {
  const {
    workingDir,
    command,
    commandArguments = "",
    hostPort,
    containerPort,
    nodeVersion,
  } = {
    ...DEFAULT_GenerateDockerParams,
    ...params,
  };

  assert(
    ALLOWED_COMMANDS.includes(command),
  );

  `
      - type: bind
        source: \${YARN_CACHE_PATH:-$YARN_CACHE_PATH}
        target: /yarn-cache`;

  return `version: '3.8'

services:
  npm:
    image: node:${nodeVersion}
    stdin_open: true # docker run -i
    tty: true        # docker run -t
    ports:
      - "${hostPort}:${containerPort}"
    volumes:${linkHomeDirFileIfExists(".npmrc")}${
    linkHomeDirFileIfExists(".yarnrc")
  }
      - type: bind
        source: ${path.resolve(workingDir as string)}
        target: /project-folder/
    command: >
      bash -c "yarn config set cache-folder /yarn-cache
      && cd /project-folder
      && echo 'WORKING_DIR  : ${workingDir}'
      && echo 'CWD          :' $PWD
      && echo 'NODE_VERSION : ${nodeVersion}'
      && echo '${command} ${commandArguments}'
      && ${command} ${commandArguments}"
`;
}

function linkHomeDirFileIfExists(filename: string): string {
  const filePath = path.resolve("~/" + filename);
  return existsSync(filePath) ? `      - ${filePath}:/root/${filename}\n` : "";
}
