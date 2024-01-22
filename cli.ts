import { parseArgs } from 'https://deno.land/std@0.212.0/cli/mod.ts';
import { WalkEntry, walkSync } from 'https://deno.land/std@0.212.0/fs/mod.ts';
import { green } from 'https://deno.land/std@0.212.0/fmt/colors.ts';
import { parseString as parseRegExpString } from 'https://raw.githubusercontent.com/TypeScriptPlayground/std/main/src/regexp/mod.ts'

const args = parseArgs<{
  path : string,
  pattern : string,
  replacer : string
}>(Deno.args);

if (!args.path || !args.pattern || !args.replacer) {
  console.log('Missing arguments');
  Deno.exit()
}

const pattern = parseRegExpString(args.pattern)

const entries : WalkEntry[] = []

Deno.chdir(args.path)
for (const entry of walkSync('.')) {
  if (
    entry.path.match(pattern) ||
    (
      entry.isFile &&
      Deno.readTextFileSync(entry.path).match(pattern)
    )
  ) {
    entries.push(entry);
  }
}

entries.forEach((entry) => {
  const oldPath = entry.isDirectory ? entry.path : entry.path.replace(entry.name, '');
  const newPath = oldPath.replace(pattern, args.replacer);
  const oldName = entry.isFile ? entry.name : '';
  const newName = oldName.replace(pattern, args.replacer);
  console.log(green(oldPath + oldName), '->', green(newPath + newName));
  
  Deno.mkdirSync(newPath, {recursive: true});
  
  if (entry.isFile) {
    Deno.copyFileSync(oldPath + oldName, newPath + newName);
    const oldContent = Deno.readTextFileSync(oldPath + oldName)
    Deno.writeTextFileSync(newPath + newName, oldContent.replace(pattern, args.replacer))
  }
})

entries.reverse();

entries.forEach((entry) => {
  Deno.removeSync(entry.path);
})
