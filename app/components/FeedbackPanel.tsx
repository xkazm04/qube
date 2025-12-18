"use client";

import { useState } from "react";

export interface ChatMessage {
  role: "customer" | "agent";
  message: string;
}

export interface FeedbackItem {
  id: string;
  channel: "twitter" | "email" | "support_chat" | "facebook" | "trustpilot" | "app_store" | "instagram";
  icon: string;
  author: string;
  time: string;
  content?: string;
  subject?: string;
  excerpt?: string;
  title?: string;
  conversation?: ChatMessage[];
  engagement?: { likes?: number; retweets?: number };
  reactions?: { angry?: number; haha?: number; sad?: number };
  rating?: number;
  tag: string;
  priority?: "viral" | "viral_risk" | "churn_risk" | "partner" | "advocacy";
  translation?: string;
  followers?: string;
  location?: string;
  type?: string;
}

interface FeedbackPanelProps {
  feedbackItems: FeedbackItem[];
  accentColor: string;
  agentColor: string;
}

const channelColors: Record<string, string> = {
  twitter: "#1DA1F2",
  facebook: "#4267B2",
  email: "#EA4335",
  support_chat: "#00a991",
  trustpilot: "#00b67a",
  app_store: "#007AFF",
  instagram: "#E1306C",
};

const channelNames: Record<string, string> = {
  twitter: "Twitter",
  facebook: "Facebook",
  email: "Email",
  support_chat: "Support Chat",
  trustpilot: "Trustpilot",
  app_store: "App Store",
  instagram: "Instagram",
};

export default function FeedbackPanel({ feedbackItems, accentColor, agentColor }: FeedbackPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: accentColor }}
        className={`fixed z-[101] top-20 text-white border-none px-4 py-2 rounded-l-full cursor-pointer font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 ${
          isOpen ? "right-[380px] lg:right-[380px] md:right-[320px]" : "right-0"
        }`}
      >
        <span>Live Feedback</span>
        <span className="bg-white px-2 py-0.5 rounded-full text-xs" style={{ color: accentColor }}>
          {feedbackItems.length}
        </span>
      </button>

      {/* Feedback Panel */}
      <div
        className={`fixed right-0 top-16 w-[380px] lg:w-[380px] md:w-[320px] h-[calc(100vh-64px)] bg-[#f8f9fa] border-l border-gray-200 overflow-y-auto z-[100] transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#f8f9fa] border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">Live Customer Feedback</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Auto-refresh
          </div>
        </div>

        {/* Feedback Cards */}
        <div className="p-4 space-y-3">
          {feedbackItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow ${
                item.priority === "viral" || item.priority === "viral_risk" || item.priority === "churn_risk"
                  ? "border-l-4 border-red-500"
                  : item.priority === "partner"
                  ? "border-l-4 border-orange-500"
                  : item.priority === "advocacy"
                  ? "border-l-4 border-blue-500"
                  : ""
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span className="text-base">{item.icon}</span>
                <span style={{ color: channelColors[item.channel] }} className="font-medium">
                  {channelNames[item.channel]}
                </span>
                <span className="text-gray-700 font-semibold">{item.author}</span>
                {item.followers && <span className="text-gray-400">({item.followers})</span>}
                <span className="ml-auto text-gray-400">{item.time}</span>
              </div>

              {/* Rating (for Trustpilot/App Store) */}
              {item.rating && (
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < item.rating! ? "text-yellow-400" : "text-gray-300"}>
                      ★
                    </span>
                  ))}
                </div>
              )}

              {/* Subject (for emails) */}
              {item.subject && (
                <div className="font-semibold text-sm text-gray-800 mb-1">{item.subject}</div>
              )}

              {/* Title (for reviews) */}
              {item.title && (
                <div className="font-semibold text-sm text-gray-800 mb-1">{item.title}</div>
              )}

              {/* Content */}
              {(item.content || item.excerpt) && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  &ldquo;{item.content || item.excerpt}&rdquo;
                </p>
              )}

              {/* Chat Conversation */}
              {item.conversation && (
                <div className="space-y-2 text-sm">
                  {item.conversation.map((msg, idx) => (
                    <div key={idx} className="py-1">
                      <span
                        className="font-semibold"
                        style={{ color: msg.role === "agent" ? agentColor : "#333" }}
                      >
                        {msg.role === "agent" ? "Agent" : "Customer"}:
                      </span>{" "}
                      <span className="text-gray-600">{msg.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Translation */}
              {item.translation && (
                <div className="mt-2 pt-2 border-t border-dashed border-gray-200 text-xs text-gray-500 italic">
                  Translation: {item.translation}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                  {item.tag}
                </span>
                {item.engagement && (
                  <div className="flex gap-3 text-xs text-gray-400">
                    {item.engagement.likes !== undefined && <span>❤️ {item.engagement.likes}</span>}
                    {item.engagement.retweets !== undefined && <span>🔁 {item.engagement.retweets}</span>}
                  </div>
                )}
                {item.reactions && (
                  <div className="flex gap-2 text-xs text-gray-400">
                    {item.reactions.angry !== undefined && <span>😠 {item.reactions.angry}</span>}
                    {item.reactions.haha !== undefined && <span>😂 {item.reactions.haha}</span>}
                    {item.reactions.sad !== undefined && <span>😢 {item.reactions.sad}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="p-4 pt-0">
          <button className="w-full py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Load More Feedback
          </button>
        </div>
      </div>
    </>
  );
}
