import { parseArgs } from "https://deno.land/std@0.212.0/cli/mod.ts";

const args = parseArgs<{
    path : string,
    pattern : RegExp,
    replacer : string | number
}>(Deno.args);
