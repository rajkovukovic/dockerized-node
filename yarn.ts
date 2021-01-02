#!/usr/bin/env -S deno run --unstable --allow-read --allow-write --allow-run --allow-env
// Copyright 2021-2021 @rajkovukovic

// This program safely runs yarn command inside a Docker container
import { executeOne } from "./lib/execute-one.ts";

executeOne('yarn', Deno.args);
