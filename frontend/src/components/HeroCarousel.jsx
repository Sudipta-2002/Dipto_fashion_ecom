// import React, { useState, useEffect, useRef } from 'react';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
// import { API_URL, apiFetch, parseResponseSafely } from '../api';

// const HeroCarousel = ({ onSelectCategory }) => {
//   const [banners, setBanners] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const autoPlayRef = useRef(null);

//   useEffect(() => {
//     fetchHeroBanners();
//   }, []);

//   const fetchHeroBanners = async () => {
//     try {
//       const res = await apiFetch('/api/hero-banners/active');
//       const data = await parseResponseSafely(res);
//       if (res.ok && Array.isArray(data) && data.length > 0) {
//         setBanners(data);
//       } else {
//         loadLocalStorageFallback();
//       }
//     } catch (e) {
//       loadLocalStorageFallback();
//     }
//   };

//   const loadLocalStorageFallback = () => {
//     try {
//       const saved = localStorage.getItem('df_hero_banners');
//       if (saved) {
//         const list = JSON.parse(saved);
//         if (Array.isArray(list) && list.length > 0) {
//           setBanners(list.filter((b) => b.isActive));
//         }
//       }
//     } catch (e) {}
//   };

//   // Autoplay carousel if > 1 banner
//   useEffect(() => {
//     if (banners.length <= 1) return;

//     autoPlayRef.current = setInterval(() => {
//       setCurrentIndex((prev) => (prev + 1) % banners.length);
//     }, 4500);

//     return () => {
//       if (autoPlayRef.current) clearInterval(autoPlayRef.current);
//     };
//   }, [banners.length]);

//   const handlePrev = () => {
//     setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
//   };

//   const handleNext = () => {
//     setCurrentIndex((prev) => (prev + 1) % banners.length);
//   };

//   const handleBannerClick = (banner) => {
//     if (!banner) return;
//     if (banner.linkUrl && onSelectCategory) {
//       onSelectCategory(banner.linkUrl);
//     }
//   };

//   if (!banners || banners.length === 0) return null;

//   return (
//     <div
//       className="hero-carousel-container"
//       style={{
//         maxWidth: '1440px',
//         width: '100%',
//         margin: '0.75rem auto 0.5rem auto',
//         padding: '0 1.25rem',
//         boxSizing: 'border-box'
//       }}
//     >
//       <div
//         className="hero-carousel-inner"
//         style={{
//           position: 'relative',
//           width: '100%',
//           borderRadius: '1rem',
//           overflow: 'hidden',
//           boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
//           background: '#0f172a'
//         }}
//       >
//         {banners.map((banner, index) => (
//           <div
//             key={banner._id || index}
//             onClick={() => handleBannerClick(banner)}
//             style={{
//               position: 'absolute',
//               inset: 0,
//               opacity: index === currentIndex ? 1 : 0,
//               transition: 'opacity 0.6s ease-in-out',
//               pointerEvents: index === currentIndex ? 'auto' : 'none',
//               cursor: banner.linkUrl ? 'pointer' : 'default'
//             }}
//           >
//             {/* Banner Image */}
//             <img
//               src={banner.imageUrl}
//               alt={banner.title || 'Sale Hero Banner'}
//               style={{
//                 width: '100%',
//                 height: '100%',
//                 objectFit: 'cover',
//                 borderRadius: '1rem'
//               }}
//             />

//             {/* Subtle Dark Bottom Gradient Overlay for High Legibility */}
//             <div
//               style={{
//                 position: 'absolute',
//                 inset: 0,
//                 background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0) 100%)',
//                 pointerEvents: 'none'
//               }}
//             />

