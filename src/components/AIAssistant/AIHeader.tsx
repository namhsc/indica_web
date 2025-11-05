import React from 'react';
import { Badge } from '../ui/badge';
import { Bot } from 'lucide-react';
import { motion } from 'motion/react';
import { AIConfig } from './types';

interface AIHeaderProps {
  config: AIConfig;
}

export function AIHeader({ config }: AIHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6 pb-5 border-b-2 border-gradient-to-r from-violet-100 to-purple-100 flex-shrink-0">
      <motion.div 
        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}
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
        <h3 className={`text-xl bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
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
  );
}

