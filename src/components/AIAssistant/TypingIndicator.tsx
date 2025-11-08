import React from 'react';
import { motion } from 'motion/react';
import { AIConfig } from './types';

interface TypingIndicatorProps {
	aiConfig: AIConfig;
}

export function TypingIndicator({ aiConfig }: TypingIndicatorProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex justify-start"
		>
			<div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-3xl px-5 py-4 shadow-md">
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
				</div>
			</div>
		</motion.div>
	);
}
