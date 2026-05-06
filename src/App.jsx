import {
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
} from 'react-router-dom';
import { useEffect, useState } from 'react';

import { useAuth } from './context/useAuth';
import Login from './pages/Login';
import WardList from './pages/ward/WardList';
import WardForm from './pages/ward/WardForm';
import BedList from './pages/bed/BedList';
import BedForm from './pages/bed/BedForm';
import BedTypeList from './pages/bedType/BedTypeList';
import BedTypeForm from './pages/bedType/BedTypeForm';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('bearer_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Layout({ pageTitle, children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isSidebarOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  const handleLogout = () => {
    setIsSidebarOpen(false);
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex min-h-11 items-center gap-3 border-l-4 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-300 ${
      isActive
        ? 'bg-slate-700 border-blue-400 text-white'
        : 'border-transparent text-slate-200 hover:bg-slate-700 hover:text-white'
    }`;

  const sidebarContent = (
    <>
      <div className="flex items-start justify-between gap-3 border-b border-slate-700 px-4 py-5">
        <div>
          <h1 className="text-xl font-bold">Medicare IPD</h1>
          <p className="mt-1 text-xs text-slate-300">Ward & Bed Management</p>
        </div>

        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsSidebarOpen(false)}
          className="rounded-md p-2 text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 lg:hidden"
        >
          X
        </button>
      </div>

      <nav className="mt-4 flex flex-col" aria-label="Primary navigation">
        <NavLink
          to="/ward"
          className={linkClass}
          onClick={() => setIsSidebarOpen(false)}
        >
          <span>Ward Management</span>
        </NavLink>

        <NavLink
          to="/bed"
          className={linkClass}
          onClick={() => setIsSidebarOpen(false)}
        >
          <span>Bed Management</span>
        </NavLink>

        <NavLink
          to="/bed-type"
          className={linkClass}
          onClick={() => setIsSidebarOpen(false)}
        >
          <span>Bed Types</span>
        </NavLink>
      </nav>
    </>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[240px] bg-slate-800 text-white lg:block">
        {sidebarContent}
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/40"
          />
          <aside className="relative h-full w-[min(82vw,280px)] bg-slate-800 text-white shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-[240px]">
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white px-4 py-3 shadow-sm sm:px-5 lg:px-6 lg:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation menu"
                aria-expanded={isSidebarOpen}
                onClick={() => setIsSidebarOpen(true)}
                className="inline-flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-1.5 rounded-md border border-gray-200 text-slate-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
              >
                <span className="h-0.5 w-5 rounded bg-current" />
                <span className="h-0.5 w-5 rounded bg-current" />
                <span className="h-0.5 w-5 rounded bg-current" />
              </button>

              <h2 className="min-w-0 truncate text-lg font-semibold text-gray-800 sm:text-xl">
                {pageTitle}
              </h2>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <div className="min-w-0 text-xs text-gray-600 sm:text-sm">
                <p className="truncate font-medium text-gray-800">Medicare User</p>
                <p className="truncate">Authenticated Session</p>
              </div>

              <button
                onClick={handleLogout}
                className="min-h-11 shrink-0 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 bg-gray-50 p-4 sm:p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/ward"
        element={
          <ProtectedRoute>
            <Layout pageTitle="Ward Management">
              <WardList />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/ward/add"
        element={
          <ProtectedRoute>
            <Layout pageTitle="Add Ward">
              <WardForm />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/ward/:id"
        element={
          <ProtectedRoute>
            <Layout pageTitle="Edit Ward">
              <WardForm />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/bed"
        element={
          <ProtectedRoute>
            <Layout pageTitle="Bed Management">
              <BedList />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/bed/add"
        element={
          <ProtectedRoute>
            <Layout pageTitle="Add Bed">
              <BedForm />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/bed/:id"
        element={
          <ProtectedRoute>
            <Layout pageTitle="Edit Bed">
              <BedForm />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/bed-type"
        element={
          <ProtectedRoute>
            <Layout pageTitle="Bed Type Management">
              <BedTypeList />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/bed-type/add"
        element={
          <ProtectedRoute>
            <Layout pageTitle="Add Bed Type">
              <BedTypeForm />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/bed-type/:id"
        element={
          <ProtectedRoute>
            <Layout pageTitle="Edit Bed Type">
              <BedTypeForm />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
