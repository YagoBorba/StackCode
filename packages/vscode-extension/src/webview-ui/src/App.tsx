import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ProjectView from './components/ProjectView';
import StatusBar from './components/StatusBar';
import NotificationPanel from './components/NotificationPanel';
import CommandPalette from './components/CommandPalette';

// Mock VSCode API for development
const mockVSCode = {
  postMessage: (message: { type: string; payload?: unknown }) => {
    console.log('VSCode message:', message);
  }
};

// Tipagem para a API do VS Code, uma boa prática.
interface VsCodeApi {
  postMessage(message: { type: string; payload?: unknown }): void;
}

// Declaração global para que o TypeScript conheça a função do VS Code.
declare global {
  interface Window {
    acquireVsCodeApi(): VsCodeApi;
  }
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'tip';
  title: string;
  message: string;
  actions?: Array<{
    label: string;
    action: string;
    primary?: boolean;
  }>;
  timestamp: Date;
  dismissed?: boolean;
}

// Estado inicial para as estatísticas que receberemos.
const initialStats = {
  files: 0,
};

function App() {
  const [currentView] = useState<'dashboard' | 'project'>('dashboard');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'tip',
      title: 'Welcome to StackCode!',
      message: 'Get started by initializing your project or exploring the dashboard.',
      actions: [
        { label: 'Initialize', action: 'stackcode.init', primary: true },
        { label: 'Learn More', action: 'stackcode.config' }
      ],
      timestamp: new Date()
    }
  ]);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [hasChanges, setHasChanges] = useState(false);
  const [lastAction, setLastAction] = useState('Ready');
  const [, setStats] = useState(initialStats);
  const [isReady, setIsReady] = useState(false);
  const [vscode] = useState(() => {
    return typeof window !== 'undefined' && 'acquireVsCodeApi' in window 
      ? (window as { acquireVsCodeApi: () => VsCodeApi }).acquireVsCodeApi() 
      : mockVSCode;
  });

  useEffect(() => {
    // Listen for keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Listener para mensagens vindas da extensão (o "backend").
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      console.log('Message received from extension:', message);

      switch (message.type) {
        case 'updateStats':
          setStats(prevStats => ({ ...prevStats, ...message.payload }));
          break;
        case 'updateBranch':
          setCurrentBranch(message.payload?.branch || 'main');
          break;
        case 'updateChanges':
          setHasChanges(message.payload?.hasChanges || false);
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    // Informa à extensão que a UI está pronta para receber dados.
    vscode.postMessage({ type: 'webviewReady' });
    setIsReady(true);

    // Função de limpeza para remover o listener.
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [vscode]);

  const handleCommand = (command: string) => {
    console.log('Executing command:', command);
    setLastAction(`Executed: ${command}`);
    
    // Send message to VSCode
    vscode.postMessage({ type: command });

    // Add success notification
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: 'success',
      title: 'Command Executed',
      message: `Successfully executed: ${command}`,
      timestamp: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleNotificationDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationAction = (action: string) => {
    handleCommand(action);
  };

  const handleQuickAction = (action: string) => {
    handleCommand(action);
  };

  if (!isReady) {
    return (
      <div className="bg-slate-900 text-white h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Initializing StackCode Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Project View */}
        <div className="w-80 border-r border-slate-700 flex-shrink-0">
          <ProjectView onCommand={handleCommand} />
        </div>

        {/* Main Panel */}
        <div className="flex-1 overflow-auto">
          {currentView === 'dashboard' ? (
            <Dashboard vscode={vscode} />
          ) : (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Project View</h1>
              <p className="text-slate-400">Project details and management tools will be displayed here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        currentBranch={currentBranch}
        hasChanges={hasChanges}
        lastAction={lastAction}
        onQuickAction={handleQuickAction}
      />

      {/* Notifications */}
      <NotificationPanel
        notifications={notifications}
        onDismiss={handleNotificationDismiss}
        onAction={handleNotificationAction}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onCommand={handleCommand}
      />
    </div>
  );
}

export default App;