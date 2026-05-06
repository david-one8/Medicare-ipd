import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApi, postApi } from '../../services/api';
import { useAuth } from '../../context/useAuth';
import { FormSkeleton } from '../../components/BoneyardLoaders';
import {
  extractFieldErrors,
  getRequestErrorMessage,
  getResponseErrorMessage,
  isUnauthorizedError,
} from '../../utils/errorHandling';

export default function BedTypeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [form, setForm] = useState({
    title: '',
    description: '',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isEdit) return;

    let ignore = false;

    const loadBedType = async () => {
      try {
        const res = await getApi.get('/get_ipd_bed_type/' + id);

        if (ignore) return;

        if (res.data.response === 200) {
          const d = res.data.data;

          setForm({
            title: d.title || '',
            description: d.description || '',
            active: d.active === 1,
          });
        } else {
          setError(getResponseErrorMessage(res.data, 'Failed to load bed type.'));
        }
      } catch (err) {
        if (ignore) return;

        setError(getRequestErrorMessage(err, 'Failed to load bed type.'));
      } finally {
        if (!ignore) {
          setFetching(false);
        }
      }
    };

    loadBedType();

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

    if (!trimmedTitle) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const payload = isEdit
        ? {
            id: parseInt(id, 10),
            title: trimmedTitle,
            description: form.description.trim(),
            active: form.active ? 1 : 0,
          }
        : {
            clinic_id: 1,
            title: trimmedTitle,
            description: form.description.trim(),
            active: form.active ? 1 : 0,
          };

      const endpoint = isEdit ? '/update_ipd_bed_type' : '/add_ipd_bed_type';
      const res = await postApi(token).post(endpoint, payload);

      if (res.data.response === 200) {
        navigate('/bed-type');
      } else {
        const errors = extractFieldErrors(res.data.message);

        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors);
        }

        setError(getResponseErrorMessage(res.data, 'Unable to save bed type.'));
      }
    } catch (err) {
      if (isUnauthorizedError(err)) {
        logout();
        navigate('/login');
      } else {
        setError(getRequestErrorMessage(err, 'Unable to save bed type.'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <FormSkeleton name="bed-type-edit-form" fields={3} />;
  }

  return (
    <div className="mx-auto mt-2 max-w-2xl rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:mt-4 sm:p-6">
      <button
        onClick={() => navigate('/bed-type')}
        className="mb-4 inline-flex min-h-10 items-center gap-1 rounded-md text-sm font-medium text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span aria-hidden="true">&lt;-</span>
        <span>Back to Bed Types</span>
      </button>

      <h1 className="mb-6 text-xl font-bold text-gray-800 sm:text-2xl">
        {isEdit ? 'Edit Bed Type' : 'Add Bed Type'}
      </h1>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="bed-type-title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Bed Type Title <span className="text-red-500">*</span>
          </label>
          <input
            id="bed-type-title"
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="min-h-11 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter bed type title"
          />
          {fieldErrors.title?.[0] && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.title[0]}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="bed-type-description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="bed-type-description"
            name="description"
            rows="3"
            value={form.description}
            onChange={handleChange}
            className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter description"
          />
          {fieldErrors.description?.[0] && (
            <p className="text-red-500 text-xs mt-1">
              {fieldErrors.description[0]}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              id="bed-type-active"
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, active: e.target.checked }))
              }
              className="h-5 w-5 accent-blue-600"
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
            className="min-h-11 w-full rounded-md bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            {loading
              ? isEdit
                ? 'Updating...'
                : 'Adding...'
              : isEdit
              ? 'Update Bed Type'
              : 'Add Bed Type'}
          </button>
        </div>
      </form>
    </div>
  );
}
