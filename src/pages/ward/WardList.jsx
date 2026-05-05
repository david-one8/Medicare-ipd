import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApi, postApi } from '../../services/api';
import { useAuth } from '../../context/useAuth';

const PAGE_SIZE = 20;

export default function WardList() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [wards, setWards] = useState([]);
  const [stats, setStats] = useState({});
  const [start, setStart] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setStart(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchWards = useCallback(async () => {
    setLoading(true);

    try {
      const res = await getApi.get('/get_ipd_ward', {
        params: {
          start,
          end: start + PAGE_SIZE,
          clinic_id: 1,
          active: 1,
          search: debouncedSearch,
        },
      });

      if (res.data.response === 200) {
        setWards(res.data.data || []);
        setStats(res.data.stats || {});
        setTotal(res.data.total_record || 0);
      } else {
        setWards([]);
        setStats({});
        setTotal(0);
      }
    } catch {
      setWards([]);
      setStats({});
      setTotal(0);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, start]);

  useEffect(() => {
    fetchWards();
  }, [fetchWards]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ward?')) return;

    try {
      const res = await postApi(token).post('/delete_ipd_ward', { id });

      if (res.data.response === 200) {
        fetchWards();
      } else {
        alert(
          typeof res.data.message === 'string'
            ? res.data.message
            : 'Unable to delete ward.'
        );
      }
    } catch {
      alert('Something went wrong.');
    }
  };

  const currentPage = Math.floor(start / PAGE_SIZE) + 1;
  const showingFrom = total === 0 ? 0 : start + 1;
  const showingTo = Math.min(start + PAGE_SIZE, total);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ward Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage IPD wards, capacity, and status.
          </p>
        </div>

        <button
          onClick={() => navigate('/ward/add')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Add Ward
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
          <div className="text-xs font-semibold uppercase text-blue-600">Ward</div>
          <div className="text-3xl font-bold text-gray-800 mt-3">
            {stats.total_wards ?? 0}
          </div>
          <p className="text-sm text-gray-500 mt-1">Total Wards</p>
        </div>

        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
          <div className="text-xs font-semibold uppercase text-green-600">Active</div>
          <div className="text-3xl font-bold text-gray-800 mt-3">
            {stats.active_wards ?? 0}
          </div>
          <p className="text-sm text-gray-500 mt-1">Active Wards</p>
        </div>

        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500">
          <div className="text-xs font-semibold uppercase text-purple-600">Beds</div>
          <div className="text-3xl font-bold text-gray-800 mt-3">
            {stats.total_beds ?? 0}
          </div>
          <p className="text-sm text-gray-500 mt-1">Total Beds</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Search ward name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-64"
        />

        <div className="text-sm text-gray-500">Page {currentPage}</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : wards.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-sm font-semibold uppercase text-gray-400 mb-3">Ward</div>
            <p className="text-lg font-medium">No wards found</p>
            <p className="text-sm mt-1">
              Try adjusting your search or add a new ward.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Ward Title</th>
                  <th className="px-4 py-3 font-medium">Total Beds</th>
                  <th className="px-4 py-3 font-medium">Clinic</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {wards.map((ward, index) => (
                  <tr
                    key={ward.id}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <td className="px-4 py-3 text-gray-700">
                      {start + index + 1}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {ward.title}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {ward.total_beds}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {ward.clinic_title || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {ward.active === 1 ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/ward/${ward.id}`)}
                          className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(ward.id)}
                          className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-gray-600">
          Showing {showingFrom}-{showingTo} of {total} wards
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStart((prev) => Math.max(prev - PAGE_SIZE, 0))}
            disabled={start === 0}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          <button
            onClick={() => setStart((prev) => prev + PAGE_SIZE)}
            disabled={start + PAGE_SIZE >= total}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
