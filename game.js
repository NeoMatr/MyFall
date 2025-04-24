// Constants
const CONSTANTS = {
    MIN_PLAYERS: 3,
    MAX_NAME_LENGTH: 20,
    RECONNECT_TIMEOUT: 5000,
    ROOM_CODE_LENGTH: 6
};

// Game state
let peer = null;
let connections = [];
let reconnectAttempts = 0;
let maxReconnectAttempts = 3;
let gameState = {
    players: {},
    location: null,
    roles: {},
    isHost: false,
    gameStarted: false,
    spyCount: 0,
    roomCode: null,
    hostConnection: null // Store host connection for reconnection
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

// Improved error handling and connection stability
function setupConnectionHandlers(conn) {
    conn.on('open', () => {
        console.log('Connected to:', conn.peer);
        hideStatus();
        reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        
        // If this is a player connecting to host, store the host connection
        if (!gameState.isHost) {
            gameState.hostConnection = conn;
            elements.roomCode.textContent = gameState.roomCode;
            showSection('gameRoom');
            
            // Send join message
            conn.send({
                type: 'join',
                name: elements.playerName.value,
                id: peer.id
            });
        }
    });

    conn.on('data', (data) => {
        console.log('Received data:', data);
        handleGameData(data, conn);
    });

    conn.on('close', () => {
        console.log('Connection closed with peer:', conn.peer);
        
        if (!gameState.isHost) {
            // Player lost connection to host
            handleDisconnection();
        } else {
            // Host lost connection to a player
            handlePlayerDisconnection(conn);
        }
    });

    conn.on('error', (err) => {
        console.error('Connection error:', err);
        showStatus('Connection error: ' + err.message, true);
        
        if (!gameState.isHost) {
            handleDisconnection();
        }
    });
}

// Handle player disconnection from host
function handlePlayerDisconnection(conn) {
    const playerId = conn.metadata?.id || conn.peer;
    const playerName = gameState.players[playerId];
    
    if (playerName) {
        showStatus(`Player ${playerName} disconnected`, true);
        delete gameState.players[playerId];
        connections = connections.filter(c => c.peer !== conn.peer);
        updatePlayersList();
        broadcastGameState();
    }
}

// Handle player's disconnection from host
function handleDisconnection() {
    if (reconnectAttempts < maxReconnectAttempts) {
        showStatus(`Connection lost. Attempting to reconnect... (${reconnectAttempts + 1}/${maxReconnectAttempts})`, true);
        setTimeout(() => attemptReconnection(), CONSTANTS.RECONNECT_TIMEOUT);
    } else {
        showStatus('Unable to reconnect to the game. Please rejoin.', true);
        setTimeout(() => {
            cleanupPeer();
            showSection('lobby');
        }, 2000);
    }
}

// Attempt to reconnect to the host
function attemptReconnection() {
    if (!gameState.roomCode || gameState.isHost) return;
    
    reconnectAttempts++;
    const conn = peer.connect(gameState.roomCode, {
        reliable: true,
        metadata: { name: elements.playerName.value }
    });
    
    setupConnectionHandlers(conn);
    connections = [conn];
}

// Validate player name
function validatePlayerName(name) {
    if (!name) {
        showStatus('Please enter your name', true);
        return false;
    }
    
    if (name.length > CONSTANTS.MAX_NAME_LENGTH) {
        showStatus(`Name must be ${CONSTANTS.MAX_NAME_LENGTH} characters or less`, true);
        return false;
    }
    
    if (!/^[a-zA-Z0-9\s-_]+$/.test(name)) {
        showStatus('Name can only contain letters, numbers, spaces, hyphens, and underscores', true);
        return false;
    }
    
    return true;
}

// Create copy room code button
function createCopyButton() {
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy Room Code';
    copyButton.className = 'copy-button';
    copyButton.style.marginLeft = '10px';
    copyButton.style.padding = '5px 10px';
    copyButton.style.fontSize = '0.9em';
    
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(elements.roomCode.textContent)
            .then(() => {
                const originalText = copyButton.textContent;
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy room code:', err);
                showStatus('Failed to copy room code', true);
            });
    });
    
    return copyButton;
}

