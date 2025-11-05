import { UserRole } from '../../types/auth';
import { AIConfig } from './types';

export const getAIConfig = (role: UserRole): AIConfig => {
  const configs: Record<UserRole, AIConfig> = {
    receptionist: {
      greeting: 'Xin chào! Tôi là trợ lý AI của Indica Clinic. Tôi sẽ giúp bạn tiếp nhận khách hàng nhanh chóng. Bạn cần hỗ trợ gì hôm nay?',
      suggestions: [
        'Tiếp nhận khách hàng mới',
        'Tìm kiếm hồ sơ',
        'Xem danh sách hồ sơ',
        'Thống kê hôm nay'
      ],
      color: 'from-blue-500 via-cyan-500 to-blue-600'
    },
    doctor: {
      greeting: 'Xin chào Bác sĩ! Tôi là trợ lý AI hỗ trợ khám chữa bệnh. Tôi sẽ giúp bạn quản lý hồ sơ khám và chuẩn đoán. Bạn cần hỗ trợ gì?',
      suggestions: [
        'Hồ sơ chờ khám',
        'Xem hồ sơ cần xử lý',
        'Gợi ý chẩn đoán',
        'Thống kê ca khám'
      ],
      color: 'from-emerald-500 via-teal-500 to-emerald-600'
    },
    nurse: {
      greeting: 'Xin chào! Tôi là trợ lý AI hỗ trợ xét nghiệm. Tôi sẽ giúp bạn quản lý và nhập kết quả xét nghiệm. Bạn cần hỗ trợ gì?',
      suggestions: [
        'Xét nghiệm chờ xử lý',
        'Nhập kết quả',
        'Xem danh sách mẫu',
        'Thống kê xét nghiệm'
      ],
      color: 'from-violet-500 via-purple-500 to-fuchsia-600'
    },
    admin: {
      greeting: 'Xin chào Admin! Tôi là trợ lý AI quản trị hệ thống. Tôi sẽ giúp bạn giám sát toàn bộ hoạt động của phòng khám. Bạn cần gì?',
      suggestions: [
        'Tổng quan hệ thống',
        'Quản lý người dùng',
        'Báo cáo tổng hợp',
        'Cài đặt hệ thống'
      ],
      color: 'from-rose-500 via-pink-500 to-rose-600'
    }
  };
  return configs[role];
};

