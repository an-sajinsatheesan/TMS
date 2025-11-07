import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveCompanyInfo, clearError } from '../../store/slices/onboardingSlice';
import { onboardingService } from '../../api/onboarding.service';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

  // Form values
  const [selectedAppUsageIds, setSelectedAppUsageIds] = useState([]);
  const [selectedIndustryIds, setSelectedIndustryIds] = useState([]);
  const [selectedTeamSizeId, setSelectedTeamSizeId] = useState('');

  const [error, setError] = useState('');
  const [loadingOptions, setLoadingOptions] = useState(true);

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
    } catch (error) {
      console.error('Error fetching options:', error);
      setError('Failed to load options. Please refresh the page.');
      toast.error('Failed to load options');
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleAppUsageToggle = (id) => {
    setSelectedAppUsageIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleIndustryToggle = (id) => {
    setSelectedIndustryIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* App Usage Section */}
        <div className="space-y-4">
          <Label className="text-base font-medium">What will you use this app for? *</Label>
          {loadingOptions ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading options...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {appUsageOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`app-usage-${option.id}`}
                    checked={selectedAppUsageIds.includes(option.id)}
                    onCheckedChange={() => handleAppUsageToggle(option.id)}
                    disabled={saving}
                  />
                  <label
                    htmlFor={`app-usage-${option.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Industry Section */}
        <div className="space-y-4">
          <Label className="text-base font-medium">What industry are you in? *</Label>
          {loadingOptions ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading options...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {industryOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`industry-${option.id}`}
                    checked={selectedIndustryIds.includes(option.id)}
                    onCheckedChange={() => handleIndustryToggle(option.id)}
                    disabled={saving}
                  />
                  <label
                    htmlFor={`industry-${option.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Size Section */}
        <div className="space-y-4">
          <Label className="text-base font-medium">What's your team size? *</Label>
          {loadingOptions ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading options...</span>
            </div>
          ) : (
            <RadioGroup
              value={selectedTeamSizeId}
              onValueChange={setSelectedTeamSizeId}
              disabled={saving}
            >
              <div className="space-y-3">
                {teamSizeOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={`team-size-${option.id}`} />
                    <label
                      htmlFor={`team-size-${option.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/onboarding/step2')}
            disabled={saving || loadingOptions}
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={saving || loadingOptions}
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
