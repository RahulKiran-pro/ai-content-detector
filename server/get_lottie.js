const axios = require('axios');

async function run() {
  try {
    const urls = {
      text: 'https://app.lottiefiles.com/share/6ea8d00a-4321-4ee9-9c9f-788eab8da535',
      pdf: 'https://app.lottiefiles.com/share/3026d71f-1591-4b55-9841-393dcb6542f4',
      video: 'https://app.lottiefiles.com/share/798c9fda-0fb1-4120-8183-1f6c81a1d461'
    };

    for (const [key, link] of Object.entries(urls)) {
      const res = await axios.get(link);
      const matches = res.data.match(/https:\/\/lottie\.host\/[^"'\s]+/g);
      console.log(`${key.toUpperCase()} LOTTIE:`, matches);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
