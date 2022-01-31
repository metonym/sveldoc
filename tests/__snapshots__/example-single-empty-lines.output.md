<script>
import ComponentDefault from "./component";
import { ComponentNamed } from "./component";
import { Component as Alias } from "./component";
export let type = "button";
</script>
<style>

  button {
    color: red;
  }

</style>
<!-- prettier-ignore-start -->

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

<!-- prettier-ignore-end -->
