import { yupResolver } from '@hookform/resolvers/yup'
import { IconX } from '@tabler/icons-react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import useSettings from '../store/settings'

export const SettingsModalId = 'settingsModal'

export default function SettingsModal() {
  const schema = yup
    .object({ openaiApiKey: yup.string(), ollamaUrl: yup.string().url() })
    .required()
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema)
  })

  const settingsStore = useSettings()
  const onSave = (data) => {
    settingsStore.update({ ollamaUrl: data.ollamaUrl, openaiApiKey: data.openaiApiKey })
    reset()
  }

  return (
    <dialog id={SettingsModalId} className="modal">
      <div className="modal-box">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Settings</h3>
          <form method="dialog">
            <button className="btn btn-circle btn-ghost">
              <IconX className="h-4 w-4" />
            </button>
          </form>
        </div>
        <form onSubmit={handleSubmit(onSave)}>
          <div>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">OpenAI API Key</legend>
              <input
                type="text"
                className="input w-full"
                placeholder="sk-*****"
                {...register('openaiApiKey')}
              />
              <p className="fieldset-label">
                Don&apos;t worry, we keep the key to yourself and secure.
              </p>
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Ollama API URL</legend>
              <input
                type="text"
                className="input w-full"
                placeholder="http://localhost:11434"
                {...register('ollamaUrl')}
              />
              {errors.ollamaUrl && (
                <p className="fieldset-label text-error">{errors.ollamaUrl.message}</p>
              )}
            </fieldset>
          </div>
          <div className="modal-action">
            <button className="btn btn-primary" disabled={isLoading || isSubmitting}>
              Save
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
