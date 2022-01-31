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
