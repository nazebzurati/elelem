import "katex/dist/katex.min.css";

import Markdown from "react-markdown";
import { Prism } from "react-syntax-highlighter";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

export function MarkdownRenderer({ children }: Readonly<{ children: string }>) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // deno-lint-ignore no-explicit-any
        code: ({ inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || "");
          if (!inline && match) {
            return (
              <Prism language={match[1]} className="text-xs! rounded-md!">
                {children}
              </Prism>
            );
          } else {
            return (
              <code
                className={`${className} text-xs bg-zinc-200 dark:bg-zinc-600 py-0.5 px-1 rounded-md`}
                {...props}
              >
                {children}
              </code>
            );
          }
        },
        pre: ({ children }) => <>{children}</>,
        // deno-lint-ignore no-explicit-any
        ol: ({ children, ...props }: any) => {
          return (
            <ol className="text-sm list-decimal list-outside ml-4" {...props}>
              {children}
            </ol>
          );
        },
        // deno-lint-ignore no-explicit-any
        li: ({ children, ...props }: any) => {
          return (
            <li className="text-sm my-1!" {...props}>
              {children}
            </li>
          );
        },
        // deno-lint-ignore no-explicit-any
        ul: ({ children, ...props }: any) => {
          return (
            <ul className="text-sm list-disc list-outside my-1!" {...props}>
              {children}
            </ul>
          );
        },
        // deno-lint-ignore no-explicit-any
        strong: ({ children, ...props }: any) => {
          return (
            <span className="text-sm font-semibold" {...props}>
              {children}
            </span>
          );
        },
        // deno-lint-ignore no-explicit-any
        p: ({ children, ...props }: any) => {
          return (
            <p className="text-sm my-2!" {...props}>
              {children}
            </p>
          );
        },
        // deno-lint-ignore no-explicit-any
        a: ({ children, ...props }: any) => {
          return (
            <a
              className="text-sm text-blue-500 hover:underline"
              target="_blank"
              rel="noreferrer"
              {...props}
            >
              {children}
            </a>
          );
        },
        // deno-lint-ignore no-explicit-any
        h1: ({ children, ...props }: any) => {
          return (
            <h1 className="text-xl font-semibold my-1!" {...props}>
              {children}
            </h1>
          );
        },
        // deno-lint-ignore no-explicit-any
        h2: ({ children, ...props }: any) => {
          return (
            <h2 className="text-lg font-semibold my-1!" {...props}>
              {children}
            </h2>
          );
        },
        // deno-lint-ignore no-explicit-any
        h3: ({ children, ...props }: any) => {
          return (
            <h3 className="text-base font-semibold my-1!" {...props}>
              {children}
            </h3>
          );
        },
        // deno-lint-ignore no-explicit-any
        h4: ({ children, ...props }: any) => {
          return (
            <h4 className="text-base font-semibold my-1!" {...props}>
              {children}
            </h4>
          );
        },
        // deno-lint-ignore no-explicit-any
        h5: ({ children, ...props }: any) => {
          return (
            <h5 className="text-base font-semibold my-1!" {...props}>
              {children}
            </h5>
          );
        },
        // deno-lint-ignore no-explicit-any
        h6: ({ children, ...props }: any) => {
          return (
            <h6 className="text-base font-semibold my-1!" {...props}>
              {children}
            </h6>
          );
        },
        // deno-lint-ignore no-explicit-any
        table: ({ children, ...props }: any) => {
          return (
            <div className="overflow-x-auto! text-sm rounded-box border border-base-content/5 bg-base-100">
              <table className="table" {...props}>
                {children}
              </table>
            </div>
          );
        },
        // deno-lint-ignore no-explicit-any
        td: ({ children, ...props }: any) => {
          return (
            <td className="py-1!" {...props}>
              {children}
            </td>
          );
        },
        // deno-lint-ignore no-explicit-any
        th: ({ children, ...props }: any) => {
          return (
            <th className="py-1!" {...props}>
              {children}
            </th>
          );
        },
      }}
    >
      {children}
    </Markdown>
  );
}
