/**
 * Maps short suggestion phrases to full sentences for AI assistant
 * Example: "Báo cáo hôm nay" => "Hãy gửi cho tôi báo cáo ngày hôm nay"
 */

export const mapSuggestionToFullMessage = (suggestion: string): string => {
  const lowerSuggestion = suggestion.toLowerCase().trim();
  
  // Mapping rules for common suggestions
  const mappings: Record<string, string> = {
    // Báo cáo và thống kê
    'báo cáo hôm nay': 'Hãy gửi cho tôi báo cáo ngày hôm nay',
    'thống kê hôm nay': 'Hãy gửi cho tôi thống kê ngày hôm nay',
    'xuất báo cáo': 'Hãy xuất báo cáo cho tôi',
    'xem chi tiết': 'Hãy cho tôi xem chi tiết',
    
    // Tiếp nhận và quản lý hồ sơ
    'tiếp nhận khách hàng mới': 'Hãy giúp tôi tiếp nhận khách hàng mới',
    'tìm kiếm hồ sơ': 'Hãy giúp tôi tìm kiếm hồ sơ',
    'xem danh sách hồ sơ': 'Hãy cho tôi xem danh sách hồ sơ',
    'danh sách hồ sơ': 'Hãy cho tôi xem danh sách hồ sơ',
    'lọc theo trạng thái': 'Hãy giúp tôi lọc theo trạng thái',
    
    // Bác sĩ
    'hồ sơ chờ khám': 'Hãy cho tôi xem hồ sơ chờ khám',
    'xem hồ sơ cần xử lý': 'Hãy cho tôi xem hồ sơ cần xử lý',
    'gợi ý chẩn đoán': 'Hãy gợi ý chẩn đoán cho tôi',
    'thống kê ca khám': 'Hãy gửi cho tôi thống kê ca khám',
    'xem danh sách chờ khám': 'Hãy cho tôi xem danh sách chờ khám',
    'lọc theo khoa': 'Hãy giúp tôi lọc theo khoa',
    'ưu tiên khẩn cấp': 'Hãy cho tôi xem các trường hợp ưu tiên khẩn cấp',
    'xem hồ sơ ưu tiên': 'Hãy cho tôi xem hồ sơ ưu tiên',
    'sắp xếp theo thời gian': 'Hãy sắp xếp hồ sơ theo thời gian cho tôi',
    'triệu chứng thường gặp': 'Hãy cho tôi xem các triệu chứng thường gặp',
    'xét nghiệm khuyến nghị': 'Hãy đưa ra các xét nghiệm khuyến nghị cho tôi',
    
    // Điều dưỡng
    'xét nghiệm chờ xử lý': 'Hãy cho tôi xem các xét nghiệm chờ xử lý',
    'nhập kết quả': 'Hãy giúp tôi nhập kết quả xét nghiệm',
    'xem danh sách mẫu': 'Hãy cho tôi xem danh sách mẫu',
    'thống kê xét nghiệm': 'Hãy gửi cho tôi thống kê xét nghiệm',
    'xét nghiệm máu': 'Hãy giúp tôi nhập kết quả xét nghiệm máu',
    'xét nghiệm nước tiểu': 'Hãy giúp tôi nhập kết quả xét nghiệm nước tiểu',
    'hình ảnh (x-quang, ct)': 'Hãy giúp tôi nhập kết quả hình ảnh (X-quang, CT)',
    'siêu âm': 'Hãy giúp tôi nhập kết quả siêu âm',
    'mẫu mới hôm nay': 'Hãy cho tôi xem các mẫu mới hôm nay',
    'mẫu chờ xử lý': 'Hãy cho tôi xem các mẫu chờ xử lý',
    
    // Admin
    'tổng quan hệ thống': 'Hãy cho tôi xem tổng quan hệ thống',
    'quản lý người dùng': 'Hãy giúp tôi quản lý người dùng',
    'báo cáo tổng hợp': 'Hãy gửi cho tôi báo cáo tổng hợp',
    'cài đặt hệ thống': 'Hãy mở cài đặt hệ thống cho tôi',
    'chi tiết hiệu suất': 'Hãy cho tôi xem chi tiết hiệu suất',
    'cảnh báo hệ thống': 'Hãy cho tôi xem các cảnh báo hệ thống',
    'danh sách người dùng': 'Hãy cho tôi xem danh sách người dùng',
    'thêm người dùng mới': 'Hãy giúp tôi thêm người dùng mới',
    'cài đặt chung': 'Hãy mở cài đặt chung cho tôi',
    'bảo mật': 'Hãy mở cài đặt bảo mật cho tôi',
    
    // Tìm kiếm
    'tìm theo mã hồ sơ': 'Hãy giúp tôi tìm theo mã hồ sơ',
    'tìm theo số điện thoại': 'Hãy giúp tôi tìm theo số điện thoại',
    'tìm theo tên': 'Hãy giúp tôi tìm theo tên',
    
    // Khác
    'danh sách bác sĩ trực': 'Hãy cho tôi xem danh sách bác sĩ trực',
    'dịch vụ phổ biến': 'Hãy cho tôi xem các dịch vụ phổ biến',
    'lịch trực': 'Hãy cho tôi xem lịch trực',
    'phân công khám': 'Hãy giúp tôi phân công khám',
  };
  
  // Check exact match first
  if (mappings[lowerSuggestion]) {
    return mappings[lowerSuggestion];
  }
  
  // Pattern-based mapping for flexible matching
  if (lowerSuggestion.includes('báo cáo') && lowerSuggestion.includes('hôm nay')) {
    return 'Hãy gửi cho tôi báo cáo ngày hôm nay';
  }
  
  if (lowerSuggestion.includes('thống kê') && lowerSuggestion.includes('hôm nay')) {
    return 'Hãy gửi cho tôi thống kê ngày hôm nay';
  }
  
  if (lowerSuggestion.includes('tiếp nhận')) {
    return `Hãy giúp tôi ${suggestion.toLowerCase()}`;
  }
  
  if (lowerSuggestion.includes('tìm') || lowerSuggestion.includes('tìm kiếm')) {
    return `Hãy giúp tôi ${suggestion.toLowerCase()}`;
  }
  
  if (lowerSuggestion.includes('xem') || lowerSuggestion.includes('cho tôi xem')) {
    return `Hãy ${suggestion.toLowerCase()}`;
  }
  
  if (lowerSuggestion.includes('nhập')) {
    return `Hãy giúp tôi ${suggestion.toLowerCase()}`;
  }
  
  if (lowerSuggestion.includes('quản lý')) {
    return `Hãy giúp tôi ${suggestion.toLowerCase()}`;
  }
  
  // Default: add "Hãy" prefix if not already present
  if (!lowerSuggestion.startsWith('hãy')) {
    return `Hãy ${suggestion}`;
  }
  
  return suggestion;
};

