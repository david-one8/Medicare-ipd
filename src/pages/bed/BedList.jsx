import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApi, postApi } from '../../services/api';
import { useAuth } from '../../context/useAuth';
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
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bed Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage IPD beds, bed status, and ward allocation.
          </p>
        </div>

        <button
          onClick={() => navigate('/bed/add')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Add Bed
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-500 p-4">
          <div className="text-xs font-semibold uppercase text-blue-600">Beds</div>
          <div className="text-2xl font-bold text-gray-800 mt-2">
            {stats.total_beds ?? 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">Total Beds</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border-l-4 border-green-500 p-4">
          <div className="text-xs font-semibold uppercase text-green-600">Open</div>
          <div className="text-2xl font-bold text-gray-800 mt-2">
            {stats.available ?? 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">Available</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border-l-4 border-red-500 p-4">
          <div className="text-xs font-semibold uppercase text-red-600">Busy</div>
          <div className="text-2xl font-bold text-gray-800 mt-2">
            {stats.occupied ?? 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">Occupied</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border-l-4 border-yellow-500 p-4">
          <div className="text-xs font-semibold uppercase text-yellow-600">Repair</div>
          <div className="text-2xl font-bold text-gray-800 mt-2">
            {stats.maintenance ?? 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">Maintenance</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border-l-4 border-purple-500 p-4">
          <div className="text-xs font-semibold uppercase text-purple-600">Rate</div>
          <div className="text-2xl font-bold text-gray-800 mt-2">
            {stats.occupancy_rate ?? 0}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Occupancy Rate</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="bed-filter-ward"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
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
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
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
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
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
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : beds.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-sm font-semibold uppercase text-gray-400 mb-3">Bed</div>
            <p className="text-lg font-medium">No beds found</p>
            <p className="text-sm mt-1">
              Try changing filters or add a new bed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
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
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <td className="px-4 py-3 text-gray-700">
                      {start + index + 1}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-semibold">
                      {bed.bed_number}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {bed.ward_title || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 capitalize">
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
                          className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(bed.id)}
                          className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-100"
                        >
                          Delete
                        </button>

                        <select
                          value={bed.status}
                          onChange={(e) =>
                            handleStatusChange(bed.id, e.target.value)
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500"
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
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-gray-600">
          Showing {showingFrom}-{showingTo} of {total} beds
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStart((prev) => Math.max(prev - PAGE_SIZE, 0))}
            disabled={start === 0}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-500">Page {currentPage}</span>

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
