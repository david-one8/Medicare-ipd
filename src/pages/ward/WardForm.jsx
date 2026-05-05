import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApi, postApi } from '../../services/api';
import { useAuth } from '../../context/useAuth';

export default function WardForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [form, setForm] = useState({
    title: '',
    description: '',
    total_beds: '',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isEdit) return;

    let ignore = false;

    const loadWard = async () => {
      try {
        const res = await getApi.get('/get_ipd_ward/' + id);

        if (ignore) return;

        if (res.data.response === 200) {
          const d = res.data.data;

          setForm({
            title: d.title || '',
            description: d.description || '',
            total_beds: d.total_beds || '',
            active: d.active === 1,
          });
        } else {
          setError(
            typeof res.data.message === 'string'
              ? res.data.message
              : 'Failed to load ward data.'
          );
        }
      } catch {
        if (ignore) return;

        setError('Failed to load ward data.');
      } finally {
        if (!ignore) {
          setFetching(false);
        }
      }
    };

    loadWard();

    return () => {
      ignore = true;
    };
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

    const trimmedTitle = form.title.trim();
    const totalBeds = parseInt(form.total_beds, 10);

    if (!trimmedTitle || !form.total_beds) {
      setError('Please fill in all required fields.');
      return;
    }

    if (Number.isNaN(totalBeds) || totalBeds < 1) {
      setError('Total beds must be at least 1.');
      return;
    }

    setLoading(true);

    try {
      const api = postApi(token);

      const payload = isEdit
        ? {
            id: parseInt(id, 10),
            title: trimmedTitle,
            description: form.description.trim(),
            total_beds: totalBeds,
            active: form.active ? 1 : 0,
          }
        : {
            clinic_id: 1,
            title: trimmedTitle,
            description: form.description.trim(),
            total_beds: totalBeds,
            active: form.active ? 1 : 0,
          };

      const endpoint = isEdit ? '/update_ipd_ward' : '/add_ipd_ward';
      const res = await api.post(endpoint, payload);

      if (res.data.response === 200) {
        navigate('/ward');
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
        onClick={() => navigate('/ward')}
        className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-4"
      >
        <span aria-hidden="true">&lt;-</span>
        <span>Back to Wards</span>
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Edit Ward' : 'Add Ward'}
      </h1>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="ward-title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ward Title <span className="text-red-500">*</span>
          </label>
          <input
            id="ward-title"
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter ward title"
          />
          {fieldErrors.title?.[0] && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.title[0]}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="ward-description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="ward-description"
            name="description"
            rows="3"
            value={form.description}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Enter description"
          />
          {fieldErrors.description?.[0] && (
            <p className="text-red-500 text-xs mt-1">
              {fieldErrors.description[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="ward-total-beds"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Total Beds <span className="text-red-500">*</span>
          </label>
          <input
            id="ward-total-beds"
            type="number"
            name="total_beds"
            min="1"
            value={form.total_beds}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter total beds"
          />
          {fieldErrors.total_beds?.[0] && (
            <p className="text-red-500 text-xs mt-1">
              {fieldErrors.total_beds[0]}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              id="ward-active"
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
            <p className="text-red-500 text-xs mt-1">{fieldErrors.active[0]}</p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {loading
              ? isEdit
                ? 'Updating...'
                : 'Adding...'
              : isEdit
              ? 'Update Ward'
              : 'Add Ward'}
          </button>
        </div>
      </form>
    </div>
  );
}
