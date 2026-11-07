// Photography bundled in /public/photos (Unsplash licence, free to use).
// Photographers: Ed Wingate, Wynand Uys, Justice Hubane, Iwaria Inc., Daniel Thomas,
// Christina @ wocintechchat, Ali Mkumbwa, ThisisEngineering, Richard Nyoni, Nathan Wong.

export const PHOTOS = {
  okavango: "/photos/okavango.webp",
  delta: "/photos/delta-aerial.webp",
  city: "/photos/city-aerial.webp",
  elephants: "/photos/elephants.webp",
  team: "/photos/team-laptop.webp",
  founder: "/photos/founder-laptop.webp",
  portrait: "/photos/founder-macbook.webp",
  maker: "/photos/maker-sewing.webp",
  keyboard: "/photos/engineer.webp",
  farmer: "/photos/farmer-field.webp",
  grain: "/photos/grain-hands.webp",
  solar: "/photos/solar-rural.webp",
} as const;

/** Cover photo for a call or idea, picked from its theme or sector. */
export function themePhoto(theme: string | null | undefined): string {
  const t = (theme ?? "").toLowerCase();
  if (/agri|farm|food/.test(t)) return PHOTOS.farmer;
  if (/energy|environment|climate|solar|water/.test(t)) return PHOTOS.solar;
  if (/digital|fintech|ict|software|tech/.test(t)) return PHOTOS.keyboard;
  if (/manufact|mining|industr/.test(t)) return PHOTOS.maker;
  if (/touris|creative|culture/.test(t)) return PHOTOS.elephants;
  if (/health|social|education/.test(t)) return PHOTOS.portrait;
  return PHOTOS.delta;
}
