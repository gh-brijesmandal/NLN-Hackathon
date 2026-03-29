import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { ScanOverlay } from './ScanOverlay';
import type { ScanState } from '../types';

interface Props {
  onRefresh: () => void;
  scan: ScanState;
  scanError?: string | null;
}

export function Layout({ onRefresh, scan, scanError = null }: Props) {
  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {scan.isScanning && <ScanOverlay scan={scan} />}
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar onRefresh={onRefresh} isScanning={scan.isScanning} />
      </div>
      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {scanError && (
          <div className="mx-4 mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300 font-mono">
            {scanError}
          </div>
        )}
        <Outlet />
      </main>
      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40">
        <MobileNav onRefresh={onRefresh} isScanning={scan.isScanning} />
      </div>
    </div>
  );
}
