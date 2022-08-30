<script lang="ts">
  interface $$Props {
    count: number;
  }

  interface $$Events {
    own: CustomEvent<boolean>;
    click: MouseEvent;
  }

  interface $$Slots {
    default: { prop: boolean };
  }

  export let count: number;
</script>

<button on:click on:click={() => count++}>
  Increment the count: {count}
</button>
