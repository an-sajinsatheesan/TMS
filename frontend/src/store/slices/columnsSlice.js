import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { columnsService } from '../../services/api/columns.service';

// Async thunks
export const fetchColumns = createAsyncThunk(
  'columns/fetchColumns',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await columnsService.getAll(projectId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch columns');
    }
  }
);

export const createColumn = createAsyncThunk(
  'columns/createColumn',
  async ({ projectId, columnData }, { rejectWithValue }) => {
    try {
      const response = await columnsService.create(projectId, columnData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create column');
    }
  }
);

export const updateColumn = createAsyncThunk(
  'columns/updateColumn',
  async ({ projectId, columnId, updates }, { rejectWithValue }) => {
    try {
      const response = await columnsService.update(projectId, columnId, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update column');
    }
  }
);

export const deleteColumn = createAsyncThunk(
  'columns/deleteColumn',
  async ({ projectId, columnId }, { rejectWithValue }) => {
    try {
      await columnsService.delete(projectId, columnId);
      return columnId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete column');
    }
  }
);

export const reorderColumns = createAsyncThunk(
  'columns/reorderColumns',
  async ({ projectId, columnIds }, { rejectWithValue }) => {
    try {
      const response = await columnsService.reorder(projectId, columnIds);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reorder columns');
    }
  }
);

// Default system columns (cannot be deleted)
const DEFAULT_SYSTEM_COLUMNS = [
  {
    id: 'taskNumber',
    name: '#',
    type: 'number',
    width: 64,
    visible: true,
    position: 0,
    isSystem: true,
  },
  {
    id: 'taskName',
    name: 'Task Name',
    type: 'text',
    width: 320,
    visible: true,
    position: 1,
    isSystem: true,
  },
];

const initialState = {
  columns: DEFAULT_SYSTEM_COLUMNS,
  loading: false,
  error: null,
  currentProjectId: null,
};

const columnsSlice = createSlice({
  name: 'columns',
  initialState,
  reducers: {
    // Toggle column visibility locally (before sync)
    toggleColumnVisibility: (state, action) => {
      const columnId = action.payload;
      const column = state.columns.find((col) => col.id === columnId);
      if (column && !column.isSystem) {
        column.visible = !column.visible;
      }
    },
    // Clear columns (when switching projects)
    clearColumns: (state) => {
      state.columns = DEFAULT_SYSTEM_COLUMNS;
      state.currentProjectId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch columns
      .addCase(fetchColumns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchColumns.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProjectId = action.meta.arg;
        // Merge system columns with fetched custom columns
        const customColumns = action.payload.map((col, index) => ({
          ...col,
          position: DEFAULT_SYSTEM_COLUMNS.length + index,
          isSystem: false,
        }));
        state.columns = [...DEFAULT_SYSTEM_COLUMNS, ...customColumns];
      })
      .addCase(fetchColumns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create column
      .addCase(createColumn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createColumn.fulfilled, (state, action) => {
        state.loading = false;
        const newColumn = {
          ...action.payload,
          position: state.columns.length,
          isSystem: false,
        };
        state.columns.push(newColumn);
      })
      .addCase(createColumn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update column
      .addCase(updateColumn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateColumn.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.columns.findIndex((col) => col.id === action.payload.id);
        if (index !== -1) {
          state.columns[index] = { ...state.columns[index], ...action.payload };
        }
      })
      .addCase(updateColumn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete column
      .addCase(deleteColumn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteColumn.fulfilled, (state, action) => {
        state.loading = false;
        state.columns = state.columns.filter((col) => col.id !== action.payload);
      })
      .addCase(deleteColumn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reorder columns
      .addCase(reorderColumns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reorderColumns.fulfilled, (state, action) => {
        state.loading = false;
        // Update positions from server response
        const customColumns = action.payload.map((col) => ({
          ...col,
          position: col.position + DEFAULT_SYSTEM_COLUMNS.length,
          isSystem: false,
        }));
        state.columns = [...DEFAULT_SYSTEM_COLUMNS, ...customColumns];
      })
      .addCase(reorderColumns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { toggleColumnVisibility, clearColumns } = columnsSlice.actions;
export default columnsSlice.reducer;
