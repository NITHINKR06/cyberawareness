import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TimeMachinePage from '../pages/TimeMachinePage';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

function TimeMachineRoute() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <div className="min-h-screen">
          <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
                <p className="text-white text-lg">Loading Time Machine...</p>
              </div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<TimeMachinePage />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </I18nextProvider>
  );
}

export default TimeMachineRoute;
