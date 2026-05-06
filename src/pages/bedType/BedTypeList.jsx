import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApi, postApi } from '../../services/api';
import { useAuth } from '../../context/useAuth';
import { TableSkeleton } from '../../components/BoneyardLoaders';
import {
  getRequestErrorMessage,
  getResponseErrorMessage,
  isUnauthorizedError,
} from '../../utils/errorHandling';

const PAGE_SIZE = 20;

export default function BedTypeList() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [bedTypes, setBedTypes] = useState([]);
  const [start, setStart] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setStart(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchBedTypes = useCallback(async () => {
    const fetchId = fetchIdRef.current + 1;
    fetchIdRef.current = fetchId;
    setLoading(true);
    setError('');

    try {
      const res = await getApi.get('/get_ipd_bed_type', {
        params: {
          start,
          end: start + PAGE_SIZE,
          clinic_id: 1,
          active: 1,
          search: debouncedSearch,
        },
      });

      if (fetchId !== fetchIdRef.current) return;

      if (res.data.response === 200) {
        const data = res.data.data || [];
        setBedTypes(data);
        setTotal(res.data.total_record || data.length);
      } else {
        setBedTypes([]);
        setTotal(0);
        setError(getResponseErrorMessage(res.data, 'Failed to load bed types.'));
      }
    } catch (err) {
      if (fetchId !== fetchIdRef.current) return;

      setBedTypes([]);
      setTotal(0);
      setError(getRequestErrorMessage(err, 'Failed to load bed types.'));
    } finally {
      if (fetchId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [debouncedSearch, start]);

  useEffect(() => {
    fetchBedTypes();
  }, [fetchBedTypes]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bed type?')) return;

    try {
      const res = await postApi(token).post('/delete_ipd_bed_type', { id });

      if (res.data.response === 200) {
        fetchBedTypes();
      } else {
        setError(getResponseErrorMessage(res.data, 'Unable to delete bed type.'));
      }
    } catch (err) {
      if (isUnauthorizedError(err)) {
        logout();
        navigate('/login');
        return;
      }

      setError(getRequestErrorMessage(err, 'Unable to delete bed type.'));
    }
  };

  const currentPage = Math.floor(start / PAGE_SIZE) + 1;
  const showingFrom = total === 0 ? 0 : start + 1;
  const showingTo = Math.min(start + PAGE_SIZE, total);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bed Type Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage reusable bed type records for IPD beds.
          </p>
        </div>

        <button
          onClick={() => navigate('/bed-type/add')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Add Bed Type
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Search bed type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-64"
        />

        <div className="text-sm text-gray-500">Page {currentPage}</div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <TableSkeleton name="bed-type-list-table" columns={6} rows={6} />
        ) : bedTypes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-sm font-semibold uppercase text-gray-400 mb-3">
              Type
            </div>
            <p className="text-lg font-medium">No bed types found</p>
            <p className="text-sm mt-1">
              Try adjusting your search or add a bed type.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Clinic</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bedTypes.map((bedType, index) => (
                  <tr
                    key={bedType.id}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <td className="px-4 py-3 text-gray-700">
                      {start + index + 1}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {bedType.title}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {bedType.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {bedType.clinic_title || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {bedType.active === 1 ? (
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
                          onClick={() => navigate(`/bed-type/${bedType.id}`)}
                          className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(bedType.id)}
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
          Showing {showingFrom}-{showingTo} of {total} bed types
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
