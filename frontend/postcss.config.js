/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    tailwindcss: {
      config: `${__dirname}/tailwind.config.js`,
    },
    autoprefixer: {},
  },
};
