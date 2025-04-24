// Game state
let peer = null;
let connections = [];
let gameState = {
    players: {},
    location: null,
    roles: {},
    isHost: false,
    gameStarted: false,
    spyCount: 0,
    roomCode: null
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

// Status message
function createStatusMessage() {
    if (!document.getElementById('statusMessage')) {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'statusMessage';
        statusDiv.style.padding = '10px';
        statusDiv.style.marginTop = '10px';
        statusDiv.style.backgroundColor = 'var(--twitter-background)';
        statusDiv.style.borderRadius = '8px';
        statusDiv.style.color = 'var(--twitter-text)';
        statusDiv.style.textAlign = 'center';
        
        const lobby = document.querySelector('.create-game');
        lobby.appendChild(statusDiv);
        
        return statusDiv;
    }
    return document.getElementById('statusMessage');
}

function showStatus(message, isError = false) {
    const statusDiv = createStatusMessage();
    statusDiv.textContent = message;
    statusDiv.style.color = isError ? '#ff3333' : 'var(--twitter-text)';
    statusDiv.style.display = 'block';
}

function hideStatus() {
    const statusDiv = document.getElementById('statusMessage');
    if (statusDiv) {
        statusDiv.style.display = 'none';
    }
}

// Clean up old peer connection
function cleanupPeer() {
    if (peer) {
        peer.destroy();
        peer = null;
    }
    connections = [];
}

// Generate a custom room code
function generateRoomCode() {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters like 0, O, 1, I
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Create a new game as host
elements.createGame.addEventListener('click', () => {
    if (!elements.playerName.value) {
        showStatus('Please enter your name', true);
        return;
    }
    
    // Clean up any existing connection
    cleanupPeer();
    
    // Show connecting status
    showStatus('Creating game room...');
    
    // Generate a room code
    const roomCode = generateRoomCode();
    gameState.roomCode = roomCode;
    
    // Create peer with room code as ID
    peer = new Peer(roomCode, {
        debug: 2
    });
    
    peer.on('open', (id) => {
        console.log('Room created with ID:', id);
        gameState.isHost = true;
        elements.roomCode.textContent = id;
        
        // Add host to players list
        gameState.players = {};
        gameState.players[id] = elements.playerName.value;
        
        updatePlayersList();
        showSection('gameRoom');
        elements.startGame.classList.remove('hidden');
        hideStatus();
    });
    
    peer.on('connection', (conn) => {
        console.log('New player connecting:', conn.peer);
        handlePlayerConnection(conn);
    });
    
    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        if (err.type === 'unavailable-id') {
            showStatus('Room code already in use. Try again.', true);
        } else {
            showStatus('Connection error: ' + err.type, true);
        }
        cleanupPeer();
        showSection('lobby');
    });
});

// Join an existing game
elements.joinGame.addEventListener('click', () => {
    if (!elements.playerName.value) {
        showStatus('Please enter your name', true);
        return;
    }
    
    if (!elements.joinCode.value) {
        showStatus('Please enter a room code', true);
        return;
    }
    
    // Clean up any existing connection
    cleanupPeer();
    
    // Show connecting status
    showStatus('Connecting to game...');
    
    // Format room code
    const roomCode = elements.joinCode.value.trim().toUpperCase();
    gameState.roomCode = roomCode;
    
    // Create a random peer ID for this player
    peer = new Peer({
        debug: 2
    });
    
    peer.on('open', (myId) => {
        console.log('Connected with my ID:', myId);
        
        // Connect to the host's room
        const conn = peer.connect(roomCode, {
            reliable: true,
            metadata: {
                name: elements.playerName.value
            }
        });
        
        conn.on('open', () => {
            console.log('Connected to host:', roomCode);
            
            // Send player info to host
            conn.send({
                type: 'join',
                name: elements.playerName.value,
                id: myId
            });
            
            elements.roomCode.textContent = roomCode;
            showSection('gameRoom');
            hideStatus();
        });
        
        conn.on('data', (data) => {
            console.log('Received data:', data);
            handleGameData(data, conn);
        });
        
        conn.on('close', () => {
            console.log('Disconnected from host');
            showStatus('Disconnected from host', true);
            setTimeout(() => {
                showSection('lobby');
            }, 2000);
        });
        
        conn.on('error', (err) => {
            console.error('Connection error:', err);
            showStatus('Connection error', true);
            showSection('lobby');
        });
        
        // Store connection
        connections.push(conn);
    });
    
    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        if (err.type === 'peer-unavailable') {
            showStatus('Game room not found', true);
        } else {
            showStatus('Connection error: ' + err.type, true);
        }
        cleanupPeer();
        showSection('lobby');
    });
});

// Handle incoming player connection (host only)
function handlePlayerConnection(conn) {
    conn.on('open', () => {
        console.log('Player connected:', conn.peer);
        
        // Save connection
        connections.push(conn);
        
        // Set up data handler
        conn.on('data', (data) => {
            console.log('Received data from player:', data);
            handleGameData(data, conn);
        });
        
        // Handle disconnection
        conn.on('close', () => {
            console.log('Player disconnected:', conn.peer);
            
            // Remove from players and connections
            if (gameState.players[conn.metadata?.id || conn.peer]) {
                delete gameState.players[conn.metadata?.id || conn.peer];
            }
            
            connections = connections.filter(c => c.peer !== conn.peer);
            
            // Update all clients
            updatePlayersList();
            broadcastGameState();
        });
    });
}

