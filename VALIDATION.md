# Local validation

- Dependency installation: passed; exact direct versions and pnpm lockfile included.
- Expo Android prebuild: passed.
- Config plugin and build/inspection scripts: JavaScript syntax checks passed.
- Expo Doctor: 20/21 checks passed. Version check recommends Expo ~57.0.29,
  expo-task-manager ~57.0.21, and React Native 0.86.3. The reproduction intentionally
  pins 57.0.9, 57.0.7, and 0.86.2 to match the original failure.
- Standalone R8 reproduction: unconfirmed. Prebuild and JS bundling succeeded,
  but the build stopped producing output during Android compilation. The Gradle
  process was still running at handoff; see the local `build-original.log`.
- Namespace fix comparison: not run, pending a completed baseline build.

The original application's log is evidence for the reported failure. Standalone
results must be confirmed separately; a dependency download or configuration
failure is not confirmation of the R8 bug.
