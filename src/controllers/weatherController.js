const redisClient = require('../services/redisClient');
const { fetchWeatherData } = require('../services/api');

const getWeather = async(req, res) => {
    const city = req.query.city;
    if(!city) return res.status(400).json({ error: 'City is Required' });

    try {
        console.log(`🔍 Checking for city: ${city}`);
        const cachedData = await redisClient.get(city);

        if(cachedData) {
            console.log('📦 Cache hit');
            return res.json(JSON.parse(cachedData));
        }
        
        console.log('🌍 Fetching from API');
        const data = await fetchWeatherData(city);

        console.log('📝 Saving to cache');
        await redisClient.setEx(city, 3600, JSON.stringify(data));

        res.json(data);
    } catch(error) {
        console.error('🚨 Error:', error);
        res.status(500).json({ error: "Something went wrong" });
    }
}

module.exports = { getWeather };