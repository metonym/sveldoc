<script lang="ts">
  interface $$Slots {
    /** This is a comment */
    default: {
      /**
       * @default 4
       */
      prop: boolean;
    };
  }

  export let count: number;
</script>

<button {...$$restProps} type="button" on:click on:click={() => count++}>
  Increment the count: {count}
</button>
