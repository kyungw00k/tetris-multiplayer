// PeerJS 라이브러리 불러오기
import { Peer } from 'peerjs';

// 상수 및 설정
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 25; // 각 셀의 크기 (픽셀)
const EMPTY = 0; // 빈 셀
const UPDATE_INTERVAL = 1000; // 블록 하강 간격 (ms)
const SPEEDS = [1000, 800, 600, 500, 400, 300, 200, 100]; // 레벨별 속도

// 테트로미노 정의
const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ]
};

// 테트로미노 색상 클래스
const COLORS = {
  I: 'tetromino-i',
  J: 'tetromino-j',
  L: 'tetromino-l',
  O: 'tetromino-o',
  S: 'tetromino-s',
  T: 'tetromino-t',
  Z: 'tetromino-z'
};

// 키 코드 정의
const KEYS = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  SPACE: 32,
  P: 80,
  ESC: 27,
  W: 87,
  A: 65,
  S: 83,
  D: 68
};

/**
 * 테트리스 게임 클래스
 * 게임 로직 및 렌더링을 담당
 */
class TetrisGame {
  constructor(boardElement, previewElement, scoreDisplay) {
    this.boardElement = boardElement;
    this.previewElement = previewElement;
    this.scoreDisplay = scoreDisplay;
    this.gameOver = false;
    this.isPaused = false;
    this.isActive = false;
    this.score = 0;
    this.level = 0;
    this.linesCleared = 0;
    this.currentSpeed = SPEEDS[0];
    this.intervalId = null;
    this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
    this.currentPiece = null;
    this.nextPiece = null;
    this.initBoard();
    this.initPreview();
  }

