# 테트리스 멀티플레이어

실시간 P2P 대전이 가능한 테트리스 게임입니다. HTML, JavaScript, Tailwind CSS로 구현되었으며 PeerJS를 이용해 네트워크 연결을 구현했습니다.

## 기능

- 기본 테트리스 게임 플레이 (7가지 테트로미노, 회전, 이동, 하드/소프트 드롭)
- PeerJS를 이용한 P2P 실시간 멀티플레이
- Google의 공개 STUN 서버를 사용한 NAT 통과 지원
- 로컬 네트워크 내 다른 플레이어 자동 검색
- 모바일 지원 반응형 UI
- 상대방 게임 화면과 점수 실시간 표시
- 자동 ID 발급 및 유지

## 실행 방법

1. 프로젝트 클론 또는 다운로드
```bash
git clone <repository-url>
cd tetris-multiplayer
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm run start
```

4. 브라우저에서 열기
- 로컬: http://localhost:3000
- 같은 네트워크에 있는 다른 기기에서 접속할 경우: http://<your-local-ip>:3000

## 멀티플레이 방법

1. 자동 매칭
   - 동일 로컬 네트워크에 있는 다른 플레이어가 자동으로 "로컬 네트워크 유저" 목록에 표시됩니다.
   - 목록에서 원하는 상대방의 "연결" 버튼을 클릭하여 게임 시작

2. 수동 연결
   - 상대방의 ID를 "상대방 ID 입력" 필드에 입력하고 "연결" 버튼 클릭

## 게임 조작법

### 키보드 컨트롤
- 왼쪽 이동: 왼쪽 화살표 또는 A 키
- 오른쪽 이동: 오른쪽 화살표 또는 D 키
- 회전: 위쪽 화살표 또는 W 키
- 소프트 드롭: 아래쪽 화살표 또는 S 키
- 하드 드롭: 스페이스바
- 일시정지: P 키 또는 ESC 키

### 모바일 컨트롤
- 화면 하단에 있는 버튼으로 조작
  - 왼쪽/오른쪽 이동, 회전, 하드 드롭

## 기술 스택

- HTML5
- JavaScript (ES6+)
- Tailwind CSS
- PeerJS (WebRTC)
- Google STUN 서버
- Vite (빌드 도구)

## 프로젝트 구조

- `index.html`: 게임 화면 및 UI 요소
- `main.css`: Tailwind CSS 설정 및 커스텀 스타일
- `tetris.js`: 게임 로직 및 네트워크 코드
- `discovery.js`: 로컬 네트워크 자동 매칭 로직
- `package.json`: 의존성 관리
- `tailwind.config.js`: Tailwind 구성 파일
- `vite.config.js`: Vite 설정 파일 
