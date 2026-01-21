<script lang="ts">
  import { StaffProfile } from "$lib/components/staff";

  let { data } = $props();
</script>

<svelte:head>
  <title>{data.staffMember.displayName} | Expressions Hair Designs</title>
  <meta
    name="description"
    content={data.staffMember.bio || `Book an appointment with ${data.staffMember.displayName} at Expressions Hair Designs.`}
  />
</svelte:head>

<main class="px-6 py-16 md:py-24">
  <div class="mx-auto max-w-5xl">
    <StaffProfile staffMember={data.staffMember} />
  </div>
</main>
