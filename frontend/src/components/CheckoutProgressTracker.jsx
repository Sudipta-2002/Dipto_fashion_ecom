import React from 'react';
import { Check, ShoppingCart, MapPin, CreditCard } from 'lucide-react';

const CheckoutProgressTracker = ({ currentStep = 'cart', cartCount = 0 }) => {
  // Determine status for each step: 'completed' | 'blinking' | 'upcoming'
  let step1Status = 'upcoming';
  let step2Status = 'upcoming';
  let step3Status = 'upcoming';

  if (currentStep === 'cart') {
    if (cartCount === 0) {
      // IF no product in cart: "Add Product" blinks green, other steps upcoming
      step1Status = 'blinking';
      step2Status = 'upcoming';
      step3Status = 'upcoming';
    } else {
      // IF product exists in cart: "Add Product" is green, next step "Place Order" blinks green
      step1Status = 'completed';
      step2Status = 'blinking';
      step3Status = 'upcoming';
    }
  } else if (currentStep === 'checkout') {
    step1Status = 'completed'; // Add Product is green
    step2Status = 'completed'; // Place Order turns green
    step3Status = 'blinking';  // Payment blinks green
  } else if (currentStep === 'payment') {
    step1Status = 'completed'; // Add Product is green
    step2Status = 'completed'; // Place Order is green
    step3Status = 'blinking';  // Payment blinks green
  } else if (currentStep === 'confirmation') {
    step1Status = 'completed'; // Add Product turns green
    step2Status = 'completed'; // Place Order turns green
    step3Status = 'completed'; // Payment turns green
  }

  const steps = [
    { id: 1, key: 'cart', label: 'Add Product', icon: ShoppingCart, status: step1Status },
    { id: 2, key: 'checkout', label: 'Place Order', icon: MapPin, status: step2Status },
    { id: 3, key: 'payment', label: 'Payment', icon: CreditCard, status: step3Status }
  ];

  const getStepStyles = (status) => {
    if (status === 'completed') {
      return {
        badgeStyle: {
          background: '#16a34a',
          color: '#ffffff',
          border: '2px solid #15803d',
          boxShadow: '0 2px 8px rgba(22, 163, 74, 0.35)'
        },
        labelStyle: { color: '#15803d', fontWeight: '800' }
      };
    }
    if (status === 'blinking') {
      return {
        badgeStyle: {
          border: '2px solid #16a34a'
        },
        labelStyle: { color: '#16a34a', fontWeight: '800' },
        isBlinking: true
      };
    }
    // upcoming (white)
    return {
      badgeStyle: {
        background: '#ffffff',
        color: '#94a3b8',
        border: '2px solid #cbd5e1'
      },
      labelStyle: { color: '#94a3b8', fontWeight: '600' }
    };
  };

  return (
    <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', borderRadius: '12px 12px 0 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', maxWidth: '420px', margin: '0 auto' }}>
        {/* Connecting Lines Background */}
        <div style={{ position: 'absolute', top: '18px', left: '35px', right: '35px', height: '3px', background: '#e2e8f0', zIndex: 1 }}>
          <div
            style={{
              height: '100%',
              background: '#16a34a',
              transition: 'width 0.4s ease',
              width: (currentStep === 'cart' && cartCount === 0) ? '0%' : (currentStep === 'cart' && cartCount > 0) ? '50%' : '100%'
            }}
          />
        </div>

        {steps.map((st, idx) => {
          const { badgeStyle, labelStyle, isBlinking } = getStepStyles(st.status);
          const IconComp = st.icon;

          return (
            <div key={st.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
              <div
                className={isBlinking ? 'step-blink-green' : ''}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  transition: 'all 0.3s ease',
                  ...badgeStyle
                }}
              >
                {st.status === 'completed' ? (
                  <Check size={18} strokeWidth={3} />
                ) : (
                  <span>{st.id}</span>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', marginTop: '6px', textAlign: 'center', whiteSpace: 'nowrap', ...labelStyle }}>
                {st.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutProgressTracker;
