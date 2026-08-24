# Apps in Toss 공유 API 기술 검증

- Issue: [#5 Apps in Toss 공유 기능 기술 검증](https://github.com/KONG-AIT/pet-rock/issues/5)
- 계획 ID: P04
- 검증일: 2026-08-24
- 검증 대상: `@apps-in-toss/web-framework@3.0.2`, `@apps-in-toss/devtools@3.0.5`

## 결론

현재 설치된 Apps in Toss SDK가 공식적으로 보장하는 OS Share Sheet 경로는
`Share.sendMessage({ message: string })`이며, **텍스트 한 개만 공유할 수 있다.** 이미지,
`Blob`, `File`, Base64, 로컬 파일 URI를 payload로 전달하는 SDK API는 없다.

따라서 UX 문서의 “현재 돌 중심의 공유 이미지를 만들어 OS Share Sheet로 연결”은
**Apps in Toss SDK만으로는 구현할 수 없다.** 다음 두 경로로 나누어 판단해야 한다.

1. 공식 지원 경로: `Share.createLink`로 링크를 만들고 `Share.sendMessage`로 텍스트/링크를
   공유한다. 원격 HTTPS 이미지가 있으면 `ogImageUrl`로 링크 미리보기를 설정할 수 있지만,
   현재 돌의 동적 이미지를 서버 없이 첨부하는 방식은 아니다.
2. 조건부 경로: Canvas를 PNG `Blob`과 `File`로 변환한 뒤 Web Share Level 2의
   `navigator.share({ files: [file] })`를 호출한다. 이 경로는 Apps in Toss SDK 계약이
   아니며 토스 WebView 지원 여부도 공식 문서에 보장되어 있지 않으므로, iOS/Android
   실기기에서 capability를 통과한 경우에만 사용할 수 있다.

P09의 확정 방향은 **공식 SDK의 텍스트/링크 공유를 이미지 capability와 독립적인 기본
경로로 두고, 이미지 파일 공유는 실기기 capability가 확인된 환경에서만 progressive
enhancement로 추가하는 것**이다. 이미지 파일 공유는 현재 구현의 필수 요구사항이 아니며,
이미지 capability가 없어도 기본 공유 기능은 사용할 수 있어야 한다.

## 제품/UX 요구사항

관련 제품 문서는 공유를 다음과 같이 제한한다.

- 서버에 다른 사용자의 돌 상태를 저장하거나 조회하지 않는다.
- 현재 돌의 모습을 외부에 공유한다.
- 기본적으로 텍스트와 링크를 OS Share Sheet로 전달한다.
- 실행 환경이 이미지 파일 공유를 지원하면 현재 돌, 이름, 장착 식물을 표현한 이미지를
  함께 전달할 수 있다.
- 이미지 파일은 선택적인 enhancement이며 기본 공유 기능의 완료 조건이 아니다.
- 별도의 공유 Preview 화면을 만들지 않는다.
- 선택적 이미지는 앱 화면 전체 캡처보다 돌, 현재 머리 위 식물, 돌 이름, 작은 브랜딩을
  중심으로 만든다.
- 공유 완료, 취소, 실패 이후에도 현재 게임 상태와 홈 상태를 유지한다.
- 공유 결과에 게임 보상이나 상태 변경을 연결하지 않는다.

이 검증은 위 경로의 기술 가능성만 다루며 공유 화면, 보상, 유입, 서버 저장 기능을 추가하지
않는다.

## 설치된 SDK 계약

### `Share.sendMessage`

설치된 3.0.2의 타입과 런타임 구현은 다음 계약이다.

```ts
Share.sendMessage({
  message: string,
}): Promise<void>
```

내부적으로 native bridge의 `share` 메서드에 동일한 객체를 전달한다. payload에는
`message` 외의 `title`, `url`, `files`, `image`, `data`, `mimeType` 필드가 없다.

SDK 3.x에서는 `Share.sendMessage`가 권장 API다. 최상위 `share({ message })`도 같은 native
bridge를 호출하지만 deprecated 호환 API이므로 새 구현에서는 사용하지 않는다.

공식 문서는 이 API가 iOS/Android의 네이티브 공유 시트를 열고 설치된 앱 목록에서 텍스트를
공유한다고 설명한다. Toss App과 Sandbox App을 실행환경으로 명시한다.

### `Share.createLink`

```ts
Share.createLink({
  path: string,
  ogImageUrl?: string,
}): Promise<string>
```

- `path`는 출시 환경에서 `intoss://` 딥링크를 사용한다.
- 출시 전 QR 테스트는 `intoss-private://` 테스트 스킴을 사용한다.
- `ogImageUrl`은 외부 플랫폼의 링크 미리보기 이미지이며 파일 첨부가 아니다.
- 공식 문서는 `ogImageUrl`에 HTTPS 절대 URL을 요구한다.
- 설치된 SDK는 `ogImageUrl`을 Android Toss 5.240.0, iOS Toss 5.239.0 이상에서 native
  bridge로 전달한다. 그보다 낮은 버전에서는 이미지 없이 기존 링크 생성 방식으로
  fallback한다.

현재 돌을 Canvas로 그려 만든 Base64/data URL은 공개 HTTPS URL이 아니므로
`ogImageUrl`로 사용할 수 없다. 동적 OG 이미지를 사용하려면 별도 업로드/CDN/이미지 생성
서버가 필요하며, 이는 “서버 없이 우선 구현” 요구와 맞지 않는다.

### `File.saveBase64`

```ts
File.saveBase64({
  data: string,
  fileName: string,
  mimeType: string,
}): Promise<void>
```

이 API는 Base64 데이터를 기기에 **저장**한다. Android Toss 5.218.0, iOS Toss 5.216.0
이상에서 지원되며 `File.saveBase64.isSupported()`로 확인할 수 있다.

반환값은 파일 URI나 파일 handle이 아니라 `void`다. 저장된 파일을 이어서 Share Sheet에
첨부하는 API가 없으므로 `File.saveBase64`와 `Share.sendMessage`를 조합해 자동으로 이미지
파일을 공유할 수 없다. 사용자에게 “저장 후 갤러리에서 직접 공유”를 요구하는 흐름은 현재
UX 계약의 한 번의 공유 동작과 다르다.

## 데이터 형식별 가능 여부

| 입력 형식 | Apps in Toss `Share` | Web Share | 판정 |
| --- | --- | --- | --- |
| 문자열 | `Share.sendMessage({ message })` | `navigator.share({ text })` | 공식 SDK 경로 사용 가능 |
| Toss 딥링크 | `Share.createLink` 후 문자열로 전송 | 생성된 HTTPS 링크를 `url`/`text`로 전송 | 공식 SDK 경로 사용 가능 |
| 원격 HTTPS 이미지 URL | `Share.createLink`의 `ogImageUrl` 미리보기 | URL 자체 공유 가능 | 파일 첨부가 아님 |
| Canvas | 직접 전달 불가 | `canvas.toBlob()` 후 `File`로 변환 | 조건부 가능 |
| Blob | 직접 전달 불가 | `new File([blob], ...)` 후 전달 | 조건부 가능 |
| File | payload에 없음 | `navigator.canShare({ files })`가 true일 때 전달 | 조건부 가능 |
| Base64 | `File.saveBase64`로 저장만 가능 | Blob/File로 디코딩 후 전달 | SDK 공유에는 사용 불가 |
| data URL | payload에 없음, `ogImageUrl`로 부적합 | Blob/File로 변환 필요 | 직접 공유 불가 |
| 임시 파일/로컬 URI | 생성·반환 API 없음 | 브라우저 `File` 객체로만 취급 | SDK 공유에는 사용 불가 |

## 이미지 생성에서 Share Sheet까지의 경로

### 경로 A: SDK 텍스트/링크 공유 — 공식 지원, 이미지 첨부 불가

```ts
const link = await Share.createLink({
  path: 'intoss://pet-rock',
  // ogImageUrl은 공개 HTTPS URL이 있을 때만 사용
});

await Share.sendMessage({
  message: `내 애완돌을 소개할게요.\n${link}`,
});
```

장점은 Toss App과 Sandbox App에서 공식 지원되는 native bridge를 이용하고 OS Share Sheet로
연결된다는 점이다. 단점은 현재 돌의 동적 PNG를 첨부하지 못한다는 점이다.

### 경로 B: Canvas → Blob → File → Web Share — 조건부

```ts
async function canvasToPngFile(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (value == null) {
        reject(new Error('공유 이미지를 만들지 못했습니다.'));
        return;
      }
      resolve(value);
    }, 'image/png');
  });

  return new File([blob], 'pet-rock.png', { type: 'image/png' });
}

async function sharePng(file: File) {
  const payload = { files: [file] };

  if (typeof navigator.share !== 'function' ||
      typeof navigator.canShare !== 'function' ||
      !navigator.canShare(payload)) {
    return false;
  }

  await navigator.share(payload);
  return true;
}
```

Web Share는 secure context, 사용자 activation, 브라우저와 OS의 파일 공유 지원이 필요하다.
파일 MIME도 `navigator.canShare()`로 실행 시점에 확인해야 한다. Promise가 resolve돼도
대상 앱이 파일을 최종 수락했다는 뜻까지 보장하지 않는다.

Canvas 렌더링과 `toBlob()`은 비동기이므로 사용자 activation을 잃을 가능성을 줄이기 위해
공유 이미지를 버튼 클릭 전에 미리 생성하거나 캐시하는 편이 안전하다. 돌 상태가 변경되면
캐시를 무효화한다. 실제 공유 호출은 반드시 사용자의 공유 버튼 이벤트 안에서 실행한다.

이 경로는 일반 모바일 브라우저에서는 구현 가능한 표준 경로지만, 토스 앱 WebView가
파일 공유를 노출한다는 Apps in Toss 계약은 확인되지 않았다. 다음 네 환경에서 각각
`navigator.share`, `navigator.canShare({ files: [pngFile] })`, 실제 Share Sheet의 PNG 첨부를
실기기로 확인해야 한다.

- Toss App iOS
- Toss App Android
- Sandbox App iOS
- Sandbox App Android

### 경로 C: Base64 저장 후 공유 — 자동 연결 불가

Canvas의 `toDataURL('image/png')` 결과에서 Base64 부분을 꺼내 `File.saveBase64`로 저장할 수
있다. 그러나 저장 API가 URI를 반환하지 않고 `Share.sendMessage`도 파일을 받지 않으므로
같은 사용자 동작에서 해당 파일을 Share Sheet에 첨부할 수 없다. 다운로드/갤러리 저장
fallback으로는 고려할 수 있지만 현재 공유 UX의 구현 경로로 추천하지 않는다.

## 환경별 capability matrix

| 환경 | `Share.sendMessage` | SDK 이미지/파일 첨부 | Web Share 파일 | `File.saveBase64` | 검증 의미 |
| --- | --- | --- | --- | --- | --- |
| Toss App | native OS Share Sheet, 텍스트 지원 | 미지원 | 공식 보장 없음, 실기기 확인 필요 | 지원 버전에서 저장 가능 | 최종 동작 판정 환경 |
| Sandbox App | 공식 문서상 텍스트 공유 지원 | 미지원 | 공식 보장 없음, iOS/Android 확인 필요 | SDK는 sandbox에서 버전 검사를 항상 통과시킴 | bridge 흐름 확인용, 버전 경계 검증에는 부적합 |
| 브라우저 개발환경 + AIT devtools | mock이 `navigator.share({ text })`를 호출하고, 미지원이면 console log | mock도 텍스트만 전달 | 해당 브라우저/OS의 구현에 좌우됨 | `<a download>` 기반 다운로드로 mock | Toss WebView 지원 증거가 아님 |
| 일반 브라우저 + 실제 SDK | native bridge가 없어 호출 실패 | 미지원 | 브라우저가 직접 지원하면 가능 | native bridge가 없어 호출 실패 | SDK fallback이 별도로 필요 |

프로젝트의 Vite 개발 모드는 `@apps-in-toss/devtools`가 SDK를 mock으로 치환한다. 이 mock의
`Share.sendMessage`는 브라우저에 `navigator.share`가 있으면 텍스트 Web Share를 호출하고,
없으면 console에 기록하고 resolve한다. 따라서 로컬에서 성공한 호출은 Toss native bridge의
성공을 증명하지 않으며, 반대로 데스크톱 브라우저에서 Share Sheet가 없다고 Toss App도
미지원이라고 판단해서는 안 된다.

`File.saveBase64` mock도 native 저장소 대신 data URL과 `<a download>`를 사용한다. 파일 저장
UX와 권한은 실기기 동작과 동일하지 않다.

## 브라우저 fallback 결정

P09가 Apps in Toss 전용 기능으로 구현된다면 일반 브라우저에서 SDK native share를 완전히
재현할 필요는 없다. 다만 개발환경의 mock과 실제 SDK의 동작이 다르므로 다음 분기는
필요하다.

1. 파일 Web Share capability가 실기기 검증을 통과하면 PNG 파일 공유를 먼저 시도한다.
2. 파일 공유가 없거나 거부되면 `Share.sendMessage`로 텍스트/링크를 공유한다.
3. native bridge가 없는 일반 브라우저에서는 `navigator.share({ text, url })`를 사용할 수
   있을 때만 사용한다.
4. `navigator.share`도 없을 때 별도의 다운로드, 클립보드 복사, 공유 버튼 숨김 UX를 새로
   만들지 않는다. Apps in Toss 공식 SDK 경로를 사용할 수 없는 일반 브라우저의 fallback은
   P09 범위에서 임의로 확장하지 않는다.

SDK 호출 가능 여부를 단순히 `navigator.share`로 판정해서는 안 된다. Toss App의
`Share.sendMessage`는 브라우저 Web Share가 아니라 native bridge API다. 브라우저 fallback은
실행환경 판정과 함께 별도 adapter에 격리하는 편이 안전하다.

## 실패와 취소 처리

### SDK 경로

- `Share.createLink`와 `Share.sendMessage`를 각각 `try/catch`한다.
- 공식 문서와 설치 타입에는 사용자 취소를 구분하는 에러 코드가 정의되어 있지 않다.
- 취소와 bridge 실패를 임의로 구분하지 말고, 사용자에게 성공 보상이나 불이익을 연결하지
  않는다.
- Share Sheet에서 앱을 선택한 뒤의 전달 성공은 미니앱이 확인할 수 없다고 가정한다.
- 실패 시 홈 상태를 유지하고 재시도할 수 있게 한다.

### Web Share 경로

- `AbortError`는 사용자가 취소했거나 공유 대상이 없는 경우이므로 오류 알림 없이 홈에
  그대로 머물 수 있다.
- `NotAllowedError`는 사용자 activation, Permissions Policy, 차단된 파일 형식 등을 확인한다.
- `TypeError`는 잘못되거나 지원되지 않는 payload를 의미할 수 있으므로 capability와 MIME을
  다시 확인한다.
- `DataError` 등 그 밖의 오류는 파일 공유 실패로 처리하고, SDK 텍스트/링크 fallback을
  제안할 수 있다.

공유 완료를 게임 보상이나 상태 변경 조건으로 사용하지 않는다. Share API는 수신 앱에서의
최종 전송 완료를 보장하지 않는다.

## 확정된 공유 정책

- 이미지 파일 공유는 현재 구현의 필수 요구사항이 아니다.
- `Share.createLink`와 `Share.sendMessage`를 사용하는 텍스트/링크 공유가 기본 경로다.
- 파일 Web Share는 Toss App과 Sandbox App 실기기에서 capability가 확인된 환경에서만
  progressive enhancement로 제공한다.
- 이미지 capability가 없거나 runtime 확인에 실패해도 공식 SDK 텍스트/링크 공유는 사용할
  수 있어야 한다.
- 동적 이미지 공유를 위한 별도 서버나 CDN을 도입하지 않는다.
- `File.saveBase64`로 이미지를 저장한 뒤 사용자가 직접 공유하게 하는 흐름은 포함하지 않는다.
- 공유 결과에 게임 보상이나 상태 변경을 연결하지 않는다.
- 공유 완료, 취소, 실패 이후에도 현재 게임 상태와 홈 상태를 유지한다.

## P09 구현 계약

1. 공유 UI는 Apps in Toss SDK나 Web Share API의 세부 구현을 직접 알지 않는다.
2. SDK, Web Share, runtime capability 판정은 별도 share adapter 또는 service에 격리한다.
3. adapter는 이미지 capability와 독립적으로 `Share.createLink` + `Share.sendMessage`
   텍스트/링크 기본 경로를 제공한다.
4. 파일 Web Share 경로는 실기기 capability가 확인된 환경에서만 후보가 되며, 실행할 때마다
   `navigator.share`와 `navigator.canShare({ files })`를 runtime capability로 확인한다.
5. 선택적 이미지 경로를 제공할 때만 현재 돌, 장착 식물, 돌 이름, 작은 브랜딩을 Canvas에
   그리고 PNG `Blob`과 `File`로 변환한다. Base64 저장 경로는 만들지 않는다.
6. UI가 처리하는 결과 상태는 다음 네 가지로 제한한다.

   - `shared`
   - `cancelled`
   - `unavailable`
   - `failed`

7. SDK가 제공하지 않는 수신 앱 선택, 실제 전송 완료 같은 세부 성공 상태를 임의로 만들지
   않는다.
8. 어떤 결과 상태에서도 게임 보상이나 도메인 상태를 변경하지 않으며 홈 상태를 유지한다.

## P09 전에 남아 있는 기술 검증

Toss App과 Sandbox App의 iOS/Android 실기기에서 Web Share 파일 capability와 실제 PNG
첨부를 확인하는 작업만 남아 있다. 이 검증은 선택적 이미지 enhancement의 활성화 여부만
결정하며, 공식 SDK 텍스트/링크 기본 경로를 구현하는 P09의 착수를 막지 않는다.

## 근거

- 설치된 `@apps-in-toss/web-framework@3.0.2`의 `dist/index.d.ts`, `dist/index.js`
- 설치된 `@apps-in-toss/devtools@3.0.5`의 `dist/mock/3x.d.ts`, `dist/mock/3x.js`
- [앱인토스 개발자센터: 메시지 공유](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B3%B5%EC%9C%A0/share.html)
- [앱인토스 개발자센터: 토스앱 공유 링크](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B3%B5%EC%9C%A0/getTossShareLink.html)
- [Apps in Toss 공식 예제](https://github.com/toss/apps-in-toss-examples)
- [W3C Web Share API](https://w3c.github.io/web-share/)
- [MDN Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)
