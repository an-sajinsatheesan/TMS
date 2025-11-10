import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, FolderPlus, Copy, Globe } from 'lucide-react';
import { projectsService } from '../services/api/projects.service';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'MY_ORG', label: 'My Organization' },
  { value: 'ALL', label: 'All Templates' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'HR', label: 'HR' },
  { value: 'IT', label: 'IT' },
  { value: 'SALES', label: 'Sales' },
  { value: 'OPERATION', label: 'Operations' },
  { value: 'CAMPAIGN', label: 'Campaign' },
  { value: 'DESIGN', label: 'Design' },
];

const ProjectTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('MY_ORG');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [creatingProject, setCreatingProject] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [selectedCategory, searchQuery, templates, userProjects]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [templatesResponse, projectsResponse] = await Promise.all([
        projectsService.getTemplates(),
        projectsService.getAll()
      ]);

      // Handle templates response - backend returns { data: { all: [...], byCategory: {...} } }
      const templatesData = templatesResponse.data?.data || templatesResponse.data;
      setTemplates(templatesData?.all || []);

      // Handle projects response - backend returns { data: { data: [...], pagination: {...} } }
      const projectsData = projectsResponse.data?.data || projectsResponse.data;
      setUserProjects(projectsData?.data || projectsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load templates');
      setTemplates([]);
      setUserProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [];

    if (selectedCategory === 'MY_ORG') {
      // Show user's own projects
      filtered = userProjects;
    } else {
      // Show templates
      filtered = templates;

      // Filter by category
      if (selectedCategory !== 'ALL') {
        filtered = filtered.filter(t => t.templateCategory === selectedCategory);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  };

  const handleUseTemplate = async (template) => {
    const projectName = prompt(`Enter name for your new project:`, template.name);

    if (!projectName || !projectName.trim()) {
      return;
    }

    try {
      setCreatingProject(template.id);
      const response = await projectsService.cloneTemplate(template.id, projectName.trim());
      const newProject = response.data.data;

      toast.success(`Project "${projectName}" created successfully!`);

      // Navigate to the new project
      navigate(`/project-board/${newProject.createdBy}/${newProject.id}/list`);
    } catch (error) {
      console.error('Error creating project from template:', error);
      toast.error('Failed to create project from template');
    } finally {
      setCreatingProject(null);
    }
  };

  const handleCloneOrgProject = async (project) => {
    const projectName = prompt(`Enter name for your new project:`, `${project.name} (Copy)`);

    if (!projectName || !projectName.trim()) {
      return;
    }

    try {
      setCreatingProject(project.id);
      // For now, we'll use the same clone endpoint but in the future,
      // we could add a specific endpoint for cloning user projects
      const response = await projectsService.cloneTemplate(project.id, projectName.trim());
      const newProject = response.data.data;

      toast.success(`Project "${projectName}" created successfully!`);

      // Navigate to the new project
      navigate(`/project-board/${newProject.createdBy}/${newProject.id}/list`);
    } catch (error) {
      console.error('Error cloning project:', error);
      toast.error('Failed to clone project');
    } finally {
      setCreatingProject(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const isMyOrgTab = selectedCategory === 'MY_ORG';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              {isMyOrgTab ? 'My Projects' : 'Project Templates'}
            </h1>
          </div>
          <p className="text-gray-600">
            {isMyOrgTab
              ? 'Clone from your existing projects'
              : 'Start your project with a pre-built template'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Category Tabs */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${isMyOrgTab ? 'projects' : 'templates'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredItems.length} {isMyOrgTab ? 'project' : 'template'}{filteredItems.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <FolderPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isMyOrgTab ? 'No projects found' : 'No templates found'}
            </h3>
            <p className="text-gray-500">
              {isMyOrgTab
                ? 'You don\'t have any projects yet'
                : 'Try adjusting your filters or search query'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Item Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: item.color || '#3b82f6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {/* Global Template Badge */}
                        {!isMyOrgTab && item.isGlobal && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200">
                            <Globe className="w-3 h-3" />
                            Global
                          </span>
                        )}
                        {/* Category Badge */}
                        {!isMyOrgTab && item.templateCategory && (
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                            {item.templateCategory}
                          </span>
                        )}
                        {/* Layout Badge (for My Org projects) */}
                        {isMyOrgTab && (
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            {item.layout || 'LIST'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.description || 'No description available'}
                  </p>
                </div>

                {/* Item Info */}
                <div className="px-6 py-4 bg-gray-50">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{item._count?.sections || item.memberCount || 0} sections</span>
                    <span>{item._count?.tasks || item.taskCount || 0} tasks</span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => isMyOrgTab ? handleCloneOrgProject(item) : handleUseTemplate(item)}
                    disabled={creatingProject === item.id}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {creatingProject === item.id ? (
                      'Creating...'
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {isMyOrgTab ? 'Clone Project' : 'Use Template'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTemplates;