//             {/* Bottom-Left Corner Text Overlay (Multiline Preserved) */}
//             <div
//               style={{
//                 position: 'absolute',
//                 left: 'clamp(1rem, 3.5vw, 2rem)',
//                 bottom: 'clamp(1rem, 3.5vw, 2rem)',
//                 zIndex: 10,
//                 display: 'flex',
//                 flexDirection: 'column',
//                 gap: '0.2rem',
//                 maxWidth: '85%',
//                 pointerEvents: 'none'
//               }}
//             >
//               {banner.subtitle && (
//                 <span
//                   style={{
//                     fontSize: 'clamp(0.65rem, 1.4vw, 0.82rem)',
//                     fontWeight: '700',
//                     letterSpacing: '0.05em',
//                     color: 'rgba(255, 255, 255, 0.9)',
//                     textTransform: 'none',
//                     whiteSpace: 'pre-line',
//                     filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))'
//                   }}
//                 >
//                   {banner.subtitle}
//                 </span>
//               )}

//               {banner.title && (
//                 <h2
//                   style={{
//                     fontSize: 'clamp(1.05rem, 3vw, 2.1rem)',
//                     fontWeight: '900',
//                     color: '#ffffff',
//                     textTransform: 'none',
//                     letterSpacing: '-0.02em',
//                     lineHeight: 1.15,
//                     margin: 0,
//                     whiteSpace: 'pre-line',
//                     filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.75))'
//                   }}
//                 >
//                   {banner.title}
//                 </h2>
//               )}
//             </div>
//           </div>
//         ))}

//         {/* Navigation Arrows */}
//         {banners.length > 1 && (
//           <>
//             <button
//               type="button"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handlePrev();
//               }}
//               style={{
//                 position: 'absolute',
//                 left: '12px',
//                 top: '50%',
//                 transform: 'translateY(-50%)',
//                 background: 'rgba(255, 255, 255, 0.85)',
//                 border: 'none',
//                 borderRadius: '50%',
//                 width: '36px',
//                 height: '36px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 cursor: 'pointer',
//                 boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
//                 zIndex: 10
//               }}
//             >
//               <ChevronLeft size={20} color="#0f172a" />
//             </button>

//             <button
//               type="button"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleNext();
//               }}
//               style={{
//                 position: 'absolute',
//                 right: '12px',
//                 top: '50%',
//                 transform: 'translateY(-50%)',
//                 background: 'rgba(255, 255, 255, 0.85)',
//                 border: 'none',
//                 borderRadius: '50%',
//                 width: '36px',
//                 height: '36px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 cursor: 'pointer',
//                 boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
//                 zIndex: 10
//               }}
//             >
//               <ChevronRight size={20} color="#0f172a" />
//             </button>

//             {/* Dot Indicators */}
//             <div
//               style={{
//                 position: 'absolute',
//                 bottom: '10px',
//                 left: '50%',
//                 transform: 'translateX(-50%)',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '6px',
//                 zIndex: 10
//               }}
//             >
//               {banners.map((_, idx) => (
//                 <button
//                   key={idx}
//                   type="button"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setCurrentIndex(idx);
//                   }}
//                   style={{
//                     width: idx === currentIndex ? '22px' : '8px',
//                     height: '8px',
//                     borderRadius: '4px',
//                     background: idx === currentIndex ? '#c026d3' : 'rgba(255, 255, 255, 0.7)',
//                     border: 'none',
//                     cursor: 'pointer',
//                     transition: 'all 0.3s ease'
//                   }}
//                 />
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default HeroCarousel;






import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { API_URL, apiFetch, parseResponseSafely } from '../api';

