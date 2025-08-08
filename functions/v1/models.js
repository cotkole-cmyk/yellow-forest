export async function onRequestGet() {
  const modelList = {
    "object": "list",
    "data": [
      {
        "id": "deepseek-r1-distill-qwen-32b", // 32B模型标识
        "object": "model",
        "created": 1686935000,
        "owned_by": "deepseek-ai",
        "permission": [],
        "root": "deepseek-r1-distill-qwen-32b",
        "description": "32B蒸馏版Qwen模型，支持32K上下文"
      }
    ]
  };

  return new Response(JSON.stringify(modelList), {
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
