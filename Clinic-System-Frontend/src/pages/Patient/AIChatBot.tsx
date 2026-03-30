import React, { useState, useEffect, useRef } from "react";
import { Input, Button, Card, Space } from "antd";
import type { InputRef } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { BsRobot } from "react-icons/bs";
import { createConversation as createConversationService, sendChatMessage } from "../../services/ChatbotService";

const formatTime = (timestamp: Date) => {
  return new Date(timestamp).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

type Message = { role: "user" | "assistant"; content: string; timestamp: Date };

export default function Chatbot() {
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (!conversationId) {
      createConversation();
    }
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
  const createConversation = async () => {
    try {
      const data = await createConversationService();
      setConversationId(data.conversationId);
      setMessages([{ role: "assistant", content: "Chào bạn, tôi là **Trợ lý Y tế ảo** của Hệ thống chăm sóc sức khỏe ProHealth. Tôi có thể hỗ trợ bạn tìm hiểu thông tin sức khỏe.", timestamp: new Date() }]);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (err) {
      console.error("Create conv err", err);
      setErrorMsg("Không thể tạo cuộc trò chuyện. Vui lòng thử lại.");
    }
  };
  const sendMessage = async (e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    setErrorMsg("");
    const userMessage: Message = { role: "user", content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendChatMessage(userMessage.content, conversationId);
      if (data?.success) {
        setMessages(prev => [...prev, { role: "assistant", content: data.message, timestamp: new Date() }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "Xin lỗi, đã có lỗi xảy ra.", timestamp: new Date() }]);
        setErrorMsg(data?.message || "Lỗi từ server");
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      const status = err?.response?.status;
      if (status === 429) {
        setErrorMsg("Bạn gửi quá nhiều yêu cầu. Vui lòng đợi rồi thử lại.");
      } else {
        setErrorMsg("Lỗi kết nối. Vui lòng thử lại.");
      }
      setMessages(prev => [...prev, { role: "assistant", content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      sendMessage();
    }
  };

  // Hàm định dạng nội dung của trợ lý ảo
  const formatAssistantContent = (rawContent: string) => {
    // Chuẩn hóa đầu vào (xóa khoảng trắng thừa đầu cuối)
    let formattedContent = rawContent.trim();

    // Xử lý In Đậm (Bold) trước
    // Lý do: Để khi xử lý List, text đã được bọc trong <strong>, tránh vỡ layout.
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');

    // Xử lý Tiêu đề (Header)
    // Logic: Tìm dòng bắt đầu bằng Chữ Hoa, kết thúc bằng dấu hai chấm (:), nằm trên dòng riêng.
    formattedContent = formattedContent.replace(
      /(?:^|\n)([A-ZÀ-Ỹ][\w\sÀ-Ỹ]+):(?=\s|$)/g,
      (_match, p1) => {
        return `<div class="text-blue-700 font-bold mt-3 mb-1 text-base">${p1}:</div>`;
      }
    );

    // Xử lý List Item (Dấu chấm đầu dòng)
    // Logic: Tìm dấu * ở đầu dòng, bắt toàn bộ nội dung phía sau.
    formattedContent = formattedContent.replace(
      /(?:^|\n)\*\s+(.+?)(?=\n|$)/g,
      (_match, p1) => {
        return `<div class="flex items-start gap-2 mb-1">
                  <span class="text-blue-500 font-bold text-lg leading-none mt-[2px] shrink-0">•</span>
                  <span class="text-gray-800 leading-snug">${p1}</span>
                </div>`;
      }
    );

    // Xử lý xuống dòng còn lại
    // Thay thế \n bằng <br> cho các đoạn văn thông thường không thuộc list/header.
    formattedContent = formattedContent.replace(/\n/g, '<br/>');

    return formattedContent;
  };

  // Thành phần hiển thị bong bóng "Đang suy nghĩ..."
  const ThinkingBubble = () => (
    <div className="flex justify-start mb-2 sm:mb-4">
      <div className="bg-gray-200 p-2 sm:p-3 rounded-xl rounded-tl-none max-w-[90%] sm:max-w-[75%] shadow-md">

        <div className="flex items-center">

          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full animate-bounce delay-300"></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full animate-bounce delay-700"></div>
          </div>

          <span className="ml-2 text-xs sm:text-sm text-gray-700 italic">Đang suy nghĩ...</span>
        </div>

      </div>
    </div>
  );

  const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.role === "user";
    const content = isUser ? message.content : formatAssistantContent(message.content);

    return (
      <div className={`flex mb-2 sm:mb-3 ${isUser ? "justify-end" : "justify-start"}`}>
        <div className={`flex flex-col max-w-[90%] sm:max-w-[85%] md:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
          <div
            className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm text-xs sm:text-sm md:text-[15px] break-words ${isUser
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
              }`}
          >
            <div
              className="assistant-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
          <span className={`text-[10px] sm:text-[11px] mt-1 text-gray-400 ${isUser ? "mr-1" : "ml-1"}`}>
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  };  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-gray-50 font-sans overflow-hidden">
      {/* Header - fixed height */}
      <Card
        className="shadow-sm bg-white rounded-none border-b border-gray-200 flex-shrink-0 responsive-card-body"
        title={<div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg font-bold text-blue-600">
          <span className="text-lg sm:text-xl md:text-2xl"><BsRobot /></span> Trợ lý Y tế ảo
        </div>}
        bodyStyle={{ padding: '8px 12px' }}
        bordered={false}
      >
        <p className="text-xs sm:text-sm text-gray-500 m-0">Hỗ trợ thông tin sức khỏe và hướng dẫn đặt lịch khám bệnh.</p>
      </Card>

      {/* Messages area - scrollable */}
      <div className="flex-grow overflow-y-auto p-2 sm:p-3 md:p-4 space-y-2 custom-scrollbar">
        {messages.map((m, i) => (
          <MessageItem key={i} message={m} />
        ))}
        {loading && <ThinkingBubble />}
        <div ref={bottomRef} />
      </div>

      {/* Error message - fixed height if shown */}
      {errorMsg && (
        <div className="mx-2 sm:flex-shrink-0 mx-4 mt-2 p-2 text-red-500 bg-red-50 border border-red-200 rounded-md text-xs sm:text-sm text-center">
          {errorMsg}
        </div>
      )}

      {/* Input + Button - fixed at bottom, never scrolls */}
      <div className="p-2 sm:p-3 md:flex-shrink-0 p-4 bg-white border-t border-gray-200 w-full">
        <form onSubmit={sendMessage}>
          <Space.Compact className="w-full" size="small">
            <Input
              onPressEnter={handlePressEnter}
              ref={inputRef as any}
              className="text-sm sm:text-base py-1 sm:py-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              size="middle"
              placeholder="Nhập tin nhắn..."
            />
            <Button
              className="w-[60px] sm:w-[80px] text-xs sm:text-sm"
              type="primary"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              icon={<SendOutlined />}
              size="middle"
            >
              <span className="hidden sm:inline">Gửi</span>
            </Button>
          </Space.Compact>
        </form>
      </div>
    </div>
  );
}