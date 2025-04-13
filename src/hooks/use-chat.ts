import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
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
        .object({
          input: yup.string().label("Input"),
        })
        .required(),
    ),
  });

  // reset input and clear streamed text after complete
  useEffect(() => {
    reset();
    setMessages([]);
  }, [isSubmitSuccessful]);

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
    isThinking,
    messages,
    setMessages,
  };
};

export default useChat;
