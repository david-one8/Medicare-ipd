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

export default function BedList() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [beds, setBeds] = useState([]);
  const [stats, setStats] = useState({});
  const [wards, setWards] = useState([]);
  const [bedTypes, setBedTypes] = useState([]);
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedBedType, setSelectedBedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [start, setStart] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetchIdRef = useRef(0);

  const loadWards = async () => {
    try {
      const res = await getApi.get('/get_ipd_ward', {
        params: {
          clinic_id: 1,
          active: 1,
          start: 0,
          end: 100,
        },
      });

      if (res.data.response === 200) {
        setWards(res.data.data || []);
      }
    } catch (err) {
      setError(getRequestErrorMessage(err, 'Failed to load ward filters.'));
    }
  };

  const loadBedTypes = async () => {
    try {
      const res = await getApi.get('/get_ipd_bed_type', {
        params: {
          clinic_id: 1,
          active: 1,
          start: 0,
          end: 100,
        },
      });

      if (res.data.response === 200) {
        setBedTypes(res.data.data || []);
      } else {
        setError(getResponseErrorMessage(res.data, 'Failed to load bed type filters.'));
      }
    } catch (err) {
      setError(getRequestErrorMessage(err, 'Failed to load bed type filters.'));
    }
  };

  const fetchBeds = useCallback(async () => {
    const fetchId = fetchIdRef.current + 1;
    fetchIdRef.current = fetchId;
    setLoading(true);
    setError('');

    try {
      const params = {
        start,
        end: start + PAGE_SIZE,
        clinic_id: 1,
        active: 1,
      };

      if (selectedWard) params.ward_id = selectedWard;
      if (selectedBedType) params.bed_type_id = selectedBedType;
      if (selectedStatus) params.status = selectedStatus;

      const res = await getApi.get('/get_ipd_bed', { params });

      if (fetchId !== fetchIdRef.current) return;

      if (res.data.response === 200) {
        setBeds(res.data.data || []);
        setStats(res.data.stats || {});
        setTotal(res.data.total_record || 0);
      } else {
        setBeds([]);
        setStats({});
        setTotal(0);
        setError(
          getResponseErrorMessage(res.data, 'Failed to load beds.')
        );
      }
    } catch (err) {
      if (fetchId !== fetchIdRef.current) return;

      setError(getRequestErrorMessage(err, 'Failed to load beds.'));
    } finally {
      if (fetchId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [selectedBedType, selectedStatus, selectedWard, start]);

  useEffect(() => {
    loadWards();
    loadBedTypes();
  }, []);

  useEffect(() => {
    fetchBeds();
  }, [fetchBeds]);

  const handleStatusChange = async (bedId, newStatus) => {
    try {
      const res = await postApi(token).post('/update_ipd_bed_status', {
        id: bedId,
        status: newStatus,
      });

      if (res.data.response === 200) {
        fetchBeds();
      } else {
        setError(getResponseErrorMessage(res.data, 'Status update failed.'));
      }
    } catch (err) {
      if (isUnauthorizedError(err)) {
        logout();
        navigate('/login');
        return;
      }

      setError(getRequestErrorMessage(err, 'Status update failed.'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bed?')) return;

    try {
      const res = await postApi(token).post('/delete_ipd_bed', { id });

      if (res.data.response === 200) {
        fetchBeds();
      } else {
        setError(getResponseErrorMessage(res.data, 'Delete failed.'));
      }
    } catch (err) {
      if (isUnauthorizedError(err)) {
        logout();
        navigate('/login');
        return;
      }

      setError(getRequestErrorMessage(err, 'Delete failed.'));
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'available') {
      return (
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
          Available
        </span>
      );
    }

    if (status === 'occupied') {
      return (
        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
          Occupied
        </span>
      );
    }

    return (
      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
        Maintenance
      </span>
    );
  };

  const currentPage = Math.floor(start / PAGE_SIZE) + 1;
  const showingFrom = total === 0 ? 0 : start + 1;
  const showingTo = Math.min(start + PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
            Bed Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage IPD beds, bed status, and ward allocation.
          </p>
        </div>

        <button
          onClick={() => navigate('/bed/add')}
          className="min-h-11 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
        >
          Add Bed
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="rounded-lg border-l-4 border-blue-500 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase text-blue-600">Beds</div>
          <div className="mt-2 text-2xl font-bold text-gray-800">
            {stats.total_beds ?? 0}
          </div>
          <div className="mt-1 text-xs text-gray-500">Total Beds</div>
        </div>

        <div className="rounded-lg border-l-4 border-green-500 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase text-green-600">Open</div>
          <div className="mt-2 text-2xl font-bold text-gray-800">
            {stats.available ?? 0}
          </div>
          <div className="mt-1 text-xs text-gray-500">Available</div>
        </div>

        <div className="rounded-lg border-l-4 border-red-500 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase text-red-600">Busy</div>
          <div className="mt-2 text-2xl font-bold text-gray-800">
            {stats.occupied ?? 0}
          </div>
          <div className="mt-1 text-xs text-gray-500">Occupied</div>
        </div>

        <div className="rounded-lg border-l-4 border-yellow-500 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase text-yellow-600">Repair</div>
          <div className="mt-2 text-2xl font-bold text-gray-800">
            {stats.maintenance ?? 0}
          </div>
          <div className="mt-1 text-xs text-gray-500">Maintenance</div>
        </div>

        <div className="rounded-lg border-l-4 border-purple-500 bg-white p-4 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="text-xs font-semibold uppercase text-purple-600">Rate</div>
          <div className="mt-2 text-2xl font-bold text-gray-800">
            {stats.occupancy_rate ?? 0}%
          </div>
          <div className="mt-1 text-xs text-gray-500">Occupancy Rate</div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="bed-filter-ward"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Filter by Ward
            </label>
            <select
              id="bed-filter-ward"
              value={selectedWard}
              onChange={(e) => {
                setStart(0);
                setSelectedWard(e.target.value);
              }}
              className="min-h-11 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Wards</option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {ward.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="bed-filter-type"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Filter by Bed Type
            </label>
            <select
              id="bed-filter-type"
              value={selectedBedType}
              onChange={(e) => {
                setStart(0);
                setSelectedBedType(e.target.value);
              }}
              className="min-h-11 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Bed Types</option>
              {bedTypes.map((bedType) => (
                <option key={bedType.id} value={bedType.id}>
                  {bedType.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="bed-filter-status"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Filter by Status
            </label>
            <select
              id="bed-filter-status"
              value={selectedStatus}
              onChange={(e) => {
                setStart(0);
                setSelectedStatus(e.target.value);
              }}
              className="min-h-11 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <TableSkeleton name="bed-list-table" columns={8} rows={6} />
        ) : beds.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <div className="mb-3 text-sm font-semibold uppercase text-gray-400">
              Bed
            </div>
            <p className="text-lg font-medium">No beds found</p>
            <p className="mt-1 text-sm">Try changing filters or add a new bed.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100 lg:hidden">
              {beds.map((bed, index) => (
                <div key={bed.id} className="p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-400">
                        #{start + index + 1}
                      </p>
                      <h3 className="mt-1 truncate text-base font-semibold text-gray-800">
                        {bed.bed_number}
                      </h3>
                      <p className="mt-1 truncate text-sm text-gray-500">
                        {bed.ward_title || '-'}
                      </p>
                    </div>

                    <div className="shrink-0">{getStatusBadge(bed.status)}</div>
                  </div>

                  <div className="mb-4 grid grid-cols-1 gap-2 rounded-md bg-gray-50 p-3 text-sm text-gray-700 sm:grid-cols-2">
                    <p>
                      <span className="font-medium text-gray-500">Type:</span>{' '}
                      {bed.bed_type_title || bed.bed_type || '-'}
                    </p>
                    <p>
                      <span className="font-medium text-gray-500">Floor:</span>{' '}
                      {bed.floor || '-'}
                    </p>
                    <p className="sm:col-span-2">
                      <span className="font-medium text-gray-500">
                        Charges/Day:
                      </span>{' '}
                      Rs.{' '}
                      {Number.isNaN(parseFloat(bed.charges_per_day))
                        ? '0'
                        : parseFloat(bed.charges_per_day).toFixed(0)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate(`/bed/${bed.id}`)}
                      className="min-h-11 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(bed.id)}
                      className="min-h-11 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Delete
                    </button>

                    <select
                      value={bed.status}
                      onChange={(e) => handleStatusChange(bed.id, e.target.value)}
                      className="col-span-2 min-h-11 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`Update status for bed ${bed.bed_number}`}
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-[980px] w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Bed Number</th>
                    <th className="px-4 py-3 font-medium">Ward</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Floor</th>
                    <th className="px-4 py-3 font-medium">Charges/Day</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {beds.map((bed, index) => (
                    <tr
                      key={bed.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-gray-700">
                        {start + index + 1}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-700">
                        {bed.bed_number}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {bed.ward_title || '-'}
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-700">
                        {bed.bed_type_title || bed.bed_type || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {bed.floor || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        Rs.{' '}
                        {Number.isNaN(parseFloat(bed.charges_per_day))
                          ? '0'
                          : parseFloat(bed.charges_per_day).toFixed(0)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {getStatusBadge(bed.status)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => navigate(`/bed/${bed.id}`)}
                            className="min-h-10 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(bed.id)}
                            className="min-h-10 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            Delete
                          </button>

                          <select
                            value={bed.status}
                            onChange={(e) =>
                              handleStatusChange(bed.id, e.target.value)
                            }
                            className="min-h-10 rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label={`Update status for bed ${bed.bed_number}`}
                          >
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="maintenance">Maintenance</option>
                          </select>
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
        label={`Showing ${showingFrom}-${showingTo} of ${total} beds`}
        currentPage={currentPage}
        canPrevious={start !== 0}
        canNext={start + PAGE_SIZE < total}
        onPrevious={() => setStart((prev) => Math.max(prev - PAGE_SIZE, 0))}
        onNext={() => setStart((prev) => prev + PAGE_SIZE)}
      />
    </div>
  );
}
