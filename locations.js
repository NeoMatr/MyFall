const gameLocations = {
    "Space Station": {
        roles: ["Commander", "Engineer", "Medical Officer", "Security Chief", "Communications Officer", "Spy"],
        spyRoles: ["Saboteur", "Double Agent", "Infiltrator"]
    },
    "Medieval Castle": {
        roles: ["King", "Queen", "Knight", "Court Jester", "Royal Guard", "Spy"],
        spyRoles: ["Assassin", "Usurper", "Foreign Agent"]
    },
    "Luxury Cruise Ship": {
        roles: ["Captain", "Chef", "Entertainment Director", "Purser", "Deck Officer", "Spy"],
        spyRoles: ["Pirate", "Smuggler", "Stowaway"]
    },
    "Hospital": {
        roles: ["Chief Surgeon", "Nurse", "Anesthesiologist", "Resident", "Receptionist", "Spy"],
        spyRoles: ["Imposter Doctor", "Drug Dealer", "Organ Trafficker"]
    },
    "Movie Studio": {
        roles: ["Director", "Actor", "Cameraman", "Makeup Artist", "Stunt Coordinator", "Spy"],
        spyRoles: ["Paparazzi", "Rival Producer", "Scandal Reporter"]
    },
    "University Campus": {
        roles: ["Professor", "Student", "Dean", "Librarian", "Campus Security", "Spy"],
        spyRoles: ["Cheater", "Plagiarist", "Fake Student"]
    },
    "Submarine": {
        roles: ["Captain", "Navigator", "Sonar Operator", "Engineer", "Cook", "Spy"],
        spyRoles: ["Enemy Agent", "Saboteur", "Sleeper Agent"]
    },
    "Shopping Mall": {
        roles: ["Store Manager", "Security Guard", "Sales Associate", "Janitor", "Food Court Worker", "Spy"],
        spyRoles: ["Shoplifter", "Corporate Spy", "Pickpocket"]
    },
    "Airport": {
        roles: ["Pilot", "Flight Attendant", "Air Traffic Controller", "Security Officer", "Baggage Handler", "Spy"],
        spyRoles: ["Smuggler", "Terrorist", "Human Trafficker"]
    },
    "Zoo": {
        roles: ["Zookeeper", "Veterinarian", "Tour Guide", "Gift Shop Clerk", "Animal Trainer", "Spy"],
        spyRoles: ["Poacher", "Animal Smuggler", "Activist"]
    },
    "Amusement Park": {
        roles: ["Ride Operator", "Mascot", "Ticket Taker", "Maintenance Worker", "Food Vendor", "Spy"],
        spyRoles: ["Thief", "Saboteur", "Competitor Spy"]
    },
    "Police Station": {
        roles: ["Detective", "Chief", "Officer", "Forensic Expert", "Dispatcher", "Spy"],
        spyRoles: ["Corrupt Cop", "Mole", "Criminal"]
    },
    "Ancient Temple": {
        roles: ["Archaeologist", "Guide", "Photographer", "Security Guard", "Researcher", "Spy"],
        spyRoles: ["Tomb Raider", "Black Market Dealer", "Cult Member"]
    },
    "Underwater Research Facility": {
        roles: ["Lead Scientist", "Marine Biologist", "Maintenance Tech", "Security Diver", "Research Assistant", "Spy"],
        spyRoles: ["Eco-Terrorist", "Corporate Spy", "Deep Sea Mercenary"]
    },
    "Cyberpunk Nightclub": {
        roles: ["DJ", "Bartender", "Bouncer", "VIP Host", "Cyber-Enhancement Tech", "Spy"],
        spyRoles: ["Data Thief", "Underground Hacker", "Syndicate Agent"]
    },
    "Ancient Egyptian Tomb": {
        roles: ["Lead Archaeologist", "Historian", "Security Expert", "Equipment Specialist", "Translator", "Spy"],
        spyRoles: ["Treasure Hunter", "Cult Member", "Black Market Dealer"]
    },
    "Quantum Research Lab": {
        roles: ["Lead Physicist", "Computer Specialist", "Safety Officer", "Research Assistant", "Project Manager", "Spy"],
        spyRoles: ["Time Traveler", "Parallel Universe Agent", "Quantum Terrorist"]
    },
    "Steampunk Airship": {
        roles: ["Captain", "Engineer", "Navigator", "Quartermaster", "Sky Marshal", "Spy"],
        spyRoles: ["Sky Pirate", "Saboteur", "Foreign Agent"]
    },
    "Arctic Research Base": {
        roles: ["Station Chief", "Climate Scientist", "Radio Operator", "Medical Officer", "Maintenance Tech", "Spy"],
        spyRoles: ["Eco-Terrorist", "Foreign Agent", "Creature Cultist"]
    },
    "Haunted Mansion": {
        roles: ["Ghost Hunter", "Medium", "Equipment Specialist", "Paranormal Researcher", "Historical Expert", "Spy"],
        spyRoles: ["Cultist", "Fraud Medium", "Supernatural Entity"]
    },
    "Secret Government Bunker": {
        roles: ["Military Commander", "Intelligence Officer", "Communications Expert", "Security Chief", "Analyst", "Spy"],
        spyRoles: ["Double Agent", "Sleeper Cell", "Foreign Operative"]
    },
    "Space Colony": {
        roles: ["Colony Administrator", "Terraforming Expert", "Resource Manager", "Security Chief", "Medical Officer", "Spy"],
        spyRoles: ["Alien Infiltrator", "Corporate Saboteur", "Resistance Member"]
    },
    "Virtual Reality Hub": {
        roles: ["System Admin", "VR Designer", "Security Specialist", "Network Engineer", "User Experience Lead", "Spy"],
        spyRoles: ["Hacker", "Digital Terrorist", "Reality Manipulator"]
    },
    "Dragon's Lair Casino": {
        roles: ["Casino Manager", "Pit Boss", "Security Chief", "High Roller Host", "Dealer", "Spy"],
        spyRoles: ["Card Counter", "Heist Operative", "Syndicate Member"]
    },
    "Time Travel Agency": {
        roles: ["Timeline Manager", "Temporal Engineer", "Historical Advisor", "Paradox Analyst", "Security Chief", "Spy"],
        spyRoles: ["Timeline Terrorist", "Temporal Assassin", "Chaos Agent"]
    },
    "Ninja Dojo": {
        roles: ["Sensei", "Weapons Master", "Meditation Guide", "Training Coordinator", "Guardian", "Spy"],
        spyRoles: ["Rival Clan Member", "Dark Arts Practitioner", "Betrayer"]
    },
    "Magical Academy": {
        roles: ["Headmaster", "Potions Master", "Magical Creatures Expert", "Spells Professor", "Librarian", "Spy"],
        spyRoles: ["Dark Wizard", "Forbidden Arts Practitioner", "Chaos Mage"]
    },
    "Post-Apocalyptic Shelter": {
        roles: ["Shelter Leader", "Resource Manager", "Security Chief", "Medical Officer", "Engineer", "Spy"],
        spyRoles: ["Raider Infiltrator", "Cult Member", "Resource Thief"]
    },
    "Alien Embassy": {
        roles: ["Human Ambassador", "Alien Liaison", "Cultural Expert", "Security Chief", "Translator", "Spy"],
        spyRoles: ["Xenophobic Agent", "Invasion Planner", "Conspiracy Theorist"]
    },
    "Prehistoric Research Camp": {
        roles: ["Lead Paleontologist", "Security Expert", "Equipment Specialist", "Research Assistant", "Camp Manager", "Spy"],
        spyRoles: ["Time Bandit", "Dinosaur Smuggler", "Saboteur"]
    },
    "Superhero Headquarters": {
        roles: ["Team Leader", "Tech Genius", "Training Coordinator", "Medical Expert", "Communications Officer", "Spy"],
        spyRoles: ["Supervillain", "Traitor", "Mind-Controlled Agent"]
    },
    "Pirate Ship": {
        roles: ["Captain", "First Mate", "Navigator", "Gunner", "Ship's Doctor", "Spy"],
        spyRoles: ["Navy Infiltrator", "Mutineer", "Rival Pirate"]
    },
    "Fashion Show": {
        roles: ["Designer", "Model", "Makeup Artist", "Photographer", "Event Coordinator", "Spy"],
        spyRoles: ["Design Thief", "Scandal Reporter", "Saboteur"]
    },
    "Art Gallery": {
        roles: ["Curator", "Security Guard", "Art Restorer", "Gallery Owner", "Guide", "Spy"],
        spyRoles: ["Art Thief", "Forger", "Black Market Dealer"]
    },
    "Ski Resort": {
        roles: ["Resort Manager", "Ski Instructor", "Lift Operator", "Emergency Response", "Equipment Tech", "Spy"],
        spyRoles: ["Avalanche Saboteur", "Competitor Spy", "Criminal Scout"]
    },
    "Circus": {
        roles: ["Ringmaster", "Acrobat", "Animal Trainer", "Magician", "Clown", "Spy"],
        spyRoles: ["Saboteur", "Animal Rights Activist", "Rival Circus Agent"]
    },
    "News Station": {
        roles: ["News Anchor", "Producer", "Camera Operator", "Weather Person", "Sound Tech", "Spy"],
        spyRoles: ["Fake News Plant", "Corporate Spy", "Political Agent"]
    },
    "Chocolate Factory": {
        roles: ["Master Chocolatier", "Quality Control", "Tour Guide", "Machine Operator", "Packaging Lead", "Spy"],
        spyRoles: ["Recipe Thief", "Health Inspector", "Competitor Spy"]
    },
    "Comic Convention": {
        roles: ["Celebrity Guest", "Cosplayer", "Vendor", "Security", "Event Organizer", "Spy"],
        spyRoles: ["Bootleg Seller", "Stalker", "Rival Convention Agent"]
    },
    "Volcano Research Station": {
        roles: ["Volcanologist", "Seismologist", "Safety Officer", "Equipment Tech", "Research Assistant", "Spy"],
        spyRoles: ["Eco-Terrorist", "Doomsday Cultist", "Resource Thief"]
    },
    "Pet Show": {
        roles: ["Judge", "Handler", "Veterinarian", "Groomer", "Event Coordinator", "Spy"],
        spyRoles: ["Pet Thief", "Scandal Reporter", "Rival Breeder"]
    },
    "Cooking Competition": {
        roles: ["Chef", "Judge", "Host", "Food Critic", "Kitchen Assistant", "Spy"],
        spyRoles: ["Saboteur", "Food Poisoner", "Rival Chef"]
    },
    "Wedding": {
        roles: ["Wedding Planner", "Photographer", "Caterer", "DJ", "Decorator", "Spy"],
        spyRoles: ["Wedding Crasher", "Jealous Ex", "Thief"]
    },
    "Antique Shop": {
        roles: ["Shop Owner", "Appraiser", "Restoration Expert", "Security Guard", "Sales Associate", "Spy"],
        spyRoles: ["Forger", "Thief", "Scammer"]
    },
    "Film Set": {
        roles: ["Director", "Lead Actor", "Cinematographer", "Production Assistant", "Stunt Coordinator", "Spy"],
        spyRoles: ["Paparazzi", "Saboteur", "Rival Studio Agent"]
    },
    "Escape Room": {
        roles: ["Game Master", "Actor", "Technician", "Customer Service", "Puzzle Designer", "Spy"],
        spyRoles: ["Competitor Spy", "Saboteur", "Thief"]
    },
    "Flower Shop": {
        roles: ["Florist", "Designer", "Delivery Person", "Botanist", "Sales Associate", "Spy"],
        spyRoles: ["Rival Shop Spy", "Allergist Activist", "Saboteur"]
    },
    "Ice Cream Parlor": {
        roles: ["Owner", "Ice Cream Maker", "Server", "Flavor Developer", "Quality Control", "Spy"],
        spyRoles: ["Health Inspector", "Competitor Spy", "Recipe Thief"]
    },
    "Toy Store": {
        roles: ["Store Manager", "Toy Demonstrator", "Cashier", "Stock Manager", "Customer Service", "Spy"],
        spyRoles: ["Safety Inspector", "Competitor Spy", "Toy Thief"]
    },
    "Haunted House Attraction": {
        roles: ["Manager", "Actor", "Special Effects Tech", "Makeup Artist", "Security Guard", "Spy"],
        spyRoles: ["Real Ghost", "Saboteur", "Rival Attraction Spy"]
    },
    "Dinosaur Park": {
        roles: ["Park Ranger", "Paleontologist", "Tour Guide", "Security Officer", "Veterinarian", "Spy"],
        spyRoles: ["Poacher", "Saboteur", "Corporate Spy"]
    },
    "Candy Store": {
        roles: ["Store Owner", "Candy Maker", "Sales Associate", "Display Designer", "Quality Control", "Spy"],
        spyRoles: ["Health Inspector", "Recipe Thief", "Competitor Spy"]
    },
    "Aquarium": {
        roles: ["Marine Biologist", "Aquarist", "Tour Guide", "Veterinarian", "Dive Team Lead", "Spy"],
        spyRoles: ["Animal Trafficker", "Activist", "Saboteur"]
    },
    "Radio Station": {
        roles: ["DJ", "Producer", "Sound Engineer", "News Reporter", "Program Director", "Spy"],
        spyRoles: ["Hacker", "Rival Station Spy", "Signal Jammer"]
    },
    "Bakery": {
        roles: ["Head Baker", "Pastry Chef", "Cashier", "Decorator", "Kitchen Assistant", "Spy"],
        spyRoles: ["Health Inspector", "Recipe Thief", "Competitor Spy"]
    },
    "Arcade": {
        roles: ["Manager", "Technician", "Tournament Organizer", "Cashier", "Security Guard", "Spy"],
        spyRoles: ["Cheater", "Rival Arcade Spy", "Token Thief"]
    },
    "Botanical Garden": {
        roles: ["Head Gardener", "Botanist", "Tour Guide", "Researcher", "Maintenance Worker", "Spy"],
        spyRoles: ["Plant Thief", "Eco-Terrorist", "Competitor Spy"]
    },
    "Laser Tag Arena": {
        roles: ["Game Master", "Equipment Tech", "Team Leader", "Safety Officer", "Front Desk Staff", "Spy"],
        spyRoles: ["Cheater", "Rival Business Spy", "Equipment Saboteur"]
    },
    "Planetarium": {
        roles: ["Astronomer", "Show Presenter", "Technical Director", "Education Coordinator", "Gift Shop Manager", "Spy"],
        spyRoles: ["UFO Cultist", "Equipment Saboteur", "Conspiracy Theorist"]
    },
    "Wax Museum": {
        roles: ["Curator", "Artist", "Tour Guide", "Historian", "Security Guard", "Spy"],
        spyRoles: ["Art Thief", "Vandal", "Rival Museum Agent"]
    },
    "Sushi Restaurant": {
        roles: ["Head Chef", "Sous Chef", "Server", "Host", "Fish Expert", "Spy"],
        spyRoles: ["Health Inspector", "Competitor Spy", "Food Critic"]
    },
    "Mini Golf Course": {
        roles: ["Course Manager", "Maintenance Tech", "Pro Shop Staff", "Instructor", "Cashier", "Spy"],
        spyRoles: ["Vandal", "Competitor Spy", "Equipment Thief"]
    },
    "Bowling Alley": {
        roles: ["Manager", "Mechanic", "Pro Shop Owner", "Snack Bar Worker", "League Coordinator", "Spy"],
        spyRoles: ["Equipment Saboteur", "Rival Alley Spy", "Scammer"]
    },
    "Rock Concert": {
        roles: ["Lead Singer", "Security Chief", "Sound Engineer", "Stage Manager", "Merchandise Manager", "Spy"],
        spyRoles: ["Bootlegger", "Saboteur", "Rival Band Spy"]
    },
    "Tattoo Parlor": {
        roles: ["Lead Artist", "Apprentice", "Receptionist", "Sterilization Tech", "Designer", "Spy"],
        spyRoles: ["Health Inspector", "Rival Shop Spy", "Scammer"]
    },
    "Food Truck Festival": {
        roles: ["Event Organizer", "Food Inspector", "Security", "Vendor Coordinator", "Parking Manager", "Spy"],
        spyRoles: ["Health Violation Plant", "Competitor Spy", "Food Thief"]
    },
    "Board Game Cafe": {
        roles: ["Owner", "Game Master", "Barista", "Food Server", "Game Teacher", "Spy"],
        spyRoles: ["Game Thief", "Competitor Spy", "Cheater"]
    },
    "Cat Cafe": {
        roles: ["Cat Behaviorist", "Cafe Manager", "Veterinarian", "Barista", "Animal Care Staff", "Spy"],
        spyRoles: ["Cat Thief", "Health Inspector", "Competitor Spy"]
    },
    "Roller Derby": {
        roles: ["Team Captain", "Referee", "Coach", "Medic", "Announcer", "Spy"],
        spyRoles: ["Rival Team Spy", "Equipment Saboteur", "Betting Scammer"]
    },
    "Karaoke Bar": {
        roles: ["DJ", "Bartender", "Sound Tech", "Host", "Server", "Spy"],
        spyRoles: ["Music Pirate", "Rival Bar Spy", "Equipment Saboteur"]
    },
    "Paintball Field": {
        roles: ["Field Manager", "Equipment Tech", "Safety Officer", "Referee", "Pro Shop Staff", "Spy"],
        spyRoles: ["Equipment Saboteur", "Rival Field Spy", "Cheater"]
    },
    "Farmers Market": {
        roles: ["Market Manager", "Produce Vendor", "Quality Inspector", "Security", "Information Booth Staff", "Spy"],
        spyRoles: ["Health Inspector", "Competitor Spy", "Scammer"]
    },
    "Psychic Reading Room": {
        roles: ["Lead Psychic", "Crystal Expert", "Tarot Reader", "Aura Photographer", "Reception", "Spy"],
        spyRoles: ["Skeptic Investigator", "Rival Psychic", "Scam Exposer"]
    },
    "Pottery Studio": {
        roles: ["Master Potter", "Instructor", "Kiln Technician", "Supply Manager", "Gallery Curator", "Spy"],
        spyRoles: ["Art Thief", "Rival Studio Spy", "Equipment Saboteur"]
    },
    "Trampoline Park": {
        roles: ["Manager", "Safety Officer", "Instructor", "Maintenance Tech", "Front Desk Staff", "Spy"],
        spyRoles: ["Equipment Saboteur", "Insurance Fraud Agent", "Competitor Spy"]
    },
    "Retro Gaming Store": {
        roles: ["Store Owner", "Game Expert", "Repair Tech", "Buyer", "Tournament Organizer", "Spy"],
        spyRoles: ["Counterfeit Seller", "Rival Store Spy", "Game Thief"]
    }
};

// Function to get a random location
function getRandomLocation() {
    const locations = Object.keys(gameLocations);
    return locations[Math.floor(Math.random() * locations.length)];
}

// Function to get roles for a location
function getLocationRoles(location) {
    return gameLocations[location].roles;
}

// Function to get spy roles for a location
function getSpyRoles(location) {
    return gameLocations[location].spyRoles;
}

// Export the functions and data
window.gameLocations = gameLocations;
window.getRandomLocation = getRandomLocation;
window.getLocationRoles = getLocationRoles;
window.getSpyRoles = getSpyRoles; 