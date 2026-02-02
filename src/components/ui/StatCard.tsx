import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'bg-white border border-gray-200',
    primary: 'bg-gradient-to-br from-ocean-500 to-ocean-600 text-white',
    success: 'bg-gradient-to-br from-green-500 to-green-600 text-white',
    warning: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white',
  };

  const textColor = variant === 'default' ? 'text-gray-600' : 'text-white/80';
  const valueColor = variant === 'default' ? 'text-gray-900' : 'text-white';

  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return 'text-gray-500';
    return trend > 0 ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className={`rounded-xl p-4 sm:p-5 shadow-sm ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>{title}</p>
          <p className={`mt-1 text-2xl sm:text-3xl font-bold ${valueColor}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`mt-1 text-xs ${textColor}`}>{subtitle}</p>
          )}
        </div>
        {icon && (
          <div
            className={`p-2 rounded-lg ${
              variant === 'default' ? 'bg-ocean-50' : 'bg-white/20'
            }`}
          >
            {icon}
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className={`mt-3 flex items-center text-sm ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="ml-1">
            {trend > 0 ? '+' : ''}
            {trend.toFixed(1)}%
          </span>
          <span className={`ml-1 ${textColor}`}>vs précédent</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
