import { createContext, useContext } from 'prop-types';
import PropTypes from 'prop-types';

const ListViewContext = createContext(null);

export const useListView = () => {
  const context = useContext(ListViewContext);
  if (!context) {
    // Return null if not in ListView context (e.g., in Board view)
    return null;
  }
  return context;
};

export const ListViewProvider = ({ children, value }) => {
  return (
    <ListViewContext.Provider value={value}>
      {children}
    </ListViewContext.Provider>
  );
};

ListViewProvider.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.shape({
    columns: PropTypes.array,
    activeFilters: PropTypes.object,
    activeSort: PropTypes.object,
    projectMembers: PropTypes.array,
    onFilterChange: PropTypes.func,
    onSortChange: PropTypes.func,
    onColumnVisibilityChange: PropTypes.func,
  }),
};
