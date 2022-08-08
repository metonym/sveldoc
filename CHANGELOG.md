# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0](https://github.com/metonym/sveldoc/releases/tag/v0.7.0) - 2022-08-07

**Breaking Changes**

- accomodate new SvelteKit/Vite set-up changes

## [0.6.0](https://github.com/metonym/sveldoc/releases/tag/v0.6.0) - 2022-07-03

**Breaking Changes**

- revert to using `svelte-preprocess` instead of `svelte-preprocess-esbuild` in `createConfig`

**Features**

- omit trailing line break in output to match latest Prettier behavior

**Fixes**

- append line break if now new line

## [0.5.0](https://github.com/metonym/sveldoc/releases/tag/v0.5.0) - 2022-06-24

**Breaking Changes**

- use `svelte-preprocess-esbuild` instead of `svelte-preprocess`

## [0.4.1](https://github.com/metonym/sveldoc/releases/tag/v0.4.1) - 2022-06-11

**Fixes**

- avoid "invalid plugin options" vite plugin warning

## [0.4.0](https://github.com/metonym/sveldoc/releases/tag/v0.4.0) - 2022-02-23

**Features**

- editing dependent example files should reload app
- set `kit.prerender.default` to `true` in `createConfig`

## [0.3.0](https://github.com/metonym/sveldoc/releases/tag/v0.3.0) - 2022-02-03

**Breaking Changes**

- `createConfig` must be await-ed because `config.kit.vite` can be async

## [0.2.1](https://github.com/metonym/sveldoc/releases/tag/v0.2.1) - 2022-02-02

**Fixes**

- remove deprecated `kit.target` default option from `createConfig`

## [0.2.0](https://github.com/metonym/sveldoc/releases/tag/v0.2.0) - 2022-01-31

**Breaking Changes**

- target ES6 instead of ESNext when building the library

**Features**

- pad Svelte code fence with extra line breaks to match default Prettier formatting style
- upgrade `mdsvex` to version 0.10.5
- type `createConfig.mdsvexOptions` using `MdsvexOptions` interface
- specify `mdsvex` as a direct dependency

## [0.1.0](https://github.com/metonym/sveldoc/releases/tag/v0.1.0) - 2022-01-30

- Initial release
