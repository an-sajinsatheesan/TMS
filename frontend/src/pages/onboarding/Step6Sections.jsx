import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveSections, clearError } from '../../store/slices/onboardingSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '../../hooks/useToast.jsx';

const Step6Sections = () => {
  const [sections, setSections] = useState(['To Do', 'In Progress', 'Done']);
  const [newSection, setNewSection] = useState('');
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error: reduxError } = useSelector((state) => state.onboarding);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleAddSection = () => {
    if (newSection.trim() && !sections.includes(newSection.trim())) {
      setSections([...sections, newSection.trim()]);
      setNewSection('');
    }
  };

  const handleRemoveSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (sections.length === 0) {
      setLocalError('Please add at least one section');
      return;
    }

    try {
      await dispatch(saveSections(sections)).unwrap();
      toast.success('Sections saved successfully');
      navigate('/onboarding/step6');
    } catch (err) {
      toast.error('Failed to save sections', {
        description: err || 'Please try again'
      });
      setLocalError(err || 'Failed to save. Please try again.');
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Add sections to your project</h2>
        <p className="text-gray-600">
          Sections help you organize tasks into different stages.
        </p>
      </div>

      {(localError || reduxError) && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{localError || reduxError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleContinue} className="space-y-6 mb-8">
        <div className="space-y-2">
          {sections.map((section, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input value={section} readOnly className="flex-1" />
              {sections.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveSection(index)}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
            placeholder="Add a new section"
            onKeyPress={(e) => e.key === 'Enter' && handleAddSection()}
            disabled={loading}
          />
          <Button
            type="button"
            onClick={handleAddSection}
            variant="outline"
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/onboarding/step4')}
            disabled={loading}
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={sections.length === 0 || loading}
            className="flex-1"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Step6Sections;
