import React from 'react';
import { Button } from '../ui/button';
import { CheckCircle2, QrCode, Camera, CreditCard, ScanLine } from 'lucide-react';
import { motion } from 'motion/react';
import { Gender } from '../../types';
import { mockExistingPatients } from '../../lib/mockPatients';

interface ScanningResultProps {
  formData: {
    fullName: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: Gender;
    address: string;
    email: string;
    customerId: string;
    insurance: string;
  };
  onReset: () => void;
  onContinue: () => void;
  type: 'qr' | 'face' | 'insurance';
}

export function ScanningResult({ formData, onReset, onContinue, type }: ScanningResultProps) {
  const colors = {
    qr: { bg: 'from-green-50 to-emerald-50', border: 'border-green-300', text: 'text-green-700', icon: 'text-green-600', button: 'border-green-300 text-green-700 hover:bg-green-50' },
    face: { bg: 'from-pink-50 to-rose-50', border: 'border-pink-300', text: 'text-pink-700', icon: 'text-pink-600', button: 'border-pink-300 text-pink-700 hover:bg-pink-50' },
    insurance: { bg: 'from-orange-50 to-amber-50', border: 'border-orange-300', text: 'text-orange-700', icon: 'text-orange-600', button: 'border-orange-300 text-orange-700 hover:bg-orange-50' },
  };

  const icons = {
    qr: QrCode,
    face: Camera,
    insurance: CreditCard,
  };

  const messages = {
    qr: '✅ Nhận diện thành công!',
    face: '✅ Nhận diện khuôn mặt thành công!',
    insurance: '✅ Quét thẻ BHYT thành công!',
  };

  const color = colors[type];
  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-6 bg-gradient-to-br ${color.bg} border-2 ${color.border} rounded-2xl p-6 max-w-2xl mx-auto`}
    >
      <CheckCircle2 className={`h-10 w-10 ${color.icon} mx-auto mb-4`} />
      <h4 className={`text-xl mb-4 ${color.text}`}>{messages[type]}</h4>
      
      <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
        <h5 className="text-sm mb-3 text-gray-700">📋 Thông tin bệnh nhân đã được tự động điền:</h5>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Họ tên:</span>
            <p className="text-gray-900">{formData.fullName}</p>
          </div>
          <div>
            <span className="text-gray-500">SĐT:</span>
            <p className="text-gray-900">{formData.phoneNumber}</p>
          </div>
          <div>
            <span className="text-gray-500">Ngày sinh:</span>
            <p className="text-gray-900">{formData.dateOfBirth}</p>
          </div>
          <div>
            <span className="text-gray-500">Giới tính:</span>
            <p className="text-gray-900">{formData.gender === 'male' ? 'Nam' : formData.gender === 'female' ? 'Nữ' : 'Khác'}</p>
          </div>
          {formData.insurance && (
            <div className="col-span-2">
              <span className="text-gray-500">Bảo hiểm:</span>
              <p className="text-gray-900">{formData.insurance}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-700">
          💡 <strong>Bước tiếp theo:</strong> Chọn dịch vụ khám và bác sĩ phụ trách
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onReset}
          className={`flex-1 ${color.button}`}
        >
          <Icon className="h-4 w-4 mr-2" />
          {type === 'qr' ? 'Quét lại' : type === 'face' ? 'Nhận diện lại' : 'Quét lại thẻ'}
        </Button>
        <Button
          onClick={onContinue}
          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
        >
          Chọn dịch vụ & Bác sĩ →
        </Button>
      </div>
    </motion.div>
  );
}

interface ScanningInterfaceProps {
  isScanning: boolean;
  type: 'qr' | 'face' | 'insurance';
  onStartScan: () => void;
}

export function ScanningInterface({ isScanning, type, onStartScan }: ScanningInterfaceProps) {
  const configs = {
    qr: {
      icon: QrCode,
      title: isScanning ? 'Đang quét QR Code...' : 'Quét CCCD gắn chip',
      description: isScanning ? 'Vui lòng giữ CCCD ổn định' : 'Đặt mã QR trên CCCD vào vùng quét camera',
      color: isScanning ? 'from-emerald-500 to-teal-500' : 'from-blue-500 to-indigo-500',
      buttonColor: 'from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
    },
    face: {
      icon: Camera,
      title: isScanning ? 'Đang nhận diện khuôn mặt...' : 'Nhận diện khuôn mặt khách hàng',
      description: isScanning ? 'Vui lòng nhìn thẳng vào camera' : 'Sử dụng AI để nhận diện khách hàng cũ',
      color: isScanning ? 'from-pink-500 to-rose-500' : 'from-blue-500 to-indigo-500',
      buttonColor: 'from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600',
    },
    insurance: {
      icon: CreditCard,
      title: isScanning ? 'Đang quét thẻ BHYT...' : 'Quét thẻ bảo hiểm y tế',
      description: isScanning ? 'Đang đọc thông tin từ thẻ' : 'Đặt thẻ BHYT vào đầu đọc hoặc quét QR/Barcode',
      color: isScanning ? 'from-orange-500 to-amber-500' : 'from-blue-500 to-indigo-500',
      buttonColor: 'from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <>
      <div className="flex justify-center mb-6">
        <motion.div
          animate={isScanning ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: isScanning ? Infinity : 0 }}
          className={`p-6 rounded-3xl bg-gradient-to-br ${config.color} shadow-none`}
        >
          <Icon className="h-16 w-16 text-white" />
        </motion.div>
      </div>

      <h3 className="text-xl">{config.title}</h3>
      <p className="text-gray-600 mb-6">{config.description}</p>

      {!isScanning && (
        <Button
          onClick={onStartScan}
          className={`bg-gradient-to-r ${config.buttonColor}`}
        >
          <ScanLine className="h-5 w-5 mr-2" />
          {type === 'qr' ? 'Bắt đầu quét' : type === 'face' ? 'Bắt đầu nhận diện' : 'Quét thẻ BHYT'}
        </Button>
      )}
    </>
  );
}

