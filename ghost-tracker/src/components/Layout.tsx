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
    <div className="flex h-screen bg-bg overflow-hidden">
      {scan.isScanning && <ScanOverlay scan={scan} />}
      <Sidebar onRefresh={onRefresh} isScanning={scan.isScanning} />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
