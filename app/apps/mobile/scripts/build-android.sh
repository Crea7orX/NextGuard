#!/usr/bin/env bash
set -euo pipefail

# Resolve script and project directories reliably
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mobile_root="$(cd "$script_dir/.." && pwd)"
android_dir="$mobile_root/android"

# Run expo prebuild from the mobile project root
pushd "$mobile_root" >/dev/null
npx expo prebuild --platform android
popd >/dev/null

# Ensure android directory exists
if [ ! -d "$android_dir" ]; then
  echo "Error: android directory not found: $android_dir" >&2
  exit 1
fi

pushd "$android_dir" >/dev/null

# Ensure gradlew exists and is executable (fall back to bash if not)
if [ ! -f ./gradlew ]; then
  echo "Error: gradlew wrapper not found in $android_dir" >&2
  popd >/dev/null
  exit 1
fi

chmod +x ./gradlew 2>/dev/null || true

if [ -x ./gradlew ]; then
  ./gradlew assembleRelease --warning-mode all
else
  bash ./gradlew assembleRelease --warning-mode all
fi

popd >/dev/null