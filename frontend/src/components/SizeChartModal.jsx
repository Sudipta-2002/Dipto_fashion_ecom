import React from 'react';
import { X, Ruler, CheckCircle } from 'lucide-react';

const SizeChartModal = ({ isOpen, onClose, category }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 500 }}>
      <div className="modal-card" style={{ maxWidth: '560px', width: '92%', borderRadius: '16px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ background: '#fdf4ff', borderBottom: '1px solid #f5d0fe' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c026d3' }}>
            <Ruler size={22} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Dipto Fashion Size Guide</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
            All measurements are given in inches (in). Please measure around the fullest part of your bust/chest for exact fit.
          </p>

          <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
            👗 Punjabi Suits, Kurtas & Tops Size Chart
          </h4>
          <div className="table-responsive" style={{ marginBottom: '1.25rem' }}>
            <table className="admin-table" style={{ fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th>Size Tag</th>
                  <th>Chest / Bust (in)</th>
                  <th>Waist (in)</th>
                  <th>Shoulder (in)</th>
                  <th>Kurta Length (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong style={{ color: '#c026d3' }}>S</strong></td>
                  <td>36"</td>
                  <td>32"</td>
                  <td>14.0"</td>
                  <td>42"</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#c026d3' }}>M</strong></td>
                  <td>38"</td>
                  <td>34"</td>
                  <td>14.5"</td>
                  <td>42"</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#c026d3' }}>L</strong></td>
                  <td>40"</td>
                  <td>36"</td>
                  <td>15.0"</td>
                  <td>43"</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#c026d3' }}>XL</strong></td>
                  <td>42"</td>
                  <td>38"</td>
                  <td>15.5"</td>
                  <td>43"</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#c026d3' }}>XXL</strong></td>
                  <td>44"</td>
                  <td>40"</td>
                  <td>16.0"</td>
                  <td>44"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
            🥻 Saree & Unstitched Blouse
          </h4>
          <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '10px', padding: '0.85rem', fontSize: '0.85rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <CheckCircle size={24} />
            <div>
              <strong>Free Size (Universal Fit):</strong>
              <div style={{ fontSize: '0.78rem', marginTop: '2px', color: '#15803d' }}>
                Standard 5.5 Meters Saree length + 0.8 Meter unstitched blouse piece. Tailored easily for any size.
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }} onClick={onClose}>
              Got It! Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeChartModal;
