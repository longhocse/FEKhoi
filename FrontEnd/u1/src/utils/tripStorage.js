export const getTrips = () => {
  return JSON.parse(localStorage.getItem("trips")) || [];
};

export const saveTrip = (trip) => {
  const trips = getTrips();

  const newTrip = {
    id: "B-" + Math.floor(Math.random() * 10000),
    status: "Scheduled",
    ...trip,
  };

  localStorage.setItem("trips", JSON.stringify([...trips, newTrip]));
};