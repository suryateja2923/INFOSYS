import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { cn } from '@/lib/utils';

const DashboardLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Initialize AgentX Chatbot - Dashboard Only
  useEffect(() => {
    // Create chat bubble container
    const chatBubbleRoot = document.createElement('div');
    chatBubbleRoot.setAttribute('id', 'chatBubbleRoot');
    document.body.appendChild(chatBubbleRoot);

    // Set AgentX credentials
    (window as any).agx = '698a2150adfb07e4322f8b14DB3zn76SnuxyDvRzIQIdUA==|SXumI/A4zPRadJpcBuLNPrPQ9nR9nHNmlJp5z+xR3Ts=';

    // Load AgentX script
    const script = document.createElement('script');
    script.src = 'https://storage.googleapis.com/agentx-cdn-01/agentx-chat.js';
    script.defer = true;
    document.body.appendChild(script);

    // Cleanup: Remove AgentX when leaving dashboard
    return () => {
      const chatRoot = document.getElementById('chatBubbleRoot');
      if (chatRoot) chatRoot.remove();
      const agentScript = document.querySelector(
        'script[src="https://storage.googleapis.com/agentx-cdn-01/agentx-chat.js"]'
      );
      if (agentScript) agentScript.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <DashboardHeader sidebarCollapsed={sidebarCollapsed} />
      
      <main
        className={cn(
          'pt-20 pb-8 transition-all duration-300',
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        <div className="px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
