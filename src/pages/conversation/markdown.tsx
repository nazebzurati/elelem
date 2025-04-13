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
              <Prism language={match[1]} className="text-sm! rounded-md!">
                {children}
              </Prism>
            );
          } else {
            return (
              <code
                className={`${className} text-sm bg-zinc-200 dark:bg-zinc-600 py-0.5 px-1 rounded-md`}
                {...props}
              >
                {children}
              </code>
            );
          }
        },
        pre: ({ children }) => <>{children}</>,
        ol: ({ children, ...props }) => {
          return (
            <ol className="list-decimal list-outside ml-4" {...props}>
              {children}
            </ol>
          );
        },
        li: ({ children, ...props }) => {
          return (
            <li className="py-1" {...props}>
              {children}
            </li>
          );
        },
        ul: ({ children, ...props }) => {
          return (
            <ul className="list-decimal list-outside ml-4" {...props}>
              {children}
            </ul>
          );
        },
        strong: ({ children, ...props }) => {
          return (
            <span className="font-semibold" {...props}>
              {children}
            </span>
          );
        },
        a: ({ children, ...props }) => {
          return (
            <a
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noreferrer"
              {...props}
            >
              {children}
            </a>
          );
        },
        h1: ({ children, ...props }) => {
          return (
            <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
              {children}
            </h1>
          );
        },
        h2: ({ children, ...props }) => {
          return (
            <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
              {children}
            </h2>
          );
        },
        h3: ({ children, ...props }) => {
          return (
            <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
              {children}
            </h3>
          );
        },
        h4: ({ children, ...props }) => {
          return (
            <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
              {children}
            </h4>
          );
        },
        h5: ({ children, ...props }) => {
          return (
            <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
              {children}
            </h5>
          );
        },
        h6: ({ children, ...props }) => {
          return (
            <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
              {children}
            </h6>
          );
        },
        table: ({ children, ...props }) => {
          return (
            <div className="text-sm rounded-box border border-base-content/5 bg-base-100">
              <table className="table" {...props}>
                {children}
              </table>
            </div>
          );
        },
      }}
    >
      {children}
    </Markdown>
  );
}
