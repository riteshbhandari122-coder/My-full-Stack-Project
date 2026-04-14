import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';

const botReplies = {
  'hello': 'Hi there! 👋 Welcome to ShopMart! How can I help you?',
  'hi': 'Hello! 😊 How can I assist you today?',
  'order': 'You can track your order in My Orders section. Need help with a specific order?',
  'delivery': '🚚 We deliver across Nepal! Standard delivery takes 3-5 business days.',
  'return': '↩️ We have a 30-day return policy. Visit My Orders to initiate a return.',
  'payment': '💳 We accept eSewa, Khalti, Credit/Debit Cards and Cash on Delivery.',
  'discount': '🎁 Use code SAVE10 for 10% off! Also try our Spin the Wheel for more coupons!',
  'help': 'I can help you with orders, delivery, returns, and payments. What do you need?',
  'default': 'Thanks for your message! Our team will get back to you soon. You can also WhatsApp us at +977-9800000000 😊',
};

const getBotReply = (message) => {
  const lower = message.toLowerCase();
  for (const [key, reply] of Object.entries(botReplies)) {
    if (lower.includes(key)) return reply;
  }
  return botReplies.default;
};

const LiveChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      text: 'Hi! 👋 Welcome to ShopMart support! How can I help you today?',
      time: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(1);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      scrollToBottom();
    }
  }, [open, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      from: 'user',
      text: input,
      time: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const reply = getBotReply(input);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        from: 'bot',
        text: reply,
        time: new Date(),
      }]);
      setTyping(false);
      if (!open) setUnread(prev => prev + 1);
    }, 1000 + Math.random() * 1000);
  };

  const quickReplies = ['Track Order', 'Return Policy', 'Payment Options', 'Discount Codes'];

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
              <FiX size={24} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }}>
              <FiMessageCircle size={24} />
            </motion.div>
          )}
        </AnimatePresence>
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-36 right-4 md:bottom-24 md:right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                🛍️
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">ShopMart Support</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-white/70 text-xs">Online · Typically replies instantly</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
                <FiX size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.from === 'bot' && (
                    <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
                      🤖
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                      msg.from === 'user'
                        ? 'bg-primary-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-sm">🤖</div>
                  <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-sm shadow-sm flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-3 py-2 flex gap-2 overflow-x-auto scrollbar-hide border-t border-gray-100">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => {
                    setInput(reply);
                    setTimeout(() => sendMessage(), 100);
                  }}
                  className="whitespace-nowrap text-xs bg-gray-100 hover:bg-primary-50 hover:text-primary-600 text-gray-600 px-3 py-1.5 rounded-full transition-colors flex-shrink-0"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary-400"
              />
              <button
                onClick={sendMessage}
                className="w-9 h-9 bg-primary-500 text-white rounded-xl flex items-center justify-center hover:bg-primary-600 transition-colors flex-shrink-0"
              >
                <FiSend size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveChat;