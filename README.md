<div align="center">

# Codinghub Test
</br> </br> 
Test Link</br> 
https://jehoontest.vercel.app/
</br> </br> 


자연스럽고 직관적인 사용자 경험을 목표로, Zustand를 활용한 상태 관리와 </br> Next.js, Tailwind CSS를 통한 UI/UX 최적화를 공부하며 제작했습니다. </br>
프로젝트를 생성, 삭제 하고 프로젝트 내 보드와 To-do들을 생성 및 관리 할 수 있습니다. </br>
</br> </br> 

## 주요 기술 스택
</br> 

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Zustand-FF4154?style=flat-square&logo=react&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/framer_motion-ffca28?style=flat-square&logo=framer&logoColor=%23ffffff&color=%237178f6 alt="Motion" />
</p>

</br> </br> 

## 사용 기술 및 라이브러리

| Name                  | Appliance            | Version | 선정 이유                                                                 |
|-----------------------|----------------------|---------|---------------------------------------------------------------------------|
| React                 | 프론트엔드 라이브러리| 18.3.1  | 컴포넌트 기반 UI 구축과 풍부한 생태계를 고려하여 선택.                   |
| Next.js               | React 프레임워크     | 14.2.23 | 서버 사이드 렌더링과 정적 생성으로 성능 최적화 및 SEO 개선.             |
| Tailwind CSS          | CSS 프레임워크       | 3.4.17  | 유틸리티 클래스 기반 스타일링으로 빠르고 일관된 디자인 구현.           |
| TypeScript            | 정적 타입            | 5.7.3   | 코드 안정성과 유지보수성을 높이기 위해 선택.                           |
| Framer Motion         | 애니메이션 라이브러리| 12.4.7  | React 환경에서 직관적이고 부드러운 모션 애니메이션 적용.               |
| React DnD             | 드래그 앤 드롭       | 16.0.1  | Kanban 보드의 인터랙티브한 드래그 앤 드롭 기능 구현.                   |
| Zustand               | 상태 관리 라이브러리 | 5.0.3   | 간결하고 유연한 전역 상태 관리로 컴포넌트 간 데이터 공유 간소화.         |
| @supabase/supabase-js | 백엔드 서비스        | 2.48.1  | 간편한 인증과 실시간 기능을 제공하는 Supabase와 통합.                    |
| Zod                   | 스키마 검증          | 3.24.2  | 타입스크립트와의 호환성을 고려한 런타임 데이터 검증.                     |
| PostCSS               | 스타일 변환 툴       | 8.5.2   | Tailwind CSS와 함께 CSS 최적화 및 변환 작업 지원.                       |
| Autoprefixer          | CSS 자동 접두어 추가 | 10.4.20 | 브라우저 호환성을 위한 자동 접두어 처리.                               |



</div>
</br> </br> 

## 회고</br> 
이번 프로젝트에서 상태 관리 로직을 다루며 편집, 삭제, 오류 모드 등을 구현하면서 중요한 깨달음을 얻었습니다. 처음에는 컴포넌트마다 이벤트 핸들러에서 상태를 직접 조작하려 했으나, 코드 중복과 불일치 문제가 발생했고, 이를 해결하기 위해 상태 업데이트를 한 곳에서 관리하도록 설계를 변경하니 로직이 간결해지고 예측 가능성이 높아졌습니다. 하지만

컴포넌트는 UI와 사용자 입력만 담당하고, 상태 변화는 중앙에서 처리하도록 분리하는 과정에서 중복되는 함수들은 zustand 스토어에 다 넣어놨더니 점점 불어나서 나중에는 타입 불일치와 가독성이 떨어진점이 아쉬웠습니다. 다음 프로젝트를 타입스크립트와 zustand를 활용한다면 기존에 한곳에서 관리를 하다가 나중에 분리하려 하지말고 미리 분리해가며 코드 관리를 해야겠다는 생각이 들었습니다. 그렇게하면 타입도 인터페이스도 보다 명확히 하기 좋을 것 같단 생각이 들었습니다. 

이번 작업을 통해 상태 관리와 타입 시스템에 대한 이해가 깊어지고, 앞으로는 초기 설계에 더 신경 써서 코드 품질을 높이며 팀 협업을 쉽게 할 수 있는 방향으로 나아가고자 합니다.

</br> </br> </br> </br> 
## Trouble 1: 모드 전환 시 editMode가 의도치 않게 켜지는 문제</br> </br> 
### 문제</br> 
Kanban 보드에서 editMode, deleteMode, errorMode 전환 시 editMode가 꺼지지 않음.
deleteMode에서 다른 모드로 전환하면 editMode가 예기치 않게 활성화됨.
### 해결</br> 
Zustand 스토어에서 toggleEditMode, toggleDeleteMode, toggleErrorMode 함수를 개선해 상호 배타적 로직 구현. 각 함수가 호출될 때 선택된 모드만 토글되고 나머지 모드는 false로 설정. KanbanHeader의 onClick 핸들러를 단순화해 Zustand에 의존하도록 수정.
### 결과</br> 
모드 전환이 정상적으로 동작하며 불필요한 상태 충돌 제거. 페이지 응답 속도가 약간 개선됨(FCP 2.1s → 1.9s). 타입스크립트로 상태 타입을 엄격히 관리해 런타임 오류 감소.</br> </br> 
🔗 GitHub Comment #1
🔗 Blog Post
</br> 
</br> </br> 
## Trouble 2: 타입스크립트에서 Zustand 상태 타입 오류로 컴파일 실패</br> </br> 
### 문제 </br> 
normalTodos와 errorTodos 상태 업데이트 시 'Todo[]' 형식은 'unknown' 형식에 할당할 수 없습니다 오류 발생.
KanbanBoard 컴포넌트에서 todos prop 전달 시 타입 불일치로 빌드 실패.
### 해결 </br> 
Zustand 스토어에 create<KanbanState> 제네릭 타입을 명시해 상태와 액션 타입 정의. Todo 인터페이스 임포트를 모든 파일에서 통일하고, 타입 단언 대신 정확한 타입 지정으로 수정. 더미 데이터로 테스트하며 타입 오류 해결 확인.
### 결과 </br> 
컴파일 오류가 사라지고, 타입 안전성이 확보됨. 빌드 시간이 약간 단축(12s → 10s). 타입스크립트 디버깅 능력 향상.</br> </br> 
🔗 GitHub Comment #2
🔗 Blog Post


</br> </br> </br> 
