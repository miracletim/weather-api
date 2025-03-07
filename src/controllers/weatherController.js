const redisClient = require('../services/redisClient');
const { fetchWeatherData } = require('../services/api');

const getWeather = async (req, res) => {
    const city = req.query.city;
    if (!city) {
        console.error('Bad Request');
        return res.status(400).json({ error: 'Bad Request' });
        } 

    try {
        console.log(`🔍 Checking for city: ${city}`);
        
        let cachedData;
        try {
            cachedData = await redisClient.get(city);
        } catch (redisError) {
            console.warn("⚠ Redis read failed, falling back to API:", redisError.message);
        }

        if (cachedData) {
            console.log('📦 Cache hit');
            return res.json(JSON.parse(cachedData));
        }
        
        console.log('🌍 Fetching from API');
        const data = await fetchWeatherData(city);
        console.log('Fetched data:', data);

        // If data is invalid (no data.main) then return 404
        if (!data || !data.main) {
            console.error("🚨 Invalid city name:", city);
            return res.status(404).json({ error: "City not found" });
        }

        try {
            console.log('📝 Saving to cache');
            await redisClient.setEx(city, 3600, JSON.stringify(data));
        } catch (redisError) {
            console.warn("⚠ Redis write failed, proceeding without caching:", redisError.message);
        }

        res.json(data);
    } catch (error) {
        console.error('🚨 Error:', error);
        // If the error message is "City not found", return a 404
        if (error.message === "City not found") {
            return res.status(404).json({ error: "City not found" });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { getWeather };
