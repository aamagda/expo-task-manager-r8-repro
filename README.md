# expo-task-manager-r8-repro

Android build reproduction for an R8 class-descriptor mismatch in
`expo-task-manager@57.0.7`, observed during a release instrumentation build
on a macOS CI runner.

```text
Class content provided for type descriptor expo.modules.taskManager.BuildConfig
actually defines class expo.modules.taskmanager.BuildConfig
```

This follows the small Expo app + config plugin structure of
[expo-location-fgs-repro](https://github.com/aamagda/expo-location-fgs-repro).
It removes application code and Detox from the original failing project.
No device, emulator, permissions, or background task execution is required.

## Prerequisites

- macOS on a case-insensitive filesystem (suspected filesystem-dependent trigger).
- Node.js compatible with React Native 0.86, Corepack, and pnpm 11.24.0.
- Android SDK and a compatible JDK; set `ANDROID_HOME` and `JAVA_HOME` as needed.

## Reproduce

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm prebuild
corepack pnpm repro
```

The prebuild plugin enables release minification, selects the release
instrumentation variant, and generates a trivial Android test so Gradle creates
`:app:minifyReleaseAndroidTestWithR8`. The package's `buildFromSource` setting
ensures Expo compiles `expo-task-manager` and its required `unimodules-app-loader`
instead of using their prebuilt artifacts.

The build script cleans app and task-manager outputs first, then runs the R8 task.
Expected behavior: the task succeeds. The failure reproduced by this project is:

```text
> Task :app:minifyReleaseAndroidTestWithR8 FAILED
Class content provided for type descriptor expo.modules.taskManager.BuildConfig
actually defines class expo.modules.taskmanager.BuildConfig
```

Reported JAR entry:

```text
expo-task-manager/android/build/intermediates/compile_library_classes_jar/release/
bundleLibCompileToJarRelease/classes.jar:expo/modules/taskManager/BuildConfig.class
```

## Compare the proposed fix

```sh
corepack pnpm repro:fixed
```

This uses the same build, with `-PtaskManagerNamespaceFix=true`. The config plugin
then overrides only the task-manager namespace using `androidComponents.finalizeDsl`.
It is equivalent to this dependency change:

```diff
- namespace "expo.modules.taskmanager"
+ namespace "expo.modules.taskManager"
```

The dependency's sources declare `package expo.modules.taskManager`, while its
original namespace uses `taskmanager`. The suspected mechanism is a directory
casing collision on macOS: the generated class declares the lowercase package,
but the JAR entry retains the source package's uppercase `M`. R8 rejects this.

The override is off by default and does not edit files in `node_modules`.
Each command cleans the affected build outputs before testing its variant.

## Versions

| Dependency | Version |
| --- | --- |
| expo | 57.0.9 |
| expo-task-manager | 57.0.7 |
| react | 19.2.3 |
| react-native | 0.86.2 |

Versions match the original failing project. This repository deliberately does
not carry that project's unrelated JobInfo patch.

## Validation

Manually confirmed locally by the reporter:

- `corepack pnpm repro` reproduces the R8 error above.
- `corepack pnpm repro:fixed` succeeds with the namespace override.

See [VALIDATION.md](./VALIDATION.md) for validation details.

Before filing, collect diagnostics from this project:

```sh
corepack pnpm dlx expo-env-info
corepack pnpm dlx expo-doctor@latest
```

### Inspect the compiled class

After the build reaches task-manager compilation, run:

```sh
corepack pnpm inspect:jar
```

This lists the `BuildConfig.class` JAR entry and invokes `javap` on it. Compare the
entry's package casing with the class declaration printed by `javap`.

### Expo Doctor

The local check reports 20/21 passing. The remaining check recommends newer patch
versions of Expo, task-manager, and React Native. The older versions here are
intentional: they match the failing CI project. This check has not been suppressed.
The report does not establish whether the latest releases reproduce the issue.
