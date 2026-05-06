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

export default function WardList() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [wards, setWards] = useState([]);
  const [stats, setStats] = useState({});
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

  const fetchWards = useCallback(async () => {
    const fetchId = fetchIdRef.current + 1;
    fetchIdRef.current = fetchId;
    setLoading(true);
    setError('');

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

      if (fetchId !== fetchIdRef.current) return;

      if (res.data.response === 200) {
        const wardData = res.data.data || [];

        setWards(wardData);
        setStats(
          res.data.stats || {
            total_wards: res.data.total_record || wardData.length,
            active_wards: wardData.filter((ward) => ward.active === 1).length,
            total_beds: wardData.reduce(
              (sum, ward) => sum + (Number(ward.total_beds) || 0),
              0
            ),
          }
        );
        setTotal(res.data.total_record || wardData.length);
      } else {
        setWards([]);
        setStats({});
        setTotal(0);
        setError(getResponseErrorMessage(res.data, 'Failed to load wards.'));
      }
    } catch (err) {
      if (fetchId !== fetchIdRef.current) return;

      setWards([]);
      setStats({});
      setTotal(0);
      setError(getRequestErrorMessage(err, 'Failed to load wards.'));
    } finally {
      if (fetchId === fetchIdRef.current) {
        setLoading(false);
      }
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
    } catch (err) {
      if (isUnauthorizedError(err)) {
        logout();
        navigate('/login');
        return;
      }

      setError(getRequestErrorMessage(err, 'Unable to delete ward.'));
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
            Ward Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage IPD wards, capacity, and status.
          </p>
        </div>

        <button
          onClick={() => navigate('/ward/add')}
          className="min-h-11 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
        >
          Add Ward
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg border-l-4 border-blue-500 bg-white p-4 shadow sm:p-5">
          <div className="text-xs font-semibold uppercase text-blue-600">Ward</div>
          <div className="mt-3 text-2xl font-bold text-gray-800 sm:text-3xl">
            {stats.total_wards ?? 0}
          </div>
          <p className="text-sm text-gray-500 mt-1">Total Wards</p>
        </div>

        <div className="rounded-lg border-l-4 border-green-500 bg-white p-4 shadow sm:p-5">
          <div className="text-xs font-semibold uppercase text-green-600">Active</div>
          <div className="mt-3 text-2xl font-bold text-gray-800 sm:text-3xl">
            {stats.active_wards ?? 0}
          </div>
          <p className="text-sm text-gray-500 mt-1">Active Wards</p>
        </div>

        <div className="rounded-lg border-l-4 border-purple-500 bg-white p-4 shadow sm:col-span-2 sm:p-5 xl:col-span-1">
          <div className="text-xs font-semibold uppercase text-purple-600">Beds</div>
          <div className="mt-3 text-2xl font-bold text-gray-800 sm:text-3xl">
            {stats.total_beds ?? 0}
          </div>
          <p className="text-sm text-gray-500 mt-1">Total Beds</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Search ward name..."
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
          <TableSkeleton name="ward-list-table" columns={6} rows={6} />
        ) : wards.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-sm font-semibold uppercase text-gray-400 mb-3">Ward</div>
            <p className="text-lg font-medium">No wards found</p>
            <p className="text-sm mt-1">
              Try adjusting your search or add a new ward.
            </p>
          </div>
        ) : (
          <>
          <div className="divide-y divide-gray-100 md:hidden">
            {wards.map((ward, index) => (
              <div key={ward.id} className="p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-400">
                      #{start + index + 1}
                    </p>
                    <h3 className="mt-1 truncate text-base font-semibold text-gray-800">
                      {ward.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {ward.clinic_title || '-'}
                    </p>
                  </div>

                  {ward.active === 1 ? (
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
                  <span className="font-medium text-gray-500">Total Beds:</span>{' '}
                  {ward.total_beds}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate(`/ward/${ward.id}`)}
                    className="min-h-11 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ward.id)}
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
                          className="min-h-10 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(ward.id)}
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
        label={`Showing ${showingFrom}-${showingTo} of ${total} wards`}
        currentPage={currentPage}
        canPrevious={start !== 0}
        canNext={start + PAGE_SIZE < total}
        onPrevious={() => setStart((prev) => Math.max(prev - PAGE_SIZE, 0))}
        onNext={() => setStart((prev) => prev + PAGE_SIZE)}
      />
    </div>
  );
}
