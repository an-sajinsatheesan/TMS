import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import InviteDialog from '../shared/InviteDialog';
import { useProject } from '../../contexts/ProjectContext';

const ProjectHeader = ({ projectName, projectIcon, projectColor, teamMembers, projectStatus, onStatusChange }) => {
  const [inviteDialogVisible, setInviteDialogVisible] = useState(false);
  const { activeProject } = useProject();
  const statusOptions = [
    { label: 'On Track', value: 'on_track', color: '#10b981', icon: 'pi-check-circle' },
    { label: 'At Risk', value: 'at_risk', color: '#f59e0b', icon: 'pi-exclamation-triangle' },
    { label: 'Off Track', value: 'off_track', color: '#ef4444', icon: 'pi-times-circle' },
    { label: 'On Hold', value: 'on_hold', color: '#6b7280', icon: 'pi-pause-circle' },
    { label: 'Complete', value: 'complete', color: '#8b5cf6', icon: 'pi-check' }
  ];

  const [selectedStatus, setSelectedStatus] = useState(
    projectStatus || statusOptions[0].value
  );

  // Sync local state when projectStatus prop changes
  useEffect(() => {
    if (projectStatus) {
      setSelectedStatus(projectStatus);
    }
  }, [projectStatus]);

  const handleStatusChange = (e) => {
    setSelectedStatus(e.value);
    if (onStatusChange) onStatusChange(e.value);
  };

  const selectedStatusOption = statusOptions.find(opt => opt.value === selectedStatus);

  const statusTemplate = (option) => {
    if (!option) return null;
    return (
      <div className="flex items-center gap-2">
        <i className={`pi ${option.icon}`} style={{ color: option.color }}></i>
        <span>{option.label}</span>
      </div>
    );
  };

  return (
    <div className="border-b border-gray-200 bg-white px-8 py-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
        <button className="hover:text-gray-900 transition-colors flex items-center gap-1">
          <i className="pi pi-angle-left text-xs"></i>
          <i className="pi pi-angle-right text-xs"></i>
        </button>
        <span className="hover:text-gray-900 cursor-pointer">My Pages</span>
        <i className="pi pi-angle-right text-xs"></i>
        <span className="text-gray-900 font-medium">{projectName}</span>
      </div>

      {/* Project Title and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Project Icon and Name */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${projectColor} rounded-xl flex items-center justify-center`}>
              <span className="text-white font-bold text-xl">{projectIcon}</span>
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">{projectName}</h1>
            </div>
          </div>

          {/* Project Status Dropdown */}
          <Dropdown
            value={selectedStatus}
            options={statusOptions}
            onChange={handleStatusChange}
            optionLabel="label"
            valueTemplate={statusTemplate}
            itemTemplate={statusTemplate}
            className="w-48"
          />
        </div>

        {/* Team Members and Actions */}
        <div className="flex items-center gap-4">
          {/* Team Members Avatars */}
          <div className="flex items-center">
            {teamMembers && teamMembers.map((member, index) => (
              <div
                key={index}
                className="w-9 h-9 rounded-full border-2 border-white -ml-2 first:ml-0 flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: member.color, zIndex: teamMembers.length - index }}
                title={member.name}
              >
                {member.initials}
              </div>
            ))}
          </div>

          {/* Invite Button */}
          <button
            onClick={() => setInviteDialogVisible(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <i className="pi pi-user-plus text-xs"></i>
            <span>Invite</span>
          </button>

          {/* More Options */}
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <i className="pi pi-ellipsis-h text-sm"></i>
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <i className="pi pi-share-alt text-sm"></i>
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <i className="pi pi-star text-sm"></i>
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <i className="pi pi-ellipsis-v text-sm"></i>
          </button>
        </div>
      </div>

      {/* Invite Dialog */}
      <InviteDialog
        visible={inviteDialogVisible}
        onHide={() => setInviteDialogVisible(false)}
        projectId={activeProject?.id}
        projectName={projectName || activeProject?.name}
      />
    </div>
  );
};

ProjectHeader.propTypes = {
  projectName: PropTypes.string.isRequired,
  projectIcon: PropTypes.string.isRequired,
  projectColor: PropTypes.string,
  teamMembers: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      initials: PropTypes.string,
      color: PropTypes.string
    })
  ),
  projectStatus: PropTypes.string,
  onStatusChange: PropTypes.func
};

ProjectHeader.defaultProps = {
  projectColor: 'bg-purple-500',
  teamMembers: [],
  projectStatus: 'on_track'
};

export default ProjectHeader;
