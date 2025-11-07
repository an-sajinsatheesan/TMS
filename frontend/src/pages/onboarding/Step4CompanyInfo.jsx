import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveCompanyInfo, clearError } from '../../store/slices/onboardingSlice';
import { onboardingService } from '../../api/onboarding.service';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '../../hooks/useToast.jsx';

const Step4CompanyInfo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading: saving, error: reduxError } = useSelector((state) => state.onboarding);

  // Options from API
  const [appUsageOptions, setAppUsageOptions] = useState([]);
  const [industryOptions, setIndustryOptions] = useState([]);
  const [teamSizeOptions, setTeamSizeOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);

  // Form values
  const [selectedAppUsageIds, setSelectedAppUsageIds] = useState([]);
  const [selectedIndustryIds, setSelectedIndustryIds] = useState([]);
  const [selectedTeamSizeId, setSelectedTeamSizeId] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllOptions();
    return () => dispatch(clearError());
  }, [dispatch]);

  const fetchAllOptions = async () => {
    try {
      const response = await onboardingService.getAllOptions();
      const data = response.data;

      setAppUsageOptions(data.appUsage || []);
      setIndustryOptions(data.industries || []);
      setTeamSizeOptions(data.teamSizes || []);
      setRoleOptions(data.roles || []);
    } catch (error) {
      console.error('Error fetching options:', error);
      setError('Failed to load options. Please refresh the page.');
      toast.error('Failed to load options');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (selectedAppUsageIds.length === 0) {
      setError('Please select at least one app usage');
      return;
    }

    if (selectedIndustryIds.length === 0) {
      setError('Please select at least one industry');
      return;
    }

    if (!selectedTeamSizeId) {
      setError('Please select your team size');
      return;
    }

    setError('');

    try {
      await dispatch(saveCompanyInfo({
        appUsageIds: selectedAppUsageIds,
        industryIds: selectedIndustryIds,
        teamSizeId: selectedTeamSizeId
      })).unwrap();

      toast.success('Company info saved successfully');
      navigate('/onboarding/step4');
    } catch (err) {
      toast.error('Failed to save company info', {
        description: err || 'Please try again'
      });
      setError(err || 'Failed to save. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Tell us about your company</h2>
        <p className="text-gray-600">
          This helps us customize your experience
        </p>
      </div>

      {(error || reduxError) && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || reduxError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/onboarding/step2')}
            disabled={saving}
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex-1"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Step4CompanyInfo;
