import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Bot, 
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardStats } from '../types';
import { UserRole } from '../types/auth';

interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIAssistantProps {
  stats: DashboardStats;
  onNewRecord: () => void;
  onViewRecords: () => void;
  userRole: UserRole;
}

// AI Configuration based on user role
const getAIConfig = (role: UserRole) => {
  const configs = {
    receptionist: {
      greeting: 'Xin chào! 👋 Tôi là trợ lý AI của Indica Clinic. Tôi sẽ giúp bạn tiếp nhận khách hàng nhanh chóng. Bạn cần hỗ trợ gì hôm nay?',
      suggestions: [
        'Tiếp nhận khách hàng mới',
        'Tìm kiếm hồ sơ',
        'Xem danh sách hồ sơ',
        'Thống kê hôm nay'
      ],
      color: 'from-blue-500 via-cyan-500 to-blue-600'
    },
    doctor: {
      greeting: 'Xin chào Bác sĩ! 👨‍⚕️ Tôi là trợ lý AI hỗ trợ khám chữa bệnh. Tôi sẽ giúp bạn quản lý hồ sơ khám và chuẩn đoán. Bạn cần hỗ trợ gì?',
      suggestions: [
        'Hồ sơ chờ khám',
        'Xem hồ sơ cần xử lý',
        'Gợi ý chẩn đoán',
        'Thống kê ca khám'
      ],
      color: 'from-emerald-500 via-teal-500 to-emerald-600'
    },
    technician: {
      greeting: 'Xin chào! 🔬 Tôi là trợ lý AI hỗ trợ xét nghiệm. Tôi sẽ giúp bạn quản lý và nhập kết quả xét nghiệm. Bạn cần hỗ trợ gì?',
      suggestions: [
        'Xét nghiệm chờ xử lý',
        'Nhập kết quả',
        'Xem danh sách mẫu',
        'Thống kê xét nghiệm'
      ],
      color: 'from-violet-500 via-purple-500 to-fuchsia-600'
    },
    admin: {
      greeting: 'Xin chào Admin! 👑 Tôi là trợ lý AI quản trị hệ thống. Tôi sẽ giúp bạn giám sát toàn bộ hoạt động của phòng khám. Bạn cần gì?',
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

export function AIAssistant({ stats, onNewRecord, onViewRecords, userRole }: AIAssistantProps) {
  const aiConfig = getAIConfig(userRole);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: aiConfig.greeting,
      timestamp: new Date(),
      suggestions: aiConfig.suggestions
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addAIMessage = (content: string, suggestions?: string[]) => {
    setIsTyping(false);
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content,
      timestamp: new Date(),
      suggestions,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userInput = input.trim();
    setInput('');
    addUserMessage(userInput);
    setIsTyping(true);

    // Simulate AI response based on role
    setTimeout(() => {
      const lowerInput = userInput.toLowerCase();
      
      // Common responses for all roles
      if (lowerInput.includes('thống kê') || lowerInput.includes('báo cáo')) {
        addAIMessage(
          `📊 Thống kê hôm nay:\n• Tổng hồ sơ: ${stats.totalRecords}\n• Chờ khám: ${stats.pendingExamination}\n• Đang xử lý: ${stats.inProgress}\n• Hoàn thành: ${stats.completed}\n• Đã trả: ${stats.returned}`,
          ['Xuất báo cáo', 'Xem chi tiết']
        );
      } else if (lowerInput.includes('danh sách') || lowerInput.includes('xem hồ sơ')) {
        addAIMessage('Đang chuyển đến danh sách hồ sơ...', ['Lọc theo trạng thái']);
        setTimeout(() => onViewRecords(), 500);
      }
      // Role-specific responses
      else if (userRole === 'receptionist') {
        if (lowerInput.includes('tiếp nhận') || lowerInput.includes('tạo') || lowerInput.includes('mới')) {
          addAIMessage('Vâng, tôi sẽ mở form tiếp nhận khách hàng mới ngay!', [
            'Danh sách bác sĩ trực',
            'Dịch vụ phổ biến'
          ]);
          setTimeout(() => onNewRecord(), 500);
        } else if (lowerInput.includes('tìm') || lowerInput.includes('search')) {
          addAIMessage('Bạn muốn tìm theo mã hồ sơ, số điện thoại hay tên bệnh nhân?', [
            'Tìm theo mã hồ sơ',
            'Tìm theo số điện thoại',
            'Tìm theo tên'
          ]);
        } else if (lowerInput.includes('bác sĩ')) {
          addAIMessage('Danh sách bác sĩ đang trực:\n• BS. Nguyễn Văn An (Nội khoa)\n• BS. Trần Thị Bình (Ngoại khoa)\n• BS. Lê Hoàng Cường (Tim mạch)\n• BS. Phạm Thị Dung (Nhi khoa)', [
            'Lịch trực',
            'Phân công khám'
          ]);
        } else {
          addAIMessage('Tôi có thể giúp bạn:\n✓ Tiếp nhận khách hàng mới\n✓ Tìm kiếm hồ sơ\n✓ Xem thống kê\n✓ Quản lý danh sách hồ sơ', aiConfig.suggestions);
        }
      } else if (userRole === 'doctor') {
        if (lowerInput.includes('chờ khám') || lowerInput.includes('khám')) {
          addAIMessage(`Hiện có ${stats.pendingExamination} hồ sơ chờ khám. Bạn muốn xem danh sách?`, [
            'Xem danh sách chờ khám',
            'Lọc theo khoa',
            'Ưu tiên khẩn cấp'
          ]);
        } else if (lowerInput.includes('chẩn đoán') || lowerInput.includes('gợi ý')) {
          addAIMessage('Tôi có thể giúp:\n✓ Gợi ý chẩn đoán dựa trên triệu chứng\n✓ Đề xuất xét nghiệm cần thiết\n✓ Tham khảo tiêu chuẩn lâm sàng\n✓ Tra cứu thuốc và tương tác', [
            'Triệu chứng thường gặp',
            'Xét nghiệm khuyến nghị'
          ]);
        } else if (lowerInput.includes('xử lý') || lowerInput.includes('cần')) {
          addAIMessage(`Có ${stats.inProgress} hồ sơ đang chờ bạn xử lý. Muốn xem chi tiết?`, [
            'Xem hồ sơ ưu tiên',
            'Sắp xếp theo thời gian'
          ]);
        } else {
          addAIMessage('Tôi có thể hỗ trợ:\n✓ Quản lý hồ sơ khám\n✓ Gợi ý chẩn đoán\n✓ Chỉ định xét nghiệm\n✓ Kê đơn thuốc', aiConfig.suggestions);
        }
      } else if (userRole === 'technician') {
        if (lowerInput.includes('xét nghiệm') || lowerInput.includes('chờ')) {
          addAIMessage('Hiện có các xét nghiệm chờ xử lý:\n• 5 xét nghiệm máu\n• 3 xét nghiệm nước tiểu\n• 2 X-quang\n• 1 siêu âm', [
            'Xem chi tiết',
            'Ưu tiên khẩn cấp',
            'Nhập kết quả'
          ]);
        } else if (lowerInput.includes('nhập') || lowerInput.includes('kết quả')) {
          addAIMessage('Bạn muốn nhập kết quả loại xét nghiệm nào?', [
            'Xét nghiệm máu',
            'Xét nghiệm nước tiểu',
            'Hình ảnh (X-quang, CT)',
            'Siêu âm'
          ]);
        } else if (lowerInput.includes('mẫu')) {
          addAIMessage('Quản lý mẫu xét nghiệm:\n✓ Tiếp nhận mẫu mới\n✓ Kiểm tra chất lượng mẫu\n✓ Phân loại và lưu trữ\n✓ Theo dõi tiến độ', [
            'Mẫu mới hôm nay',
            'Mẫu chờ xử lý'
          ]);
        } else {
          addAIMessage('Tôi có thể giúp:\n✓ Quản lý xét nghiệm\n✓ Nhập kết quả\n✓ Kiểm tra mẫu\n✓ Báo cáo thống kê', aiConfig.suggestions);
        }
      } else if (userRole === 'admin') {
        if (lowerInput.includes('tổng quan') || lowerInput.includes('overview')) {
          addAIMessage(`📊 Tổng quan hệ thống:\n• Tổng hồ sơ: ${stats.totalRecords}\n• Hiệu suất: 98.5%\n• Người dùng hoạt động: 12\n• Thời gian phản hồi TB: 2.3s`, [
            'Chi tiết hiệu suất',
            'Cảnh báo hệ thống'
          ]);
        } else if (lowerInput.includes('người dùng') || lowerInput.includes('user')) {
          addAIMessage('Quản lý người dùng:\n✓ Thêm/xóa người dùng\n✓ Phân quyền vai trò\n✓ Theo dõi hoạt động\n✓ Đặt lại mật khẩu', [
            'Danh sách người dùng',
            'Thêm người dùng mới'
          ]);
        } else if (lowerInput.includes('cài đặt') || lowerInput.includes('setting')) {
          addAIMessage('Cài đặt hệ thống:\n• Cấu hình phòng khám\n• Quản lý dịch vụ\n• Thiết lập bảo mật\n• Sao lưu & phục hồi', [
            'Cài đặt chung',
            'Bảo mật'
          ]);
        } else {
          addAIMessage('Tôi có thể giúp:\n✓ Giám sát hệ thống\n✓ Quản lý người dùng\n✓ Báo cáo tổng hợp\n✓ Cấu hình hệ thống', aiConfig.suggestions);
        }
      } else {
        addAIMessage(`Tôi hiểu bạn đang hỏi về "${userInput}". Hãy thử các gợi ý bên dưới!`, aiConfig.suggestions);
      }
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <div className="space-y-5">
      {/* Chat Interface - Full Focus */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6">
            {/* AI Header */}
            <div className="flex items-center gap-3 mb-6 pb-5 border-b-2 border-gradient-to-r from-violet-100 to-purple-100">
              <motion.div 
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${aiConfig.color} flex items-center justify-center shadow-lg`}
                animate={{ 
                  boxShadow: [
                    '0 4px 14px 0 rgba(139, 92, 246, 0.4)',
                    '0 4px 20px 0 rgba(139, 92, 246, 0.6)',
                    '0 4px 14px 0 rgba(139, 92, 246, 0.4)',
                  ]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Bot className="w-7 h-7 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className={`text-xl bg-gradient-to-r ${aiConfig.color} bg-clip-text text-transparent`}>
                  Trợ lý AI Indica
                </h3>
                <p className="text-sm text-muted-foreground">Sẵn sàng hỗ trợ bạn 24/7</p>
              </div>
              <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-none shadow-md px-3 py-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Online
                </span>
              </Badge>
            </div>

            {/* Messages */}
            <div className="h-[500px] overflow-y-auto pr-3 -mr-3 scrollbar-thin scrollbar-thumb-violet-200 scrollbar-track-transparent" ref={scrollRef}>
              <div className="space-y-5 pb-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                        {/* Message Bubble */}
                        <motion.div 
                          className={`rounded-3xl p-4 shadow-md ${
                            message.type === 'user' 
                              ? `bg-gradient-to-br ${aiConfig.color} text-white` 
                              : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200'
                          }`}
                          whileHover={{ scale: 1.01 }}
                        >
                          <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
                        </motion.div>
                        
                        {/* Suggestions */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <motion.div 
                            className="flex flex-wrap gap-2 mt-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            {message.suggestions.map((suggestion, idx) => (
                              <motion.div
                                key={idx}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className={`text-xs bg-white hover:bg-gradient-to-r hover:${aiConfig.color} hover:text-white border border-violet-200 shadow-sm transition-all`}
                                  size="sm"
                                >
                                  {suggestion}
                                </Button>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className={`bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-3xl px-5 py-4 shadow-md`}>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                            className={`w-2.5 h-2.5 bg-gradient-to-r ${aiConfig.color} rounded-full`}
                          />
                          <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                            className={`w-2.5 h-2.5 bg-gradient-to-r ${aiConfig.color} rounded-full`}
                          />
                          <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                            className={`w-2.5 h-2.5 bg-gradient-to-r ${aiConfig.color} rounded-full`}
                          />
                        </div>
                        <span className="text-xs text-violet-600 ml-1">AI đang suy nghĩ...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Input Area - Enhanced */}
            <div className="flex gap-3 mt-6 pt-5 border-t-2 border-gradient-to-r from-violet-100 to-purple-100">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="💬 Nhập câu hỏi hoặc yêu cầu của bạn..."
                className="flex-1 border-2 border-violet-200/50 focus:border-violet-400 rounded-2xl px-5 py-6 text-base shadow-sm"
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={`bg-gradient-to-r ${aiConfig.color} hover:opacity-90 text-white h-full px-6 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
            
            {/* Quick Tip */}
            <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
              <span className="text-violet-500">💡</span>
              Nhấn Enter để gửi, Shift+Enter để xuống dòng
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