const HeroCarousel = ({ onSelectCategory }) => {
  const [banners, setBanners] = useState(() => {
    try {
      const saved = localStorage.getItem('df_hero_banners');
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list) && list.length > 0) {
          return list.filter((b) => b.isActive);
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(() => banners.length === 0);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    fetchHeroBanners();
  }, []);

  const fetchHeroBanners = async () => {
    try {
      const res = await apiFetch('/api/hero-banners/active');
      const data = await parseResponseSafely(res);
      if (res.ok && Array.isArray(data) && data.length > 0) {
        setBanners(data);
        try {
          localStorage.setItem('df_hero_banners', JSON.stringify(data));
        } catch (e) {}
      } else {
        loadLocalStorageFallback();
      }
    } catch (e) {
      loadLocalStorageFallback();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalStorageFallback = () => {
    try {
      const saved = localStorage.getItem('df_hero_banners');
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list) && list.length > 0) {
          setBanners(list.filter((b) => b.isActive));
        }
      }
    } catch (e) {}
  };

  // Autoplay carousel if > 1 banner
  useEffect(() => {
    if (banners.length <= 1) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [banners.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleBannerClick = (banner) => {
    if (!banner) return;
    if (banner.linkUrl && onSelectCategory) {
      onSelectCategory(banner.linkUrl);
    }
  };

  // Loading obosthay layout reservation
  if (loading && (!banners || banners.length === 0)) {
    return (
      <div
        className="hero-carousel-container"
        style={{
          maxWidth: '1440px',
          width: '100%',
          margin: '0.75rem auto 0.5rem auto',
          padding: '0 1.25rem',
          boxSizing: 'border-box'
        }}
      >
        <div
          className="hero-carousel-inner"
          style={{
            position: 'relative',
            width: '100%',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            background: '#0f172a',
            minHeight: '220px'
          }}
        />
      </div>
    );
  }

  if (!banners || banners.length === 0) return null;

  return (
    <div
      className="hero-carousel-container"
      style={{
        maxWidth: '1440px',
        width: '100%',
        margin: '0.75rem auto 0.5rem auto',
        padding: '0 1.25rem',
        boxSizing: 'border-box'
      }}
    >
      <div
        className="hero-carousel-inner"
        style={{
          position: 'relative',
          width: '100%',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          background: '#0f172a'
        }}
      >
        {banners.map((banner, index) => (
          <div
            key={banner._id || index}
            onClick={() => handleBannerClick(banner)}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: index === currentIndex ? 1 : 0,
              transition: 'opacity 0.6s ease-in-out',
              pointerEvents: index === currentIndex ? 'auto' : 'none',
              cursor: banner.linkUrl ? 'pointer' : 'default'
            }}
          >
            {/* Banner Image */}
            <img
              src={banner.imageUrl}
              alt={banner.title || 'Sale Hero Banner'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '1rem'
              }}
            />

            {/* Subtle Dark Bottom Gradient Overlay for High Legibility */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0) 100%)',
                pointerEvents: 'none'
              }}
            />

            {/* Bottom-Left Corner Text Overlay (Multiline Preserved) */}
            <div
              style={{
                position: 'absolute',
                left: 'clamp(1rem, 3.5vw, 2rem)',
                bottom: 'clamp(1rem, 3.5vw, 2rem)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
                maxWidth: '85%',
                pointerEvents: 'none'
              }}
            >
              {banner.subtitle && (
                <span
                  style={{
                    fontSize: 'clamp(0.65rem, 1.4vw, 0.82rem)',
                    fontWeight: '700',
                    letterSpacing: '0.05em',
                    color: 'rgba(255, 255, 255, 0.9)',
                    textTransform: 'none',
                    whiteSpace: 'pre-line',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))'
                  }}
                >
                  {banner.subtitle}
                </span>
              )}

              {banner.title && (
                <h2
                  style={{
                    fontSize: 'clamp(1.05rem, 3vw, 2.1rem)',
                    fontWeight: '900',
                    color: '#ffffff',
                    textTransform: 'none',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    margin: 0,
                    whiteSpace: 'pre-line',
                    filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.75))'
                  }}
                >
                  {banner.title}
                </h2>
              )}
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.85)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 10
              }}
            >
              <ChevronLeft size={20} color="#0f172a" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.85)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 10
              }}
            >
              <ChevronRight size={20} color="#0f172a" />
            </button>

            {/* Dot Indicators */}
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                zIndex: 10
              }}
            >
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  style={{
                    width: idx === currentIndex ? '22px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: idx === currentIndex ? '#c026d3' : 'rgba(255, 255, 255, 0.7)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HeroCarousel;