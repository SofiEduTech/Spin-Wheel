// ===========================
// Global Variables
// ===========================
let entries = [];
let currentRotation = 0;
let isSpinning = false;
let lastWinner = null;

// Canvas and wheel setup
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 280;

// Audio elements
const spinSound = document.getElementById('spinSound');
const applauseSound = document.getElementById('applauseSound');

// Color palette for wheel segments
const wheelColors = [
    '#FF6B9D', '#C371F6', '#FFA94D', '#FFD93D', 
    '#6BCF7F', '#4D96FF', '#FF5757', '#FFA8E4',
    '#A8E6CF', '#FFD700', '#FF8C94', '#B4A7D6',
    '#FFB6B9', '#C7CEEA', '#FFDAC1', '#B5EAD7'
];

// ===========================
// Initialization
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    drawWheel();
});

function initializeApp() {
    // Add some sample names if textarea is empty
    const textarea = document.getElementById('namesTextarea');
    if (!textarea.value.trim()) {
        textarea.value = "Sofi Javeed\nSofi Waseem\nSofi Iqbal\nSofi Sajid\nBhat Rahaan\nZainab Javeed\nTameem Javeed\nJahaan Ara Javeed\nReyaz Ahmad Reshi\nSajad Akbar Rather";
        updateEntries();
    }
}

// ===========================
// Event Listeners
// ===========================
function setupEventListeners() {
    // Mode toggle
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const mode = this.dataset.mode;
            switchMode(mode);
        });
    });

    // Control buttons
    document.getElementById('addNamesBtn').addEventListener('click', updateEntries);
    document.getElementById('shuffleBtn').addEventListener('click', shuffleEntries);
    document.getElementById('clearBtn').addEventListener('click', clearAll);
    document.getElementById('removeWinnerBtn').addEventListener('click', removeWinner);
    document.getElementById('saveListBtn').addEventListener('click', saveList);
    
    // Spin button
    document.getElementById('spinButton').addEventListener('click', spinWheel);
    
    // Modal close button
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    
    // File upload
    document.getElementById('fileUpload').addEventListener('change', handleFileUpload);
    
    // Group mode buttons
    document.getElementById('generateGroupsBtn').addEventListener('click', generateGroups);
    document.getElementById('downloadGroupsBtn').addEventListener('click', downloadGroups);
    document.getElementById('copyGroupsBtn').addEventListener('click', copyGroups);
    document.getElementById('regenerateBtn').addEventListener('click', generateGroups);
    
    // Textarea auto-update
    document.getElementById('namesTextarea').addEventListener('input', updateEntryCount);
}

// ===========================
// Mode Switching
// ===========================
function switchMode(mode) {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    const wheelSection = document.getElementById('wheelSection');
    const controlPanel = document.querySelector('.control-panel');
    const groupSection = document.getElementById('groupSection');
    
    if (mode === 'wheel') {
        wheelSection.style.display = 'flex';
        controlPanel.style.display = 'flex';
        groupSection.style.display = 'none';
    } else {
        wheelSection.style.display = 'none';
        controlPanel.style.display = 'none';
        groupSection.style.display = 'block';
    }
}

// ===========================
// Entry Management
// ===========================
function updateEntries() {
    const textarea = document.getElementById('namesTextarea');
    const text = textarea.value.trim();
    
    if (!text) {
        alert('⚠️ Please enter some names first!');
        return;
    }
    
    entries = text.split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
    
    updateEntryCount();
    drawWheel();
    
    // Show success animation
    playSuccessAnimation();
}

function updateEntryCount() {
    const textarea = document.getElementById('namesTextarea');
    const text = textarea.value.trim();
    const count = text ? text.split('\n').filter(line => line.trim().length > 0).length : 0;
    document.getElementById('entryCount').textContent = count;
}

