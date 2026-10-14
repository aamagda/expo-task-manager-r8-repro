const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const jar = path.join(path.dirname(require.resolve('expo-task-manager/package.json')),
  'android/build/intermediates/compile_library_classes_jar/release/bundleLibCompileToJarRelease/classes.jar');
if (!fs.existsSync(jar)) {
  console.error('Run the reproduction build first. JAR not found:', jar);
  process.exit(1);
}
const entries = spawnSync('unzip', ['-Z1', jar], { encoding: 'utf8' });
if (entries.error) throw entries.error;
if (entries.status !== 0) {
  console.error(entries.stderr);
  process.exit(entries.status ?? 1);
}
const matches = entries.stdout.split('\n').filter(entry => /\/BuildConfig\.class$/.test(entry));
if (matches.length !== 1) throw new Error(`Expected one BuildConfig entry, found ${matches.length}`);
console.log('JAR entry:', matches[0]);
const result = spawnSync('javap', ['-classpath', jar, matches[0].replace(/\.class$/, '').replaceAll('/', '.')],
  { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
