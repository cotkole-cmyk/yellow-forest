const ACCOUNT_ID = "6f0e4947b3ea06460693e68e5d41743b"; // 替换为您的账户ID

export async function onRequestPost({ request, env }) {
  try {
    // 解析请求
    const { messages } = await request.json();
    
    // ===== 使用32B模型 =====
    const targetUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`;
    
    // 创建请求（含中国大陆优化）
    const cfRequest = new Request(targetUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.API_TOKEN}`,
        "Content-Type": "application/json",
        "CF-IPCountry": "US", // 强制海外节点
        "X-Forwarded-For": "8.8.8.8" // 绕过区域限制
      },
      body: JSON.stringify({ 
        messages,
        max_tokens: 4096 // 提高输出长度
      })
    });
    
    // ========= 中国大陆优化 =========
    cfRequest.cf = {
      httpProtocol: "http/3", // HTTP/3协议
      tlsVersion: "TLSv1.3",  // 最新TLS
      cacheEverything: false, // 禁用缓存
      scrapeShield: false     // 关闭安全扫描
    };
    
    // ========= 32B模型专用超时 =========
    const fetchOptions = {
      retry: { 
        retries: 2,          // 失败重试2次
        minTimeout: 1000     // 每次间隔1秒
      },
      timeout: 30000 // 30秒超时（原15秒）
    };
    
    // 发送请求
    const response = await fetch(cfRequest, fetchOptions);
    const data = await response.json();
    
    // ========= 构建响应 =========
    const openAIResponse = {
      id: `chatcmpl-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "deepseek-r1-distill-qwen-32b",
      choices: [{
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
    // 32B专用错误处理
    let errorMsg = "请求失败";
    if (error.message.includes("timeout")) {
      errorMsg = "32B模型响应较慢，请简化问题或稍后重试";
    } else if (error.message.includes("resource")) {
      errorMsg = "计算资源不足，请稍后重试";
    }
    
    return new Response(JSON.stringify({
      error: {
        message: errorMsg,
        type: "api_error",
        suggestion: "请尝试30秒内简化问题"
      }
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
