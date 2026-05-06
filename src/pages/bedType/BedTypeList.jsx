import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApi, postApi } from '../../services/api';
import { useAuth } from '../../context/useAuth';
import { TableSkeleton } from '../../components/BoneyardLoaders';
import { PaginationBar } from '../../components/PaginationBar';
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
            Bed Type Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage reusable bed type records for IPD beds.
          </p>
        </div>

        <button
          onClick={() => navigate('/bed-type/add')}
          className="min-h-11 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
        >
          Add Bed Type
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Search bed type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-h-11 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-72"
        />

        <div className="text-sm text-gray-500">Page {currentPage}</div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
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
          <>
          <div className="divide-y divide-gray-100 md:hidden">
            {bedTypes.map((bedType, index) => (
              <div key={bedType.id} className="p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-400">
                      #{start + index + 1}
                    </p>
                    <h3 className="mt-1 truncate text-base font-semibold text-gray-800">
                      {bedType.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {bedType.description || 'No description'}
                    </p>
                  </div>

                  {bedType.active === 1 ? (
                    <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="mb-4 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  <span className="font-medium text-gray-500">Clinic:</span>{' '}
                  {bedType.clinic_title || '-'}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate(`/bed-type/${bedType.id}`)}
                    className="min-h-11 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(bedType.id)}
                    className="min-h-11 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-[760px] w-full text-left text-sm">
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
                          className="min-h-10 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(bedType.id)}
                          className="min-h-10 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
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
          </>
        )}
      </div>

      <PaginationBar
        label={`Showing ${showingFrom}-${showingTo} of ${total} bed types`}
        currentPage={currentPage}
        canPrevious={start !== 0}
        canNext={start + PAGE_SIZE < total}
        onPrevious={() => setStart((prev) => Math.max(prev - PAGE_SIZE, 0))}
        onNext={() => setStart((prev) => prev + PAGE_SIZE)}
      />
    </div>
  );
}
