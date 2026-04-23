import { TableComponentProps } from '@/types/table_props.type';
import { DataGrid } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import { useState } from 'react';

const TableComponent = ({
  columns,
  data,
  currentPage,
  setCurrentPage,
  totalItems,
  isLoading,
  pageSize,
  onPageChange,
}: TableComponentProps) => {
  const [columnVisibility, setColumnVisibility] = useState(
    columns.reduce((acc, column) => {
      acc[column.field] = true;
      return acc;
    }, {} as { [key: string]: boolean })
  );

  const paginationModel = {
    page: currentPage - 1,
    pageSize: pageSize,
  };

  const handleColumnVisibilityChange = (newVisibility: { [key: string]: boolean }) => {
    const visibleColumns = Object.values(newVisibility).filter(Boolean).length;
    if (visibleColumns === 0) {
      newVisibility[columns[0].field] = true;
    }
    setColumnVisibility(newVisibility);
  };

  const handlePaginationChange = (newModel: any) => {
    const newPage = newModel.page + 1;
    setCurrentPage(newPage);
    onPageChange(newPage, newModel.pageSize);
  };

  return (
    <div style={{ width: '100%' }}>
      <DataGrid
        rows={data}
        columns={columns}
        pagination
        paginationMode="server"
        pageSizeOptions={[5, 10, 25]}
        loading={isLoading}
        paginationModel={paginationModel}
        rowCount={totalItems}
        // getRowHeight={() => "auto"}
        onPaginationModelChange={handlePaginationChange}
        getRowId={(row) => row.id || row.userId}
        columnVisibilityModel={columnVisibility}
        onColumnVisibilityModelChange={handleColumnVisibilityChange}
      />
    </div>
  );
};

TableComponent.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  currentPage: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  totalItems: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default TableComponent;