  /**
   * 게임 보드 초기화
   */
  initBoard() {
    this.boardElement.innerHTML = '';
    this.boardElement.style.gridTemplateColumns = `repeat(${COLS}, ${BLOCK_SIZE}px)`;
    this.boardElement.style.gridTemplateRows = `repeat(${ROWS}, ${BLOCK_SIZE}px)`;

    // 셀 생성
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div');
        cell.className = 'game-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        this.boardElement.appendChild(cell);
      }
    }
  }

  /**
   * 미리보기 영역 초기화
   */
  initPreview() {
    this.previewElement.innerHTML = '';
    // 미리보기 셀 생성
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const cell = document.createElement('div');
        cell.className = 'preview-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        this.previewElement.appendChild(cell);
      }
    }
  }

  /**
   * 게임 시작
   */
  start() {
    this.resetGame();
    this.isActive = true;
    this.generatePiece();
    this.intervalId = setInterval(() => this.moveDown(), this.currentSpeed);
  }

  /**
   * 게임 재시작
   */
  restart() {
    this.clearBoard();
    this.resetGame();
    this.start();
  }

  /**
   * 게임 중지
   */
  pause() {
    if (this.isPaused) {
      this.isPaused = false;
      this.intervalId = setInterval(() => this.moveDown(), this.currentSpeed);
    } else {
      this.isPaused = true;
      clearInterval(this.intervalId);
    }
  }

  /**
   * 게임 초기화
   */
  resetGame() {
    this.gameOver = false;
    this.isPaused = false;
    this.score = 0;
    this.level = 0;
    this.linesCleared = 0;
    this.currentSpeed = SPEEDS[0];
    this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
    this.currentPiece = null;
    this.nextPiece = null;
    this.updateScore();
    clearInterval(this.intervalId);
  }

  /**
   * 게임 보드 지우기
   */
  clearBoard() {
    const cells = this.boardElement.querySelectorAll('.game-cell');
    cells.forEach(cell => {
      cell.className = 'game-cell';
      cell.classList.remove(...Object.values(COLORS));
    });

    const previewCells = this.previewElement.querySelectorAll('.preview-cell');
    previewCells.forEach(cell => {
      cell.className = 'preview-cell';
      cell.classList.remove(...Object.values(COLORS));
    });
  }

  /**
   * 새 테트로미노 생성
   */
  generatePiece() {
    if (!this.nextPiece) {
      this.nextPiece = this.getRandomPiece();
    }
    
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.getRandomPiece();
    
    // 초기 위치 설정
    this.currentPiece.x = Math.floor(COLS / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
    this.currentPiece.y = 0;
    
    // 다음 블록 미리보기 업데이트
    this.updatePreview();
    
    // 게임 오버 체크
    if (this.isCollision()) {
      this.handleGameOver();
      return false;
    }
    
    return true;
  }

  /**
   * 랜덤 테트로미노 생성
   */
  getRandomPiece() {
    const keys = Object.keys(SHAPES);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return {
      shape: SHAPES[randomKey],
      color: COLORS[randomKey],
      type: randomKey,
      x: 0,
      y: 0
    };
  }

  /**
   * 다음 블럭 미리보기 업데이트
   */
  updatePreview() {
    const previewCells = this.previewElement.querySelectorAll('.preview-cell');
    
    // 모든 셀 초기화
    previewCells.forEach(cell => {
      cell.className = 'preview-cell';
      cell.classList.remove(...Object.values(COLORS));
    });
    
    // 다음 블록 그리기
    if (this.nextPiece) {
      for (let r = 0; r < this.nextPiece.shape.length; r++) {
        for (let c = 0; c < this.nextPiece.shape[r].length; c++) {
          if (this.nextPiece.shape[r][c]) {
            const index = r * 4 + c;
            if (previewCells[index]) {
              previewCells[index].classList.add(this.nextPiece.color);
            }
          }
        }
      }
    }
  }

  /**
   * 게임 보드 렌더링
   */
  render() {
    const cells = this.boardElement.querySelectorAll('.game-cell');
    
    // 보드 상태 반영
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const index = r * COLS + c;
        cells[index].className = 'game-cell';
        
        if (this.board[r][c] !== EMPTY) {
          cells[index].classList.add(this.board[r][c], 'filled');
        }
      }
    }
    
    // 현재 떨어지는 블록 그리기
    if (this.currentPiece) {
      for (let r = 0; r < this.currentPiece.shape.length; r++) {
        for (let c = 0; c < this.currentPiece.shape[r].length; c++) {
          if (this.currentPiece.shape[r][c]) {
            const boardRow = this.currentPiece.y + r;
            const boardCol = this.currentPiece.x + c;
            
            if (boardRow >= 0 && boardRow < ROWS && boardCol >= 0 && boardCol < COLS) {
              const index = boardRow * COLS + boardCol;
              cells[index].classList.add(this.currentPiece.color);
            }
          }
        }
      }
    }
  }

  /**
   * 충돌 감지
   */
  isCollision(offsetX = 0, offsetY = 0, testShape = null) {
    const shape = testShape || this.currentPiece.shape;
    
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newRow = this.currentPiece.y + r + offsetY;
          const newCol = this.currentPiece.x + c + offsetX;
          
          // 게임 영역 밖으로 벗어나는지 확인
          if (newCol < 0 || newCol >= COLS || newRow >= ROWS) {
            return true;
          }
          
          // 다른 블록과 충돌하는지 확인
          if (newRow >= 0 && this.board[newRow][newCol] !== EMPTY) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * 블록 회전
   */
  rotate() {
    if (this.gameOver || this.isPaused) return;
    
    const rotated = [];
    const shape = this.currentPiece.shape;
    
    // 행렬 전치 및 행 역순으로 90도 회전 구현
    for (let c = 0; c < shape[0].length; c++) {
      const newRow = [];
      for (let r = shape.length - 1; r >= 0; r--) {
        newRow.push(shape[r][c]);
      }
      rotated.push(newRow);
    }
    
    // 충돌 체크 후 회전
    if (!this.isCollision(0, 0, rotated)) {
      this.currentPiece.shape = rotated;
      this.render();
      return true;
    }
    
    // 회전 시 벽에 닿는 경우, 벽에서 이동 시키기 (월 킥)
    const kicks = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: -1 },
      { x: 2, y: 0 },
      { x: -2, y: 0 }
    ];
    
    for (const kick of kicks) {
      if (!this.isCollision(kick.x, kick.y, rotated)) {
        this.currentPiece.x += kick.x;
        this.currentPiece.y += kick.y;
        this.currentPiece.shape = rotated;
        this.render();
        return true;
      }
    }
    
    return false;
  }

  /**
   * 좌로 이동
   */
  moveLeft() {
    if (this.gameOver || this.isPaused) return;
    
    if (!this.isCollision(-1, 0)) {
      this.currentPiece.x--;
      this.render();
      return true;
    }
    return false;
  }

  /**
   * 우로 이동
   */
  moveRight() {
    if (this.gameOver || this.isPaused) return;
    
    if (!this.isCollision(1, 0)) {
      this.currentPiece.x++;
      this.render();
      return true;
    }
    return false;
  }

  /**
   * 아래로 이동 (소프트 드롭)
   */
  moveDown() {
    if (this.gameOver || this.isPaused) return;
    
    if (!this.isCollision(0, 1)) {
      this.currentPiece.y++;
      this.render();
      return true;
    } else {
      this.lockPiece();
      return false;
    }
  }

  /**
   * 하드 드롭
   */
  hardDrop() {
    if (this.gameOver || this.isPaused) return;
    
    while (!this.isCollision(0, 1)) {
      this.currentPiece.y++;
    }
    
    this.render();
    this.lockPiece();
  }

  /**
   * 블록 고정 및 라인 체크
   */
  lockPiece() {
    // 현재 블록을 보드에 고정
    for (let r = 0; r < this.currentPiece.shape.length; r++) {
      for (let c = 0; c < this.currentPiece.shape[r].length; c++) {
        if (this.currentPiece.shape[r][c]) {
          const boardRow = this.currentPiece.y + r;
          const boardCol = this.currentPiece.x + c;
          
          if (boardRow >= 0 && boardRow < ROWS && boardCol >= 0 && boardCol < COLS) {
            this.board[boardRow][boardCol] = this.currentPiece.color;
          }
        }
      }
    }
    
    // 완성된 라인 체크 및 제거
    const completedLines = this.checkLines();
    
    // 점수 업데이트
    if (completedLines > 0) {
      this.updateScoreWithLines(completedLines);
    }
    
    // 새 블록 생성
    if (!this.generatePiece()) {
      this.handleGameOver();
    }
    
    this.render();
  }

  /**
   * 완성된 라인 체크하고 제거
   */
  checkLines() {
    let lines = 0;
    
    for (let r = ROWS - 1; r >= 0; r--) {
      let rowComplete = true;
      
      for (let c = 0; c < COLS; c++) {
        if (this.board[r][c] === EMPTY) {
          rowComplete = false;
          break;
        }
      }
      
      if (rowComplete) {
        // 라인 제거 및 위쪽 블록 내리기
        this.board.splice(r, 1);
        this.board.unshift(Array(COLS).fill(EMPTY));
        lines++;
        r++; // 같은 행을 다시 체크하기 위해 인덱스 조정
      }
    }
    
    return lines;
  }

  /**
   * 점수 업데이트
   */
  updateScoreWithLines(lines) {
    // 테트리스 점수 계산 방식
    const lineScores = [40, 100, 300, 1200]; // 1, 2, 3, 4줄
    this.score += lineScores[lines - 1] * (this.level + 1);
    this.linesCleared += lines;
    
    // 레벨 업데이트
    const newLevel = Math.floor(this.linesCleared / 10);
    
    if (newLevel > this.level) {
      this.level = newLevel;
      
      // 최대 레벨 제한
      if (this.level >= SPEEDS.length) {
        this.level = SPEEDS.length - 1;
      }
      
      // 게임 속도 조정
      this.currentSpeed = SPEEDS[this.level];
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => this.moveDown(), this.currentSpeed);
    }
    
    this.updateScore();
  }

  /**
   * 점수 표시 업데이트
   */
  updateScore() {
    this.scoreDisplay.textContent = this.score;
  }

  /**
   * 게임 오버 처리
   */
  handleGameOver() {
    this.gameOver = true;
    this.isActive = false;
    clearInterval(this.intervalId);
    document.getElementById('game-over-overlay').classList.remove('hidden');
  }

  /**
   * 게임 상태 정보 가져오기
   */
  getGameState() {
    return {
      board: this.board,
      score: this.score,
      nextPiece: this.nextPiece,
      level: this.level,
      linesCleared: this.linesCleared,
      gameOver: this.gameOver
    };
  }

  /**
   * 상대방 게임보드 업데이트
   */
  updateOpponentBoard(board) {
    const cells = document.querySelectorAll('#opponent-game-board .game-cell');
    
    // 보드 상태 반영
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const index = r * COLS + c;
        cells[index].className = 'game-cell';
        
        if (board[r][c] !== EMPTY) {
          cells[index].classList.add(board[r][c], 'filled');
        }
      }
    }
  }

  /**
   * 상대방 다음 블록 미리보기 업데이트
   */
  updateOpponentNextPiece(nextPiece) {
    const previewCells = document.querySelectorAll('#opponent-next-piece .preview-cell');
    
    // 모든 셀 초기화
    previewCells.forEach(cell => {
      cell.className = 'preview-cell';
      cell.classList.remove(...Object.values(COLORS));
    });
    
    // 다음 블록 그리기
    if (nextPiece) {
      for (let r = 0; r < nextPiece.shape.length; r++) {
        for (let c = 0; c < nextPiece.shape[r].length; c++) {
          if (nextPiece.shape[r][c]) {
            const index = r * 4 + c;
            if (previewCells[index]) {
              previewCells[index].classList.add(nextPiece.color);
            }
          }
        }
      }
    }
  }
}

