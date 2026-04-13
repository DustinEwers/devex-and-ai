import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { CheerDTO } from '../../types/cheer';
import { Card } from '../ui';

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
    <Card variant="recognition" className="mb-3 p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
            {cheer.senderFirstName[0]}{cheer.senderLastName[0]}
          </div>
          <div>
            <p className="font-semibold text-slate-100">
              {cheer.senderFirstName} {cheer.senderLastName}
            </p>
            <p className="text-xs text-slate-400">{formatDate(cheer.createdAt)}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-slate-400">Total Points</p>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30">
            {totalPoints}
          </span>
        </div>
      </div>

      {/* Message */}
      <div className="prose prose-sm prose-invert max-w-none mb-3 text-slate-200 leading-relaxed">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
        >
          {cheer.message}
        </ReactMarkdown>
      </div>

      {/* Recipients */}
      <div className="border-t border-slate-700 pt-3">
        <p className="text-xs font-semibold text-slate-300 mb-2">
          Recipients ({cheer.recipients.length}):
        </p>
        <div className="flex flex-wrap gap-2">
          {cheer.recipients.map((recipient) => (
            <div
              key={recipient.id}
              className="inline-flex items-center bg-blue-500/10 border border-blue-500/30 rounded-full px-2.5 py-1"
            >
              <span className="text-xs font-medium text-blue-200">
                {recipient.recipientFirstName} {recipient.recipientLastName}
              </span>
              <span className="ml-1.5 text-xs font-bold text-blue-300">
                +{recipient.pointsAwarded}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
