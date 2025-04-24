// Game state
let peer = null;
let connections = [];
let gameState = {
    players: {},
    location: null,
    roles: {},
    isHost: false,
    gameStarted: false,
    spyCount: 0
};

// DOM Elements
const elements = {
    playerName: document.getElementById('playerName'),
    createGame: document.getElementById('createGame'),
    joinGame: document.getElementById('joinGame'),
    joinCode: document.getElementById('joinCode'),
    roomCode: document.getElementById('roomCode'),
    playersList: document.getElementById('playersList'),
    startGame: document.getElementById('startGame'),
    location: document.getElementById('location'),
    role: document.getElementById('role'),
    timeLeft: document.getElementById('timeLeft'),
    locationsList: document.getElementById('locationsList')
};

// Sections
const sections = {
    lobby: document.getElementById('lobby'),
    gameRoom: document.getElementById('gameRoom'),
    gamePlay: document.getElementById('gamePlay')
};

// Initialize PeerJS
function initializePeer() {
    peer = new Peer(generateId());
    peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
    });

    peer.on('connection', (conn) => {
        handleConnection(conn);
    });
}

// Generate random ID
function generateId() {
    return Math.random().toString(36).substr(2, 6);
}

// Create game
elements.createGame.addEventListener('click', () => {
    if (!elements.playerName.value) {
        alert('Please enter your name');
        return;
    }

    gameState.isHost = true;
    initializePeer();
    elements.roomCode.textContent = peer.id;
    gameState.players[peer.id] = elements.playerName.value;
    updatePlayersList();
    showSection('gameRoom');
    elements.startGame.classList.remove('hidden');
});

// Join game
elements.joinGame.addEventListener('click', () => {
    if (!elements.playerName.value || !elements.joinCode.value) {
        alert('Please enter your name and game code');
        return;
    }

    initializePeer();
    const conn = peer.connect(elements.joinCode.value);
    handleConnection(conn);
    showSection('gameRoom');
});

// Handle connection
function handleConnection(conn) {
    connections.push(conn);
    
    conn.on('open', () => {
        conn.send({
            type: 'join',
            name: elements.playerName.value,
            id: peer.id
        });
    });

    conn.on('data', (data) => {
        handleGameData(data, conn);
    });
}

// Handle game data
function handleGameData(data, conn) {
    switch (data.type) {
        case 'join':
            gameState.players[data.id] = data.name;
            broadcastGameState();
            updatePlayersList();
            break;

        case 'gameState':
            gameState = {...gameState, ...data.state};
            updatePlayersList();
            if (gameState.gameStarted) {
                startGame();
            }
            break;

        case 'startGame':
            gameState = {...gameState, ...data.gameState};
            startGame();
            break;
    }
}

// Broadcast game state
function broadcastGameState() {
    connections.forEach(conn => {
        conn.send({
            type: 'gameState',
            state: gameState
        });
    });
}

// Update players list
function updatePlayersList() {
    elements.playersList.innerHTML = '';
    Object.entries(gameState.players).forEach(([id, name]) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-card';
        playerDiv.textContent = name;
        elements.playersList.appendChild(playerDiv);
    });
}

// Show section
function showSection(sectionId) {
    Object.values(sections).forEach(section => {
        section.classList.add('hidden');
    });
    sections[sectionId].classList.remove('hidden');
}

// Start game button
elements.startGame.addEventListener('click', () => {
    if (Object.keys(gameState.players).length < 3) {
        alert('Need at least 3 players to start');
        return;
    }

    // Initialize game state
    const location = getRandomLocation();
    const players = Object.keys(gameState.players);
    const roles = {};
    
    // Determine number of spies (1-3 based on player count)
    gameState.spyCount = Math.min(3, Math.max(1, Math.floor(players.length / 4)));
    
    // Assign roles
    const locationRoles = getLocationRoles(location);
    const spyRoles = getSpyRoles(location);
    
    // Select spies
    const spies = new Set();
    while (spies.size < gameState.spyCount) {
        spies.add(players[Math.floor(Math.random() * players.length)]);
    }
    
    // Assign roles to players
    players.forEach(playerId => {
        if (spies.has(playerId)) {
            roles[playerId] = spyRoles[Math.floor(Math.random() * spyRoles.length)];
        } else {
            roles[playerId] = locationRoles[Math.floor(Math.random() * (locationRoles.length - 1))];
        }
    });

    const gameState = {
        location,
        roles,
        gameStarted: true
    };

    // Broadcast game start
    connections.forEach(conn => {
        conn.send({
            type: 'startGame',
            gameState
        });
    });

    startGame(gameState);
});

// Start game
function startGame() {
    showSection('gamePlay');
    
    // Display role and location
    if (gameState.roles[peer.id].includes('Spy')) {
        elements.location.textContent = "???";
    } else {
        elements.location.textContent = gameState.location;
    }
    elements.role.textContent = gameState.roles[peer.id];

    // Initialize locations list
    elements.locationsList.innerHTML = '';
    Object.keys(gameLocations).forEach(location => {
        const locationDiv = document.createElement('div');
        locationDiv.className = 'location-item';
        locationDiv.textContent = location;
        elements.locationsList.appendChild(locationDiv);
    });

    // Start timer
    startTimer();
}

// Timer function
function startTimer() {
    let timeLeft = 480; // 8 minutes
    const timer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        elements.timeLeft.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert('Time\'s up! Players must vote now!');
        }
        timeLeft--;
    }, 1000);
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Show initial lobby section
    showSection('lobby');
}); 