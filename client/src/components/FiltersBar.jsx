import React from 'react';
import { Search, X, Filter } from 'lucide-react';

const FiltersBar = ({ search, setSearch, statusFilter, setStatusFilter, typeFilter, setTypeFilter }) => {
  const isFiltered = search || statusFilter || typeFilter;

  const handleClear = () => {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
  };

  return (
    <div className="filters-bar">
      {/* Search Box */}
      <div className="search-box">
        <Search size={17} className="search-icon" />
        <input
          type="text"
          className="form-control"
          placeholder="Search child, institute, problem..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8'
            }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Status Filter */}
      <select
        className="form-control"
        style={{ width: 'auto' }}
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="Pending">Pending</option>
        <option value="Referred">Referred</option>
        <option value="Treatment Started">Treatment Started</option>
        <option value="Completed">Completed</option>
      </select>

      {/* Institute Filter */}
      <select
        className="form-control"
        style={{ width: 'auto' }}
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
      >
        <option value="">All Institutes</option>
        <option value="School">School</option>
        <option value="AWC">AWC (Anganwadi)</option>
      </select>

      {/* Reset Filter Button */}
      {isFiltered && (
        <button onClick={handleClear} className="btn btn-light btn-sm" title="Clear all filters">
          <X size={14} />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};

export default FiltersBar;