// Create a new game as host
elements.createGame.addEventListener('click', () => {
    const playerName = elements.playerName.value.trim();
    if (!validatePlayerName(playerName)) return;
    
    cleanupPeer();
    showStatus('Creating game room...');
    const roomCode = generateRoomCode();
    gameState.roomCode = roomCode;
    
    peer = new Peer(roomCode, { 
        debug: 2,
        config: {
            'iceServers': [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        }
    });
    
    peer.on('open', (id) => {
        console.log('Room created with ID:', id);
        gameState.isHost = true;
        elements.roomCode.textContent = id;
        
        // Add copy button next to room code
        const codeContainer = elements.roomCode.parentElement;
        const copyButton = createCopyButton();
        codeContainer.appendChild(copyButton);
        
        gameState.players = {};
        gameState.players[id] = playerName;
        updatePlayersList();
        showSection('gameRoom');
        elements.startGame.classList.remove('hidden');
        hideStatus();
    });
    
    peer.on('connection', handlePlayerConnection);
    
    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        showStatus('Connection error: ' + err.message, true);
        cleanupPeer();
        showSection('lobby');
    });
    
    peer.on('disconnected', () => {
        console.log('Disconnected from server. Attempting to reconnect...');
        peer.reconnect();
    });
});

// Join an existing game
elements.joinGame.addEventListener('click', () => {
    const playerName = elements.playerName.value.trim();
    if (!validatePlayerName(playerName)) return;
    
    const roomCode = elements.joinCode.value.trim().toUpperCase();
    if (!roomCode) {
        showStatus('Please enter a room code', true);
        return;
    }
    
    cleanupPeer();
    showStatus('Connecting to game...');
    gameState.roomCode = roomCode;
    
    peer = new Peer({ 
        debug: 2,
        config: {
            'iceServers': [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        }
    });
    
    peer.on('open', (myId) => {
        console.log('Connected with ID:', myId);
        const conn = peer.connect(roomCode, {
            reliable: true,
            metadata: { name: playerName }
        });
        
        setupConnectionHandlers(conn);
        connections = [conn];
    });
    
    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        if (err.type === 'peer-unavailable') {
            showStatus('Game room not found. Please check the room code.', true);
        } else {
            showStatus('Connection error: ' + err.message, true);
        }
        cleanupPeer();
        showSection('lobby');
    });
});

// Handle incoming player connection (host only)
function handlePlayerConnection(conn) {
    console.log('New player connecting:', conn.peer);
    
    // Check if maximum players reached (if implemented)
    // if (Object.keys(gameState.players).length >= MAX_PLAYERS) {
    //     conn.close();
    //     return;
    // }
    
    setupConnectionHandlers(conn);
    connections.push(conn);
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

// Update the players list display with improved styling
function updatePlayersList() {
    elements.playersList.innerHTML = '';
    
    const playerEntries = Object.entries(gameState.players);
    
    if (playerEntries.length === 0) {
        const noPlayersDiv = document.createElement('div');
        noPlayersDiv.className = 'player-card';
        noPlayersDiv.textContent = 'Waiting for players...';
        noPlayersDiv.style.opacity = '0.7';
        elements.playersList.appendChild(noPlayersDiv);
        return;
    }
    
    playerEntries.forEach(([id, name]) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-card';
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = name;
        playerDiv.appendChild(nameSpan);
        
        if (peer && id === peer.id) {
            const youBadge = document.createElement('span');
            youBadge.textContent = ' (You)';
            youBadge.style.color = 'var(--twitter-blue)';
            playerDiv.appendChild(youBadge);
            playerDiv.style.borderColor = 'var(--twitter-blue)';
        }
        
        if (gameState.roomCode && id === gameState.roomCode) {
            const hostBadge = document.createElement('div');
            hostBadge.textContent = 'Host';
            hostBadge.style.fontSize = '0.8em';
            hostBadge.style.marginTop = '5px';
            hostBadge.style.color = 'var(--twitter-blue)';
            playerDiv.appendChild(hostBadge);
        }
        
        elements.playersList.appendChild(playerDiv);
    });
    
    // Update start game button visibility
    if (gameState.isHost) {
        const playerCount = playerEntries.length;
        elements.startGame.disabled = playerCount < CONSTANTS.MIN_PLAYERS;
        if (playerCount < CONSTANTS.MIN_PLAYERS) {
            showStatus(`Need at least ${CONSTANTS.MIN_PLAYERS} players to start (${playerCount}/${CONSTANTS.MIN_PLAYERS})`, false);
        } else {
            hideStatus();
        }
    }
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

// Focus on the name input field when the page loads
document.addEventListener('DOMContentLoaded', () => {
    createStatusMessage();
    hideStatus();
    showSection('lobby');
    elements.playerName.focus();
    
    // Add input event listeners for real-time validation
    elements.playerName.addEventListener('input', () => {
        const playerName = elements.playerName.value.trim();
        if (playerName) {
            validatePlayerName(playerName);
        }
    });
    
    // Add enter key support
    elements.playerName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            elements.createGame.click();
        }
    });
    
    elements.joinCode.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            elements.joinGame.click();
        }
    });
}); 