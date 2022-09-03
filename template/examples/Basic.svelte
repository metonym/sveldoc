<script>
  import Counter from "svelte-component";

  let count = 10;
</script>

<Counter bind:count />

This is the current count: {count}
