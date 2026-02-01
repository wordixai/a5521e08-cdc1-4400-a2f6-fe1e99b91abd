import { useState, useCallback } from 'react';
import { Sparkles, Apple, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUploader } from '../components/ImageUploader';
import { NutritionResult, type FoodAnalysis } from '../components/NutritionResult';
import { HistoryCard, type HistoryItem } from '../components/HistoryCard';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// 真实AI分析食物函数
const analyzeFood = async (imageBase64: string): Promise<FoodAnalysis> => {
  // 检查 Supabase 是否配置
  if (!isSupabaseConfigured()) {
    toast.error('请先启用云服务以使用 AI 分析功能');
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase.functions.invoke('analyze-food', {
    body: { image: imageBase64 }
  });

  if (error) {
    console.error('AI analysis error:', error);
    throw new Error(error.message || '分析失败');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.result) {
    throw new Error('未获取到分析结果');
  }

  return data.result as FoodAnalysis;
};

const Index = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleImageSelect = useCallback(async (_file: File, imagePreview: string) => {
    setPreview(imagePreview);
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const result = await analyzeFood(imagePreview);
      setAnalysis(result);
      toast.success(`已识别: ${result.name}`);

      // 添加到历史记录
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        analysis: result,
        image: imagePreview,
        timestamp: new Date(),
      };
      setHistory(prev => [newItem, ...prev]);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error(error instanceof Error ? error.message : '分析失败，请重试');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setPreview(null);
    setAnalysis(null);
  }, []);

  const handleDeleteHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleSelectHistory = useCallback((item: HistoryItem) => {
    setPreview(item.image);
    setAnalysis(item.analysis);
  }, []);

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Apple className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">AI 卡路里</h1>
                <p className="text-xs text-muted-foreground">智能食物分析</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI 驱动</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Bar */}
        {history.length > 0 && (
          <div className="glass-card p-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">今日摄入</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-foreground">
                  {history.reduce((sum, item) => sum + item.analysis.calories, 0)}
                </span>
                <span className="text-muted-foreground ml-1">/ 2000 千卡</span>
              </div>
            </div>
            <div className="mt-3 nutrition-bar">
              <div
                className="nutrition-bar-fill"
                style={{
                  width: `${Math.min((history.reduce((sum, item) => sum + item.analysis.calories, 0) / 2000) * 100, 100)}%`,
                  background: 'var(--gradient-primary)',
                }}
              />
            </div>
          </div>
        )}

        {/* Upload Section */}
        <section>
          <ImageUploader
            onImageSelect={handleImageSelect}
            isAnalyzing={isAnalyzing}
            preview={preview}
            onClear={handleClear}
          />
        </section>

        {/* Analysis Result */}
        {analysis && (
          <section>
            <NutritionResult analysis={analysis} />
          </section>
        )}

        {/* History */}
        {history.length > 0 && (
          <section>
            <HistoryCard
              items={history}
              onDelete={handleDeleteHistory}
              onSelect={handleSelectHistory}
            />
          </section>
        )}

        {/* Empty State */}
        {!preview && history.length === 0 && (
          <div className="text-center py-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Apple className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              开始你的健康之旅
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              上传食物图片，AI 将自动识别并计算卡路里和营养成分
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
