import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import StatsCards from '../components/StatsCards';
import FiltersBar from '../components/FiltersBar';
import ReferralCard from '../components/ReferralCard';
import ReferralModal from '../components/modals/ReferralModal';
import StatusModal from '../components/modals/StatusModal';
import DetailsModal from '../components/modals/DetailsModal';
import DeleteModal from '../components/modals/DeleteModal';
import api from '../api/client';
import { PlusCircle, FileSpreadsheet, Inbox, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, referred: 0, started: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals state
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [editingReferral, setEditingReferral] = useState(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTargetReferral, setStatusTargetReferral] = useState(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsTargetReferral, setDetailsTargetReferral] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetReferral, setDeleteTargetReferral] = useState(null);

  const fetchReferrals = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.instituteType = typeFilter;

      const res = await api.get('/referrals', { params });
      if (res.data.success) {
        setReferrals(res.data.data);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Fetch referrals error:', err);
      toast.error('Failed to load referral records');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReferrals();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchReferrals]);

  // Handlers
  const handleOpenNew = () => {
    setEditingReferral(null);
    setIsReferralModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingReferral(record);
    setIsReferralModalOpen(true);
  };

  const handleOpenStatus = (record) => {
    setStatusTargetReferral(record);
    setIsStatusModalOpen(true);
  };

  const handleOpenDetails = (record) => {
    setDetailsTargetReferral(record);
    setIsDetailsModalOpen(true);
  };

  const handleOpenDelete = (record) => {
    setDeleteTargetReferral(record);
    setIsDeleteModalOpen(true);
  };

  const handleSaveReferral = async (data) => {
    if (editingReferral) {
      const res = await api.put(`/referrals/${editingReferral._id}`, data);
      if (res.data.success) {
        toast.success('Referral updated successfully');
        fetchReferrals();
      }
    } else {
      const res = await api.post('/referrals', data);
      if (res.data.success) {
        toast.success('Referral created successfully');
        fetchReferrals();
      }
    }
  };

  const handleUpdateStatus = async (id, updateData) => {
    const res = await api.patch(`/referrals/${id}/status`, updateData);
    if (res.data.success) {
      toast.success('Status updated successfully');
      fetchReferrals();
    }
  };

  const handleDeleteConfirm = async (id) => {
    const res = await api.delete(`/referrals/${id}`);
    if (res.data.success) {
      toast.success('Referral deleted successfully');
      fetchReferrals();
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Top navigation */}
      <Navbar />

      <main className="dashboard-container">
        {/* Hero Section */}
        <section className="hero-banner">
          <div>
            <h2>Referral Management Dashboard</h2>
            <p>Track, manage, and facilitate child health referrals and hospital treatment.</p>
          </div>

          <button onClick={handleOpenNew} className="btn btn-light" style={{ fontWeight: 700 }}>
            <PlusCircle size={18} color="#0284c7" />
            <span>New Referral</span>
          </button>
        </section>

        {/* Live Stats */}
        <StatsCards stats={stats} />

        {/* Records Panel */}
        <section className="records-panel">
          <div className="panel-header">
            <div>
              <h3>Referral Records</h3>
              <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
                Showing {referrals.length} record{referrals.length !== 1 ? 's' : ''}
              </p>
            </div>

            <FiltersBar
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
            />
          </div>

          {/* Records Display */}
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
              <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px auto', animation: 'spin 1s linear infinite' }} />
              <p>Loading referral records...</p>
            </div>
          ) : referrals.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <Inbox size={48} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ fontSize: '1.15rem', color: '#1e293b', marginBottom: '6px' }}>No referrals found</h4>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '18px' }}>
                {search || statusFilter || typeFilter
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first child referral'}
              </p>
              {!search && !statusFilter && !typeFilter && (
                <button onClick={handleOpenNew} className="btn btn-primary">
                  <PlusCircle size={16} />
                  <span>Create First Referral</span>
                </button>
              )}
            </div>
          ) : (
            <div className="referrals-grid">
              {referrals.map((referral) => (
                <ReferralCard
                  key={referral._id}
                  referral={referral}
                  onView={handleOpenDetails}
                  onEdit={handleOpenEdit}
                  onStatus={handleOpenStatus}
                  onDelete={handleOpenDelete}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* MODALS */}
      <ReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        onSave={handleSaveReferral}
        editingReferral={editingReferral}
      />

      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        referral={statusTargetReferral}
        onUpdateStatus={handleUpdateStatus}
      />

      <DetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        referral={detailsTargetReferral}
        onEdit={handleOpenEdit}
        onStatus={handleOpenStatus}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        referral={deleteTargetReferral}
        onDeleteConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default DashboardPage;
