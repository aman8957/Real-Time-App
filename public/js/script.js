const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
}

// Correctly initialize the map
const map = L.map("map").setView([0, 0], 16);

// Set up the tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Made By Rehan"
}).addTo(map);

const markers = {};

// Function to separate markers slightly
const adjustMarkerPosition = (latitude, longitude, index) => {
    const offset = 0.0001 * index; // Adjust the offset based on the index
    return {
        latitude: latitude + offset,
        longitude: longitude + offset
    };
};

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    const adjustedPosition = adjustMarkerPosition(latitude, longitude, Object.keys(markers).length);

    map.setView([adjustedPosition.latitude, adjustedPosition.longitude]);

    if (markers[id]) {
        markers[id].setLatLng([adjustedPosition.latitude, adjustedPosition.longitude]);
    } else {
        markers[id] = L.marker([adjustedPosition.latitude, adjustedPosition.longitude]).addTo(map);
    }
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
