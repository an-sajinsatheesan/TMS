import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { onboardingService } from '../../api/onboarding.service';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { AlertCircle, Loader2 } from 'lucide-react';

const Step4CompanyInfo = () => {
  const navigate = useNavigate();
  const { setCurrentStep, saveCompanyInfo } = useOnboarding();

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAllOptions();
  }, []);

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

    if (selectedRoleIds.length === 0) {
      setError('Please select at least one role');
      return;
    }

    setError('');
    setSaving(true);

    try {
      await saveCompanyInfo({
        appUsageIds: selectedAppUsageIds,
        industryIds: selectedIndustryIds,
        teamSizeId: selectedTeamSizeId,
        roleIds: selectedRoleIds,
      });
      setCurrentStep(5);
      navigate('/onboarding/step5');
    } catch (err) {
      console.error('Save error:', err);
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Tell us about your company</h2>
        <p className="text-gray-600">
          This helps us personalize your experience and provide relevant features.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6 mb-6">
          {/* App Usage */}
          <div className="flex flex-col gap-2">
            <label htmlFor="appUsage" className="block text-sm font-semibold">
              What will you use TMS for? *
            </label>
            <MultiSelect
              options={appUsageOptions}
              value={selectedAppUsageIds}
              onChange={setSelectedAppUsageIds}
              optionLabel="label"
              optionValue="id"
              placeholder="Select usage types"
              disabled={saving}
            />
          </div>

          {/* Industry */}
          <div className="flex flex-col gap-2">
            <label htmlFor="industries" className="block text-sm font-semibold">
              What industry best describes your company? *
            </label>
            <MultiSelect
              options={industryOptions}
              value={selectedIndustryIds}
              onChange={setSelectedIndustryIds}
              optionLabel="label"
              optionValue="id"
              placeholder="Select industries"
              disabled={saving}
            />
          </div>

          {/* Team Size */}
          <div className="flex flex-col gap-2">
            <label htmlFor="teamSize" className="block text-sm font-semibold">
              How big is your team? *
            </label>
            <Select value={selectedTeamSizeId} onValueChange={setSelectedTeamSizeId} disabled={saving}>
              <SelectTrigger>
                <SelectValue placeholder="Select team size" />
              </SelectTrigger>
              <SelectContent>
                {teamSizeOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role */}
          <div className="flex flex-col gap-2">
            <label htmlFor="roles" className="block text-sm font-semibold">
              What best describes your role? *
            </label>
            <MultiSelect
              options={roleOptions}
              value={selectedRoleIds}
              onChange={setSelectedRoleIds}
              optionLabel="label"
              optionValue="id"
              placeholder="Select your role(s)"
              disabled={saving}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/onboarding/step3')}
            disabled={saving}
          >
            Back
          </Button>
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Step4CompanyInfo;
