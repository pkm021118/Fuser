![Wire Frame _ Login1](https://github.com/user-attachments/assets/757dbc6f-b502-48de-ac61-f4bc922a8bb8)

<br/><br>

# Fuser
Fuser는 React, React Router, Firebase를 사용하여 구축된 전자 제품 전문 중고 거래 사이트입니다. 이 문서는 각 코드 파일의 주요 기능을 설명합니다.

<br/><br>

## Link
- **`Figma`** : https://www.figma.com/design/QmXvmCkX3rTGkn2W1q8EbW/FUSER?node-id=0-1&t=JoO7vFbbpBBgJmrB-1
- **`youtube`** : https://youtu.be/HuKNwUG_iNk

<br/><br>

## 파일 구조 및 기능 설명

### `src/App.js`

- **`App` 컴포넌트**: 애플리케이션의 주요 라우팅 및 레이아웃을 정의합니다.
  - `AuthProvider`로 인증 상태를 관리합니다.
  - `PrivateRoute`를 사용하여 인증된 사용자만 접근할 수 있는 라우트를 보호합니다.
  - `/` 및 `/login` 경로는 공개되어 있고, 나머지 경로는 `PrivateRoute`로 보호됩니다.
- **`DefaultLayout` 컴포넌트**: 공통 레이아웃 및 스타일을 정의합니다.
  - `NavBar`를 포함하여 주요 페이지의 레이아웃을 설정합니다.
  - 경로에 따라 `StorePage`, `MyPage`, `SalePage` 등 다양한 페이지를 렌더링합니다.

### `src/index.js`

- **React 애플리케이션의 진입점**: `App` 컴포넌트를 루트 DOM 요소에 렌더링합니다.
- `React.StrictMode`로 애플리케이션을 감싸 개발 모드에서 더 많은 경고와 오류를 확인합니다.

### `src/components/NavBar.js`

- **네비게이션 바 컴포넌트**: 로그인 상태에 따라 다른 메뉴를 표시합니다.
  - 로그인 상태에서는 **로그아웃 아이콘**을 표시하고, 클릭 시 로그아웃 처리 후 로그인 페이지로 리디렉션합니다.
  - 로그아웃 상태에서는 **로그인 아이콘**을 표시합니다.
  - **스토어, 판매하기, MY 페이지**로의 링크를 제공합니다.

### `src/components/PrivateRoute.js`

- **인증된 사용자만 접근할 수 있는 라우트 컴포넌트**:
  - **`useAuth`** 훅을 사용하여 현재 사용자 상태를 확인합니다.
  - 인증되지 않은 사용자는 로그인 페이지로 리디렉션하고, 로그인 이후 사용할 수 있다는 경고 메시지를 표시합니다.
  - 인증된 사용자는 `Outlet`을 통해 자식 라우트를 렌더링합니다.

### `src/contexts/AuthContext.js`

- **사용자 인증 상태를 관리하는 컨텍스트**:
  - **`AuthProvider`** 컴포넌트를 통해 인증 상태와 관련된 기능을 제공합니다.
  - **`useAuth`** 훅을 통해 다른 컴포넌트에서 인증 상태를 사용할 수 있게 합니다.
  - **`login`**, `logout` 함수와 `onAuthStateChanged`를 사용하여 Firebase 인증 상태를 관리합니다.

### `src/Firebase/fbInstance.js`

- **Firebase 초기화 및 서비스 설정**:
  - **Firebase 설정**을 초기화하고 **Firestore, Auth, Storage** 인스턴스를 생성하여 내보냅니다.
  - `.env` 파일에서 환경 변수를 읽어와 Firebase 설정을 구성합니다.

### `src/pages/LoginPage.js`

- **사용자 로그인 페이지**:
  - 사용자 이메일과 비밀번호를 입력받아 **Firebase Auth**를 통해 로그인 처리합니다.
  - 로그인 성공 시 스토어 페이지로 리디렉션합니다.

### `src/pages/SignUpPage.js`

- **사용자 회원가입 페이지**:
  - 사용자 이메일과 비밀번호를 입력받아 새 계정을 생성합니다.
  - 회원가입 성공 시 자동으로 로그인 처리하고 스토어 페이지로 리디렉션합니다.

### `src/pages/StorePage.js`

- **전체 제품 목록을 보여주는 스토어 페이지**:
  - Firestore에서 제품 데이터를 가져와 목록으로 표시합니다.
  - 각 제품에 대한 간단한 정보를 표시하며, 클릭 시 제품 상세 페이지로 이동합니다.

### `src/pages/SalePage.js`

- **세일 중인 제품 목록을 보여주는 페이지**:
  - Firestore에서 세일 제품 데이터를 가져와 목록으로 표시합니다.
  - 각 제품에 대한 간단한 정보를 표시하며, 클릭 시 제품 상세 페이지로 이동합니다.

### `src/pages/MyPage.js`

- **사용자 개인 페이지**:
  - 사용자 정보와 관련된 기능을 제공합니다.
  - 사용자가 구매한 제품 목록 등을 표시할 수 있습니다.

### `src/pages/ProductDetail.js`

- **특정 제품의 세부 정보를 보여주는 페이지**:
  - Firestore에서 제품 ID를 기반으로 제품의 상세 정보를 가져와 표시합니다.
  - 제품의 이미지, 설명, 가격 등을 포함합니다.

### `src/pages/CategoryPage.js`

- **특정 카테고리의 제품 목록을 보여주는 페이지**:
  - 선택된 카테고리에 해당하는 제품을 Firestore에서 필터링하여 표시합니다.
  - 각 제품에 대한 간단한 정보를 표시하며, 클릭 시 제품 상세 페이지로 이동합니다.

### `src/pages/BrandPage.js`

- **특정 브랜드의 제품 목록을 보여주는 페이지**:
  - 선택된 브랜드에 해당하는 제품을 Firestore에서 필터링하여 표시합니다.
  - 구매한 제품을 제외하고 나머지 제품을 표시합니다.
  - 각 제품에 대한 간단한 정보를 표시하며, 클릭 시 제품 상세 페이지로 이동합니다.

### `src/pages/PurchasePage.js`

- **제품 구매 페이지**:
  - URL 매개변수로 전달된 제품 ID를 기반으로 제품 정보를 Firestore에서 가져옵니다.
  - 사용자 주소와 결제 방법을 입력받아 Firestore에 구매 정보를 저장합니다.
  - 구매가 완료되면 사용자를 My 페이지로 리디렉션합니다.
  - 구매 시 판매 상태를 업데이트하여 더 이상 구매할 수 없도록 설정합니다.
  - **`useAuthState`** 훅을 사용하여 현재 로그인한 사용자의 정보를 가져옵니다.
  - 로딩 상태일 때 "Loading..." 메시지를 표시하고, 제품 정보를 가져온 후 상세 정보를 표시합니다.
