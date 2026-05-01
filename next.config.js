/** @type {import('next').NextConfig} */
const nextConfig = {
  // La API base URL se configura aqui para no repetirla en cada fetch
  env: {
    API_URL: "https://backend-p4-klvc.onrender.com",
    STUDENT_NAME: "gabriel",
  },
};

module.exports = nextConfig;
