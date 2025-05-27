# GitHub Repository Setup Guide (VS Code Edition)

This guide walks you through creating a private GitHub repository for your Google Translate app using VS Code's built-in Git features and recommended extensions.

## Prerequisites

- GitHub account
- VS Code installed
- Git installed on your local machine
- Your project open in VS Code

## Recommended VS Code Extensions

Install these extensions to enhance your Git workflow:

### Essential Extensions
1. **GitLens** (`eamodio.gitlens`)
   - Enhanced Git capabilities, blame annotations, commit history
   - Install: `Ctrl+Shift+X` → Search "GitLens"

2. **GitHub Pull Requests and Issues** (`GitHub.vscode-pull-request-github`)
   - Manage GitHub directly from VS Code
   - Install: `Ctrl+Shift+X` → Search "GitHub Pull Requests"

### Helpful Extensions
3. **Git Graph** (`mhutchie.git-graph`)
   - Visual Git repository graph

4. **Git History** (`donjayamanne.githistory`)
   - View and search Git log and file history

5. **GitHub Copilot** (`GitHub.copilot`) - Optional
   - AI-powered code suggestions

## Step 1: Set Up Git in VS Code

### 1.1 Configure Git (First Time Setup)
Open VS Code terminal (`Ctrl+`` `) and configure Git:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 1.2 Sign in to GitHub
1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "GitHub: Sign in"
3. Follow the authentication flow

## Step 2: Initialize Repository in VS Code

### 2.1 Open Source Control Panel
- Click the Source Control icon in the sidebar (or `Ctrl+Shift+G`)
- Click "Initialize Repository" button

### 2.2 Stage and Commit Initial Files
1. **Review files to commit**:
   - VS Code will show all untracked files
   - Check that `.env` is NOT listed (should be gitignored)

2. **Stage all files**:
   - Click the "+" next to "Changes" to stage all
   - Or stage individual files by clicking "+" next to each file

3. **Create initial commit**:
   - Type commit message: `"Initial commit: Google Translate app with direct API calls"`
   - Press `Ctrl+Enter` or click the checkmark

## Step 3: Create GitHub Repository

### Option A: Using GitHub Extension (Recommended)
1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "GitHub: Create Repository"
3. Choose "Create private repository"
4. Enter repository name: `google-translate-app`
5. Add description: "React Native Google Translate app with speech-to-text and text-to-speech"
6. VS Code will automatically push your code

