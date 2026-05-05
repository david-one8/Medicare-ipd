import {
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
} from 'react-router-dom';

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-l-4 ${
      isActive
        ? 'bg-slate-700 border-blue-400 text-white'
        : 'border-transparent text-slate-200 hover:bg-slate-700 hover:text-white'
    }`;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="fixed left-0 top-0 h-screen w-[220px] bg-slate-800 text-white">
        <div className="border-b border-slate-700 px-4 py-5">
          <h1 className="text-xl font-bold">Medicare IPD</h1>
          <p className="mt-1 text-xs text-slate-300">Ward & Bed Management</p>
        </div>

        <nav className="mt-4 flex flex-col">
          <NavLink to="/ward" className={linkClass}>
            <span>Ward Management</span>
          </NavLink>

          <NavLink to="/bed" className={linkClass}>
            <span>Bed Management</span>
          </NavLink>

          <NavLink to="/bed-type" className={linkClass}>
            <span>Bed Types</span>
          </NavLink>
        </nav>
      </aside>

      <div className="ml-[220px] flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">{pageTitle}</h2>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-800">Medicare User</p>
              <p>Authenticated Session</p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 bg-gray-50 p-6">{children}</main>
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
