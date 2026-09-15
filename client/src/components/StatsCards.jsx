import React from 'react';
import { ClipboardList, Clock, Send, Hospital, CheckCircle2 } from 'lucide-react';

const StatsCards = ({ stats = {} }) => {
  const cards = [
    {
      label: 'Total Referrals',
      value: stats.total || 0,
      icon: ClipboardList,
      bg: '#eff6ff',
      color: '#2563eb'
    },
    {
      label: 'Pending',
      value: stats.pending || 0,
      icon: Clock,
      bg: '#fffbeb',
      color: '#d97706'
    },
    {
      label: 'Referred',
      value: stats.referred || 0,
      icon: Send,
      bg: '#e0f2fe',
      color: '#0284c7'
    },
    {
      label: 'Treatment Started',
      value: stats.started || 0,
      icon: Hospital,
      bg: '#fdf4ff',
      color: '#9333ea'
    },
    {
      label: 'Completed',
      value: stats.completed || 0,
      icon: CheckCircle2,
      bg: '#ecfdf5',
      color: '#059669'
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="stat-card">
            <div className="stat-icon-wrap" style={{ background: item.bg, color: item.color }}>
              <Icon size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-number">{item.value}</div>
              <div className="stat-label">{item.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
