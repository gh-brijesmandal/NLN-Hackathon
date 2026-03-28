import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './hooks/useStore';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { RejectionParser } from './pages/RejectionParser';
import { Heatmap } from './pages/Heatmap';
import { Tracker } from './pages/Tracker';
import { Settings } from './pages/Settings';
import { PageNotFoundError } from './pages/PageNotFoundError';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/parser" element={<RejectionParser />} />
            <Route path="/heatmap" element={<Heatmap />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<PageNotFoundError />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
