import React from 'react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
      
      {/* Left Side: Text */}
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        
        {/* Optional: Trend Indicator (e.g., +12% this month) */}
        {trend && (
          <p className={`text-xs font-semibold mt-2 ${trend.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
            {trend} from last month
          </p>
        )}
      </div>

      {/* Right Side: Icon with dynamic background color */}
      <div className={`p-4 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>

    </div>
  );
};

export default StatCard;