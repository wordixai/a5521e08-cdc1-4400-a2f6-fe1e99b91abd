import { Flame, Trash2 } from 'lucide-react';
import type { FoodAnalysis } from './NutritionResult';

interface HistoryItem {
  id: string;
  analysis: FoodAnalysis;
  image: string;
  timestamp: Date;
}

interface HistoryCardProps {
  items: HistoryItem[];
  onDelete: (id: string) => void;
  onSelect: (item: HistoryItem) => void;
}

export const HistoryCard = ({ items, onDelete, onSelect }: HistoryCardProps) => {
  if (items.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-muted-foreground">暂无分析记录</p>
      </div>
    );
  }

  const totalCalories = items.reduce((sum, item) => sum + item.analysis.calories, 0);

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">今日记录</h3>
        <div className="flex items-center gap-2 text-accent">
          <Flame className="w-4 h-4" />
          <span className="font-bold">{totalCalories} 千卡</span>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
            onClick={() => onSelect(item)}
          >
            <img
              src={item.image}
              alt={item.analysis.name}
              className="w-14 h-14 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {item.analysis.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.analysis.calories} 千卡 · {item.analysis.servingSize}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export type { HistoryItem };