function shuffleEntries() {
    if (entries.length === 0) {
        alert('⚠️ No entries to shuffle!');
        return;
    }
    
    // Fisher-Yates shuffle
    for (let i = entries.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [entries[i], entries[j]] = [entries[j], entries[i]];
    }
    
    // Update textarea
    document.getElementById('namesTextarea').value = entries.join('\n');
    drawWheel();
    playSuccessAnimation();
}

function clearAll() {
    if (confirm('🗑️ Are you sure you want to clear all entries?')) {
        entries = [];
        document.getElementById('namesTextarea').value = '';
        updateEntryCount();
        drawWheel();
    }
}

function removeWinner() {
    if (!lastWinner) {
        alert('⚠️ No winner to remove!');
        return;
    }
    
    const index = entries.indexOf(lastWinner);
    if (index > -1) {
        entries.splice(index, 1);
        document.getElementById('namesTextarea').value = entries.join('\n');
        updateEntryCount();
        drawWheel();
        lastWinner = null;
        playSuccessAnimation();
    }
}

function saveList() {
    if (entries.length === 0) {
        alert('⚠️ No entries to save!');
        return;
    }
    
    const text = entries.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wheel-entries.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        document.getElementById('namesTextarea').value = content;
        updateEntries();
    };
    reader.readAsText(file);
}

// ===========================
// Wheel Drawing
// ===========================
function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (entries.length === 0) {
        drawEmptyWheel();
        return;
    }
    
    const sliceAngle = (Math.PI * 2) / entries.length;
    
    entries.forEach((entry, index) => {
        const startAngle = currentRotation + (sliceAngle * index);
        const endAngle = startAngle + sliceAngle;
        const color = wheelColors[index % wheelColors.length];
        
        // Draw slice
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = color;
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px "Fredoka"';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(entry, radius - 20, 10);
        ctx.restore();
    });
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#FF6B9D';
    ctx.lineWidth = 5;
    ctx.stroke();
}

function drawEmptyWheel() {
    // Draw a placeholder wheel
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw message
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px "Fredoka"';
    ctx.textAlign = 'center';
    ctx.fillText('Add names to start!', centerX, centerY);
}

// ===========================
// Wheel Spinning
// ===========================
function spinWheel() {
    if (isSpinning) return;
    if (entries.length === 0) {
        alert('⚠️ Please add some entries first!');
        return;
    }
    
    isSpinning = true;
    const spinButton = document.getElementById('spinButton');
    spinButton.disabled = true;
    
    // Play spin sound
    spinSound.currentTime = 0;
    spinSound.play().catch(() => {});
    
    // Random spin duration (5-8 seconds)
    const duration = 5000 + Math.random() * 3000;
    const startTime = Date.now();
    
    // Random extra rotations (5-10 full rotations)
    const extraRotations = 5 + Math.random() * 5;
    const totalRotation = (Math.PI * 2 * extraRotations);
    
    // Select random winner
    const winnerIndex = Math.floor(Math.random() * entries.length);
    const sliceAngle = (Math.PI * 2) / entries.length;
    const targetAngle = (sliceAngle * winnerIndex) + (sliceAngle / 2);
    
    const finalRotation = totalRotation + (Math.PI * 2) - targetAngle;
    
    let lastSegment = -1;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out cubic)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        currentRotation = finalRotation * easeProgress;
        
        // Play tick sound when crossing segments
        const currentSegment = getCurrentSegmentAtPointer();
        if (currentSegment !== lastSegment && currentSegment >= 0) {
            playTickSound();
            lastSegment = currentSegment;
        }
        
        drawWheel();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Spinning complete
            spinSound.pause();
            spinSound.currentTime = 0;
            
            // Get the winner based on pointer position
            const winnerSegment = getCurrentSegmentAtPointer();
            lastWinner = entries[winnerSegment];
            showWinner(lastWinner);
            
            // Remove winner if checkbox is unchecked
            if (!document.getElementById('keepWinnersCheckbox').checked) {
                setTimeout(() => {
                    removeWinner();
                }, 3000);
            }
            
            isSpinning = false;
            spinButton.disabled = false;
        }
    }
    
    animate();
}

