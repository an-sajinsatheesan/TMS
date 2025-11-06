import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { onboardingService } from '../../api/onboarding.service';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import 'primereact/resources/themes/lara-light-teal/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

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

  useEffect(() => {
    console.log('teamSizeOptions state updated:', teamSizeOptions);
    console.log('teamSizeOptions is array?', Array.isArray(teamSizeOptions));
    console.log('teamSizeOptions length:', teamSizeOptions.length);
  }, [teamSizeOptions]);

  const fetchAllOptions = async () => {
    try {
      const response = await onboardingService.getAllOptions();
      const data = response.data;
      
      
      setAppUsageOptions(data.appUsage || []);
      setIndustryOptions(data.industries || []);
      setTeamSizeOptions(data.teamSizes || []);
      setRoleOptions(data.roles || []);
 


      console.log(appUsageOptions, 'appUsageOptions');
      console.log(industryOptions, 'industryOptions');
      console.log(teamSizeOptions, 'teamSizeOptions');
      console.log(roleOptions, 'roleOptions');
       
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
      <div className="card p-6">
        <div className="flex justify-center items-center py-12">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Tell us about your company</h2>
        <p className="text-gray-600">
          This helps us personalize your experience and provide relevant features.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Message severity="error" text={error} className="w-full" />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6 mb-6">
          {/* App Usage */}
          <div className="flex flex-col gap-2">
            <label htmlFor="appUsage" className="block text-gray-700 text-sm font-semibold">
              What will you use StackFlow for? *
            </label>
            <MultiSelect
              id="appUsage"
              value={selectedAppUsageIds}
              onChange={(e) => setSelectedAppUsageIds(e.value)}
              options={appUsageOptions}
              optionLabel="label"
              optionValue="id"
              placeholder="Select usage types"
              display="chip"
              className="w-full"
              showSelectAll={false}
              filter={false}
              disabled={saving}
            />
          </div>

          {/* Industry */}
          <div className="flex flex-col gap-2">
            <label htmlFor="industries" className="block text-gray-700 text-sm font-semibold">
              What industry best describes your company? *
            </label>
            <MultiSelect
              id="industries"
              value={selectedIndustryIds}
              onChange={(e) => setSelectedIndustryIds(e.value)}
              options={industryOptions}
              optionLabel="label"
              optionValue="id"
              placeholder="Select industries"
              display="chip"
              className="w-full"
              showSelectAll={false}
              filter={false}
              disabled={saving}
            />
          </div>

          {/* Team Size */}
          <div className="flex flex-col gap-2">
            <label htmlFor="teamSize" className="block text-gray-700 text-sm font-semibold">
              How big is your team? *
            </label>
            <Dropdown
              id="teamSize"
              value={selectedTeamSizeId}
              onChange={(e) => {
                console.log('Selected team size:', e.value);
                setSelectedTeamSizeId(e.value);
              }}
              options={teamSizeOptions}
              optionLabel="label"
              optionValue="id"
              placeholder="Select team size"
              className="w-full"
              disabled={saving}
              appendTo="self"
            />
          </div>

          {/* Role */}
          <div className="flex flex-col gap-2">
            <label htmlFor="roles" className="block text-gray-700 text-sm font-semibold">
              What best describes your role? *
            </label>
            <MultiSelect
              id="roles"
              value={selectedRoleIds}
              onChange={(e) => setSelectedRoleIds(e.value)}
              options={roleOptions}
              optionLabel="label"
              optionValue="id"
              placeholder="Select your role(s)"
              display="chip"
              className="w-full"
              showSelectAll={false}
              filter={false}
              disabled={saving}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/onboarding/step3')}
            disabled={saving}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step4CompanyInfo;
