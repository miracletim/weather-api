const request = require("supertest");
const app = require("../src/index");

jest.mock("../src/services/redisClient", () => ({
    get: jest.fn(),
    setEx: jest.fn(),
    quit: jest.fn().mockResolvedValue()
}));

jest.mock("../src/services/api", () => ({
    fetchWeatherData: jest.fn()
}));

const redisClient = require("../src/services/redisClient");
const { fetchWeatherData } = require("../src/services/api");


test("GET / should return API running message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("Weather API is running!");
});

test("GET /api/weather?city=kampala should return cached weather data", async () => {
    const cachedWeatherData = {
        name: "Kampala",
        main: { temp: 87.58 },
        weather: [{ description: "overcast clouds" }]
    };

    redisClient.get.mockResolvedValue(JSON.stringify(cachedWeatherData));

    const res = await request(app).get("/api/weather?city=kampala");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(cachedWeatherData);
    expect(fetchWeatherData).not.toHaveBeenCalled();
});

test("GET /api/weather?city=nairobi should return API weather data", async () => {
    const APIWeatherData = {
        name: "Nairobi",
        main: { temp: 40.58 },
        weather: [{ description: "clouds" }]
    };

    redisClient.get.mockResolvedValue(null);
    fetchWeatherData.mockResolvedValue(APIWeatherData);

    const res = await request(app).get("/api/weather?city=nairobi");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(APIWeatherData);
    expect(fetchWeatherData).toHaveBeenCalledWith("nairobi");
});

test("GET /api/weather?city=lagos should return new data if cache is expired", async () => {
    const APIWeatherData = {
        name: "Lagos",
        main: { temp: 35.2 },
        weather: [{ description: "clear sky" }]
    };

    redisClient.get.mockResolvedValue(null);
    fetchWeatherData.mockResolvedValue(APIWeatherData);

    redisClient.setEx.mockResolvedValue();

    const res = await request(app).get("/api/weather?city=lagos");

    expect(redisClient.setEx).toHaveBeenCalledWith(
        "lagos",
        expect.any(Number),
        JSON.stringify(APIWeatherData)
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(APIWeatherData);
});

test("GET /api/weather?city=paris should return API data if Redis read fails", async () => {
    const APIWeatherData = {
        name: "Paris",
        main: { temp: 15.3 },
        weather: [{ description: "light rain" }]
    };

    redisClient.get.mockRejectedValue(new Error("Redis is down"));
    fetchWeatherData.mockResolvedValue(APIWeatherData);

    const res = await request(app).get("/api/weather?city=paris");

    expect(fetchWeatherData).toHaveBeenCalledWith("paris");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(APIWeatherData);
});

test("GET /api/weather?city=cairo should return API data if Redis write fails", async () => {
    const APIWeatherData = {
        name: "Cairo",
        main: { temp: 90.2 },
        weather: [{ description: "sun" }]
    };

    redisClient.get.mockResolvedValue(null);
    fetchWeatherData.mockResolvedValue(APIWeatherData);

    redisClient.setEx.mockRejectedValue(new Error("Redis is down"));
    
    const res = await request(app).get("/api/weather?city=cairo");

    expect(fetchWeatherData).toHaveBeenCalledWith("cairo");
    expect(redisClient.setEx).toHaveBeenCalled();

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(APIWeatherData);
});

test("GET /api/weather?city=unkowncity should return 404 or an error message", async() => {
    fetchWeatherData.mockRejectedValue(new Error("City not found"));

    const res = await request(app).get("/api/weather?city=unknowncity");

    expect(fetchWeatherData).toHaveBeenCalledWith("unknowncity");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "City not found"});
});

test("GET /api/weather should return 400 Bad Request", async() => {
    const res = await request(app).get("/api/weather");

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Bad Request" });
});

test("GET /api/weather should return 500 Internal Server Error", async() => {
    fetchWeatherData.mockRejectedValue(new Error("Something went wrong"));

    const res = await request(app).get("/api/weather?city=kampala");

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Internal Server Error" });
});

afterAll(async () => {
    await redisClient.quit();
});
