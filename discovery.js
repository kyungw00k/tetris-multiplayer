/**
 * 로컬 네트워크 피어 발견 모듈
 * 로컬 네트워크에서 다른 플레이어를 자동으로 발견하는 기능을 제공합니다.
 */

// 피어 목록 관리 및 UI 표시
class PeerDiscovery {
  constructor() {
    this.peers = new Map(); // 발견된 피어 목록
    this.myPeerId = null; // 내 피어 ID
    this.discoveryInterval = null; // 피어 발견 인터벌 ID
    this.heartbeatCounter = 0; // 하트비트 카운터
    this.discoveryStatus = document.getElementById('discovery-status');
    this.availablePeersElem = document.getElementById('available-peers');
    
    // 피어 검색 이벤트 리스너 등록
    this.setupEventListeners();
    
    // 초기화
    this.initDiscovery();
  }
  
  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    // 새로운 피어 발견 이벤트
    window.addEventListener('peerAvailable', (e) => {
      const peerId = e.detail.id;
      
      // 자기 자신은 목록에 추가하지 않음
      if (peerId === this.myPeerId) return;
      
      // 피어 목록에 추가
      this.addPeer(peerId);
    });
    
    // 1분마다 오래된 피어를 목록에서 제거
    setInterval(() => this.cleanupPeers(), 60000);
  }
  
  /**
   * 피어 발견 초기화
   */
  initDiscovery() {
    // 피어 ID 설정
    this.myPeerId = localStorage.getItem('tetris-peerId');
    
    if (!this.myPeerId) {
      console.warn('피어 ID가 설정되지 않았습니다. tetris.js가 먼저 로드되어야 합니다.');
      
      // tetris.js가 로드될 때까지 잠시 대기
      setTimeout(() => this.initDiscovery(), 1000);
      return;
    }
    
    console.log('피어 발견 서비스 초기화. 내 ID:', this.myPeerId);
    
    // 즉시 하트비트 브로드캐스트
    this.broadcastHeartbeat();
    
    // 주기적으로 피어 목록 업데이트
    this.discoveryInterval = setInterval(() => {
      this.updateAvailablePeers();
      this.updateDiscoveryStatus();
      
      // 주기적으로 하트비트 브로드캐스트 (2초마다)
      this.broadcastHeartbeat();
      this.heartbeatCounter++;
    }, 2000);
  }
  
  /**
   * 피어 목록에 새로운 피어 추가
   */
  addPeer(peerId) {
    // 이미 목록에 있는지 확인
    if (this.peers.has(peerId)) {
      // 마지막 활동 시간 업데이트
      this.peers.set(peerId, Date.now());
      return;
    }
    
    // 새 피어 추가
    this.peers.set(peerId, Date.now());
    console.log('새로운 피어가 발견되었습니다:', peerId);
    
    // UI 업데이트
    this.updateAvailablePeers();
  }
  
  /**
   * 오래된 피어 정리
   */
  cleanupPeers() {
    const now = Date.now();
    const TIMEOUT = 120000; // 2분간 활동이 없으면 제거
    
    for (const [peerId, lastSeen] of this.peers.entries()) {
      if (now - lastSeen > TIMEOUT) {
        console.log('비활성 피어 제거:', peerId);
        this.peers.delete(peerId);
      }
    }
    
    // UI 업데이트
    this.updateAvailablePeers();
  }
  
  /**
   * 하트비트 브로드캐스트
   */
  broadcastHeartbeat() {
    if (!this.myPeerId) return;
    
    // 자신의 존재를 알림
    window.dispatchEvent(new CustomEvent('peerAvailable', {
      detail: { id: this.myPeerId }
    }));
  }
  
  /**
   * 사용 가능한 피어 목록 UI 업데이트
   */
  updateAvailablePeers() {
    // 피어가 없는 경우
    if (this.peers.size === 0) {
      this.availablePeersElem.innerHTML = `
        <div class="text-gray-500 text-sm">현재 연결 가능한 사용자가 없습니다.</div>
      `;
      return;
    }
    
    // 피어 목록 렌더링
    let html = '';
    for (const [peerId, lastSeen] of this.peers.entries()) {
      const timeDiff = Math.floor((Date.now() - lastSeen) / 1000);
      html += `
        <div class="flex justify-between items-center p-2 mb-1 bg-gray-700 rounded">
          <div class="truncate max-w-[70%]">${peerId}</div>
          <div class="flex items-center">
            <span class="text-xs text-gray-400 mr-2">${timeDiff}초 전</span>
            <button 
              class="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded" 
              onclick="window.handlePeerSelected('${peerId}')"
            >
              연결
            </button>
          </div>
        </div>
      `;
    }
    
    this.availablePeersElem.innerHTML = html;
  }
  
  /**
   * 발견 상태 업데이트
   */
  updateDiscoveryStatus() {
    if (this.peers.size === 0) {
      this.discoveryStatus.textContent = '검색 중... 가능한 사용자 없음';
    } else {
      this.discoveryStatus.textContent = `가능한 사용자: ${this.peers.size}명`;
    }
  }
}

// 페이지 로드 완료시 피어 발견 서비스 시작
document.addEventListener('DOMContentLoaded', () => {
  // tetris.js가 로드된 후 초기화하기 위해 약간 지연
  setTimeout(() => {
    window.peerDiscovery = new PeerDiscovery();
  }, 1000);
}); 
