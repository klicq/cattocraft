# Get CattoCraft online: GitHub → Vercel

This guide gets the website onto a shareable HTTPS address for public review. You can add a custom domain and complete the business launch later. No GitHub repository, remote push, Vercel account connection, or hosted deployment has been created by these UI changes.

The source repository can be **private** while the Vercel website is **public**. Both English and Italian pages are ready to deploy. Contact and enquiry confirmations are deliberately **mock interactions** with finished-looking copy: they do not send email or save requests to a studio inbox. Use fictional details when showing these flows, and treat this deployment as a review site rather than accepting real customer enquiries.

## 1. Create the accounts and empty repository

1. Sign in to [GitHub](https://github.com), or create your account.
2. Choose **New repository**, name it **`cattocraft`**, and select **Private**.
3. Leave README, `.gitignore`, and license initialization **unchecked**: this project already supplies its README and ignore rules.
4. Create the repository and copy its HTTPS URL, which will look like `https://github.com/YOUR-USERNAME/cattocraft.git`.

GitHub's official [existing-project instructions](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github) cover the same local-repository workflow.

## 2. Prepare and push the local project

Open a normal VS Code PowerShell terminal:

```powershell
Set-Location 'C:\Vs Code Projects\CatArtSire'
npm.cmd test
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
```

Continue only when each check succeeds. The Windows folder name does not need to change for the CattoCraft brand.

The project currently has no Git repository. Initialize it once:

```powershell
git init -b main
```

If you have already initialized it, skip that command. Set your real commit identity for this repository if necessary, replacing both placeholders. Your GitHub email settings provide a private `noreply` address if you prefer it:

```powershell
git config user.name 'YOUR NAME'
git config user.email 'YOUR GITHUB COMMIT EMAIL'
```

Stage and inspect the files:

```powershell
git add .
git status --short
git diff --cached --stat
```

The prepared public WebP images belong in the commit. The supplied `.gitignore` excludes raw/upscaled originals, `node_modules`, `.next`, personal `.env` files, and generated performance artifacts. Commit `.env.example`, which contains placeholders, alongside `package-lock.json`.

Commit and connect your empty GitHub repository:

```powershell
git commit -m 'Prepare CattoCraft for public review'
git remote add origin https://github.com/YOUR-USERNAME/cattocraft.git
git remote -v
git push -u origin main
```

Replace `YOUR-USERNAME` before running the remote command. If `origin` already exists, inspect `git remote -v` and use the intended existing repository rather than adding a second origin. Follow Git's browser sign-in if requested. GitHub Desktop is an alternative if command-line authentication is not set up. Refresh the repository page to confirm the files arrived.

## 3. Connect GitHub to Vercel

1. Sign in to [Vercel](https://vercel.com) using your GitHub account.
2. Choose a hosting plan that permits commercial use. This is a small-business catalog: Vercel Hobby is limited to personal, non-commercial use. Review a commercial-compatible plan such as Pro before selecting it; no paid plan has been purchased by this work. [Plan terms](https://vercel.com/docs/plans/hobby)
3. Choose **Add New → Project** and connect GitHub if prompted.
4. Authorize the Vercel GitHub integration for the **`cattocraft` repository**. A private repository will appear once the integration has access to it.
5. Select **Import** beside that repository. Use **`cattocraft`** as the Vercel project name, or an available variation.

Vercel supports Git-connected builds and Next.js directly. [Git deployment workflow](https://vercel.com/docs/deployments), [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs)

## 4. Check the build settings

| Setting | Use |
| --- | --- |
| Framework preset | **Next.js** |
| Root directory | Repository root, **`./`** |
| Production branch | **`main`** |
| Node.js version | **22.x**, matching the tested runtime family |
| Install command | **`npm ci`**; use the package lock |
| Build command | **`npm run build`** |
| Output directory | Leave the Next.js framework default |

Keep Next.js server rendering and its image optimizer enabled. Do not set the output directory to `out` or configure a static export: the shop uses server-rendered URL filters and the images use Next.js optimization. No database is needed for this review deployment.

Under environment variables:

| Variable | First review deployment |
| --- | --- |
| `SITE_INDEXING_ENABLED` | **`false`** in both Production and Preview |
| `NEXT_PUBLIC_SITE_URL` | Leave unset initially, then set it to the actual stable HTTPS production address if needed |

Do not upload `.env.example` values as live settings: `https://your-domain.example` is only a placeholder. With `NEXT_PUBLIC_SITE_URL` unset, the application uses Vercel's `VERCEL_PROJECT_PRODUCTION_URL` system variable for absolute metadata URLs. Keep automatic exposure of Vercel system environment variables enabled. Check the generated canonical URLs after deployment; if they show localhost or an incorrect domain, set `NEXT_PUBLIC_SITE_URL` to the exact stable HTTPS address and redeploy. [System environment variables](https://vercel.com/docs/environment-variables/system-environment-variables)

No email/provider secrets are needed for the mock review site. Add server-only delivery settings when real submissions are implemented.

## 5. Deploy and share the public address

Choose **Deploy** and wait for a successful build. Open the project's stable production domain shown by Vercel, commonly an available `cattocraft…vercel.app` address. The exact name depends on availability. HTTPS is supplied for this address; buying a custom domain can wait.

Vercel calls the deployment from `main` **Production**. For this project it is still a public design review, with mock forms and search indexing disabled. Preview-branch URLs may require Vercel login, so share the stable production domain rather than a protected generated deployment URL.

Open that address in an **incognito window while signed out**. If it asks viewers to log in, review **Settings → Deployment Protection** and ensure the intended production domain is public. Standard Protection normally protects preview/generated URLs while allowing production domains. Keep protection on other environments as appropriate. [Deployment Protection](https://vercel.com/docs/deployment-protection)

`noindex` and `robots.txt` keep this review out of intended search indexing; they do not make a public website private.

## 6. Check the hosted website

- [ ] Home, shop, product, how-to-order, and contact pages show **CattoCraft**.
- [ ] The dropdown offers **English** and **Italiano** with flags; switching retains the current product or gallery filters.
- [ ] Italian URLs begin with `/it`; old English URLs remain unprefixed.
- [ ] All images load sharply, cards remain paginated, and the inspection image opens only on request.
- [ ] Add a piece, reload, switch languages, then review the same cart.
- [ ] Use fictional details to inspect the mock enquiry/contact confirmations. No inbox receipt should be expected yet.
- [ ] Test on your phone and in signed-out incognito mode.
- [ ] Canonical URLs and share images use the real HTTPS domain. `/robots.txt` disallows indexing, and page metadata includes `noindex`.
- [ ] Check Lighthouse on the hosted production domain using the steps in [performance-report.md](performance-report.md).

You may also run the repository's HTTP check against the public address:

```powershell
npm.cmd run check:production -- https://YOUR-ACTUAL-PRODUCTION-DOMAIN
```

Replace the domain first. This checks routes, pagination, and image/cache delivery; it does not send forms or measure browser Web Vitals.

## 7. Publish later changes

After testing your changes locally:

```powershell
git add .
git commit -m 'Refine CattoCraft'
git push
```

Vercel rebuilds the connected production branch automatically. Use separate branches for protected reviews when helpful. Monitor deployment logs and image/hosting usage. Once the review is complete, follow [deployment-and-go-live.md](deployment-and-go-live.md) to connect reliable message delivery, confirm business details, add the final domain, and enable indexing for the actual launch.
