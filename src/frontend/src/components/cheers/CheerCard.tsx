import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { CheerDTO } from '../../types/cheer';
import { Card, Badge } from '../ui';

interface CheerCardProps {
  cheer: CheerDTO;
}

export const CheerCard: React.FC<CheerCardProps> = ({ cheer }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const totalPoints = cheer.recipients.length * cheer.pointsPerRecipient;

  return (
    <Card variant="recognition" className="mb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3 shadow-lg">
            {cheer.senderFirstName[0]}{cheer.senderLastName[0]}
          </div>
          <div>
            <p className="font-semibold text-slate-100">
              {cheer.senderFirstName} {cheer.senderLastName}
            </p>
            <p className="text-sm text-slate-400">{formatDate(cheer.createdAt)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Total Points</p>
          <Badge variant="points">{totalPoints}</Badge>
        </div>
      </div>

      {/* Message */}
      <div className="prose prose-sm prose-invert max-w-none mb-4 text-slate-200 leading-relaxed">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
        >
          {cheer.message}
        </ReactMarkdown>
      </div>

      {/* Recipients */}
      <div className="border-t border-slate-700 pt-4">
        <p className="text-sm font-semibold text-slate-300 mb-2">
          Recipients ({cheer.recipients.length}):
        </p>
        <div className="flex flex-wrap gap-2">
          {cheer.recipients.map((recipient) => (
            <div
              key={recipient.id}
              className="inline-flex items-center bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1"
            >
              <span className="text-sm font-medium text-amber-300">
                {recipient.recipientFirstName} {recipient.recipientLastName}
              </span>
              <span className="ml-2 text-xs font-bold text-amber-400">
                +{recipient.pointsAwarded}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
