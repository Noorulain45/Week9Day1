"use client";
import { useState, useMemo } from 'react';
import axios from 'axios';
import { Search, Loader2, CheckCircle2, Terminal as TerminalIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResearchDashboard() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // --- INPUT VALIDATION LOGIC ---
  const validation = useMemo(() => {
    if (!question) return null;
    if (/^\d+$/.test(question)) return "Input cannot be only numbers.";
    if (question.length < 5) return "Question is too short.";
    if (question.length > 200) return "Question is too long (max 200 chars).";
    
    // Check for repetitive word spam (e.g., "sql sql sql sql")
    const words = question.toLowerCase().trim().split(/\s+/);
    const uniqueWords = new Set(words);
    if (words.length > 4 && uniqueWords.size / words.length < 0.4) {
      return "Please avoid repetitive word spam.";
    }
    
    return null;
  }, [question]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validation || !question.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post('http://localhost:3000/research/ask', { 
        question: question.trim() 
      });
      setResult(data);
    } catch (err) {
      setError("The research agents encountered an error. Please check your connection.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const cleanedAnswer = result?.finalAnswer || result?.answer || "No response generated.";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 md:p-8 font-sans selection:bg-indigo-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-10 text-center md:text-left">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 rounded-full">
            v2.0 Agentic Workflow
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Technical <span className="text-indigo-600">Research</span> Lab
          </h1>
          <p className="text-slate-500 mt-3 text-lg max-w-2xl">
            Deep-dive technical analysis powered by multi-agent synthesis and MongoDB documentation.
          </p>
        </header>

        {/* Search & Validation Area */}
        <div className="max-w-4xl mb-12">
          <form onSubmit={handleSearch} className="relative group">
            <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000`}></div>
            <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-1.5 transition-all focus-within:border-indigo-400 focus-within:shadow-md">
              <div className="pl-4 text-slate-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Compare SQL vs NoSQL or ask about API design..."
                className="w-full bg-transparent border-none py-4 px-4 text-slate-700 placeholder:text-slate-400 focus:ring-0 text-lg"
              />
              <button
                type="submit"
                disabled={!!validation || loading || !question}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-100"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Analyze"}
              </button>
            </div>
          </form>

          {/* Validation Tooltip */}
          <AnimatePresence>
            {(validation || error) && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 mt-3 px-4 text-sm font-medium text-rose-500"
              >
                <AlertCircle size={14} />
                {validation || error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-12 gap-6 md:gap-10">
          
          {/* Execution Trace (Left) */}
          <div className="col-span-12 lg:col-span-4 order-2 lg:order-1">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-slate-800">
                  <TerminalIcon size={18} className="text-indigo-500" />
                  <h2 className="font-bold text-sm uppercase tracking-widest">Agent Trace</h2>
                </div>
                {loading && <RefreshCw size={14} className="animate-spin text-slate-400" />}
              </div>

              <div className="space-y-4">
                {result?.trace?.length > 0 ? (
                  result.trace.map((step: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-3 text-xs leading-relaxed group"
                    >
                      <div className="w-1 h-auto bg-indigo-100 rounded-full group-last:bg-indigo-500 transition-colors" />
                      <span className="text-slate-600 font-medium">{step}</span>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                    <p className="text-xs text-slate-400 uppercase font-semibold">Waiting for input...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Synthesis Report (Right) */}
          <div className="col-span-12 lg:col-span-8 order-1 lg:order-2">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
                >
                  <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={24} />
                      <h3 className="text-xl font-bold">Research Findings</h3>
                    </div>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm font-medium">
                      Final Synthesis
                    </span>
                  </div>

                  <div className="p-8">
                    <div className="prose prose-slate max-w-none">
                      <div className="text-slate-700 leading-8 whitespace-pre-wrap font-medium text-md bg-slate-50 p-6 rounded-2xl border-l-4 border-indigo-500 mb-8">
                        {cleanedAnswer}
                      </div>
                    </div>

                    {/* Sources Section */}
                    <div className="mt-10 pt-6 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                        Validated Documentation
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result?.documents?.map((doc: any, i: number) => (
                          <div 
                            key={i}
                            className="flex items-center gap-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 px-4 py-2 rounded-xl text-sm text-slate-600 transition-colors cursor-default"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            {doc.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 border border-slate-100">
                    <TerminalIcon size={32} className="text-indigo-200" />
                  </div>
                  <h3 className="text-slate-400 font-medium">Enter a query to trigger agentic synthesis</h3>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}