// Get the segment currently pointed by the arrow (on the right side)
function getCurrentSegmentAtPointer() {
    if (entries.length === 0) return -1;
    
    const sliceAngle = (Math.PI * 2) / entries.length;
    // The pointer is at 0 degrees (right side of the wheel)
    // We need to find which segment is at this position
    const pointerAngle = 0;
    
    // Normalize current rotation to 0-2π range
    const normalizedRotation = ((currentRotation % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
    
    // Calculate which segment the pointer is pointing at
    // We need to account for the rotation direction (clockwise)
    const segmentAtPointer = Math.floor(((Math.PI * 2) - normalizedRotation) / sliceAngle) % entries.length;
    
    return segmentAtPointer;
}

// ===========================
// Winner Modal
// ===========================
function showWinner(winner) {
    const modal = document.getElementById('winnerModal');
    const winnerName = document.getElementById('winnerName');
    
    winnerName.textContent = winner;
    modal.classList.add('show');
    
    // Play applause sound
    applauseSound.currentTime = 0;
    applauseSound.play().catch(() => {});
    
    // Create petals
    createPetals();
    
    // Create confetti
    createConfetti();
}

function closeModal() {
    const modal = document.getElementById('winnerModal');
    modal.classList.remove('show');
}

// ===========================
// Animations
// ===========================
function createPetals() {
    const container = document.getElementById('petals-container');
    const petalCount = 50;
    
    for (let i = 0; i < petalCount; i++) {
        setTimeout(() => {
            const petal = document.createElement('div');
            petal.className = 'petal';
            petal.style.left = Math.random() * 100 + '%';
            petal.style.animationDuration = (3 + Math.random() * 2) + 's';
            petal.style.animationDelay = Math.random() * 0.5 + 's';
            
            // Random colors
            const colors = ['#FFB6C1', '#FF69B4', '#FFA8E4', '#FFD93D', '#FFA94D'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            petal.style.background = color;
            
            container.appendChild(petal);
            
            // Remove after animation
            setTimeout(() => {
                petal.remove();
            }, 6000);
        }, i * 50);
    }
}

function createConfetti() {
    const container = document.getElementById('confettiContainer');
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = (2 + Math.random()) + 's';
        
        // Random colors
        const colors = ['#FF6B9D', '#C371F6', '#FFA94D', '#FFD93D', '#6BCF7F', '#4D96FF'];
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        container.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => {
            confetti.remove();
        }, 4000);
    }
}

function playSuccessAnimation() {
    // Simple visual feedback
    const count = document.getElementById('entryCount');
    count.style.transform = 'scale(1.3)';
    count.style.color = '#FFD93D';
    
    setTimeout(() => {
        count.style.transform = 'scale(1)';
        count.style.color = '';
    }, 300);
}

// ===========================
// Group Generator
// ===========================
function generateGroups() {
    const textarea = document.getElementById('namesTextarea');
    const text = textarea.value.trim();
    
    if (!text) {
        alert('⚠️ Please add some names first!');
        return;
    }
    
    const names = text.split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
    
    if (names.length < 2) {
        alert('⚠️ You need at least 2 names to create groups!');
        return;
    }
    
    // Get configuration
    const numGroupsInput = document.getElementById('numGroups').value;
    const groupSizeInput = document.getElementById('groupSize').value;
    
    let numGroups;
    
    // Determine number of groups
    if (numGroupsInput && parseInt(numGroupsInput) > 0) {
        numGroups = Math.min(parseInt(numGroupsInput), names.length);
    } else if (groupSizeInput && parseInt(groupSizeInput) > 0) {
        const groupSize = parseInt(groupSizeInput);
        numGroups = Math.ceil(names.length / groupSize);
    } else {
        numGroups = 3;
    }
    
    // Shuffle names
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    
    // Create groups
    const groups = [];
    const baseSize = Math.floor(shuffled.length / numGroups);
    const remainder = shuffled.length % numGroups;
    
    let currentIndex = 0;
    for (let i = 0; i < numGroups; i++) {
        const groupSize = baseSize + (i < remainder ? 1 : 0);
        groups.push(shuffled.slice(currentIndex, currentIndex + groupSize));
        currentIndex += groupSize;
    }
    
    displayGroups(groups);
    createPetals();
    
    // Play success sound for group generation
    const successSound = document.getElementById('successSound');
    if (successSound) {
        successSound.currentTime = 0;
        successSound.play().catch(() => {});
    }
}

function displayGroups(groups) {
    const display = document.getElementById('groupsDisplay');
    const actions = document.getElementById('groupActions');
    
    display.innerHTML = '';
    
    groups.forEach((group, index) => {
        const card = document.createElement('div');
        card.className = 'group-card';
        card.style.animationDelay = (index * 0.1) + 's';
        
        const title = document.createElement('div');
        title.className = 'group-card-title';
        title.textContent = `Group ${index + 1}`;
        card.appendChild(title);
        
        group.forEach(member => {
            const memberDiv = document.createElement('div');
            memberDiv.className = 'group-member';
            memberDiv.textContent = member;
            card.appendChild(memberDiv);
        });
        
        display.appendChild(card);
    });
    
    actions.style.display = 'grid';
    
    // Store groups for download/copy
    window.currentGroups = groups;
}

function downloadGroups() {
    if (!window.currentGroups) {
        alert('⚠️ No groups to download!');
        return;
    }
    
    let text = '';
    window.currentGroups.forEach((group, index) => {
        text += `Group ${index + 1}:\n`;
        group.forEach(member => {
            text += `  - ${member}\n`;
        });
        text += '\n';
    });
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'groups.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function copyGroups() {
    if (!window.currentGroups) {
        alert('⚠️ No groups to copy!');
        return;
    }
    
    let text = '';
    window.currentGroups.forEach((group, index) => {
        text += `Group ${index + 1}:\n`;
        group.forEach(member => {
            text += `  - ${member}\n`;
        });
        text += '\n';
    });
    
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Groups copied to clipboard!');
    }).catch(() => {
        alert('❌ Failed to copy. Please try again.');
    });
}

