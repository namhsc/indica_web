import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Activity, Users, FileText, CheckCircle, Clock, TrendingUp, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { DashboardStats } from '../types';
import { motion } from 'motion/react';

interface DashboardProps {
  stats: DashboardStats;
}

export function Dashboard({ stats }: DashboardProps) {
  const statCards = [
    {
      title: 'Tổng hồ sơ',
      value: stats.totalRecords,
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-500',
      change: '+12%',
      trending: 'up',
    },
    {
      title: 'Chưa check-in',
      value: stats.pendingCheckin,
      icon: Calendar,
      gradient: 'from-yellow-500 to-amber-500',
      change: `${stats.pendingCheckin}`,
      trending: 'neutral',
    },
    {
      title: 'Chờ khám',
      value: stats.pendingExamination,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-500',
      change: '+5%',
      trending: 'up',
    },
    {
      title: 'Đang xử lý',
      value: stats.inProgress,
      icon: Activity,
      gradient: 'from-violet-500 to-purple-500',
      change: '-3%',
      trending: 'down',
    },
    {
      title: 'Hoàn thành',
      value: stats.completed,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-500',
      change: '+8%',
      trending: 'up',
    },
    {
      title: 'Đã trả',
      value: stats.returned,
      icon: Users,
      gradient: 'from-pink-500 to-rose-500',
      change: '+15%',
      trending: 'up',
    },
    {
      title: 'Hôm nay',
      value: stats.todayRecords,
      icon: TrendingUp,
      gradient: 'from-indigo-500 to-blue-500',
      change: '+10%',
      trending: 'up',
    },
  ];

  const statusData = [
    { label: 'Chưa check-in', value: stats.pendingCheckin, color: 'bg-yellow-500', total: stats.totalRecords },
    { label: 'Chờ khám', value: stats.pendingExamination, color: 'bg-amber-500', total: stats.totalRecords },
    { label: 'Đang xử lý', value: stats.inProgress, color: 'bg-violet-500', total: stats.totalRecords },
    { label: 'Hoàn thành', value: stats.completed, color: 'bg-emerald-500', total: stats.totalRecords },
    { label: 'Đã trả', value: stats.returned, color: 'bg-rose-500', total: stats.totalRecords },
  ];

  const recentActivities = [
    {
      action: 'Tiếp nhận hồ sơ mới',
      time: '5 phút trước',
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      action: 'Bác sĩ cập nhật chẩn đoán',
      time: '15 phút trước',
      icon: Activity,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      action: 'Kỹ thuật viên hoàn thành xét nghiệm',
      time: '25 phút trước',
      icon: FileText,
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      action: 'Trả hồ sơ cho khách hàng',
      time: '30 phút trước',
      icon: Users,
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-gray-600 mt-1">Tổng quan hệ thống quản lý hồ sơ khám bệnh</p>
        </div>
        <div className="text-xs text-gray-500">
          Cập nhật: {new Date().toLocaleTimeString('vi-VN')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trending === 'up' ? ArrowUpRight : ArrowDownRight;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      stat.trending === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <TrendIcon className="h-3 w-3" />
                      {stat.change}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className={`text-3xl bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                Trạng thái hồ sơ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">{item.label}</span>
                      <span className="text-sm">{item.value}</span>
                    </div>
                    <div className="relative w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.value / item.total) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className={`${item.color} h-2 rounded-full`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                Hoạt động gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors cursor-pointer"
                    >
                      <div className={`p-2.5 bg-gradient-to-br ${activity.gradient} rounded-xl shadow-md`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
