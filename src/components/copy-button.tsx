import { IconClipboard, IconClipboardCheck } from "@tabler/icons-react";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useEffect, useState } from "react";

const TEXT_COPY_COOLDOWN_DELAY_MS = 3000;

export default function CopyButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const onCopy = () => {
    if (isCopied) return;
    writeText(text);
    setIsCopied(true);
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(
        () => setIsCopied(false),
        TEXT_COPY_COOLDOWN_DELAY_MS,
      );
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return isCopied ? (
    <IconClipboardCheck
      className={`w-4 h-4 cursor-pointer text-primary ${className}`}
    />
  ) : (
    <IconClipboard
      className={`w-4 h-4 cursor-pointer ${className}`}
      onClick={onCopy}
    />
  );
}
