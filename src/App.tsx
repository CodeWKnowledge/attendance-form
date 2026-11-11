import { lazy, Suspense } from 'react';
import AttendancePage from '@/pages/AttendancePage';

const AdminPage = lazy(() => import('@/pages/AdminPage'));

function App() {
  if (window.location.pathname.replace(/\/+$/, '') === '/admin') {
    return (
      <Suspense fallback={null}>
        <AdminPage />
      </Suspense>
    );
  }
  return <AttendancePage />;
}

export default App;
