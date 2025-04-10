import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const useChat = () => {
  const [messages, setMessages] = useState<string[]>([]);

  // form
  const {
    reset,
    register,
    handleSubmit,
    setFocus,
    formState: { isLoading, isSubmitting, isSubmitSuccessful },
  } = useForm({
    resolver: yupResolver(
      yup
        .object({ input: yup.string().required("Input is a required field.") })
        .required(),
    ),
  });

  // reset input and clear streamed text after complete
  useEffect(() => {
    reset();
    setMessages([]);
  }, [isSubmitSuccessful]);

  // autoscroll
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [isSubmitting, messages]);

  // check if model is thinking
  const [isThinking, setIsThinking] = useState(false);
  useEffect(() => {
    if (messages[messages.length] === "</think>") {
      setMessages([]);
      setIsThinking(false);
      return;
    }
    setIsThinking(messages[0] === "<think>" && !messages.includes("</think>"));
  }, [messages]);

  return {
    form: {
      reset,
      register,
      handleSubmit,
      isLoading,
      isSubmitting,
      setFocus,
    },
    scrollRef,
    isThinking,
    messages,
    setMessages,
  };
};

export default useChat;