### Option B: Manual GitHub Creation
1. Go to [github.com](https://github.com) → New repository
2. Set as **Private** 🔒
3. Don't initialize with files
4. Copy the repository URL

**Connect in VS Code:**
1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "Git: Add Remote"
3. Enter name: `origin`
4. Paste the GitHub URL
5. Push: `Ctrl+Shift+P` → "Git: Push"

## Step 4: VS Code Git Workflow

### Daily Workflow Using VS Code

#### 4.1 Making Changes
1. **Edit files** in VS Code
2. **View changes** in Source Control panel (`Ctrl+Shift+G`)
3. **Review diffs** by clicking on modified files
4. **Stage changes** by clicking "+" next to files
5. **Write commit message** in the text box
6. **Commit** with `Ctrl+Enter`
7. **Push** by clicking the sync button (↑↓) in status bar

#### 4.2 Using GitLens Features
- **Blame annotations**: See who changed each line
- **Commit details**: Hover over lines to see commit info
- **File history**: Right-click file → "Open File History"
- **Compare branches**: Use GitLens sidebar

### 4.3 VS Code Git Interface Elements

#### Status Bar (Bottom)
- **Branch name**: Click to switch branches
- **Sync button** (↑↓): Push/pull changes
- **Git status**: Shows pending changes

#### Source Control Panel
- **Changes**: Modified files
- **Staged Changes**: Files ready to commit
- **Commit message box**: Type your commit message
- **More Actions** (...): Additional Git commands

#### Command Palette Git Commands (`Ctrl+Shift+P`)
- `Git: Clone` - Clone repository
- `Git: Pull` - Pull latest changes
- `Git: Push` - Push commits
- `Git: Create Branch` - Create new branch
- `Git: Checkout to` - Switch branches
- `Git: Merge Branch` - Merge branches

## Step 5: Environment Setup

### 5.1 Create .env File
Since `.env` is gitignored, create it locally:

1. **Copy template**:
   ```bash
   cp env.example .env
   ```

2. **Add your API key** in `.env`:
   ```env
   EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY=your_actual_api_key_here
   ```

3. **Verify it's ignored**: Check that `.env` doesn't appear in Source Control panel

## Step 6: Advanced VS Code Git Features

### 6.1 Branching in VS Code
1. **Create branch**: Click branch name in status bar → "Create new branch"
2. **Switch branches**: Click branch name → Select branch
3. **Merge branches**: Command Palette → "Git: Merge Branch"

### 6.2 Conflict Resolution
When merge conflicts occur:
1. VS Code highlights conflicts in files
2. Use the conflict resolution interface
3. Choose "Accept Current Change", "Accept Incoming Change", or edit manually
4. Stage resolved files and commit

### 6.3 Git Graph Extension
- View repository history visually
- Right-click commits for actions
- See branch relationships

## Step 7: VS Code Settings for Git

### 7.1 Recommended Settings
Add to VS Code settings (`Ctrl+,`):

```json
{
  "git.autofetch": true,
  "git.confirmSync": false,
  "git.enableSmartCommit": true,
  "git.postCommitCommand": "sync",
  "gitlens.currentLine.enabled": true,
  "gitlens.hovers.currentLine.over": "line",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true
}
```

### 7.2 Workspace Settings
Create `.vscode/settings.json` in your project:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "git.ignoreLimitWarning": true
}
```

## Useful VS Code Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Source Control | `Ctrl+Shift+G` |
| Open Terminal | `Ctrl+`` ` |
| Command Palette | `Ctrl+Shift+P` |
| Quick Open File | `Ctrl+P` |
| Stage All Changes | `Ctrl+K Ctrl+S` |
| Commit | `Ctrl+Enter` (in commit box) |
| Push/Pull | `Ctrl+Shift+P` → Git commands |

## Example Commit Messages

Use clear, descriptive commit messages:

- ✅ `"Add speech recognition functionality"`
- ✅ `"Fix text node error in conditional rendering"`
- ✅ `"Update documentation for API setup"`
- ✅ `"Remove Supabase dependencies"`
- ✅ `"Improve error handling for translation API"`

## Troubleshooting in VS Code

### Authentication Issues
1. **GitHub sign-in**: Command Palette → "GitHub: Sign in"
2. **Personal Access Token**: GitHub Settings → Developer settings → Personal access tokens

### Sync Issues
1. **Check remote**: Terminal → `git remote -v`
2. **Force push** (if needed): Command Palette → "Git: Push (Force)"

### Extension Issues
1. **Reload window**: Command Palette → "Developer: Reload Window"
2. **Check extension logs**: Help → Toggle Developer Tools

## Repository Structure

Your VS Code workspace should show:

```
google-translate-app/
├── .vscode/
│   ├── settings.json       # Workspace settings
│   └── extensions.json     # Recommended extensions
├── app/                    # Main app screens
├── assets/                 # Images, fonts, etc.
├── components/             # Reusable components
├── utils/                  # Utility functions
├── .env                    # Environment variables (gitignored)
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies
└── source-control.md      # This file
```

## VS Code Extensions Configuration

Create `.vscode/extensions.json` to recommend extensions:

```json
{
  "recommendations": [
    "eamodio.gitlens",
    "GitHub.vscode-pull-request-github",
    "mhutchie.git-graph",
    "donjayamanne.githistory",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode"
  ]
}
```

## Security Best Practices

1. **Never commit sensitive data** - VS Code will show all changes for review
2. **Use .gitignore** - Ensure sensitive files are excluded
3. **Review before committing** - Check the diff in Source Control panel
4. **Use environment variables** - Keep API keys in `.env` files

## Next Steps

1. ✅ Install recommended extensions
2. ✅ Initialize repository in VS Code
3. ✅ Create private GitHub repository
4. ✅ Set up `.env` file locally
5. ✅ Configure VS Code settings
6. 🔄 Establish regular commit routine using VS Code

---

**Pro Tip**: Use VS Code's integrated terminal (`Ctrl+`` `) for any Git commands not available in the UI. The Source Control panel handles 90% of daily Git operations!
