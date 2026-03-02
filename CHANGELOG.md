## [1.3.3](https://github.com/jee-r/patchwork/compare/v1.3.0...v1.3.3) (2026-03-02)

### Documentation

* **changelog:** regenerate from scratch ([af70a45](https://github.com/jee-r/patchwork/commit/af70a45bfeb973f4e256a7bd85b6291e7036b48b))

### Chores

* **assets:** track og-image and whitelist it from gitignore ([ed74f81](https://github.com/jee-r/patchwork/commit/ed74f813e7fc903e7f3802c8cfeae8eaf524684f))
* **cache:** migrate from @vercel/kv to @upstash/redis ([d5ad750](https://github.com/jee-r/patchwork/commit/d5ad75031181fd44c13e2faffdb485dab1fbd8d9))
* **deps:** update astro and adapters ([b60cbe9](https://github.com/jee-r/patchwork/commit/b60cbe93743460e9cd92031175e2c2d78964455a))
* **deps:** update astro monorepo ([#1](https://github.com/jee-r/patchwork/issues/1)) ([089396f](https://github.com/jee-r/patchwork/commit/089396ffd6512fa6d5481921330d56f81f87271e))
* **deps:** update node.js to v24 ([fd6b8c4](https://github.com/jee-r/patchwork/commit/fd6b8c419aabf68494643a78f994d250755d3a85))
* **gitignore:** ignore .vercel directory ([d628045](https://github.com/jee-r/patchwork/commit/d628045c9892dd21933a0a7bd46afee44495c78d))
* **readme:** update GitHub and author URLs ([cbf2a02](https://github.com/jee-r/patchwork/commit/cbf2a024d993c0655e639c0b96905af300cc3d24))

### Code Refactoring

* **layout:** extract shared head, nav and footer into Layout component ([fbaa5ee](https://github.com/jee-r/patchwork/commit/fbaa5eef311cebc3cc445564f81f670376673165))
## [1.3.2](https://github.com/jee-r/patchwork/compare/v1.3.1...v1.3.2) (2026-03-02)

### Documentation

* **changelog:** regenerate from scratch ([50c98c5](https://github.com/jee-r/patchwork/commit/50c98c5579baae43a2db30012468038269baa6d2))

### Chores

* **deps:** update astro and adapters ([cd5611d](https://github.com/jee-r/patchwork/commit/cd5611d93be682b7dd7861c56b3f84edf77a37fb))
* **readme:** update GitHub and author URLs ([a26c616](https://github.com/jee-r/patchwork/commit/a26c616741ee8d83f26ad27ac54e4d04406fc89c))

### Code Refactoring

* **layout:** extract shared head, nav and footer into Layout component ([d2163b0](https://github.com/jee-r/patchwork/commit/d2163b03cd1a4cbe28cf7019110ec256591aea5a))
## [1.3.1](https://github.com/jee-r/patchwork/compare/v1.3.0...v1.3.1) (2026-03-02)

### Chores

* **assets:** track og-image and whitelist it from gitignore ([ed74f81](https://github.com/jee-r/patchwork/commit/ed74f813e7fc903e7f3802c8cfeae8eaf524684f))
## [1.3.0](https://github.com/jee-r/patchwork/compare/v1.2.0...v1.3.0) (2026-03-02)

### Features

* **seo:** add OG and Twitter Card meta tags to all pages ([d03ac4b](https://github.com/jee-r/patchwork/commit/d03ac4bc507d82e5a9bcd874178d69f3226ff9f7))

### Chores

* **favicon:** replace root favicon with updated assets version ([1b939a2](https://github.com/jee-r/patchwork/commit/1b939a23f858391ecf53c8c0b370f26af9e5a64e))
## [1.2.0](https://github.com/jee-r/patchwork/compare/v1.1.0...v1.2.0) (2026-03-01)

### Features

* **lastfm:** add LASTFM_ENABLED env var to toggle provider ([e36d698](https://github.com/jee-r/patchwork/commit/e36d698a5c1fb946907a96fd23a4b9a3afddd22c))
* **patchwork:** enforce LASTFM_ENABLED check, set listenbrainz as default, normalize username to lowercase ([b7828cb](https://github.com/jee-r/patchwork/commit/b7828cb5d38582c07668415e8132dec8b5cd2a8b))
* **ui:** conditionally render provider fieldset based on LASTFM_ENABLED ([8f351fd](https://github.com/jee-r/patchwork/commit/8f351fdc077e3a03a1116f141d99da3a2415dd86))
## [1.1.0](https://github.com/jee-r/patchwork/compare/v1.0.0...v1.1.0) (2026-02-28)

### Features

* **integrations:** add file-downloader to serve local scripts at build ([5cdf321](https://github.com/jee-r/patchwork/commit/5cdf321dc5023379cc5cd3ac3b7ac442dd389eb2))
* **matomo:** add server-side page view tracking helper ([a6fe94d](https://github.com/jee-r/patchwork/commit/a6fe94d8bd3c20624105633803773399dd86be1b))
* **matomo:** configure opt-in analytics integration with env vars ([3bd3d1a](https://github.com/jee-r/patchwork/commit/3bd3d1ad4e3a993eba84cc636f5648ff35918a27))
* **patchwork:** track image generation as matomo page view ([30ecec5](https://github.com/jee-r/patchwork/commit/30ecec5a1c68d4142cd755d978710f51e160cb16))

### Documentation

* **matomo:** document analytics env vars in readme and env.example ([a734a8b](https://github.com/jee-r/patchwork/commit/a734a8b97682ffd0158560acc6c42d9c3e7c968c))
* **readme:** add Vercel deployment section ([bf0cd2c](https://github.com/jee-r/patchwork/commit/bf0cd2c16822c43fe6c9db82d9af4f11b8ef2ca6))

### Chores

* **deps:** add astro-matomo dependency ([f349bc1](https://github.com/jee-r/patchwork/commit/f349bc189720fe013e022d4f6a6c14d79a761140))
* **renovate:** enable platform automerge and switch to pr type ([25513ca](https://github.com/jee-r/patchwork/commit/25513cababa86db1e89da2bc63f44f0fb25a923f))
## [1.0.0](https://github.com/jee-r/patchwork/compare/3e640b62e73d0de67b1d3971fca791ffeca21016...v1.0.0) (2026-02-28)

### Features

* **changelog:** add changelog page ([77bca4d](https://github.com/jee-r/patchwork/commit/77bca4d1b864e65c5bf31cf94a4d4bf90256fc81))
* **listenbrainz:** add this_week, this_month, this_year period support ([6ff2ba0](https://github.com/jee-r/patchwork/commit/6ff2ba0e0371a1b4649504d62552403b016aed96))
* **ui:** add nav link styles and changelog footer link ([00b182d](https://github.com/jee-r/patchwork/commit/00b182d4d9d6cad597920a34e17257a69b9b7a19))
* **ui:** show dynamic period options for ListenBrainz ([3d0fd93](https://github.com/jee-r/patchwork/commit/3d0fd93c585f449ad0f4136e7fa4c5ef42d62965))

### Bug Fixes

* display cached patchwork by removing X-Image Header ([7e7fc04](https://github.com/jee-r/patchwork/commit/7e7fc04e6ea0b0efa7b8ed9ac9bb4380bcdb7d35))

### Styles

* **footer:** replace fork button with subtle link ([272fa6b](https://github.com/jee-r/patchwork/commit/272fa6b1b34ee3bae6b6cb86d09913a6e8b522e6))

### Chores

* **changelog:** add conventional-changelog tooling ([22aa0cd](https://github.com/jee-r/patchwork/commit/22aa0cd89304d015f2c85f3eeb304fed71d919fd))
* **renovate:** add renovate.json config ([51fb829](https://github.com/jee-r/patchwork/commit/51fb829e20265b4e9cde93235935da8f58ada2b6))

### Build System

* **pnpm:** fix approved build scripts ([3109cfe](https://github.com/jee-r/patchwork/commit/3109cfecc9164f8ec6cf9aec39cddf5e058ced9d))
* Set default adapter to node ([3e640b6](https://github.com/jee-r/patchwork/commit/3e640b62e73d0de67b1d3971fca791ffeca21016))
