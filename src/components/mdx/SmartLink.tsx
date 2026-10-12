import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

/** Links internos usam next/link (prefetch + navegação client-side); externos, <a> comum. */
export function SmartLink({ href = "", ...props }: ComponentPropsWithoutRef<"a">) {
  if (href.startsWith("/")) {
    return <Link href={href} {...props} />;
  }
  if (href.startsWith("#")) {
    return <a href={href} {...props} />;
  }
  return <a href={href} rel="noopener noreferrer" {...props} />;
}