/**
 * 네트워크 관리 클래스
 * PeerJS를 이용한 P2P 연결 및 데이터 동기화 담당
 */
class NetworkManager {
  constructor(game) {
    this.game = game;
    this.peer = null;
    this.connection = null;
    this.peerId = null;
    this.opponentId = null;
    this.isConnected = false;
    this.isHost = false;
    this.lastSyncTime = 0;
    
    // 유저 ID 생성 또는, localStorage에서 가져오기
    this.initPeerId();
    
    // PeerJS 초기화
    this.initPeer();
    
    // 업데이트 주기 설정
    this.syncIntervalId = setInterval(() => this.syncGameState(), 100);
  }

  /**
   * Peer ID 초기화
   */
  initPeerId() {
    const storedId = localStorage.getItem('tetris-peerId');
    
    if (storedId) {
      this.peerId = storedId;
    } else {
      this.peerId = 'tetris-' + this.generateRandomId();
      localStorage.setItem('tetris-peerId', this.peerId);
    }
  }

  /**
   * 랜덤 ID 생성
   */
  generateRandomId() {
    return Math.random().toString(36).substring(2, 10);
  }

  /**
   * PeerJS 초기화
   */
  initPeer() {
    // PeerJS 인스턴스 생성
    this.peer = new Peer(this.peerId, {
      debug: 2,
      config: {
        'iceServers': [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' }
        ]
      }
    });
    
    // 연결 성공 이벤트
    this.peer.on('open', (id) => {
      console.log('내 Peer ID:', id);
      document.getElementById('peer-id-display').textContent = id;
      document.getElementById('connection-status').textContent = '연결 대기 중';
      
      // 발견 서비스에 브로드캐스트
      this.broadcastPresence();
    });
    
    // 연결 요청 수신 이벤트
    this.peer.on('connection', (conn) => {
      if (this.connection) {
        // 이미 연결이 있으면 새 연결 거부
        conn.close();
        return;
      }
      
      this.connection = conn;
      this.opponentId = conn.peer;
      this.isHost = true;
      
      // 연결 이벤트 핸들러 설정
      this.setupConnectionHandlers();
      
      console.log('연결 요청을 받았습니다:', this.opponentId);
    });
    
    // 에러 이벤트
    this.peer.on('error', (err) => {
      console.error('PeerJS 에러:', err);
      document.getElementById('connection-status').textContent = '연결 오류';
    });
  }

