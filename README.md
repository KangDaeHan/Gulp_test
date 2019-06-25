# Gulp 자동화 테스트

Gulp는 프로젝트의 생산성 향상을 위해 node.js 기반의 자동화 빌드 시스템으로 프로젝트 진행에 있어서 수월하게 작업을 가능하게 도와주는 툴이다.  
서버 실행 및 배포용 소스 생성 등을 하나의 명령어로 간단한게 실행 할 수 있다.  
이러한 도구들은 사용자들이 반복적으로 수행하는 일들을 줄여줄 수 있을 뿐만이 아니라,  코드의 압축, 병합을 도와주고, 수정된 내용을 감지하여 자동으로 위의 작업을 작업자 대신에 처리해 줄 수 있다.

gulp가 grunt 에 비해 특징적인 장점은 아래와 같다.

node 의 stream 을 사용하는 빌드 도구로 task 를 병렬로 처리하여 상대적으로 작업 효율을 높일 수 있다.
grunt의 경우 플러그인들을 json 형태로 선언하여 task 를 정의하고 하는데에 반해, gulp는 json 형태가 아닌 js 형태로 task를 연결하여 상대적으로 진입장벽이 낮아 최초 접근이 쉽다.
1. node 설치 ()