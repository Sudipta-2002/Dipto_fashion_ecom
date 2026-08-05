import React, { useState } from 'react';
import { X, Star, CheckCircle } from 'lucide-react';
import { API_URL } from '../api';

const ProductRatingModal = ({ isOpen, onClose, product, userName, onRatingSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productId = product.product || product._id;
      const res = await fetch(`${API_URL}/api/products/${productId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment,
          userName: userName || 'Verified Buyer'
        })
      });

      if (!res.ok) throw new Error('Failed to submit rating');

      setSubmitted(true);
      if (onRatingSuccess) onRatingSuccess(productId, rating);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 450 }}>
      <div className="modal-card" style={{ maxWidth: '440px', width: '92%', borderRadius: '16px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Rate & Review Product</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
            <CheckCircle size={48} color="#16a34a" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>Thank You for Your Feedback!</h4>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.35rem' }}>
              Your rating of {rating} ★ has been published on Dipto Fashion.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-body">
            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', marginBottom: '1.25rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <img src={product.image} alt={product.name} style={{ width: '54px', height: '54px', objectFit: 'cover', borderRadius: '6px' }} />
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{product.name}</h4>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>Verified Purchase</p>
              </div>
            </div>

            {/* 5-STAR INTERACTIVE RATING BAR */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
                Tap stars to select rating (1 to 5 Stars):
              </label>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((starIndex) => {
                  const activeStar = (hoverRating || rating) >= starIndex;
                  return (
                    <button
                      key={starIndex}
                      type="button"
                      onClick={() => setRating(starIndex)}
                      onMouseEnter={() => setHoverRating(starIndex)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', transition: 'transform 0.15s ease' }}
                    >
                      <Star
                        size={32}
                        fill={activeStar ? '#facc15' : 'none'}
                        color={activeStar ? '#eab308' : '#cbd5e1'}
                        strokeWidth={1.5}
                      />
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#c026d3', marginTop: '0.4rem' }}>
                {rating === 5 ? '5.0 ★ Excellent' : rating === 4 ? '4.0 ★ Very Good' : rating === 3 ? '3.0 ★ Good' : rating === 2 ? '2.0 ★ Fair' : '1.0 ★ Poor'}
              </div>
            </div>

            {/* OPTIONAL COMMENT TEXTAREA */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>
                Write your review comment (Optional)
              </label>
              <textarea
                rows="3"
                placeholder="Tell other shoppers about fabric quality, fitting, or style..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem' }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
              disabled={loading}
            >
              {loading ? 'Submitting Review...' : 'Submit Rating & Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductRatingModal;
