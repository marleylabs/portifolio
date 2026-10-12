const SIZES = { sm: "var(--space-4)", md: "var(--space-8)", lg: "var(--space-16)", xl: "var(--space-24)" } as const;

/**
 * Respiro vertical extra entre blocos do MDX — para quando o ritmo padrão do texto não
 * basta (antes de uma mudança de assunto, depois de um demo grande…).
 *
 *   <Spacer />  <Spacer size="lg" />  <Spacer size={40} />  (número = px)
 */
export function Spacer({ size = "md" }: { size?: keyof typeof SIZES | number }) {
  const height = typeof size === "number" ? `${size}px` : SIZES[size];
  return <div aria-hidden="true" style={{ height, margin: 0 }} />;
}
