import React, { useState, useCallback } from 'react';
import { ChatMessage, PdfChunk } from './types.ts';
import { processPdf } from './services/pdfProcessor.ts';
import { askQuestion } from './services/geminiService.ts';
import FileUpload from './components/FileUpload.tsx';
import ChatInterface from './components/ChatInterface.tsx';
import Sidebar from './components/Sidebar.tsx';
import PracticeQuestions from './components/PracticeQuestions.tsx';
import Glossary from './components/Glossary.tsx';
import Flashcards from './components/Flashcards.tsx';
import MindMap from './components/MindMap.tsx';
import { SendIcon } from './components/icons.tsx';

export type AppMode = 'qa' | 'practice' | 'glossary' | 'flashcards' | 'mindmap';

const App: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTextChunks, setPdfTextChunks] = useState<PdfChunk[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AppMode>('qa');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [input, setInput] = useState('');

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;
    setIsLoadingPdf(true);
    setError(null);
    setPdfFile(null);
    setPdfTextChunks([]);
    setMessages([]);
    setMode('qa');

    try {
      const chunks = await processPdf(file);
      setPdfTextChunks(chunks);
      setPdfFile(file);
      setMessages([
        {
          role: 'model',
          content: `Successfully processed "${file.name}". I'm ready to answer your questions about it.`,
        },
      ]);
    } catch (err) {
      setError('Failed to process the PDF. Please try another file.');
      console.error(err);
    } finally {
      setIsLoadingPdf(false);
    }
  }, []);
  
  const handleSendMessage = useCallback(async (question: string) => {
    if (!question.trim() || isAnswering || pdfTextChunks.length === 0) return;

    const userMessage: ChatMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setIsAnswering(true);
    setError(null);

    try {
      const context = pdfTextChunks
        .map(chunk => `Page ${chunk.pageNumber}:\n${chunk.content}`)
        .join('\n\n---\n\n');
        
      const response = await askQuestion(question, context, messages);

      const modelMessage: ChatMessage = {
        role: 'model',
        content: response.answer,
        source: response.source ? {
          pageNumber: response.pageNumber,
          content: response.source,
        } : undefined,
      };
      setMessages(prev => [...prev, modelMessage]);

    } catch (err) {
      const errorMessage = 'Sorry, I encountered an error while trying to answer. Please try again.';
      setError(errorMessage);
      setMessages(prev => [...prev, { role: 'model', content: errorMessage, isError: true }]);
      console.error(err);
    } finally {
      setIsAnswering(false);
    }
  }, [isAnswering, pdfTextChunks, messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleSendMessage(input);
      setInput('');
    }
  };
  
  const handleReset = () => {
    setPdfFile(null);
    setPdfTextChunks([]);
    setMessages([]);
    setError(null);
    setMode('qa');
  };

  const renderContent = () => {
    switch (mode) {
      case 'qa':
        return (
          <ChatInterface 
            messages={messages}
            isAnswering={isAnswering}
            fileName={pdfFile?.name || ''}
          />
        );
      case 'practice':
        return <PracticeQuestions pdfTextChunks={pdfTextChunks} messages={messages} setMode={setMode} />;
      case 'glossary':
        return <Glossary pdfTextChunks={pdfTextChunks} setMode={setMode} />;
      case 'flashcards':
        return <Flashcards pdfTextChunks={pdfTextChunks} messages={messages} setMode={setMode} />;
      case 'mindmap':
        return <MindMap pdfTextChunks={pdfTextChunks} setMode={setMode} />;
      default:
        return null;
    }
  };

  return (
    <div className="text-[#2C2C2C] h-screen font-sans flex flex-col overflow-hidden bg-white">
      <header className="bg-white p-4 flex justify-between items-center w-full flex-shrink-0 z-10 border-b border-gray-200">
        <h1 className="text-xl font-bold text-[#2C2C2C]">PrepPal</h1>
        {pdfFile && (
           <button 
             onClick={handleReset} 
             className="bg-[#008080] hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
           >
             Upload New PDF
           </button>
        )}
      </header>

      <div className="flex flex-grow overflow-hidden">
        <Sidebar 
          currentMode={mode} 
          setMode={setMode} 
          isPdfLoaded={!!pdfFile}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
        
        <div className="flex-grow flex flex-col bg-[#FAFAFA]">
          <main className="flex-grow p-4 overflow-y-auto">
            {!pdfFile && mode !== 'qa' ? (
                <div className="h-full flex flex-col">
                   <div className="flex-grow overflow-hidden">
                     {renderContent()}
                   </div>
                </div>
            ) : !pdfFile ? (
              <div className="flex h-full flex-col items-center justify-center">
                {error && <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-md mb-4 max-w-2xl w-full">{error}</div>}
                <FileUpload onFileUpload={handleFileUpload} isLoading={isLoadingPdf} />
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {error && <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-md mb-4 flex-shrink-0">{error}</div>}
                <div className="flex-grow overflow-hidden">
                  {renderContent()}
                </div>
              </div>
            )}
          </main>

          {pdfFile && mode === 'qa' && (
            <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="flex items-center space-x-4 max-w-4xl mx-auto">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about the textbook..."
                  className="flex-grow bg-white border border-gray-300 text-[#2C2C2C] placeholder-gray-500/60 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080] transition"
                  disabled={isAnswering}
                />
                <button
                  type="submit"
                  disabled={isAnswering || !input.trim()}
                  className="bg-[#008080] text-white rounded-lg p-3 disabled:bg-teal-300 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors duration-200 flex-shrink-0"
                  aria-label="Send message"
                >
                  <SendIcon className="w-6 h-6" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
