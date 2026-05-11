import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Toast from './Toast';
import { DataProvider } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

export default function Layout() {
  const { toast, hideToast } = useToast();

  return (
    <DataProvider>
      <Sidebar />
      <main
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 28,
          background: '#f4f5f7',
        }}
      >
        <Outlet />
      </main>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={hideToast} />}
    </DataProvider>
  );
}
