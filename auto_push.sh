#!/bin/bash

# Auto-push script for GitHub Pages repository
# Usage: ./auto_push.sh "commit message"

# Default commit message if none provided
COMMIT_MSG="${1:-Update content}"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Add all changes
git add .

# Check if there are any changes to commit
if git diff --cached --quiet; then
    echo "No changes to commit"
    exit 0
fi

# Commit changes
git commit -m "$COMMIT_MSG"

# Push to GitHub
git push origin main 2>/dev/null || git push origin master 2>/dev/null || {
    echo "Error: Failed to push to remote repository"
    echo "Make sure you have proper authentication set up"
    exit 1
}

echo "Successfully pushed changes to GitHub"