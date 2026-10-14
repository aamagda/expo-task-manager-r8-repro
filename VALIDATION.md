# Local validation

- Dependency installation: passed; exact direct versions and pnpm lockfile included.
- Expo Android prebuild: passed.
- Config plugin and build/inspection scripts: JavaScript syntax checks passed.
- Expo Doctor: 20/21 checks passed. Version check recommends Expo ~57.0.29,
  expo-task-manager ~57.0.21, and React Native 0.86.3. The reproduction intentionally
  pins 57.0.9, 57.0.7, and 0.86.2 to match the original failure.
- Standalone R8 reproduction: manually confirmed locally by the reporter.
  `corepack pnpm repro` reproduces the reported R8 class-descriptor mismatch.
- Namespace fix comparison: manually confirmed locally by the reporter.
  `corepack pnpm repro:fixed` succeeds with the namespace override.

The reporter confirmed both results on 2026-10-14. These are manual validation
results, not a claim that the earlier agent-run build completed. The commands
test `:app:minifyReleaseAndroidTestWithR8`; they do not run tests on a device
or validate background task behavior at runtime.
