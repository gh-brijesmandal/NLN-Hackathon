import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { ScanOverlay } from './ScanOverlay';
import type { ScanState } from '../types';

interface Props {
  onRefresh: () => void;
  scan: ScanState;
}

export function Layout({ onRefresh, scan }: Props) {
  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {scan.isScanning && <ScanOverlay scan={scan} />}
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar onRefresh={onRefresh} isScanning={scan.isScanning} />
      </div>
      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>
      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40">
        <MobileNav onRefresh={onRefresh} isScanning={scan.isScanning} />
      </div>
    </div>
  );
}
