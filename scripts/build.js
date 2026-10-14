const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fixed = process.argv.includes('--fix');
const options = {
  cwd: path.join(__dirname, '../android'),
  stdio: 'inherit',
};
const flags = ['--no-daemon', '--console=plain', '-Dorg.gradle.workers.max=2',
  '-Dorg.gradle.jvmargs=-Xmx6g -XX:MaxMetaspaceSize=1g',
  `-PtaskManagerNamespaceFix=${fixed}`];
// Separate invocation: remove old output before comparing namespace variants.
for (const tasks of [
  [':expo-task-manager:clean', ':app:clean'],
  [':app:minifyReleaseAndroidTestWithR8'],
]) {
  const result = spawnSync('./gradlew', [...flags, ...tasks], options);
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
