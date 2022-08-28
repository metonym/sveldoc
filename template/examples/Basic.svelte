<script lang="ts">
  import type { ComponentProps } from "svelte";
  import Counter from "svelte-component";

  const props: ComponentProps<Counter> = {
    count: 10,
  };
</script>

<Counter {...props} />
