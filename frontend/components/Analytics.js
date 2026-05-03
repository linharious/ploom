import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import styles from '../styles/Analytics.module.css';

const COLORS = ['#eab308', '#3b82f6', '#22c55e']; // To Do, In Progress, Done

export default function Analytics({ tasks }) {
  const stats = useMemo(() => {
    const total = tasks.length;
    if (total === 0) return null;

    const byStatus = { 'To Do': 0, 'In Progress': 0, 'Done': 0 };
    tasks.forEach(t => {
      if (byStatus[t.status] !== undefined) byStatus[t.status]++;
    });

    const completion = Math.round((byStatus['Done'] / total) * 100);

    const pieData = [
      { name: 'To Do', value: byStatus['To Do'] },
      { name: 'In Progress', value: byStatus['In Progress'] },
      { name: 'Done', value: byStatus['Done'] },
    ];

    const barData = [
      { name: 'Tasks', 'To Do': byStatus['To Do'], 'In Progress': byStatus['In Progress'], 'Done': byStatus['Done'] }
    ];

    return { completion, pieData, barData };
  }, [tasks]);

  if (!stats) return null;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h3>Project Completion</h3>
        <div className={styles.completionRing}>
          <svg viewBox="0 0 36 36" className={styles.circularChart}>
            <path className={styles.circleBg}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path className={styles.circle}
              strokeDasharray={`${stats.completion}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.35" className={styles.percentage}>{stats.completion}%</text>
          </svg>
        </div>
      </div>

      <div className={styles.card}>
        <h3>Task Distribution</h3>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={stats.pieData} innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                {stats.pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.card}>
        <h3>Status Overview</h3>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="To Do" fill={COLORS[0]} />
              <Bar dataKey="In Progress" fill={COLORS[1]} />
              <Bar dataKey="Done" fill={COLORS[2]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
