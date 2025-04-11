import "katex/dist/katex.min.css";

import Markdown from "react-markdown";
import { Prism } from "react-syntax-highlighter";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

type MarkdownRendererProps = {
  children: string;
};

export function MarkdownRenderer({
  children: markdown,
}: MarkdownRendererProps) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // deno-lint-ignore no-explicit-any
        p({ children }: any) {
          return <p className="!m-2">{children}</p>;
        },
        // deno-lint-ignore no-explicit-any
        code({ children, className, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <Prism
              PreTag="div"
              language={match[1]}
              customStyle={{ fontSize: "0.875rem", background: "none" }}
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </Prism>
          ) : (
            <code {...props} className={className + " text-sm"}>
              {children}
            </code>
          );
        },
      }}
    >
      {markdown}
    </Markdown>
  );
}
