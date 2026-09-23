// Patch untuk tailwind.config.js -> merge ke theme.extend
module.exports.extendPatch = {
  fontFamily: { display: ['var(--font-display)', 'system-ui', 'sans-serif'] },
  keyframes: {
    spinSlow: { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
    marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
    float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
  },
  animation: {
    spinSlow: 'spinSlow 40s linear infinite',
    marquee: 'marquee 25s linear infinite',
    float: 'float 4s ease-in-out infinite',
  },
};
