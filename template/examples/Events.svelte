<script>
  import Counter from "svelte-component";
</script>

<Counter
  count={0}
  on:click={() => {
    console.log("on:click");
  }}
/>
