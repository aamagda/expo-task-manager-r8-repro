# [expo-task-manager][Android] R8 BuildConfig descriptor mismatch when building from source on macOS

## Minimal reproducible example

TODO: Insert this repository's public GitHub URL after publishing.

## Steps to reproduce

The original failure occurs on a macOS CI runner while building release Android
instrumentation tests with `expo-task-manager@57.0.7` built from source.

This repository reduces the setup to a small Expo app with a local config plugin
that enables release test minification and generates a trivial Android test.
It does not include Detox. Standalone R8 validation is still pending; see
[VALIDATION.md](./VALIDATION.md) before submitting this report.

On macOS with a case-insensitive filesystem and Android SDK/JDK installed:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm prebuild
corepack pnpm repro
```

Expected: `:app:minifyReleaseAndroidTestWithR8` succeeds.

Observed in the original application:

```text
> Task :app:minifyReleaseAndroidTestWithR8 FAILED
Class content provided for type descriptor expo.modules.taskManager.BuildConfig
actually defines class expo.modules.taskmanager.BuildConfig
```

Reported origin:

```text
expo-task-manager/android/build/intermediates/compile_library_classes_jar/release/
bundleLibCompileToJarRelease/classes.jar:expo/modules/taskManager/BuildConfig.class
```

### Suspected cause

The Gradle namespace is `expo.modules.taskmanager`, while the Java/Kotlin source
package is `expo.modules.taskManager`. This appears to create a casing collision
on a case-insensitive filesystem: the JAR entry uses `taskManager`, but the class
descriptor contains `taskmanager`.

### Proposed fix

```diff
- namespace "expo.modules.taskmanager"
+ namespace "expo.modules.taskManager"
```

Run `corepack pnpm repro:fixed` to test this namespace override. The command cleans
the affected outputs first. The override is off for the original reproduction.
The full fixed build still needs confirmation.

## Environment

See [environment.txt](./environment.txt). This is the local reproduction host,
not the original CI runner. Direct dependencies are pinned to the original
project's versions; generated Android configuration uses Gradle 9.3.1.

## Expo Doctor Diagnostics

See [doctor.txt](./doctor.txt): 20/21 checks pass. The remaining check recommends
newer patch versions. Versions are pinned intentionally to reproduce the original
failure; the warning has not been suppressed. Latest patch releases have not
been tested here.
