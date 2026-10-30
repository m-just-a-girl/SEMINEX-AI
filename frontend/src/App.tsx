import React, { useState, useEffect } from 'react';
import { Sidebar, PageId } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { fetchSystemStatus } from './api/client';
import { SystemStatus, InspectionResult } from './types';

// 19 Pages
import { DashboardPage } from './pages/DashboardPage';
import { InspectionPage } from './pages/InspectionPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { ExplainableAIPage } from './pages/ExplainableAIPage';
import { RootCausePage } from './pages/RootCausePage';
import { PredictiveQualityPage } from './pages/PredictiveQualityPage';
import { BatchAnalyticsPage } from './pages/BatchAnalyticsPage';
import { DecisionSupportPage } from './pages/DecisionSupportPage';
import { HumanReviewPage } from './pages/HumanReviewPage';
import { CopilotPage } from './pages/CopilotPage';
import { HistoryPage } from './pages/HistoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { SyntheticLabPage } from './pages/SyntheticLabPage';
import { JudgeModePage } from './pages/JudgeModePage';
import { ModelDatasetPage } from './pages/ModelDatasetPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<InspectionResult | null>(null);

  useEffect(() => {
    async function loadStatus() {
      try {
        const s = await fetchSystemStatus();
        setSystemStatus(s);
      } catch (err) {
        console.error('Failed to load system status:', err);
      }
    }
    loadStatus();
    const interval = setInterval(loadStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (pageId: PageId, param?: any) => {
    setCurrentPage(pageId);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
    if (pageId === 'inspection' && typeof param === 'string') {
      setSelectedInspectionId(param);
    } else if (typeof param === 'object' && param !== null) {
      setSelectedResult(param);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardPage
            onStartInspection={() => setCurrentPage('inspection')}
            onSelectInspection={(id) => handleNavigate('inspection', id)}
            onNavigate={handleNavigate}
          />
        );
      case 'inspection':
        return (
          <InspectionPage
            initialInspectionId={selectedInspectionId}
            onNavigate={handleNavigate}
          />
        );
      case 'comparison':
        return <ComparisonPage />;
      case 'intelligence':
        return <IntelligencePage />;
      case 'explainable':
        return <ExplainableAIPage initialResult={selectedResult} />;
      case 'rootcause':
        return <RootCausePage initialResult={selectedResult} />;
      case 'predictive':
        return <PredictiveQualityPage />;
      case 'batch':
        return <BatchAnalyticsPage />;
      case 'decision':
        return <DecisionSupportPage initialResult={selectedResult} />;
      case 'review':
        return <HumanReviewPage />;
      case 'copilot':
        return <CopilotPage />;
      case 'history':
        return (
          <HistoryPage
            onSelectInspection={(id) => handleNavigate('inspection', id)}
          />
        );
      case 'reports':
        return <ReportsPage initialInspectionId={selectedInspectionId} />;
      case 'twin':
        return <DigitalTwinPage />;
      case 'synthetic':
        return <SyntheticLabPage />;
      case 'judge':
        return <JudgeModePage onNavigate={handleNavigate} />;
      case 'model':
        return <ModelDatasetPage />;
      case 'settings':
        return <SettingsPage />;
      case 'about':
        return <AboutPage />;
      default:
        return (
          <DashboardPage
            onStartInspection={() => setCurrentPage('inspection')}
            onSelectInspection={(id) => handleNavigate('inspection', id)}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex">
      {/* Mobile Backdrop */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={(p) => handleNavigate(p)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'ml-0 md:ml-20' : 'ml-0 md:ml-72'
        }`}
      >
        <TopNav
          status={systemStatus}
          onStartInspection={() => handleNavigate('inspection')}
          onOpenCopilot={() => handleNavigate('copilot')}
          onToggleSidebarMobile={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 min-w-0 max-w-7xl w-full mx-auto p-4 md:p-8 pb-16 overflow-x-hidden">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};
