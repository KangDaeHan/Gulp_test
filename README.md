# Gulp 자동화 테스트

Gulp는 프로젝트의 생산성 향상을 위해 node.js 기반의 자동화 빌드 시스템으로 프로젝트 진행에 있어서 수월하게 작업을 가능하게 도와주는 툴이다.  
서버 실행 및 배포용 소스 생성 등을 하나의 명령어로 간단한게 실행 할 수 있고 사용자들이 반복적으로 수행하는 일들을 줄여줄 수 있을 뿐만이 아니라,  
코드의 압축, 병합을 도와주고, 수정된 내용을 감지하여 자동으로 위의 작업을 작업자 대신 처리해 줄 수 있다.

gulp의 특징적인 장점은 아래와 같다.

node의 stream을 사용하는 빌드 도구로 task를 병렬로 처리하여 상대적으로 작업 효율을 높일 수 있다.
gulp는 json 형태가 아닌 js 형태로 task를 연결하여 상대적으로 진입장벽이 낮아 최초 접근이 쉽다.

- 자바스크립트 라이브러리 압축
- 단위 테스트(Unit Test) 실행
- css 컴파일링
- 브라우저 자동 Refresh

### 기본 설정  

#### node 설치  
node.js [(바로가기)](https://nodejs.org/ko/) 설치 후 cmd 실행

#### npm 초기화  
```
npm init
```

#### Gulp 설치
```
npm install -g gulp
```

#### 프로젝트 로컬 설치
```
npm install --save-dev gulp
```

#### gulpfile.js 파일 생성
프로젝트 최상위 폴더 아래에 파일 생성  
파일 구성은 해당 프로젝트에 맞게 구성.

*프로젝트 폴더 구조  
```
─ root
  │  README.md
  ├─ node_modules
  ├─ tmp (실제 렌더링 폴더)
  ├─ ui (해당 프로젝트 폴더 이름)
  ├─ gulpfile.js
  ├─ package.json
  └─ .gitignore
```


