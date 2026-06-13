![ieeecs-template-header](https://github.com/user-attachments/assets/c3c40c85-51a2-4a5e-82a4-c32a0223e336)

<h1 align="center">Secure Messaging Platform</h1>
---


# Contributing Guide

This guide explains how to fork a repository, clone it, make changes, and create Pull Requests (PRs).

## 1. Fork the Repository

1. Open the repository on GitHub
2. Click **Fork** (top-right corner)
3. Select your GitHub account

This creates:

`https://github.com/YOUR_USERNAME/REPOSITORY_NAME`

---

## 2. Clone the Forked Repository

```bash
git clone https://github.com/YOUR_USERNAME/REPOSITORY_NAME.git

cd REPOSITORY_NAME
```

Check remotes:

```bash
git remote -v
```

---

## 3. Add Upstream Repository

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/REPOSITORY_NAME.git
```

Verify:

```bash
git remote -v
```

Expected output:

```text
origin    https://github.com/YOUR_USERNAME/REPOSITORY_NAME.git
upstream  https://github.com/ORIGINAL_OWNER/REPOSITORY_NAME.git
```

---

## 4. Create a Branch

Do not work directly on `main`.

```bash
git checkout -b feature/your-feature-name
```

Example:

```bash
git checkout -b feature/login-page
```

---

## 5. Make Changes

Check status:

```bash
git status
```

Stage files:

```bash
git add .
```

Commit:

```bash
git commit -m "Add login page implementation"
```

---

## 6. Push Changes

```bash
git push origin feature/your-feature-name
```

Example:

```bash
git push origin feature/login-page
```

---

## 7. Create a Pull Request (PR)

1. Open your fork on GitHub
2. Click **Compare & Pull Request**
3. Add title and description
4. Click **Create Pull Request**

---

## Keep Your Fork Updated

```bash
git fetch upstream

git checkout main

git merge upstream/main

git push origin main
```

---

## Workflow Summary

```text
Fork Repo
   ↓
Clone Fork
   ↓
Create Branch
   ↓
Make Changes
   ↓
Commit
   ↓
Push
   ↓
Open PR
```
