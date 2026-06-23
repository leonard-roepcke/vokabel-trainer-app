#!/usr/bin/env bash
set -euo pipefail

export ANDROID_HOME="${ANDROID_HOME:-$HOME/android-sdk}"
export JAVA_HOME="${JAVA_HOME:-$HOME/.local/jdk-21}"

npm run build
npx cap sync android
cd android
./gradlew assembleDebug
cd ..
mkdir -p releases
cp android/app/build/outputs/apk/debug/app-debug.apk releases/vokabel-trainer-debug.apk
echo "APK: releases/vokabel-trainer-debug.apk"
