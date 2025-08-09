export async function onRequestGet() {
  // 只返回您要使用的模型
  const modelList = {
    "object": "list",
    "data": [
      {
        "id": "deepseek-r1-distill-qwen-32b",
        "object": "model",
        "created": 1686935000,
        "owned_by": "deepseek-ai",
        "permission": [],
        "root": "deepseek-r1-distill-qwen-32b",
        "parent": null
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
