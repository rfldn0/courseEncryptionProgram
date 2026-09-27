// Data ported from program.py (CS1110 Lab 09). Keep in sync with the Python dictionaries.
window.CEP_DATA = {
  // Fallback copy of original.txt, used when the page is opened without serve.py.
  ORIGINAL: "alpha12321\nJosh09ij\nmachineIsFine\nhelloNotWorld\nOct31andDec25areTheSame",

  // course -> [room, instructor, meeting time]
  COURSES: {
    CS101: [3004, "Haynes", "8:00 a.m."],
    CS102: [4501, "Alvarado", "9:00 a.m."],
    CS103: [6755, "Rich", "10:00 a.m."],
    NT110: [1244, "Burke", "11:00 a.m."],
    CM241: [1411, "Lee", "1:00 p.m."]
  },

  STATES: {
    "Alabama": "Montgomery", "Alaska": "Juneau", "Arizona": "Phoenix", "Arkansas": "Little Rock",
    "California": "Sacramento", "Colorado": "Denver", "Connecticut": "Hartford", "Delaware": "Dover",
    "Florida": "Tallahassee", "Georgia": "Atlanta", "Hawaii": "Honolulu", "Idaho": "Boise",
    "Illinois": "Springfield", "Indiana": "Indianapolis", "Iowa": "Des Moines", "Kansas": "Topeka",
    "Kentucky": "Frankfort", "Louisiana": "Baton Rouge", "Maine": "Augusta", "Maryland": "Annapolis",
    "Massachusetts": "Boston", "Michigan": "Lansing", "Minnesota": "St. Paul", "Mississippi": "Jackson",
    "Missouri": "Jefferson City", "Montana": "Helena", "Nebraska": "Lincoln", "Nevada": "Carson City",
    "New Hampshire": "Concord", "New Jersey": "Trenton", "New Mexico": "Santa Fe", "New York": "Albany",
    "North Carolina": "Raleigh", "North Dakota": "Bismarck", "Ohio": "Columbus", "Oklahoma": "Oklahoma City",
    "Oregon": "Salem", "Pennsylvania": "Harrisburg", "Rhode Island": "Providence", "South Carolina": "Columbia",
    "South Dakota": "Pierre", "Tennessee": "Nashville", "Texas": "Austin", "Utah": "Salt Lake City",
    "Vermont": "Montpelier", "Virginia": "Richmond", "Washington": "Olympia", "West Virginia": "Charleston",
    "Wisconsin": "Madison", "Wyoming": "Cheyenne"
  },

  // Exactly the `codes` dictionary from program.py, including its quirks:
  // 'k' maps to '' (the letter is dropped) and the '' -> '4' entry never matches a character.
  CODES: {
    'A': '%', 'a': '9', 'B': '@', 'b': '#', 'C': '$', 'c': '0', 'D': '^', 'd': '!', 'E': '&', 'e': '*',
    'F': '(', 'f': ')', 'G': '-', 'g': '_', 'H': '+', 'h': '=', 'I': '[', 'i': ']', 'J': '{', 'j': '}',
    'K': '|', 'k': '', 'L': ';', 'l': ':', 'M': "'", ' ': '"', 'N': '<', 'n': '>', 'O': '.', 'o': '/',
    'P': ',', 'p': '?', 'Q': '~', 'q': '`', 'R': '1', 'r': '2', 'S': '3', '': '4', 'T': '5', 't': '6',
    'U': '7', 'u': '8', 'V': 'x', 'v': 'y', 'W': 'z', 'w': 'X', 'X': 'Y', 'x': 'Z', 'Y': 'w', 'y': 'v',
    'Z': 'u', 'z': 't'
  }
};