  /**
   * 연결 이벤트 핸들러 설정
   */
  setupConnectionHandlers() {
    this.connection.on('open', () => {
      this.isConnected = true;
      document.getElementById('connection-status').textContent = '연결됨';
      document.getElementById('opponent-id-display').textContent = this.opponentId;
      document.getElementById('opponent-info').classList.remove('hidden');
      document.getElementById('waiting-overlay').classList.add('hidden');
      
      // 게임 다시 시작
      this.restartGame();
    });
    
    this.connection.on('data', (data) => {
      this.handleDataReceived(data);
    });
    
    this.connection.on('close', () => {
      this.handleDisconnect();
    });
    
    this.connection.on('error', (err) => {
      console.error('연결 에러:', err);
      this.handleDisconnect();
    });
  }

  /**
   * 다른 피어에 연결
   */
  connectToPeer(peerId) {
    if (this.connection || peerId === this.peerId) {
      return false;
    }
    
    try {
      this.connection = this.peer.connect(peerId);
      this.opponentId = peerId;
      this.isHost = false;
      
      // 연결 이벤트 핸들러 설정
      this.setupConnectionHandlers();
      
      console.log('연결 요청을 보냈습니다:', peerId);
      document.getElementById('connection-status').textContent = '연결 중...';
      
      return true;
    } catch (e) {
      console.error('연결 오류:', e);
      return false;
    }
  }

