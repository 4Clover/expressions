export type GalleryItem = {
  id: string;
  type: "comparison" | "single";
  beforeImage?: string;
  afterImage?: string;
  image?: string;
  alt: string;
  stylistId?: string;
  categoryId?: string;
  caption?: string;
};
