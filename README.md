# VLivIn app (React Native / Expo)

Stage 1: scaffold, theme, animated navigation, phone sign-in, profile, pairing, Us home.

Expo SDK 57 (works with the current App Store Expo Go).

## Run
```bash
npm install
npx expo start        # then press i / a, or scan with a dev build
```
`@shopify/react-native-skia` and `expo-secure-store` need a **development build** (not Expo Go) once Skia screens land in Stage 3:
`npx expo run:ios` / `npx expo run:android`.

## Backend
`app.json → expo.extra.apiUrl` points at the Render staging server. First request after idle takes ~1 min (timeout is 75 s).
Staging returns the OTP as `devCode`; the OTP screen shows a tap-to-fill hint.

## Stages
1. Scaffold, theme, nav, auth, pairing, Us home  ✅
2. Mood check-in, Location (map + arc), hugs, widget summary
3. Play grid, Tic Tac Toe (live), Drawing board (Skia, live strokes)
4. Talk (daily question), Moi (letters, doodles, photos)
5. Push notifications, native widgets, polish and QA
