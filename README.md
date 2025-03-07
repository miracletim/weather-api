### **Weather API** 🌦️  
A simple Node.js API for fetching and caching weather data.  

#### **Features** 🚀  
✅ Fetches weather data from an external API  
✅ Caches responses using Redis to improve performance  
✅ Handles API failures gracefully  
✅ Includes comprehensive unit tests  

#### **Endpoints**  
| Method | Endpoint | Description |
|--------|----------|------------|
| GET | `/` | Returns API status message |
| GET | `/api/weather?city={city}` | Returns weather data for a given city |

#### **Setup & Installation**  
1. Clone the repo:  
   ```bash
   git clone <https://github.com/miracletim/weather-api.git>
   cd <weather-api>
   ```
2. Install dependencies:  
   ```bash
   npm install
   ```
3. Set up environment variables (`.env` file):  
   ```
   REDIS_URL=your_redis_url
   WEATHER_API_KEY=your_api_key
   ```
4. Run the server:  
   ```bash
   npm start
   ```
5. Run tests:  
   ```bash
   npm test
   ```

#### **How It Works**  
- Checks Redis cache before making an API request  
- Saves new weather data in Redis for future requests  
- Handles errors for missing parameters, invalid cities, and API failures  

#### **Testing** 🧪  
Includes tests for:  
✅ API status response  
✅ Cache hit & miss scenarios  
✅ Redis failures  
✅ Invalid requests & edge cases  

#### **Deployment**  
You can deploy this using services like Heroku, Vercel, or Render.  