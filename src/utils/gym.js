export function getActiveGymId(gyms) {
  const saved = localStorage.getItem("activeGymId");
  if (saved && gyms.some((g) => g.id === saved)) return saved;

  const fallback = gyms?.[0]?.id || null;
  if (fallback) localStorage.setItem("activeGymId", fallback);
  return fallback;
}

export function setActiveGymId(id) {
  localStorage.setItem("activeGymId", id);
}



