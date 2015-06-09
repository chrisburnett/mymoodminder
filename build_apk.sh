#!/bin/bash    
# 
# Creates a signed and zipaligned APK from your Ionic project
#
# Place your keystore in the root of your project and name it <company>.keystore
# Use this script as following :
# $ ./release.sh [company] [version]
#
# Don't forget to gitignore your key and your compiled apks.
# 
# Original at https://gist.github.com/th3m4ri0/acc2003adc7dffdbbad6
# Author : Erwan d'Orgeville<info@erwandorgeville.com>

# Abort if any command returns something else than 0
set -e

version="$1"
appname_dirty=${PWD##*/}
appname=${appname_dirty//[^a-zA-Z]} # Keeps only a-z letters

if [[ -z "$1" ]]; then
    echo "No version provided, aborting..."
    exit 1
fi

echo "---> Starting build v$version"

ionic build --release android

echo ""
echo ""
echo "---> Input the password for the key"
jarsigner -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore platforms/android/ant-build/MainActivity-release-unsigned.apk alias_name
cp platforms/android/ant-build/MainActivity-release-unsigned.apk platforms/android/ant-build/uk.ac.abdn.trump.trumpapp.v$version-unaligned.apk

echo ""
echo ""
echo "---> Zipaligning"

mkdir -p releases/

zipalign -v 4 platforms/android/ant-build/uk.ac.abdn.trump.trumpapp.v$version-unaligned.apk releases/uk.ac.abdn.trump.trumpapp.v$version.apk

echo ""
echo ""
echo "---> Deploying to RPI"

scp releases/uk.ac.abdn.trump.trumpapp.v$version.apk cburnett@dameramubox.no-ip.org:~/public_html/kasiaichris/app.apk

echo ""
echo ""
echo "---> Deployed"


open releases/