// ===========================
// Utility Functions
// ===========================
function playBeep() {
    // Create a simple beep sound using Web Audio API as fallback
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playTickSound() {
    // Try to play the tick sound from audio element
    const tickSound = document.getElementById('tickSound');
    if (tickSound) {
        tickSound.currentTime = 0;
        tickSound.play().catch(() => {
            // Fallback to Web Audio API tick
            playWebAudioTick();
        });
    } else {
        playWebAudioTick();
    }
}

function playWebAudioTick() {
    // Create a short tick sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 1000;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
}

// ===========================
// Keyboard Shortcuts
// ===========================
document.addEventListener('keydown', function(e) {
    // Press Space to spin (if in wheel mode and not typing)
    if (e.code === 'Space' && !isSpinning && 
        document.activeElement.tagName !== 'TEXTAREA' && 
        document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        const wheelSection = document.getElementById('wheelSection');
        if (wheelSection.style.display !== 'none') {
            spinWheel();
        }
    }
    
    // Press Escape to close modal
    if (e.code === 'Escape') {
        closeModal();
    }
});

// ===========================
// Responsive Canvas
// ===========================
window.addEventListener('resize', function() {
    // Redraw wheel on resize
    drawWheel();
});

console.log('🎡 SofiEduTech Random Wheel App loaded successfully!');
console.log('💡 Tip: Press SPACE to spin the wheel!');
console.log('💡 Tip: Press ESC to close the winner modal!');
