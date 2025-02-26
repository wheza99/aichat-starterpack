'use client';

import { useState, useRef, useEffect } from 'react';
import { BsArrowUpCircle } from 'react-icons/bs';
import { BiLike, BiDislike } from 'react-icons/bi';
import { IoRefreshOutline } from 'react-icons/io5';
import { RiShareLine } from 'react-icons/ri';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import Link from 'next/link';

interface Message {
  text: string;
  isUser: boolean;
  isLoading?: boolean;
}

export default function Home() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const currentMessage = message;
    setMessage(''); // Clear message immediately
    setMessages(prev => [...prev, { text: currentMessage, isUser: true }]);
    setIsLoading(true);

    try {
      // Show loading message
      setMessages(prev => [...prev, { text: "", isUser: false, isLoading: true }]);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      // Replace loading message with actual response
      setMessages(prev => prev.slice(0, -1).concat({ text: data.response, isUser: false }));
    } catch (error) {
      console.error('Error sending message:', error);
      // Replace loading message with error
      setMessages(prev => prev.slice(0, -1).concat({ 
        text: "I apologize, but I encountered an error processing your request. Please try again.",
        isUser: false 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1E1E1E] text-white">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-[#2A2A2A] border-b border-[#3A3A3A] flex items-center justify-between px-4 z-10">
        <Link 
          href="https://wheza.id" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-lg font-medium hover:text-blue-400 transition-colors"
        >
          Wheza
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="https://www.linkedin.com/in/wheza/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#0A66C2] transition-colors"
          >
            <FaLinkedin className="w-6 h-6" />
          </Link>
          <Link
            href="https://github.com/wheza99"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaGithub className="w-6 h-6" />
          </Link>
        </div>
      </div>

      <div className="absolute inset-0 overflow-y-auto pt-12">
        {messages.length === 0 ? (
          <div className="h-screen flex flex-col items-center justify-center px-4">
            <div className="text-center -mt-32">
              <h1 className="text-5xl mb-3 font-light">Good morning, Wheza</h1>
              <h2 className="text-2xl text-gray-400 font-light">How can I help you today?</h2>
            </div>
          </div>
        ) : (
          <div className="min-h-screen pt-20 px-4 pb-32">
            <div className="w-full max-w-3xl mx-auto">
              {messages.map((msg, index) => (
                <div key={index} className={`mb-8 ${msg.isUser ? 'bg-[#2A2A2A]' : 'bg-[#2A2A2A]'} rounded-xl p-6`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.isUser ? 'bg-blue-500' : 'bg-[#3A3A3A]'}`}>
                      {msg.isUser ? 'U' : '★'}
                    </div>
                    <div className="flex-1">
                      {msg.isLoading ? (
                        <div className="flex h-8 items-center gap-2">
                          <div className="h-2 w-2 bg-blue-500 rounded-full animate-[bounce_1s_infinite] [animation-delay:-0.3s] relative top-[0px] hover:top-[-8px] transition-all"></div>
                          <div className="h-2 w-2 bg-blue-500 rounded-full animate-[bounce_1s_infinite] [animation-delay:-0.15s] relative top-[0px] hover:top-[-8px] transition-all"></div>
                          <div className="h-2 w-2 bg-blue-500 rounded-full animate-[bounce_1s_infinite] relative top-[0px] hover:top-[-8px] transition-all"></div>
                        </div>
                      ) : (
                        <p className="text-gray-200 whitespace-pre-wrap">{msg.text}</p>
                      )}
                      {!msg.isUser && !msg.isLoading && (
                        <div className="flex items-center gap-4 mt-4 text-gray-400">
                          <button className="hover:text-white"><BiLike className="h-5 w-5" /></button>
                          <button className="hover:text-white"><BiDislike className="h-5 w-5" /></button>
                          <button className="hover:text-white"><IoRefreshOutline className="h-5 w-5" /></button>
                          <button className="hover:text-white"><RiShareLine className="h-5 w-5" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-4 w-full px-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="relative bg-[#2A2A2A] rounded-xl p-4">
              <div className="relative flex">
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (message.trim() && !isLoading) {
                          setMessage(''); // Clear message immediately
                          const form = e.currentTarget.form;
                          if (form) {
                            form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                          }
                        }
                      }
                    }}
                    placeholder="What do you want to know?"
                    className="w-full bg-transparent outline-none text-lg placeholder-gray-500 resize-none overflow-y-auto max-h-[120px] min-h-[24px] leading-6 align-top scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
                    disabled={isLoading}
                    rows={1}
                    style={{ height: 'auto' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                    }}
                  />
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    type="submit"
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={isLoading || !message.trim()}
                  >
                    <BsArrowUpCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <select 
                  className="bg-[#3A3A3A] px-4 py-2 pr-8 rounded-lg hover:bg-[#4A4A4A] transition-colors text-gray-300 text-sm appearance-none"
                  disabled={isLoading}
                >
                  <option>Gemini 2.0 Flash Lite</option>
                </select>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
