# svelte-component

[![NPM][npm]][npm-url]

> Component description

## Installation

```bash
# Yarn
yarn add -D svelte-component

# NPM
npm i -D svelte-component

# pnpm
pnpm i -D svelte-component
```

## Usage

### Basic

This is some text.

[git@github.com:metonym/sveldoc.git](git@github.com:metonym/sveldoc.git)

www.example.com

<!-- example-start examples/Basic.svelte -->

```svelte
<script>
  import Counter from "svelte-component";

  let count = 10;
</script>

<Counter bind:count />

This is the current count: {count}
```

<!-- example-end -->

<!-- example-start examples/Basic.svelte blocks:markup -->

```svelte
<Counter bind:count />

This is the current count: {count}
```

<!-- example-end -->

This is an example where the code is not evaluated:

<!-- example-start examples/Basic.svelte no-eval -->

```svelte
<script>
  import Counter from "svelte-component";

  let count = 10;
</script>

<Counter bind:count />

This is the current count: {count}
```

<!-- example-end -->

### Events

This is some text [git@github.com:metonym/sveldoc.git](git@github.com:metonym/sveldoc.git)
www.example.com

<!-- example-start examples/Events.svelte height:400px -->

```svelte
<script>
  import Counter from "svelte-component";

  let count = 100;
</script>

<Counter
  bind:count
  on:click={() => {
    console.log("on:click");
  }}
/>

<strong>{count}</strong>

<style>
  strong {
    color: red;
  }
</style>
```

<!-- example-end -->

### Style

<!-- example-start examples/Style.svelte blocks:markup,style -->

```svelte
<div>
  <Counter count={4} />
</div>

<style>
  div {
    outline: 1px solid blue;
  }
</style>
```

<!-- example-end -->

## API

### Props

| Name  | Type     | Default value |
| :---- | :------- | :------------ |
| count | `number` | `0`           |

### Dispatched Events

None.

### Forwarded Events

- on:click

## Changelog

[Changelog](./CHANGELOG.md)

## License

[MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/svelte-component.svg?color=%23ff3e00&style=for-the-badge
[npm-url]: https://npmjs.com/package/svelte-component
