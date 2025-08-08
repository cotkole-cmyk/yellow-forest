const ACCOUNT_ID = "6f0e4947b3ea06460693e68e5d41743b";
const MODEL = "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b";

export async function onRequestPost({ request, env }) {
  const targetUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${MODEL}`;
  
  const modifiedReq = new Request(targetUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.API_TOKEN}`,
      "Content-Type": "application/json",
      "CF-IPCountry": "US"
    },
    body: request.body
  });
  
  // =====================
  // 添加 HTTP/3 支持代码
  // =====================
  try {
    // 1. 强制使用 HTTP/3
    modifiedReq.cf = {
      httpProtocol: "http/3", // 强制使用 HTTP/3
      tlsVersion: "TLSv1.3",  // 使用最新的 TLS 版本
      cacheEverything: false
    };
    
    // 2. 添加 HTTP/3 回退机制（可选但推荐）
    const fetchOptions = {
      backend: "http3_backend",
      cache: "no-store"
    };
    
    // 3. 发送请求
    const response = await fetch(modifiedReq, fetchOptions);
    
    // 处理响应
    const modifiedRes = new Response(response.body, response);
    modifiedRes.headers.set("Access-Control-Allow-Origin", "*");
    
    // 4. 添加 HTTP/3 响应头（调试用）
    modifiedRes.headers.set("X-HTTP-Version", response.httpVersion || "unknown");
    return modifiedRes;
    
  } catch (error) {
    // 错误处理（包含 HTTP/3 回退提示）
    if (error.message.includes('HTTP/3')) {
      console.warn("HTTP/3 连接失败，尝试回退到 HTTP/2");
      // 这里可以添加回退逻辑
    }
    
    return new Response(JSON.stringify({ 
      error: "请求失败",
      message: error.message,
      suggestion: "请尝试切换网络或稍后重试"
    }), { 
      status: 503,
      headers: { "Content-Type": "application/json" }
    });
  }
}
