export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const getIntials = (name) => {
  if (!name) return "";
  const words = name.split(" ");
  let initals = "";
  for (let i = 0; i < Math.min(words.length, 2); i++) {
    initals += words[i][0];
  }
  return initals.toUpperCase();
};

export const getEmptyCardMessage = (filterType) => {
  switch (filterType) {
    case "search":
      return "Oops! No stories found matching your search";
    case "date":
      return "No stories found in the given date range";
    default:
      return "Start creating your first story! Click the 'Add' button to note down your thoughts, ideas and memories. Let's get started.";
  }
};
