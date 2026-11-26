import React, { useState } from 'react';
import { TopNavbar } from './components/TopNavbar';
import { Sidebar } from './components/Sidebar';
import { BisectionPage } from './pages/BisectionPage';
import { FalsePositionPage } from './pages/FalsePositionPage';
import { SecantPage } from './pages/SecantPage';
import { NewtonRaphsonPage } from './pages/NewtonRaphsonPage';
import { TrapezoidalPage } from './pages/TrapezoidalPage';
import { Simpson13Page } from './pages/Simpson13Page';
import { Simpson18Page } from './pages/Simpson18Page';
import { Simpson38Page } from './pages/Simpson38Page';
import { InterpolationPage } from './pages/InterpolationPage';
import { LeastSquaresPage } from './pages/LeastSquaresPage';
import { GoldenUnivariatePage } from './pages/GoldenUnivariatePage';
import { GoldenMultivariatePage } from './pages/GoldenMultivariatePage';
import { HistoryPage } from './pages/HistoryPage';
import { GuidePage } from './pages/GuidePage';

export function App() {
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'history' | 'guide'
  const [currentMethodId, setCurrentMethodId] = useState('bisection');
  const [isDark, setIsDark] = useState(true);
  const [history, setHistory] = useState([
    {
      method: 'Bisección',
      expr: 'sin(x) - x/2',
      result: 'Raíz: 0.000000',
      iterations: 35,
      date: '10:45 AM'
    },
    {
      method: 'Regla del Trapecio',
      expr: 'x^2 * exp(-x)',
      result: 'Integral: 1.834190',
      iterations: 10,
      date: '10:52 AM'
    }
  ]);

  const handleSaveToHistory = (entry) => {
    setHistory((prev) => [entry, ...prev]);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  // Renderizar la subpágina independiente según el método activo
  const renderMethodSubpage = () => {
    switch (currentMethodId) {
      // A. Raíces
      case 'bisection':
        return <BisectionPage onSaveToHistory={handleSaveToHistory} />;
      case 'false_position':
        return <FalsePositionPage onSaveToHistory={handleSaveToHistory} />;
      case 'secant':
        return <SecantPage onSaveToHistory={handleSaveToHistory} />;
      case 'newton_raphson':
        return <NewtonRaphsonPage onSaveToHistory={handleSaveToHistory} />;

      // B. Integración
      case 'trapezoidal':
        return <TrapezoidalPage onSaveToHistory={handleSaveToHistory} />;
      case 'simpson_13':
        return <Simpson13Page onSaveToHistory={handleSaveToHistory} />;
      case 'simpson_18':
        return <Simpson18Page onSaveToHistory={handleSaveToHistory} />;
      case 'simpson_38':
        return <Simpson38Page onSaveToHistory={handleSaveToHistory} />;

      // C. Interpolación y Regresión
      case 'interpolation_direct':
        return <InterpolationPage onSaveToHistory={handleSaveToHistory} />;
      case 'least_squares':
        return <LeastSquaresPage onSaveToHistory={handleSaveToHistory} />;

      // D. Optimización
      case 'golden_univariate':
        return <GoldenUnivariatePage onSaveToHistory={handleSaveToHistory} />;
      case 'golden_multivariate':
        return <GoldenMultivariatePage onSaveToHistory={handleSaveToHistory} />;

      default:
        return <BisectionPage onSaveToHistory={handleSaveToHistory} />;
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#070B18] text-[#F8FAFC]' : 'bg-slate-900 text-white'}`}>
      {/* Barra superior con navegación de plataforma */}
      <TopNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      <div className="flex w-full">
        {/* Menú de navegación lateral por categorías y métodos */}
        {activeTab === 'calculator' && (
          <Sidebar
            currentMethodId={currentMethodId}
            onSelectMethod={setCurrentMethodId}
          />
        )}

        {/* Contenedor principal de la aplicación */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {activeTab === 'calculator' && renderMethodSubpage()}
          {activeTab === 'history' && (
            <HistoryPage
              history={history}
              onClear={handleClearHistory}
              onSelectEntry={(entry) => {
                // Navegar a la calculadora si el usuario lo desea
                setActiveTab('calculator');
              }}
            />
          )}
          {activeTab === 'guide' && <GuidePage onSelectMethod={(id) => {
            setCurrentMethodId(id);
            setActiveTab('calculator');
          }} />}
        </main>
      </div>
    </div>
  );
}

export default App;
