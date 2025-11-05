import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Search, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { mockExistingPatients } from '../../lib/mockPatients';
import { Gender } from '../../types';

interface PatientSearchProps {
  onSelectPatient: (patient: typeof mockExistingPatients[0]) => void;
  selectedPatientName?: string;
}

export function PatientSearch({ onSelectPatient, selectedPatientName }: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState(selectedPatientName || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof mockExistingPatients>([]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = mockExistingPatients.filter(p =>
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phoneNumber.includes(searchTerm) ||
        p.customerId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  const handleSelectPatient = (patient: typeof mockExistingPatients[0]) => {
    onSelectPatient(patient);
    setSearchTerm(patient.fullName);
    setShowSuggestions(false);
    toast.success(`Đã load thông tin của ${patient.fullName}`);
  };

  return (
    <div className="space-y-2 relative">
      <Label>Tìm kiếm khách hàng (Họ tên / SĐT / Mã KH)</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Gõ để tìm kiếm khách hàng cũ..."
          className="pl-10 border-gray-300 focus:border-blue-500"
        />
      </div>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto"
          >
            {suggestions.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => handleSelectPatient(patient)}
                className="w-full p-4 hover:bg-blue-50 transition-colors text-left border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                    {patient.fullName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm mb-1">{patient.fullName}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>{patient.phoneNumber}</span>
                      <span>•</span>
                      <span className="font-mono">{patient.customerId}</span>
                      <span>•</span>
                      <span className="text-blue-600">Khám {patient.visitCount} lần</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

