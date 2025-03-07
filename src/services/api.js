require('dotenv').config();

const fetchWeatherData = async(location) => {
    const url = `https://open-weather13.p.rapidapi.com/city/${location}/EN`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'open-weather13.p.rapidapi.com'
        }
    };
    
    try {
        const response = await fetch(url, options);
        if(!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

        const result = await response.json();
        console.log(result);
        return result;
    } catch (error) {
        console.error("Error fetching weather data:", error.message);
    }
}

module.exports = { fetchWeatherData };