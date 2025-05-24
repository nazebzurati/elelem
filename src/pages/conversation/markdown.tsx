import CopyButton from "@components/copy-button";
import "katex/dist/katex.min.css";

import Markdown from "react-markdown";
import { Prism } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

export function MarkdownRenderer({ children }: Readonly<{ children: string }>) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code: ({ inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || "");
          if (!inline && match) {
            return <CodeBlock language={match[1]} code={children} />;
          } else {
            return (
              <code
                className="bg-base-100! text-xs! rounded-md! p-1!"
                {...props}
              >
                {children}
              </code>
            );
          }
        },
        pre: ({ children }) => <>{children}</>,
        ol: ({ children, ...props }: any) => {
          return <ol {...props}>{children}</ol>;
        },
        li: ({ children, ...props }: any) => {
          return <li {...props}>{children}</li>;
        },
        ul: ({ children, ...props }: any) => {
          return <ul {...props}>{children}</ul>;
        },
        strong: ({ children, ...props }: any) => {
          return (
            <span className="font-semibold" {...props}>
              {children}
            </span>
          );
        },
        p: ({ children, ...props }: any) => {
          return <p {...props}>{children}</p>;
        },
        a: ({ children, ...props }: any) => {
          return (
            <a
              className="link link-primary"
              target="_blank"
              rel="noreferrer"
              {...props}
            >
              {children}
            </a>
          );
        },
        h1: ({ children, ...props }: any) => {
          return <h1 {...props}>{children}</h1>;
        },
        h2: ({ children, ...props }: any) => {
          return <h2 {...props}>{children}</h2>;
        },
        h3: ({ children, ...props }: any) => {
          return <h3 {...props}>{children}</h3>;
        },
        h4: ({ children, ...props }: any) => {
          return <h4 {...props}>{children}</h4>;
        },
        h5: ({ children, ...props }: any) => {
          return <h5 {...props}>{children}</h5>;
        },
        h6: ({ children, ...props }: any) => {
          return <h6 {...props}>{children}</h6>;
        },
        table: ({ children, ...props }: any) => {
          return (
            <div className="overflow-x-auto!">
              <table className="table" {...props}>
                {children}
              </table>
            </div>
          );
        },
        td: ({ children, ...props }: any) => {
          return <td {...props}>{children}</td>;
        },
        th: ({ children, ...props }: any) => {
          return <th {...props}>{children}</th>;
        },
      }}
    >
      {children}
    </Markdown>
  );
}

const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  return (
    <div className="p-2! bg-base-100! rounded-md! mb-4!">
      <div className="flex justify-between items-center px-2 mt-1">
        <span className="text-xs!">{language}</span>
        <CopyButton text={code} />
      </div>
      <Prism
        style={a11yDark}
        language={language}
        className="text-sm! mt-3! p-4! pb-6! rounded-md!"
      >
        {code}
      </Prism>
    </div>
  );
};
