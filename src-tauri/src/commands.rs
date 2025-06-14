use async_openai::{config::OpenAIConfig, Client};

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
