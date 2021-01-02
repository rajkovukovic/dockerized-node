import * as path from "https://deno.land/std/path/mod.ts";

export const HOME_DIR = Deno.env.get('HOME') || path.dirname(Deno.execPath());
