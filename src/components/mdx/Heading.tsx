import type { ComponentPropsWithoutRef } from "react";
import styles from "./Heading.module.css";

type HeadingProps = ComponentPropsWithoutRef<"h2"> & { as: "h2" | "h3" };

/** Títulos com link de âncora (o id vem do rehype-slug). */
export function Heading({ as: Tag, id, children, ...props }: HeadingProps) {
  return (
    <Tag id={id} className={styles.heading} {...props}>
      {id ? (
        <a href={`#${id}`} className={styles.anchor}>
          {children}
          <span className={styles.hash} aria-hidden="true">
            #
          </span>
        </a>
      ) : (
        children
      )}
    </Tag>
  );
}
