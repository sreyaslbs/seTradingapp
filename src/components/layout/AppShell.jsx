import Header from './Header';
import BottomNav from './BottomNav';
import { Outlet } from 'react-router-dom';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-[#edf3fb] flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
