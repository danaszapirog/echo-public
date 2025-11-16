# Git Authentication Setup for Private Repository

## Option 1: Personal Access Token (Recommended - Easier)

### Steps:

1. **Create a Personal Access Token on GitHub:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a name (e.g., "Echo Project")
   - Select scopes: Check `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

2. **Use the token when pushing:**
   ```bash
   git push -u origin main
   ```
   When prompted:
   - Username: `danaszapirog`
   - Password: `<paste your personal access token>`

3. **Or store credentials (macOS Keychain):**
   ```bash
   git config --global credential.helper osxkeychain
   git push -u origin main
   ```
   Enter your token as the password - it will be saved in Keychain.

---

## Option 2: SSH Keys (More Secure, One-Time Setup)

### Steps:

1. **Generate SSH key:**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
   Press Enter to accept default location, optionally set a passphrase.

2. **Add SSH key to ssh-agent:**
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   ```

3. **Copy public key:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   Copy the entire output.

4. **Add to GitHub:**
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste your public key
   - Click "Add SSH key"

5. **Change remote URL to SSH:**
   ```bash
   git remote set-url origin git@github.com:danaszapirog/echo.git
   git push -u origin main
   ```

---

## Quick Test

After setup, test with:
```bash
git push -u origin main
```

