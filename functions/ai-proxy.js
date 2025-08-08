const ACCOUNT_ID = "6f0e4947b3ea06460693e68e5d41743b"; // 替换为您的账户ID
const MODEL = "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b";

export async function onRequestPost({ request, env }) {
  // 构建目标URL
  const targetUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${MODEL}`;
  
  // 创建新请求
  const modifiedReq = new Request(targetUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.API_TOKEN}`,
      "Content-Type": "application/json",
      "CF-IPCountry": "US" // 强制使用海外节点
    },
    body: request.body
  });
  
  try {
    // 发送请求
    const response = await fetch(modifiedReq);
    
    // 处理响应
    const modifiedRes = new Response(response.body, response);
    modifiedRes.headers.set("Access-Control-Allow-Origin", "*");
    return modifiedRes;
    
  } catch (error) {
    // 错误处理
    return new Response(JSON.stringify({ 
      error: "请求失败，请检查网络连接",
      message: error.message,
      hint: "尝试开启HTTP/3或更换DNS"
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
