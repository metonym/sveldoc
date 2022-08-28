<script lang="ts">
  export let count: number;
</script>

<button on:click={() => count++}>
  Increment the count: {count}
</button>