// Handle received game data
function handleGameData(data, conn) {
    switch (data.type) {
        case 'join':
            // Add player to the game
            gameState.players[data.id] = data.name;
            
            // Store player ID in connection metadata for later reference
            conn.metadata = { 
                id: data.id,
                name: data.name
            };
            
            // Update UI
            updatePlayersList();
            
            // If host, broadcast updated state to all players
            if (gameState.isHost) {
                broadcastGameState();
            }
            break;
            
        case 'gameState':
            // Update local game state
            gameState = {...gameState, ...data.state};
            
            // Update UI
            updatePlayersList();
            
            // If game has started, show game screen
            if (gameState.gameStarted) {
                startGame();
            }
            break;
            
        case 'startGame':
            // Update local game state with game data
            gameState = {...gameState, ...data.gameState};
            
            // Start the game
            startGame();
            break;
    }
}

// Broadcast game state to all connected players (host only)
function broadcastGameState() {
    if (!gameState.isHost) return;
    
    const state = {
        type: 'gameState',
        state: {
            players: gameState.players,
            gameStarted: gameState.gameStarted,
            location: gameState.location,
            roles: gameState.roles
        }
    };
    
    connections.forEach(conn => {
        try {
            if (conn.open) {
                conn.send(state);
            }
        } catch (error) {
            console.error('Error sending state to player:', error);
        }
    });
}

// Update the players list display
function updatePlayersList() {
    elements.playersList.innerHTML = '';
    
    const playerEntries = Object.entries(gameState.players);
    
    if (playerEntries.length === 0) {
        const noPlayersDiv = document.createElement('div');
        noPlayersDiv.className = 'player-card';
        noPlayersDiv.textContent = 'No players connected';
        noPlayersDiv.style.opacity = '0.7';
        elements.playersList.appendChild(noPlayersDiv);
        return;
    }
    
    playerEntries.forEach(([id, name]) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-card';
        
        // Add player name
        playerDiv.textContent = name;
        
        // Mark if this is the local player
        if (peer && id === peer.id) {
            playerDiv.textContent += ' (You)';
            playerDiv.style.borderColor = 'var(--twitter-blue)';
        }
        
        // Mark the host
        if (gameState.roomCode && id === gameState.roomCode) {
            playerDiv.innerHTML += '<div style="font-size: 0.8em; margin-top: 5px; color: var(--twitter-blue);">Host</div>';
        }
        
        elements.playersList.appendChild(playerDiv);
    });
}

// Switch visible section
function showSection(sectionId) {
    Object.values(sections).forEach(section => {
        section.classList.add('hidden');
    });
    sections[sectionId].classList.remove('hidden');
}

// Start game button (host only)
elements.startGame.addEventListener('click', () => {
    if (!gameState.isHost) return;
    
    const playerCount = Object.keys(gameState.players).length;
    
    if (playerCount < 3) {
        alert('Need at least 3 players to start');
        return;
    }
    
    // Select a random location
    const location = getRandomLocation();
    const players = Object.keys(gameState.players);
    const roles = {};
    
    // Determine number of spies (1-3 based on player count)
    gameState.spyCount = Math.min(3, Math.max(1, Math.floor(playerCount / 4)));
    
    // Assign roles
    const locationRoles = getLocationRoles(location);
    const spyRoles = getSpyRoles(location);
    
    // Select spies
    const spies = new Set();
    while (spies.size < gameState.spyCount) {
        const randomIndex = Math.floor(Math.random() * players.length);
        spies.add(players[randomIndex]);
    }
    
    // Assign roles to players
    players.forEach(playerId => {
        if (spies.has(playerId)) {
            // Assign spy role
            const randomSpyRole = spyRoles[Math.floor(Math.random() * spyRoles.length)];
            roles[playerId] = randomSpyRole;
        } else {
            // Assign regular role
            const availableRoles = locationRoles.filter(role => role !== 'Spy');
            const randomRole = availableRoles[Math.floor(Math.random() * availableRoles.length)];
            roles[playerId] = randomRole;
        }
    });
    
    // Update game state
    const newGameState = {
        location,
        roles,
        gameStarted: true
    };
    
    // Update local state
    gameState = {...gameState, ...newGameState};
    
    // Broadcast to all players
    connections.forEach(conn => {
        if (conn.open) {
            conn.send({
                type: 'startGame',
                gameState: newGameState
            });
        }
    });
    
    // Start the game locally
    startGame();
});

// Start the game UI
function startGame() {
    showSection('gamePlay');
    
    // Display role and location
    if (gameState.roles && gameState.roles[peer.id] && gameState.roles[peer.id].includes('Spy')) {
        elements.location.textContent = "???";
    } else if (gameState.location) {
        elements.location.textContent = gameState.location;
    } else {
        elements.location.textContent = "Unknown";
    }
    
    if (gameState.roles && gameState.roles[peer.id]) {
        elements.role.textContent = gameState.roles[peer.id];
    } else {
        elements.role.textContent = "Role not assigned";
    }
    
    // Initialize locations list
    elements.locationsList.innerHTML = '';
    Object.keys(gameLocations).sort().forEach(location => {
        const locationDiv = document.createElement('div');
        locationDiv.className = 'location-item';
        locationDiv.textContent = location;
        elements.locationsList.appendChild(locationDiv);
    });
    
    // Start timer
    startTimer();
}

// Game timer
function startTimer() {
    // Clear any existing timer
    if (window.gameTimer) {
        clearInterval(window.gameTimer);
    }
    
    // Set up timer for 8 minutes
    let timeLeft = 480; // 8 minutes in seconds
    
    // Update timer display
    const updateTimer = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        elements.timeLeft.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(window.gameTimer);
            alert('Time\'s up! Players must vote now!');
        }
        timeLeft--;
    };
    
    // Initial update
    updateTimer();
    
    // Start interval
    window.gameTimer = setInterval(updateTimer, 1000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Create the status message element
    createStatusMessage();
    hideStatus();
    
    // Show lobby first
    showSection('lobby');
}); 