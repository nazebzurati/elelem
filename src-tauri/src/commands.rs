use async_openai::{
    config::OpenAIConfig,
    types::{
        ChatCompletionRequestAssistantMessageArgs, ChatCompletionRequestFunctionMessageArgs,
        ChatCompletionRequestMessage, ChatCompletionRequestSystemMessageArgs,
        ChatCompletionRequestToolMessageArgs, ChatCompletionRequestUserMessageArgs,
        CreateChatCompletionRequestArgs, Role,
    },
    Client,
};
use futures::StreamExt;
use serde::Deserialize;
use tauri::{Emitter, Window};

#[derive(Debug, Deserialize)]
pub struct ChatMessage {
    role: Role,
    content: String,
}

#[tauri::command(rename_all = "snake_case")]
pub async fn get_model_list(base_url: String, api_key: String) -> Result<Vec<String>, String> {
    // create client
    let config = OpenAIConfig::new()
        .with_api_base(base_url)
        .with_api_key(api_key);
    let client = Client::with_config(config);

    // get service model list
    let results = client.models().list().await.map_err(|e| e.to_string())?;
    Ok(results.data.iter().map(|d| d.id.to_string()).collect())
}

#[tauri::command(rename_all = "snake_case")]
pub async fn get_chat_completion(
    window: Window,
    base_url: String,
    api_key: String,
    model_id: String,
    messages: Vec<ChatMessage>,
) -> Result<(), String> {
    // create client
    let config = OpenAIConfig::new()
        .with_api_base(base_url)
        .with_api_key(api_key);
    let client = Client::with_config(config);

    // create message
    let _parsed_messages: Result<Vec<ChatCompletionRequestMessage>, String> = messages
        .into_iter()
        .map(|msg| match msg.role {
            Role::System => ChatCompletionRequestSystemMessageArgs::default()
                .content(msg.content)
                .build()
                .map(ChatCompletionRequestMessage::from)
                .map_err(|e| e.to_string()),

            Role::User => ChatCompletionRequestUserMessageArgs::default()
                .content(msg.content)
                .build()
                .map(ChatCompletionRequestMessage::from)
                .map_err(|e| e.to_string()),

            Role::Assistant => ChatCompletionRequestAssistantMessageArgs::default()
                .content(msg.content)
                .build()
                .map(ChatCompletionRequestMessage::from)
                .map_err(|e| e.to_string()),

            Role::Tool => ChatCompletionRequestToolMessageArgs::default()
                .content(msg.content)
                .build()
                .map(ChatCompletionRequestMessage::from)
                .map_err(|e| e.to_string()),

            Role::Function => ChatCompletionRequestFunctionMessageArgs::default()
                .content(msg.content)
                .build()
                .map(ChatCompletionRequestMessage::from)
                .map_err(|e| e.to_string()),
        })
        .collect();
    let _messages = _parsed_messages.map_err(|e| e.to_string())?;

    // create request stream
    let request = CreateChatCompletionRequestArgs::default()
        .model(model_id)
        .messages(_messages)
        .stream(true)
        .build()
        .map_err(|e| e.to_string())?;
    let mut stream = client
        .chat()
        .create_stream(request)
        .await
        .map_err(|e| e.to_string())?;

    // stream
    while let Some(response) = stream.next().await {
        match response {
            Ok(res) => res.choices.iter().for_each(|c| {
                let _ = window.emit("chat_stream", &c.delta.content);
            }),
            Err(e) => {
                let _ = window.emit("chat_error", &e.to_string());
            }
        }
    }

    // mark stream complete
    let _ = window.emit("chat_complete", ());
    Ok(())
}
