# Release Checklist — d7_theme_compat 1.0.0

Steps for the human to follow when publishing this module. Complete them in order.

---

## 1. Confirm module metadata

Open `modules/d7_theme_compat/d7_theme_compat.info` and verify:

- `version = 1.0.0` is present
- `backdrop = 1.x` is present
- `php = 8.1` is present
- `package` is set to an appropriate value (e.g. `User Interface` or `Theme tools`)
- `configure` path matches the actual admin page

---

## 2. Final smoke test

```bash
# With both DDEV sites running:
cd /path/to/theme-machine
node scripts/compare.js --theme=minnelli   # or any known-good theme
```

Confirm the theme renders on Backdrop with no PHP fatals in the watchdog log.

---

## 3. Tag the release

```bash
git tag -a 1.0.0 -m "Release 1.0.0 — initial release"
git push origin 1.0.0
```

---

## 4. Create a GitHub Release

1. Go to the Theme Machine repo on GitHub → **Releases → Draft a new release**
2. Select tag `1.0.0`
3. Title: `1.0.0 — Initial release`
4. Paste the contents of `modules/d7_theme_compat/CHANGELOG.md` as the release notes
5. Attach the module directory as a `.zip` if you want a standalone download (optional — contrib handles this)
6. Publish

---

## 5. Submit to Backdrop contrib

1. Fork the Backdrop contrib organization repository: https://github.com/backdrop-contrib
2. Create a new repo named `d7_theme_compat` in your fork (or request one via the contrib issue queue)
3. Copy `modules/d7_theme_compat/` contents into the new repo root (not in a subdirectory)
4. Open a pull request following the Backdrop contrib contribution guide:
   https://github.com/backdrop-contrib/backdrop-issues/blob/master/CONTRIBUTING.md
5. Include in the PR description:
   - What the module does (one paragraph)
   - Link to the Theme Machine project for context and test data
   - Confirmation that it works on Backdrop 1.x / PHP 8.1+

---

## 6. Update the Theme Machine README

After the contrib listing is live (or the GitHub Release is published), update the main `README.md` in this repo to link to the published module so visitors can find it.

---

## Notes

- Sprint 4 (one-command `setup.sh`) was intentionally deferred past this release. The module itself is fully functional and release-ready without it.
- If the contrib review process requests module code changes, refer back to `DOC/implementation-plan.md` and the sprint handoffs before editing any PHP.
