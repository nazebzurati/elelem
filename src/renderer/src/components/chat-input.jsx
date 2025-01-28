import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

export default function ChatInput() {
  const schema = yup.object({ input: yup.string().required() }).required();
  const {
    reset,
    register,
    handleSubmit,
    setFocus,
    formState: { isLoading, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const inputRef = useRef(null);
  const onSubmit = (data) => {
    console.log('chat-input.jsx:17', data);

    // reset and refocus
    reset();
    setTimeout(() => {
      setFocus('input');
    }, 1000);
  };

  useEffect(() => {
    // shift enter to send
    const handleKeyDown = (event) => {
      if (event.shiftKey && event.key === 'Enter') {
        handleSubmit(onSubmit)();
      }
    };

    // register event listener
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <form className="w-svw absolute bottom-0 left-0 p-6" onSubmit={handleSubmit(onSubmit)}>
      <fieldset className="fieldset ">
        <legend className="fieldset-legend">Your message</legend>
        <textarea
          ref={inputRef}
          autoFocus
          disabled={isSubmitting || isLoading}
          className="textarea w-full"
          {...register('input')}
        />
        <div className="fieldset-label">Shift+Enter to send.</div>
      </fieldset>
    </form>
  );
}
