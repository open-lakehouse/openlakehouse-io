# OpenLakehouse.IO

## Troubleshooting

**`install` hangs / can't reach the registry.** Some machines block the public
npm registry (`/etc/hosts` focus-blockers or a corporate proxy), making
`npm install` stall silently:

```bash
grep -E 'registry\.(npmjs\.org)' /etc/hosts
curl -so /dev/null -w '%{http_code}\n' https://registry.npmjs.org/vite
```

If blocked, unblock it, or point this project at a mirror with a **local,
git-ignored** `.npmrc` (do **not** commit it):

```bash
echo 'registry=https://registry.npmmirror.com' > .npmrc
npm install
```

`.npmrc`, `package-lock.json`, `node_modules/`, and `dist/` are git-ignored.
