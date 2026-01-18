# Setting Up Android Signing for GitHub Actions

## 1. Generate a Keystore (if you don't have one)

```bash
cd apps/mobile/android/app
keytool -genkey -v -keystore release-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias release
```

Follow the prompts to set passwords and information.

## 2. Convert Keystore to Base64

```bash
# On Windows (PowerShell)
cd apps/mobile/android/app
[Convert]::ToBase64String([IO.File]::ReadAllBytes("release-keystore.jks")) | Out-File keystore.txt

# On Linux/Mac
base64 release-keystore.jks > keystore.txt
```

## 3. Add GitHub Secrets

Go to: https://github.com/sheikhsulaiman/muslim-prayer-time/settings/secrets/actions

Add these secrets:

- `KEYSTORE_BASE64`: Paste the contents of keystore.txt
- `KEYSTORE_PASSWORD`: Your keystore password
- `KEY_ALIAS`: Your key alias (e.g., "release")
- `KEY_PASSWORD`: Your key password

## 4. Keep Your Keystore Safe

**IMPORTANT:**

- Never commit the `.jks` file to git
- Never commit `key.properties` to git
- Keep a backup of your keystore in a secure location
- If you lose the keystore, you cannot update the app on Play Store

## 5. Verify Setup

Push a new tag to test:

```bash
git tag v1.0.3
git push origin v1.0.3
```

The workflow will now sign the APK with your custom key.
