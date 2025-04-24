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
    if (peer) {
        peer.destroy();
    }
    
    peer = new Peer(generateId(), {
        debug: 2
    });

    peer.on('open', (id) => {
        console.log('Connected with ID:', id);
    });

    peer.on('error', (error) => {
        console.error('PeerJS error:', error);
        alert('Connection error: ' + error.type);
        showSection('lobby');
    });

    peer.on('connection', handleConnection);
    
    peer.on('disconnected', () => {
        console.log('Connection lost. Attempting to reconnect...');
        peer.reconnect();
    });
}

// Generate random ID
function generateId() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Create game
elements.createGame.addEventListener('click', () => {
    if (!elements.playerName.value) {
        alert('Please enter your name');
        return;
    }

    initializePeer();
    
    peer.on('open', (id) => {
        gameState.isHost = true;
        elements.roomCode.textContent = id;
        gameState.players[id] = elements.playerName.value;
        updatePlayersList();
        showSection('gameRoom');
        elements.startGame.classList.remove('hidden');
    });
});

// Join game
elements.joinGame.addEventListener('click', () => {
    if (!elements.playerName.value || !elements.joinCode.value) {
        alert('Please enter your name and game code');
        return;
    }

    initializePeer();
    
    peer.on('open', () => {
        const conn = peer.connect(elements.joinCode.value.trim().toUpperCase(), {
            reliable: true
        });

        conn.on('error', (error) => {
            console.error('Connection error:', error);
            alert('Failed to connect to game room');
            showSection('lobby');
        });

        handleConnection(conn);
        showSection('gameRoom');
    });
});

// Handle connection
function handleConnection(conn) {
    // Ensure connection isn't already in the list
    if (!connections.some(c => c.peer === conn.peer)) {
        connections.push(conn);
        
        conn.on('open', () => {
            console.log('Connection established with peer:', conn.peer);
            
            // Send join message
            conn.send({
                type: 'join',
                name: elements.playerName.value,
                id: peer.id
            });

            // If we're the host, send current game state
            if (gameState.isHost) {
                conn.send({
                    type: 'gameState',
                    state: gameState
                });
            }
        });

        conn.on('data', (data) => {
            console.log('Received data:', data);
            handleGameData(data, conn);
        });

        conn.on('close', () => {
            console.log('Connection closed with peer:', conn.peer);
            // Remove player from game state
            delete gameState.players[conn.peer];
            // Remove connection from connections array
            connections = connections.filter(c => c.peer !== conn.peer);
            updatePlayersList();
            
            if (gameState.isHost) {
                broadcastGameState();
            }
        });

        conn.on('error', (error) => {
            console.error('Connection error with peer:', conn.peer, error);
            connections = connections.filter(c => c.peer !== conn.peer);
            delete gameState.players[conn.peer];
            updatePlayersList();
        });
    }
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
    const state = {
        type: 'gameState',
        state: gameState
    };
    
    connections.forEach(conn => {
        if (conn.open) {
            try {
                conn.send(state);
            } catch (error) {
                console.error('Error sending state to peer:', conn.peer, error);
            }
        }
    });
}

// Update players list
function updatePlayersList() {
    elements.playersList.innerHTML = '';
    Object.entries(gameState.players).forEach(([id, name]) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-card';
        playerDiv.textContent = name;
        if (id === peer.id) {
            playerDiv.textContent += ' (You)';
            playerDiv.style.borderColor = '#1d9bf0';
        }
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

    const newGameState = {
        location,
        roles,
        gameStarted: true
    };

    // Update local game state
    gameState = {...gameState, ...newGameState};

    // Broadcast game start
    connections.forEach(conn => {
        if (conn.open) {
            conn.send({
                type: 'startGame',
                gameState: newGameState
            });
        }
    });

    startGame();
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
    showSection('lobby');
}); 