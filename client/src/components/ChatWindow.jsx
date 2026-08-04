import { useEffect, useRef, useState } from 'react';
import { Send, Phone, Video, MoreVertical, Paperclip, Check, CheckCheck } from 'lucide-react';
import ChatAttachmentModal from './chat/ChatAttachmentModal';

const ChatWindow = ({ conversation, messages, onSendMessage, isTyping }) => {
  const [input, setInput] = useState('');
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isReputationCardOpen, setIsReputationCardOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [conversation?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSendAttachment = (attachmentData) => {
    if (onSendMessage) {
      onSendMessage(`[Attachment: ${attachmentData.fileName || 'File'}]`, attachmentData);
    }
  };

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Select a conversation</h3>
          <p className="text-sm text-slate-500">Choose a conversation from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-1 flex-col relative">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
              {conversation.participant.charAt(0)}
            </div>
            {conversation.online && (
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            )}
          </div>
          <div className="relative">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">{conversation.participant}</h3>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 border border-blue-200">
                {conversation.serviceCategory || 'AC Repair Service'}
              </span>
              <button
                type="button"
                id="rating-pill-button"
                onClick={() => setIsReputationCardOpen(!isReputationCardOpen)}
                className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 hover:bg-amber-100 transition cursor-pointer"
              >
                <span>⭐</span>
                <span>4.8 (12)</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">{conversation.role}</p>

            {isReputationCardOpen && (
              <div id="reputation-card-popover" className="absolute left-0 top-12 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <h4 className="text-xs font-bold text-slate-900">Worker Reputation</h4>
                  <button
                    onClick={() => setIsReputationCardOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-2xl font-black text-amber-500">4.8</div>
                  <div>
                    <div className="flex text-amber-400 text-xs">★★★★★</div>
                    <div className="text-[10px] text-slate-500">Based on 12 reviews</div>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Completion Rate</span>
                    <span className="font-semibold text-slate-800">98%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '98%' }}></div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Responsiveness</span>
                    <span className="font-semibold text-slate-800">Replies in 20 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reliability Score</span>
                    <span className="font-semibold text-blue-600">96 / 100</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex gap-1 flex-wrap">
                  <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-600">Top Pro</span>
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600">Verified Identity</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="leave-feedback-button"
            onClick={() => setIsFeedbackModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-semibold transition shadow-sm"
          >
            Leave Feedback
          </button>
          <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Call">
            <Phone size={18} />
          </button>
          <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Video call">
            <Video size={18} />
          </button>
          <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="More">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-400">No messages yet. Start a conversation!</p>
          </div>
        )}
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id || msg._id}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                  msg.isOwn
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                <div
                  className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                    msg.isOwn ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  <span>{formatTime(msg.timestamp || msg.createdAt)}</span>
                  {msg.isOwn && (
                    <span>
                      {msg.status === 'read' ? (
                        <CheckCheck size={12} className="text-emerald-300" />
                      ) : msg.status === 'delivered' ? (
                        <CheckCheck size={12} className="text-blue-200" />
                      ) : (
                        <Check size={12} className="text-blue-200" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-slate-100 px-4 py-2 text-xs text-slate-500 italic animate-pulse">
                {conversation.participant} is typing...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium shrink-0">Quick Replies:</span>
          {['Hi, are you available for AC Repair today?', 'Can you share price estimate?', 'I have shared my location.', 'Please call me when you reach.'].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSendMessage(chip)}
              className="shrink-0 rounded-full bg-white border border-slate-200 px-3 py-1 text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-200 px-6 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAttachmentModalOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title="Attach file"
          >
            <Paperclip size={18} />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-xl bg-blue-600 p-2.5 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </form>

      <ChatAttachmentModal
        isOpen={isAttachmentModalOpen}
        onClose={() => setIsAttachmentModalOpen(false)}
        onSendAttachment={handleSendAttachment}
      />

      {isFeedbackModalOpen && (
        <div id="feedback-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div id="feedback-modal-content" className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Leave Feedback</h3>
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 text-center">
              <p className="text-sm text-slate-600">
                How was your service with <span className="font-semibold text-slate-900">{conversation.participant}</span>?
              </p>
            </div>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform active:scale-95"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill={star <= (hoverRating || feedbackRating) ? "#fbbf24" : "none"}
                    stroke={star <= (hoverRating || feedbackRating) ? "#fbbf24" : "#cbd5e1"}
                    strokeWidth={2}
                    className="h-9 w-9 transition"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Comments
              </label>
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Share your experience working with this professional..."
                rows={4}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsFeedbackModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Thank you for submitting a ${feedbackRating}-star review: "${feedbackComment}"`);
                  setIsFeedbackModalOpen(false);
                  setFeedbackComment("");
                  setFeedbackRating(5);
                }}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
