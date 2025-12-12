import React from 'react';

export const FullPageSpinner = () => (
  <div style={{
    height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'
  }}>
    <div className="spinner" aria-hidden />
    <span className="sr-only">Loading…</span>
  </div>
);

// lightweight dashboard skeleton
export const DashboardSkeleton = () => (
  <div className="dashboard-skeleton" style={{ padding: 24 }}>
    {/* Header placeholder */}
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
      <div style={{ height: 32, width: '40%', background: '#eee', borderRadius: 6 }} />
      <div style={{ height: 40, width: 150, background: '#eee', borderRadius: 6 }} />
    </div>
    
    {/* Stats cards grid */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ height: 100, background: '#f5f5f5', borderRadius: 8, padding: 16 }}>
          <div style={{ height: 16, width: '60%', background: '#e0e0e0', borderRadius: 4, marginBottom: 8 }} />
          <div style={{ height: 24, width: '40%', background: '#e0e0e0', borderRadius: 4 }} />
        </div>
      ))}
    </div>
    
    {/* Table/Content area */}
    <div style={{ background: '#fafafa', borderRadius: 8, padding: 16 }}>
      <div style={{ height: 20, width: '30%', background: '#eee', borderRadius: 4, marginBottom: 16 }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          <div style={{ height: 16, width: '25%', background: '#f0f0f0', borderRadius: 4 }} />
          <div style={{ height: 16, width: '50%', background: '#f0f0f0', borderRadius: 4 }} />
          <div style={{ height: 16, width: '15%', background: '#f0f0f0', borderRadius: 4 }} />
        </div>
      ))}
    </div>
  </div>
);
