"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { ExternalIcon } from "@/components/EntryLink/EntryLink";
import iconButton from "@/components/IconButton/IconButton.module.css";
import { useBoop } from "@/hooks/use-boop";
import { useSoundEffect } from "@/components/Providers/SoundProvider";
import type { SearchItem, Searcher } from "@/lib/search";
import { OPEN_SEARCH_EVENT } from "./events";
import styles from "./Search.module.css";

type Status = "idle" | "loading" | "error";

/**
 * Busca em um <dialog> modal (Ctrl/⌘ K ou "/").
 * Padrão combobox: o foco fica sempre no campo; setas movem o item ativo
 * (aria-activedescendant) e Enter navega. O índice é baixado na primeira abertura.
 */
export function Search() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState<Searcher | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const playSound = useSoundEffect();
  const [boopStyle, boop] = useBoop({ rotation: 15, scale: 1.1, timing: 150 });
  const baseId = useId();
  const listId = `${baseId}-results`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const results = useMemo(() => (search ? search(query) : []), [search, query]);

  // Índice e motor (Fuse.js) chegam juntos, na primeira vez que a busca abre.
  const loadIndex = useCallback(async () => {
    setStatus("loading");
    try {
      const [response, { createSearcher }] = await Promise.all([fetch("/search-index.json"), import("./searcher")]);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const items: SearchItem[] = await response.json();
      setSearch(() => createSearcher(items));
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }, []);

  const open = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    inputRef.current?.focus();
    playSound("popUp");
    if (!search && status !== "loading") void loadIndex();
  }, [search, status, loadIndex, playSound]);

  // Atalhos globais: Ctrl/⌘ + K em qualquer lugar; "/" fora de campos de texto.
  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement;
      const isTyping = target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      const isShortcut =
        (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !isTyping);
      if (!isShortcut) return;
      event.preventDefault();
      open();
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_SEARCH_EVENT, open);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_SEARCH_EVENT, open);
    };
  }, [open]);

  // Mantém o item ativo visível quando a lista rola.
  useEffect(() => {
    document.getElementById(`${baseId}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, baseId]);

  function close() {
    dialogRef.current?.close();
  }

  function handleClose() {
    setQuery("");
    setActiveIndex(0);
    playSound("popDown");
  }

  function handleDialogClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) close();
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (results.length === 0) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => (index + step + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const { href, external } = results[activeIndex];
      close();
      if (external) window.open(href, "_blank", "noopener,noreferrer");
      else router.push(href);
    }
  }

  const statusMessage =
    status === "loading"
      ? "Carregando…"
      : status === "error"
        ? "Não foi possível carregar a busca. Tente de novo mais tarde."
        : search && results.length === 0
          ? `Nada encontrado para “${query}”.`
          : "";

  return (
    <>
      <button
        type="button"
        className={iconButton.button}
        onClick={open}
        onPointerEnter={boop}
        aria-label="Buscar"
        aria-keyshortcuts="Control+K Meta+K /"
        title="Buscar (Ctrl K ou /)"
      >
        <span className={iconButton.icon} style={boopStyle}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6.5" />
            <line x1="16" y1="16" x2="20.5" y2="20.5" />
          </svg>
        </span>
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label="Buscar no site"
        onClose={handleClose}
        onClick={handleDialogClick}
      >
        <div className={styles.panel}>
          <div className={styles.field}>
            <svg
              className={styles.fieldIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="6.5" />
              <line x1="16" y1="16" x2="20.5" y2="20.5" />
            </svg>
            <input
              ref={inputRef}
              className={styles.input}
              type="search"
              placeholder="Buscar artigos e projetos…"
              autoComplete="off"
              spellCheck={false}
              role="combobox"
              aria-label="Buscar artigos e projetos"
              aria-expanded={results.length > 0}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={results.length > 0 ? optionId(activeIndex) : undefined}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
            />
            <kbd className={styles.kbd}>Esc</kbd>
          </div>

          <ul id={listId} role="listbox" aria-label="Resultados" className={styles.results}>
            {results.map((item, index) => (
              <li key={item.href} role="presentation">
                <Link
                  id={optionId(index)}
                  href={item.href}
                  role="option"
                  aria-selected={index === activeIndex}
                  tabIndex={-1}
                  className={styles.result}
                  onClick={close}
                  onPointerMove={() => setActiveIndex(index)}
                  {...(item.external && { target: "_blank", rel: "noopener noreferrer" })}
                >
                  <span className={styles.resultType}>{item.type}</span>
                  <span className={styles.resultTitle}>
                    <Highlighted text={item.title} ranges={item.titleMatches} />
                    {item.external && (
                      <>
                        <ExternalIcon />
                        <span className="visually-hidden"> (abre em nova aba)</span>
                      </>
                    )}
                  </span>
                  <span className={styles.resultDescription}>{item.description}</span>
                </Link>
              </li>
            ))}
          </ul>

          <p className={styles.status} role="status">
            {statusMessage}
          </p>
        </div>
      </dialog>
    </>
  );
}

/** Título com os trechos encontrados em <mark> (as faixas vêm do Fuse). */
function Highlighted({ text, ranges }: { text: string; ranges: readonly [number, number][] }) {
  if (ranges.length === 0) return <>{text}</>;
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const [start, end] of [...ranges].sort((a, b) => a[0] - b[0])) {
    if (start < cursor) continue;
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(<mark key={start}>{text.slice(start, end + 1)}</mark>);
    cursor = end + 1;
  }
  parts.push(text.slice(cursor));
  return <>{parts}</>;
}
