import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { MedicalRecord } from '../types';
import { Search, FileCheck, Printer, AlertTriangle, PenTool } from 'lucide-react';

interface RecordReturnProps {
  records: MedicalRecord[];
  onReturnRecord: (recordId: string, signature: string) => void;
}

export function RecordReturn({ records, onReturnRecord }: RecordReturnProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.strokeStyle = '#000';
        context.lineWidth = 2;
        context.lineCap = 'round';
        setCtx(context);
      }
    }
  }, [showSignatureDialog]);

  const completedRecords = records.filter(r => 
    r.status === 'COMPLETED_EXAMINATION' && !r.signature
  );

  const handleSearch = () => {
    const found = completedRecords.find(r => 
      r.receiveCode === searchTerm || r.patient.phoneNumber === searchTerm
    );

    if (found) {
      setSelectedRecord(found);
    } else {
      toast.error('Không tìm thấy hồ sơ hoặc hồ sơ chưa hoàn thành');
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ctx || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const saveSignature = () => {
    if (!canvasRef.current || !selectedRecord) return;
    
    const signatureData = canvasRef.current.toDataURL();
    onReturnRecord(selectedRecord.id, signatureData);
    
    setShowSignatureDialog(false);
    setSelectedRecord(null);
    clearSignature();
    
    toast.success('Đã trả hồ sơ và lưu chữ ký thành công');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Trả hồ sơ khách hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Nhập mã hồ sơ hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Tra cứu
              </Button>
            </div>

            {selectedRecord && (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3>Thông tin hồ sơ</h3>
                    <div className="mt-2 space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <span className="text-gray-600">Mã hồ sơ:</span>
                          <span className="ml-2">{selectedRecord.receiveCode}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Bệnh nhân:</span>
                          <span className="ml-2">{selectedRecord.patient.fullName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">SĐT:</span>
                          <span className="ml-2">{selectedRecord.patient.phoneNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Ngày sinh:</span>
                          <span className="ml-2">{new Date(selectedRecord.patient.dateOfBirth).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Bác sĩ:</span>
                          <span className="ml-2">{selectedRecord.assignedDoctor?.name}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Chẩn đoán:</span>
                          <span className="ml-2">{selectedRecord.diagnosis || 'Chưa có'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Hoàn thành
                  </Badge>
                </div>

                <div className="border-t pt-4">
                  <h4 className="mb-2">Thông tin thanh toán</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng chi phí:</span>
                      <span>{formatCurrency(selectedRecord.totalAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đã thanh toán:</span>
                      <span>{formatCurrency(selectedRecord.paidAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Còn lại:</span>
                      <span className={
                        (selectedRecord.totalAmount || 0) - (selectedRecord.paidAmount || 0) > 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      }>
                        {formatCurrency((selectedRecord.totalAmount || 0) - (selectedRecord.paidAmount || 0))}
                      </span>
                    </div>
                  </div>
                </div>

                {(selectedRecord.totalAmount || 0) - (selectedRecord.paidAmount || 0) > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Khách hàng còn nợ {formatCurrency((selectedRecord.totalAmount || 0) - (selectedRecord.paidAmount || 0))}. 
                      Vui lòng thu đủ trước khi trả hồ sơ.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={() => setShowSignatureDialog(true)}
                    disabled={(selectedRecord.totalAmount || 0) - (selectedRecord.paidAmount || 0) > 0}
                    className="flex-1"
                  >
                    <PenTool className="h-4 w-4 mr-2" />
                    Ký nhận & Trả hồ sơ
                  </Button>
                  <Button variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    In kết quả
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h4 className="mb-3">Hồ sơ sẵn sàng trả ({completedRecords.length})</h4>
              <div className="space-y-2">
                {completedRecords.slice(0, 5).map(record => (
                  <div
                    key={record.id}
                    className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <div>
                      <div>{record.receiveCode} - {record.patient.fullName}</div>
                      <div className="text-sm text-gray-600">{record.patient.phoneNumber}</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(record.updatedAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chữ ký khách hàng</DialogTitle>
            <DialogDescription>
              Yêu cầu khách hàng ký xác nhận đã nhận đầy đủ hồ sơ và kết quả khám
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={500}
                height={250}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full cursor-crosshair touch-none"
              />
            </div>
            
            <div className="flex gap-3">
              <Button onClick={clearSignature} variant="outline">
                Xóa
              </Button>
              <Button onClick={saveSignature} className="flex-1">
                Xác nhận & Trả hồ sơ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
