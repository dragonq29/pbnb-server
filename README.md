# pbnb-server

Firebase의 Functions를 이용한 pbnb 서버

1. Firebase에서 pbnb 프로젝트 생성

2. Firebase Functions의 가이드를 따름

   ```
   npm install -g firebase-tools
   firebase init
   cd functions
   vi index.js
   firebase emulators:start // 로컬 실행 (테스트)
   firebase deploy --only functions // 배포
   (참고) firebase deploy --only functions:menu // menu API만 수정되었을 경우 골라서 배포
   ```

3. Firebase Functions 페이지에 있는 API 주소를 앱(pbnb)에서 사용
