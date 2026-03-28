import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ScanOverlay } from './ScanOverlay';
import type { ScanState } from '../types';

interface Props {
  onRefresh: () => void;
  scan: ScanState;
}

export function Layout({ onRefresh, scan }: Props) {
  return (
    <div className="min-h-screen bg-bg md:flex md:h-screen md:overflow-hidden">
      {scan.isScanning && <ScanOverlay scan={scan} />}
      <Sidebar onRefresh={onRefresh} isScanning={scan.isScanning} />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
