<script>
import ComponentDefault from "./component";
import { ComponentNamed } from "./component";
import { Component as Alias } from "./component";
export let type = "button";
export let id = undefined;
</script>
<style>

  button {
    color: red;
  }

  h1 {
    font-size: 2rem;
  }

</style>
<!-- example-start tests/__fixtures__/Button.svelte -->

<button {type}>
<slot />
</button>

```svelte
<script>
  import ComponentDefault from "./component";
  import { ComponentNamed } from "./component";
  import { Component as Alias } from "./component";

  export let type = "button";
</script>

<button {type}>
  <slot />
</button>

<style>
  button {
    color: red;
  }
</style>
```

<!-- example-end -->

<!-- example-start tests/__fixtures__/Heading.svelte -->
<h1 {id}>
  <slot />
</h1>

```svelte
<script>
  import ComponentDefault from "./component";
  import { ComponentNamed } from "./component";
  import { Component as Alias } from "./component";

  export let id = undefined;
</script>

<h1 {id}>
  <slot />
</h1>

<style>
  h1 {
    font-size: 2rem;
  }
</style>
```

<!-- example-end -->

<!-- example-start tests/__fixtures__/Simple.svelte -->
<slot />

```svelte
<slot />
```

<!-- example-end -->