  /**
   * 연결 종료 처리
   */
  handleDisconnect() {
    this.isConnected = false;
    this.connection = null;
    this.opponentId = null;
    
    document.getElementById('connection-status').textContent = '연결 대기 중';
    document.getElementById('opponent-info').classList.add('hidden');
    document.getElementById('waiting-overlay').classList.remove('hidden');
    document.getElementById('opponent-score-display').textContent = '0';
    
    // 상대방 게임 보드 초기화
    const opponentBoard = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
    this.game.updateOpponentBoard(opponentBoard);
    
    // 상대방 다음 블록 초기화
    const previewCells = document.querySelectorAll('#opponent-next-piece .preview-cell');
    previewCells.forEach(cell => {
      cell.className = 'preview-cell';
      cell.classList.remove(...Object.values(COLORS));
    });
    
    // 다시 존재를 브로드캐스트
    this.broadcastPresence();
  }

  /**
   * 데이터 수신 처리
   */
  handleDataReceived(data) {
    if (!data) return;
    
    switch (data.type) {
      case 'gameState':
        document.getElementById('opponent-score-display').textContent = data.score;
        this.game.updateOpponentBoard(data.board);
        this.game.updateOpponentNextPiece(data.nextPiece);
        
        // 상대방 게임 오버 확인
        if (data.gameOver && this.game.isActive) {
          console.log('상대방 게임 오버!');
        }
        break;
        
      case 'restart':
        // 상대방이 게임을 재시작함
        this.restartGame();
        break;
        
      default:
        console.log('알 수 없는 데이터 타입:', data.type);
    }
  }

  /**
   * 게임 상태 동기화
   */
  syncGameState() {
    if (!this.isConnected || !this.connection) return;
    
    const now = Date.now();
    // 100ms마다 동기화
    if (now - this.lastSyncTime < 100) return;
    this.lastSyncTime = now;
    
    const state = this.game.getGameState();
    this.connection.send({
      type: 'gameState',
      board: state.board,
      score: state.score,
      nextPiece: state.nextPiece,
      level: state.level,
      gameOver: state.gameOver
    });
  }

  /**
   * 게임 재시작 알림
   */
  sendRestartSignal() {
    if (this.connection) {
      this.connection.send({
        type: 'restart'
      });
    }
  }

  /**
   * 게임 재시작
   */
  restartGame() {
    this.game.restart();
  }
  
  /**
   * 자신의 존재를 다른 피어에게 알림
   */
  broadcastPresence() {
    // discovery 모듈을 통해 처리 (discovery.js에서 구현)
    window.dispatchEvent(new CustomEvent('peerAvailable', {
      detail: { id: this.peerId }
    }));
  }
}

/**
 * 게임 컨트롤러 클래스
 * 키보드, 터치 입력 처리 및 UI 이벤트 관리
 */
