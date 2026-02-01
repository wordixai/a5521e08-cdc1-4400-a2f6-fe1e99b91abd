import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface FoodAnalysisRequest {
  image: string; // base64 or URL
}

interface FoodAnalysisResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  confidence: number;
  servingSize: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const { image }: FoodAnalysisRequest = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: "请上传食物图片" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    console.log("Analyzing food image...");

    const prompt = `你是一个专业的营养师和食物识别专家。请分析这张食物图片，并返回以下JSON格式的数据：

{
  "name": "食物名称（中文）",
  "calories": 卡路里数值（千卡，整数）,
  "protein": 蛋白质克数（数字，保留1位小数）,
  "carbs": 碳水化合物克数（数字，保留1位小数）,
  "fat": 脂肪克数（数字，保留1位小数）,
  "fiber": 膳食纤维克数（数字，保留1位小数）,
  "confidence": 识别置信度（0-1之间的小数）,
  "servingSize": "份量描述（如：一份约200g）"
}

要求：
1. 仔细观察图片中的食物
2. 根据食物的外观估算份量
3. 提供准确的营养成分数据
4. 如果图片中有多种食物，合并计算总营养值
5. 只返回JSON格式，不要其他文字`;

    const response = await fetch("https://www.needware.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI service error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "请求过于频繁，请稍后再试" }),
          {
            status: 429,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          }
        );
      }

      throw new Error(`食物分析失败: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("未能获取分析结果");
    }

    // Parse JSON from response
    let result: FoodAnalysisResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("无法解析分析结果");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("分析结果格式错误");
    }

    // Validate required fields
    if (!result.name || typeof result.calories !== 'number') {
      throw new Error("分析结果不完整");
    }

    console.log("Food analysis completed:", result.name);

    return new Response(
      JSON.stringify({
        success: true,
        result
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error("Food analysis error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "分析失败，请重试" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
};

serve(handler);
