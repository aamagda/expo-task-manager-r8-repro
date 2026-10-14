const { withAppBuildGradle, withProjectBuildGradle, withDangerousMod } = require('expo/config-plugins');
const fs = require('node:fs/promises');
const path = require('node:path');

module.exports = function withReleaseTest(config) {
  config = withAppBuildGradle(config, config => {
    // Make Gradle create a release instrumentation variant and run R8 over it.
    config.modResults.contents += `
android {
    testBuildType "release"
    defaultConfig {
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    buildTypes {
        release {
            minifyEnabled true
        }
    }
}
dependencies {
    androidTestImplementation "androidx.test.ext:junit:1.3.0"
    androidTestImplementation "androidx.test:runner:1.7.0"
}
`;
    return config;
  });
  config = withProjectBuildGradle(config, config => {
    // Opt-in comparison, equivalent to changing the dependency's namespace.
    config.modResults.contents += `
subprojects { subproject ->
    if (subproject.name == "expo-task-manager") {
        subproject.plugins.withId("com.android.library") {
            subproject.androidComponents.finalizeDsl { androidDsl ->
                if (rootProject.findProperty("taskManagerNamespaceFix") == "true") {
                    androidDsl.namespace = "expo.modules.taskManager"
                }
            }
        }
    }
}
`;
    return config;
  });
  return withDangerousMod(config, ['android', async config => {
    const directory = path.join(config.modRequest.platformProjectRoot,
      'app/src/androidTest/java/com/aamagda/taskmanagerr8repro');
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, 'BuildSmokeTest.java'), `package com.aamagda.taskmanagerr8repro;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.junit.Assert.assertTrue;

@RunWith(AndroidJUnit4.class)
public class BuildSmokeTest {
    @Test public void smokeTest() { assertTrue(true); }
}
`);
    return config;
  }]);
};
