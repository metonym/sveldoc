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
