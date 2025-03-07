const { fetchWeatherData } = require('../services/api');

const getWeather = async(req, res) => {
    try {
        const weather = await fetchWeatherData(req.query.city);
        res.json(weather);
    }catch(error) {
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
}

module.exports = { getWeather };