import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApi, postApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function BedForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [form, setForm] = useState({
    ward_id: '',
    bed_number: '',
    bed_type: 'general',
    floor: 'Ground',
    charges_per_day: '',
    status: 'available',
    notes: '',
    active: true,
  });
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
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
      } catch {
        setError('Failed to load ward list.');
      }
    };

    loadWards();
  }, []);

  useEffect(() => {
    if (!isEdit) return;

    const loadBed = async () => {
      try {
        const res = await getApi.get('/get_ipd_bed/' + id);

        if (res.data.response === 200) {
          const d = res.data.data;

          setForm({
            ward_id: d.ward_id?.toString() || '',
            bed_number: d.bed_number || '',
            bed_type: d.bed_type || 'general',
            floor: d.floor || 'Ground',
            charges_per_day: parseFloat(d.charges_per_day) || '',
            status: d.status || 'available',
            notes: d.notes || '',
            active: d.active === 1,
          });
        } else {
          setError('Bed not found.');
        }
      } catch {
        setError('Failed to load bed data.');
      } finally {
        setFetching(false);
      }
    };

    loadBed();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!form.ward_id || !form.bed_number.trim() || form.charges_per_day === '') {
      setError('Please fill in all required fields.');
      return;
    }

    const parsedWardId = parseInt(form.ward_id, 10);
    const parsedCharges = parseFloat(form.charges_per_day);

    if (Number.isNaN(parsedWardId)) {
      setError('Please select a valid ward.');
      return;
    }

    if (Number.isNaN(parsedCharges) || parsedCharges < 0) {
      setError('Charges Per Day must be a valid amount.');
      return;
    }

    setLoading(true);

    try {
      const payload = isEdit
        ? {
            id: parseInt(id, 10),
            ward_id: parsedWardId,
            bed_number: form.bed_number.trim(),
            bed_type: form.bed_type,
            floor: form.floor,
            charges_per_day: parsedCharges,
            status: form.status,
            notes: form.notes.trim(),
            active: form.active ? 1 : 0,
          }
        : {
            clinic_id: 1,
            ward_id: parsedWardId,
            bed_number: form.bed_number.trim(),
            bed_type: form.bed_type,
            floor: form.floor,
            charges_per_day: parsedCharges,
            status: form.status,
            notes: form.notes.trim(),
            active: form.active ? 1 : 0,
          };

      const endpoint = isEdit ? '/update_ipd_bed' : '/add_ipd_bed';
      const res = await postApi(token).post(endpoint, payload);

      if (res.data.response === 200) {
        navigate('/bed');
      } else if (res.data.response === 400) {
        if (typeof res.data.message === 'string') {
          setError(res.data.message);
        } else if (typeof res.data.message === 'object' && res.data.message) {
          setFieldErrors(res.data.message);
        } else {
          setError('Something went wrong. Please try again.');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl mx-auto mt-6">
      <button
        onClick={() => navigate('/bed')}
        className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-4"
      >
        <span>←</span>
        <span>Back to Beds</span>
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Edit Bed' : 'Add Bed'}
      </h1>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ward <span className="text-red-500">*</span>
            </label>
            <select
              name="ward_id"
              value={form.ward_id}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Ward --</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title}
                </option>
              ))}
            </select>
            {fieldErrors.ward_id?.[0] && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.ward_id[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bed Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="bed_number"
              value={form.bed_number}
              onChange={handleChange}
              placeholder="e.g. G-101, ICU-03"
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {fieldErrors.bed_number?.[0] && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.bed_number[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bed Type
            </label>
            <select
              name="bed_type"
              value={form.bed_type}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="general">General</option>
              <option value="private">Private</option>
              <option value="semi_private">Semi Private</option>
              <option value="icu">ICU</option>
              <option value="emergency">Emergency</option>
            </select>
            {fieldErrors.bed_type?.[0] && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.bed_type[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floor
            </label>
            <select
              name="floor"
              value={form.floor}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Ground">Ground</option>
              <option value="1st">1st</option>
              <option value="2nd">2nd</option>
            </select>
            {fieldErrors.floor?.[0] && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.floor[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Charges Per Day (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              name="charges_per_day"
              value={form.charges_per_day}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {fieldErrors.charges_per_day?.[0] && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.charges_per_day[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
            {fieldErrors.status?.[0] && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.status[0]}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              rows="3"
              value={form.notes}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {fieldErrors.notes?.[0] && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.notes[0]}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, active: e.target.checked }))
                }
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm text-gray-700">Mark as Active</span>
            </label>
            {fieldErrors.active?.[0] && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.active[0]}
              </p>
            )}
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-md font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {loading
              ? isEdit
                ? 'Updating...'
                : 'Adding...'
              : isEdit
              ? 'Update Bed'
              : 'Add Bed'}
          </button>
        </div>
      </form>
    </div>
  );
}