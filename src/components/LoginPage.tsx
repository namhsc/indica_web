import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { 
  Stethoscope, 
  LogIn, 
  AlertCircle, 
  Sparkles, 
  Shield, 
  BarChart3, 
  Clock,
  Heart,
  UserRound,
  Lock,
  CheckCircle2,
  Building2,
  Phone,
  Mail
} from 'lucide-react';
import { mockUsers } from '../lib/authData';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

export function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      
      if (!success) {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError('');
    toast.success(`Đã điền tài khoản ${user}`, {
      description: 'Nhấn nút đăng nhập để tiếp tục',
      duration: 2000,
    });
  };



  const features = [
    {
      icon: Clock,
      title: 'Tiếp nhận nhanh chóng',
      description: 'Tự động sinh mã hồ sơ và phân công bác sĩ thông minh',
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Shield,
      title: 'Bảo mật cao',
      description: 'Phân quyền theo vai trò và mã hóa dữ liệu bệnh nhân',
      gradient: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-50',
    },
    {
      icon: BarChart3,
      title: 'Báo cáo chi tiết',
      description: 'Thống kê real-time và phân tích dữ liệu toàn diện',
      gradient: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
    },
    {
      icon: Sparkles,
      title: 'Giao diện hiện đại',
      description: 'Thiết kế thân thiện, dễ sử dụng cho mọi đối tượng',
      gradient: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
    },
  ];



  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1758691463610-3c2ecf5fb3fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwY2xpbmljJTIwbW9kZXJufGVufDF8fHx8MTc2MjMwOTU3NXww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Medical Clinic Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-indigo-900/90 to-purple-900/95 backdrop-blur-[2px]" />
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                x: [null, Math.random() * window.innerWidth],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left side - Branding & Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-7 space-y-8"
            >
              {/* Logo & Title */}
              <div className="text-center lg:text-left">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-3xl p-4 pr-8 shadow-2xl border border-white/20 mb-6"
                >
                  <div className="relative">
                    <motion.div
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(59, 130, 246, 0.5)',
                          '0 0 40px rgba(99, 102, 241, 0.7)',
                          '0 0 20px rgba(59, 130, 246, 0.5)',
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl"
                    >
                      <Stethoscope className="h-12 w-12 text-white" />
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
                    />
                  </div>
                  <div className="text-left">
                    <h1 className="text-3xl lg:text-4xl text-white mb-1">
                      Phòng khám đa khoa Indica
                    </h1>
                    <p className="text-blue-200 text-lg">
                      Hệ thống quản lý hồ sơ khám bệnh
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4"
                >
                  <p className="text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    Giải pháp quản lý quy trình khám bệnh hiện đại, tối ưu hóa công việc 
                    của đội ngũ y tế với công nghệ tiên tiến và trí tuệ nhân tạo
                  </p>
                  
                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Bảo mật cao cấp
                    </Badge>
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-sm">
                      <Heart className="w-4 h-4 mr-2" />
                      Thân thiện người dùng
                    </Badge>
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-sm">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Công nghệ AI
                    </Badge>
                  </div>
                </motion.div>
              </div>

              {/* Features Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                    >
                      <div className={`inline-flex p-3 bg-gradient-to-br ${feature.gradient} rounded-xl mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-white mb-2">{feature.title}</h3>
                      <p className="text-sm text-blue-200">{feature.description}</p>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex flex-wrap gap-4 text-sm text-blue-200 justify-center lg:justify-start"
              >
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Building2 className="h-4 w-4" />
                  <span>123 Đường ABC, Quận 1, TP.HCM</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Phone className="h-4 w-4" />
                  <span>1900-xxxx</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Mail className="h-4 w-4" />
                  <span>info@indica.vn</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right side - Login Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-5"
            >
              <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-xl overflow-hidden">
                {/* Card Header with gradient */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
                  <CardTitle className="text-2xl mb-2 flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <LogIn className="h-6 w-6" />
                    </div>
                    Đăng nhập hệ thống
                  </CardTitle>
                  <p className="text-blue-100">
                    Nhập thông tin để truy cập hệ thống quản lý
                  </p>
                </div>

                <CardContent className="p-6 space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                        >
                          <Alert variant="destructive" className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-gray-700 flex items-center gap-2">
                        <UserRound className="h-4 w-4" />
                        Tên đăng nhập
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nhập tên đăng nhập của bạn"
                        disabled={isLoading}
                        required
                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700 flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Mật khẩu
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nhập mật khẩu của bạn"
                        disabled={isLoading}
                        required
                        className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 shadow-lg shadow-blue-500/30 transition-all duration-300 text-lg"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                            Đang đăng nhập...
                          </>
                        ) : (
                          <>
                            <LogIn className="h-5 w-5 mr-2" />
                            Đăng nhập
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>

                  {/* Demo accounts section */}
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Tài khoản demo</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                      <div className="space-y-2 text-sm text-gray-700">
                        <div 
                          onClick={() => fillCredentials('admin', 'admin123')}
                          className="flex justify-between items-center cursor-pointer"
                        >
                          <span>👑 Admin:</span>
                          <code className="bg-white px-2 py-1 rounded text-xs text-blue-600">admin / admin123</code>
                        </div>
                        <div 
                          onClick={() => fillCredentials('letan', 'letan123')}
                          className="flex justify-between items-center cursor-pointer"
                        >
                          <span>🏥 Lễ tân:</span>
                          <code className="bg-white px-2 py-1 rounded text-xs text-blue-600">letan / letan123</code>
                        </div>
                        <div 
                          onClick={() => fillCredentials('bacsi', 'bs123')}
                          className="flex justify-between items-center cursor-pointer"
                        >
                          <span>👨‍⚕️ Bác sĩ:</span>
                          <code className="bg-white px-2 py-1 rounded text-xs text-blue-600">bacsi / bs123</code>
                        </div>
                        <div 
                          onClick={() => fillCredentials('kythuat', 'ktv123')}
                          className="flex justify-between items-center cursor-pointer"
                        >
                          <span>🔬 Kỹ thuật viên:</span>
                          <code className="bg-white px-2 py-1 rounded text-xs text-blue-600">kythuat / ktv123</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                  <p className="text-xs text-center text-gray-500">
                    © 2024 Phòng khám đa khoa Indica. Bảo mật thông tin bệnh nhân.
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Developer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-8 flex items-center justify-center gap-2 text-sm text-white/70"
          >
            <Sparkles className="h-4 w-4" />
            <span>Phát triển bởi</span>
            <span className="text-white">LIFESUP AI HIGH TECHNOLOGY CO., LTD.</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
