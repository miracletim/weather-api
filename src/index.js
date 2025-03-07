const express = require('express');
const weatherRoutes = require('./routes/weather');

const app = express();

const PORT = process.env.PORT || 3000;

app.use('/api', weatherRoutes);

app.get("/", (req, res) => {
    res.send("Weather API is running!");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});