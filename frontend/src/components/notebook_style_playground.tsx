import React, { useState } from 'react';
import { 
  Plus, Globe, Zap, FileText, ArrowRight, Play, Presentation, 
  Video, BrainCircuit, FileSpreadsheet, BookOpen, MessageSquareText, 
  BarChart3, Settings, ChevronDown 
} from 'lucide-react';

const studioItems = [
  { icon: Play, label: 'Audio Overview', beta: false },
  { icon: Presentation, label: 'Slide Deck', beta: true },
  { icon: Video, label: 'Video Overview', beta: false },
  { icon: BrainCircuit, label: 'Mind Map', beta: false },
  { icon: FileSpreadsheet, label: 'Reports', beta: false },
  { icon: BookOpen, label: 'Flashcards', beta: false },
  { icon: MessageSquareText, label: 'Quiz', beta: false },
  { icon: BarChart3, label: 'Infographic', beta: true },
  { icon: FileText, label: 'Data Table', beta: false },
];

const availableModels = [
  { id: 'llama-3-8b', name: 'Llama 3 8B (Free)' },
  { id: 'mistral-7b', name: 'Mistral 7B (Free)' },
  { id: 'gemma-2', name: 'Gemma 2 9B (Free)' },
];

export default function PlaygroundWorkspace() {
  const [theme, setTheme] = useState('dark');
  const [selectedModel, setSelectedModel] = useState(availableModels[0].id);

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="h-screen w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 p-2">
        
        {/* Main Workspace */}
        <main className="flex h-full w-full gap-2">
          
          {/* Left: Sources */}
          <div className="w-72 bg-white dark:bg-gray-900 rounded-xl p-4 flex flex-col border border-gray-200 dark:border-gray-800 shrink-0 shadow-sm">
            <h2 className="font-semibold mb-4">Sources</h2>
            <button className="w-full py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 mb-4 transition">
              + Add sources
            </button>
            <div className="bg-gray-100 dark:bg-gray-950 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
              <div className="flex gap-2 text-xs">
                <button className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                  <Globe className="w-3 h-3" /> Web
                </button>
                <button className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                  <Zap className="w-3 h-3" /> Fast Research
                </button>
              </div>
            </div>
          </div>

          {/* Center: Chat */}
          <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl flex flex-col border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">Untitled notebook</h2>
                <p className="text-sm text-gray-500">0 sources • July 16, 2026</p>
              </div>
              
              {/* Model Selector */}
              <div className="relative">
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="appearance-none bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg pl-3 pr-8 py-2 text-xs font-medium outline-none cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  {availableModels.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-3 pointer-events-none text-gray-500" />
              </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
              Notebook area for RAG output
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex items-center gap-2 border border-gray-200 dark:border-gray-700">
                <input 
                  placeholder="Start typing..." 
                  className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500 dark:placeholder-gray-600" 
                />
                <span className="text-xs text-gray-500">0 sources</span>
                <button className="p-1.5 bg-white dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Studio */}
          <div className="w-80 bg-white dark:bg-gray-900 rounded-xl p-4 flex flex-col border border-gray-200 dark:border-gray-800 gap-4 shrink-0 shadow-sm">
            <h2 className="font-semibold">Studio</h2>
            <div className="grid grid-cols-3 gap-2">
              {studioItems.map((item, i) => (
                <button key={i} className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 text-center gap-2">
                  <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  <span className="text-[10px] leading-tight font-medium">{item.label}</span>
                  {item.beta && <span className="text-[8px] bg-blue-500 text-white px-1 rounded">BETA</span>}
                </button>
              ))}
            </div>
            <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-500">
              <p>Studio output will be saved here.</p>
              <button className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                <Plus className="w-4 h-4" /> Add note
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}