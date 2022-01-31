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
