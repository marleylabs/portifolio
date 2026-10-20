import type { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";
import { Playground } from "@/components/Playground/Playground";
import { Asterisk } from "./Asterisk";
import { BuiltWithAI } from "./BuiltWithAI";
import { CodeBlock, CodeBlockPre } from "./CodeBlock";
import { Diagram } from "./Diagram";
import { Heading } from "./Heading";
import { MdxImage } from "./MdxImage";
import { MdxTable } from "./MdxTable";
import { Sidenote } from "./Sidenote";
import { SmartLink } from "./SmartLink";
import { Spacer } from "./Spacer";

/** Elementos do Markdown (h2, a, pre…) e componentes disponíveis em qualquer MDX. */
export const mdxComponents: MDXComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => <Heading as="h2" {...props} />,
  h3: (props: ComponentPropsWithoutRef<"h3">) => <Heading as="h3" {...props} />,
  a: SmartLink,
  pre: CodeBlockPre,
  img: MdxImage,
  table: MdxTable,
  Asterisk,
  BuiltWithAI,
  CodeBlock,
  Diagram,
  Playground,
  Sidenote,
  Spacer,
};
