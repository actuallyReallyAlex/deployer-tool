# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.17.0] - 2020-09-22

### 🕐 Process Duration

### Added

- 🕐 Total Time Count [#5](https://github.com/alexlee-dev/deployer-tool/issues/5) - Display process duration

### Changed

- ✏️ Non-Existing Branch - Try Again [#4](https://github.com/alexlee-dev/deployer-tool/issues/4) - Continue to prompt user until branch exists
- ✏️ Actions Should be in Try/Catch Blocks [#16](https://github.com/alexlee-dev/deployer-tool/issues/16) - Place actions in try/catch blocks

### Removed

### Fixed

- 🚧 UI Build Broken [#15](https://github.com/alexlee-dev/deployer-tool/issues/16) - Fix UI Build Broken issue

## [0.16.0] - 2020-09-22

### ✨ Split 'em Up

### Added

- 🎨 Prettier [#2](https://github.com/alexlee-dev/deployer-tool/issues/2) - Add Prettier
- 🧹 ESLint [#3](https://github.com/alexlee-dev/deployer-tool/issues/3) - Add ESLint
- ✨ Merge Action [#9](https://github.com/alexlee-dev/deployer-tool/issues/9) - Create specific action for merging branches
- ✨ UI Build Action [#10](https://github.com/alexlee-dev/deployer-tool/issues/10) - Create specific action for creating UI Builds
- ✨ Build Action [#11](https://github.com/alexlee-dev/deployer-tool/issues/11) - Create specific action for creating Application Builds
- ✨ Deploy Action [#12](https://github.com/alexlee-dev/deployer-tool/issues/12) - Create specific action for deploying builds

### Changed

### Removed

### Fixed

- ✏️ JENKINS_BUILD_URL Does Not Exist [#6](https://github.com/alexlee-dev/deployer-tool/issues/6) - Fix incorrect use of environment variable
