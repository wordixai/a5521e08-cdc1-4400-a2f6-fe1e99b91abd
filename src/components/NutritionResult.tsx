import { Flame, Beef, Wheat, Droplets, Leaf } from 'lucide-react';

export interface FoodAnalysis {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  confidence: number;
  servingSize: string;
}

interface NutritionResultProps {
  analysis: FoodAnalysis;
}

export const NutritionResult = ({ analysis }: NutritionResultProps) => {
  const macroMax = Math.max(analysis.protein, analysis.carbs, analysis.fat, 100);

  const nutrients = [
    {
      name: '蛋白质',
      value: analysis.protein,
      unit: 'g',
      icon: Beef,
      color: 'hsl(var(--protein))',
      bgColor: 'bg-[hsl(199,89%,48%)]/10',
    },
    {
      name: '碳水化合物',
      value: analysis.carbs,
      unit: 'g',
      icon: Wheat,
      color: 'hsl(var(--carbs))',
      bgColor: 'bg-[hsl(38,92%,50%)]/10',
    },
    {
      name: '脂肪',
      value: analysis.fat,
      unit: 'g',
      icon: Droplets,
      color: 'hsl(var(--fat))',
      bgColor: 'bg-[hsl(340,82%,52%)]/10',
    },
    {
      name: '膳食纤维',
      value: analysis.fiber,
      unit: 'g',
      icon: Leaf,
      color: 'hsl(var(--fiber))',
      bgColor: 'bg-[hsl(142,71%,45%)]/10',
    },
  ];

  return (
    <div className="glass-card p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {analysis.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            份量: {analysis.servingSize}
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          {Math.round(analysis.confidence * 100)}% 准确度
        </div>
      </div>

      {/* Calories Circle */}
      <div className="flex justify-center mb-8">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="url(#calorieGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(analysis.calories / 2000) * 440} 440`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Flame className="w-6 h-6 text-accent mb-1" />
            <span className="text-3xl font-bold text-foreground">
              {analysis.calories}
            </span>
            <span className="text-sm text-muted-foreground">千卡</span>
          </div>
        </div>
      </div>

      {/* Macros */}
      <div className="space-y-4">
        {nutrients.map((nutrient) => (
          <div key={nutrient.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${nutrient.bgColor} flex items-center justify-center`}>
                  <nutrient.icon className="w-4 h-4" style={{ color: nutrient.color }} />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {nutrient.name}
                </span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {nutrient.value}{nutrient.unit}
              </span>
            </div>
            <div className="nutrition-bar">
              <div
                className="nutrition-bar-fill"
                style={{
                  width: `${(nutrient.value / macroMax) * 100}%`,
                  background: nutrient.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
        <p className="text-sm text-muted-foreground">
          💡 提示: 这份食物占每日推荐摄入量的 <span className="font-semibold text-primary">{Math.round((analysis.calories / 2000) * 100)}%</span>
        </p>
      </div>
    </div>
  );
};