class GameController {
  constructor(game, network) {
    this.game = game;
    this.network = network;
    this.setupEventHandlers();
  }

  /**
   * 이벤트 핸들러 설정
   */
  setupEventHandlers() {
    // 키보드 이벤트
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    
    // 수동 연결 버튼
    document.getElementById('connect-button').addEventListener('click', () => {
      const input = document.getElementById('connect-to-id');
      const peerId = input.value.trim();
      
      if (peerId) {
        this.network.connectToPeer(peerId);
        input.value = '';
      }
    });
    
    // 다시 시작 버튼
    document.getElementById('restart-button').addEventListener('click', () => {
      document.getElementById('game-over-overlay').classList.add('hidden');
      this.game.restart();
      this.network.sendRestartSignal();
    });
    
    // 모바일 컨트롤
    document.getElementById('move-left').addEventListener('click', () => this.game.moveLeft());
    document.getElementById('move-right').addEventListener('click', () => this.game.moveRight());
    document.getElementById('rotate').addEventListener('click', () => this.game.rotate());
    document.getElementById('hard-drop').addEventListener('click', () => this.game.hardDrop());
    
    // 피어 선택 이벤트 리스너
    window.addEventListener('peerSelected', (e) => {
      const peerId = e.detail.id;
      if (peerId && peerId !== this.network.peerId) {
        this.network.connectToPeer(peerId);
      }
    });
  }

  /**
   * 키보드 입력 처리
   */
  handleKeyDown(e) {
    if (!this.game.isActive) {
      if (e.keyCode === KEYS.SPACE) {
        document.getElementById('game-over-overlay').classList.add('hidden');
        this.game.restart();
        this.network.sendRestartSignal();
      }
      return;
    }
    
    switch (e.keyCode) {
      case KEYS.LEFT:
      case KEYS.A:
        this.game.moveLeft();
        break;
        
      case KEYS.RIGHT:
      case KEYS.D:
        this.game.moveRight();
        break;
        
      case KEYS.UP:
      case KEYS.W:
        this.game.rotate();
        break;
        
      case KEYS.DOWN:
      case KEYS.S:
        this.game.moveDown();
        break;
        
      case KEYS.SPACE:
        this.game.hardDrop();
        break;
        
      case KEYS.P:
      case KEYS.ESC:
        this.game.pause();
        break;
    }
  }
}

/**
 * 게임 초기화 및 시작
 */
function initGame() {
  // 보드 엘리먼트
  const myBoardElement = document.getElementById('my-game-board');
  const myPreviewElement = document.getElementById('next-piece-preview');
  const scoreDisplay = document.getElementById('score-display');
  
  // 상대방 보드 엘리먼트 초기화
  const opponentBoardElement = document.getElementById('opponent-game-board');
  opponentBoardElement.innerHTML = '';
  opponentBoardElement.style.gridTemplateColumns = `repeat(${COLS}, ${BLOCK_SIZE}px)`;
  opponentBoardElement.style.gridTemplateRows = `repeat(${ROWS}, ${BLOCK_SIZE}px)`;
  
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'game-cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      opponentBoardElement.appendChild(cell);
    }
  }
  
  // 상대방 미리보기 초기화
  const opponentPreviewElement = document.getElementById('opponent-next-piece');
  opponentPreviewElement.innerHTML = '';
  
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const cell = document.createElement('div');
      cell.className = 'preview-cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      opponentPreviewElement.appendChild(cell);
    }
  }
  
  // 게임 인스턴스 생성
  const game = new TetrisGame(myBoardElement, myPreviewElement, scoreDisplay);
  
  // 네트워크 인스턴스 생성
  const network = new NetworkManager(game);
  
  // 컨트롤러 인스턴스 생성
  const controller = new GameController(game, network);
  
  // 게임 시작
  game.start();
}

// 페이지 로드 완료시 게임 초기화
document.addEventListener('DOMContentLoaded', initGame);

// 네트워크 발견 서비스를 위한 전역 이벤트 핸들러
window.handlePeerSelected = function(peerId) {
  window.dispatchEvent(new CustomEvent('peerSelected', {
    detail: { id: peerId }
  }));
}; 
