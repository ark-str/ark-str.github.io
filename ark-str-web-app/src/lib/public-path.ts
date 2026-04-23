function normalizeBasePath(basePath: string | undefined) {
  const normalized = basePath?.trim().replace(/^\/+|\/+$/g, "") ?? "";
  return normalized.length > 0 ? `/${normalized}` : "";
}

export function resolvePublicPath(publicPath: string) {
  const normalizedPublicPath = `/${publicPath.replace(/^\/+/, "")}`;
  const basePath = normalizeBasePath(
    process.env.NEXT_PUBLIC_ARK_STR_BASE_PATH || process.env.ARK_STR_BASE_PATH,
  );

  return `${basePath}${normalizedPublicPath}`;
}

export const appIconPath = resolvePublicPath("/ark_str_icon.png");
