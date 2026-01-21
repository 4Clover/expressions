import type { PageLoad } from "./$types";
import type { GalleryItem } from "$lib/components/gallery";

export const load: PageLoad = async ({ parent, url }) => {
  const { storyblokApi } = await parent();

  // Parse query parameters for initial filter state
  const initialCategory = url.searchParams.get("category") ?? "all";
  const initialStylist = url.searchParams.get("stylist") ?? "all";

  // Fetch gallery story from Storyblok
  let galleryItems: GalleryItem[] = [];
  let categories: { id: string; name: string }[] = [];
  let stylists: { id: string; name: string }[] = [];

  try {
    if (storyblokApi) {
      const version = import.meta.env.DEV ? "draft" : "published";

      // Fetch gallery content
      const { data } = await storyblokApi.get("cdn/stories/gallery", {
        version,
      });

      if (data?.story?.content?.images) {
        // Parse gallery images from Storyblok
        galleryItems = (data.story.content.images as Array<Record<string, unknown>>).map(
          (item, index) => {
            const isComparison = item.before_image && item.after_image;
            return {
              id: (item._uid as string) ?? `item-${index}`,
              type: isComparison ? "comparison" : "single",
              beforeImage: isComparison
                ? ((item.before_image as { filename: string })?.filename ?? "")
                : undefined,
              afterImage: isComparison
                ? ((item.after_image as { filename: string })?.filename ?? "")
                : undefined,
              image: !isComparison
                ? ((item.image as { filename: string })?.filename ?? "")
                : undefined,
              alt: (item.alt as string) ?? "Gallery image",
              stylistId: (item.stylist_id as string) ?? undefined,
              categoryId: (item.category_id as string) ?? undefined,
              caption: (item.caption as string) ?? undefined,
            } as GalleryItem;
          }
        );

        // Extract unique categories and stylists from gallery items
        const categorySet = new Set<string>();
        const stylistSet = new Set<string>();

        for (const item of galleryItems) {
          if (item.categoryId) categorySet.add(item.categoryId);
          if (item.stylistId) stylistSet.add(item.stylistId);
        }

        // Convert to filter options (names can be populated from a mapping or CMS)
        categories = Array.from(categorySet).map((id) => ({
          id,
          name: formatFilterName(id),
        }));

        stylists = Array.from(stylistSet).map((id) => ({
          id,
          name: formatFilterName(id),
        }));
      }
    }
  } catch (error) {
    // Gallery story may not exist yet - this is fine
    console.log("Gallery content not available:", error);
  }

  return {
    galleryItems,
    categories,
    stylists,
    initialCategory,
    initialStylist,
  };
};

/**
 * Convert an ID to a display name.
 * Handles kebab-case to Title Case conversion.
 */
function formatFilterName(id: string): string {
  return id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
