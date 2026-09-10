# Deploying the Martin Family Hub to DreamHost

## Recommended fit

**Astro static build → GitHub Actions → rsync over SSH → DreamHost shared hosting.**

No extra deployment framework, database, paid deployment service, or running Node process is needed on DreamHost. Node 22 builds the site on your computer or on the GitHub runner. DreamHost serves the resulting HTML, CSS, JavaScript, and images. The local site build and event-logic tests passed; an actual DreamHost upload has not been performed or tested against your account.

The repository has an initial commit on `main` and no remote configured. Keep the Git repository private because it contains family content and contribution destinations. Upload only the generated `build/` contents to your web directory, never `.git`, `src`, or `node_modules`.

## 1. Set up the destination

In the DreamHost panel, add the desired fully hosted domain or subdomain, for example `family.mikemdesigns.com`, and enable HTTPS. Assign a shell-enabled website user. Record these exact values from your panel:

| Setting | Example only |
| --- | --- |
| DREAMHOST_HOST | server.dreamhost.com |
| DREAMHOST_USER | your_shell_user |
| DREAMHOST_PATH | /home/your_shell_user/family.mikemdesigns.com |

Use a dedicated site directory. The upload updates matching filenames and preserves other files; it does not delete obsolete files. Remove retired public content separately when necessary. Cached copies and shared photo albums are separate from website files.

## 2. Put the repository on your Git host

Create an empty private repository on GitHub, then from this repository folder:

```sh
git remote add origin YOUR_PRIVATE_REPOSITORY_URL
git push -u origin main
```

A source ZIP and Git bundle are also provided. The ZIP contains source files; restore full Git history from the bundle with:

```sh
git clone martin-family.bundle martin-family
```

## 3. Configure GitHub deployment

The workflow is `.github/workflows/deploy-dreamhost.yml`. Create a GitHub environment named `production`. Add environment variables:

- `DREAMHOST_HOST`: DreamHost SSH hostname
- `DREAMHOST_USER`: shell username
- `DREAMHOST_PATH`: absolute web directory

Add environment secrets:

- `DREAMHOST_SSH_KEY`: a dedicated Ed25519 private deployment key, with its public key authorized for the DreamHost shell user
- `DREAMHOST_KNOWN_HOSTS`: the server's verified SSH known_hosts entry

Verify the SSH host fingerprint through DreamHost or another trusted channel before saving the known_hosts entry. Do not turn off SSH host verification. Store the private key only as a secret, never in this repository. The dedicated key should grant access only to the intended website account.

First run: open GitHub **Actions → Deploy to DreamHost → Run workflow**. It installs pinned dependencies, tests, builds, and uploads the generated site. Auto-deploy is initially off. When ready, add a repository variable `AUTO_DEPLOY` with value `true`; pushes to `main` then publish automatically. A failed test or build stops the upload. Uploads are serialized, with assets sent before index.html.

## 4. Or deploy directly from your computer

Use Node 22.12 or later in the Node 22 line, Git, SSH, and rsync. On your own machine, authorize an SSH key and verify the server before deployment. Copy the example deployment settings into the ignored local `.env` file:

```sh
npm ci
cp .env.example .env
chmod 600 .env
```

Edit `.env` with the DreamHost host, user, website directory, and optional absolute SSH key path. Then deploy without exporting variables in each Terminal session:

```sh
npm run deploy:preview
npm run deploy
```

`deploy:preview` tests, builds, and shows the upload plan without changing the server. `deploy` tests, builds, and uploads the result. The `.env` file is ignored by Git; `.env.example` documents the required variable names without storing account values. The private SSH key stays in `~/.ssh` and `.env` stores only its path.

If you prefer SFTP, upload the **contents** of the included static ZIP into the domain's web directory. The index.html file must sit directly in that directory. Include `.htaccess` and the `_astro` directory.

## Everyday updates

Edit `src/content/initiatives/*.md`, commit, and push. With AUTO_DEPLOY enabled, GitHub publishes the update. Funding totals are entered manually, not read from Cash App. Completed events transition to memories when their event date passes, using America/New_York time. Add an intentionally shared `photos.albumUrl` and optional cover image to publish photos for that event.

The site includes `noindex,nofollow`, robots.txt, and an Apache X-Robots-Tag header. They discourage indexing but do not restrict access. Anyone with the public URL can see its content after DreamHost publication.

## Reverting

Revert the content/code commit in Git and deploy again. Hashed assets are retained by the uploader, so older open pages continue to load. The script is intentionally not a destructive mirror: it will not remove manually uploaded files or old assets. For a retired standalone public asset, remove that exact file deliberately after checking that it is unused.

## References

- [Astro deployment guide](https://docs.astro.build/en/guides/deploy/)
- [DreamHost rsync publishing](https://help.dreamhost.com/hc/en-us/articles/216661778-Rsync)
- [DreamHost supported technologies](https://help.dreamhost.com/hc/en-us/articles/217141627-Supported-and-unsupported-technologies)
- [DreamHost SSH overview](https://help.dreamhost.com/hc/en-us/articles/216041267-SSH-overview)
