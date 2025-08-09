const ACCOUNT_ID = "6f0e4947b3ea06460693e68e5d41743b"; // 替换为您的Cloudflare账户ID

export async function onRequestPost({ request, env }) {
  try {
    // 解析请求数据
    const { messages } = await request.json();
    
    // 使用您指定的模型
    const cfModel = "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b";
    
    // 构建Cloudflare AI请求
    const targetUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${cfModel}`;
    const cfRequest = new Request(targetUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messages })
    });
    
    // 发送请求到Cloudflare AI
    const response = await fetch(cfRequest);
    const data = await response.json();
    
    // 构建OpenAI兼容响应
    const openAIResponse = {
      id: `chatcmpl-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "deepseek-r1-distill-qwen-32b",
      choices: [{
        index: 0,
        message: {
          role: "assistant",
          content: data.result.response
        },
        finish_reason: "stop"
      }],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    };
    
    return new Response(JSON.stringify(openAIResponse), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: {
        message: `请求失败: ${error.message}`,
        type: "api_error"
      }
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
