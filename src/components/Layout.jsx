import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Toast from './Toast';
import { DataProvider } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

export default function Layout() {
  const { toast, hideToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DataProvider>
      <div className="app-shell">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div
          className={'sidebar-backdrop' + (sidebarOpen ? ' show' : '')}
          onClick={() => setSidebarOpen(false)}
        />
        <div className="content-col">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />
          <main className="page-main">
            <Outlet />
          </main>
        </div>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={hideToast} />}
    </DataProvider>
  );
}
