
---

```markdown
# 🎵 Music Player App

Ứng dụng nghe nhạc được xây dựng bằng **React Native CLI**, hỗ trợ quản lý bài hát, nghệ sĩ, playlist, và lịch sử phát nhạc.  
Ứng dụng có thể quét thư mục nhạc trên thiết bị, tự động đồng bộ danh sách nghệ sĩ, và hiển thị thông tin chi tiết cho từng bài hát.

---

## 📁 Cấu trúc thư mục

```

src/
├── components/        # Các component tái sử dụng (MiniPlayer, SearchBar, Modal, ...)
├── context/           # React Context quản lý state toàn cục (AppContext)
├── database/          # Cấu trúc database & logic CRUD (songs, artists, playlists, ...)
│    ├── db.js
│    ├── songs.js
│    ├── artists.js
│    └── autoCreateArtists.js   # Tự động tạo & liên kết nghệ sĩ từ dữ liệu bài hát
├── navigation/        # Cấu hình navigation (Stack, Tabs, ...)
├── screens/           # Các màn hình chính (SongsScreen, ArtistsScreen, GenresScreen, ...)
└── utils/             # Các hàm tiện ích

````

---

## 🚀 Cài đặt

### 1️⃣ Chuẩn bị môi trường

Cài đặt các công cụ cần thiết cho React Native CLI:

```bash
# Cài đặt Node.js (phiên bản LTS khuyến nghị)
https://nodejs.org/en/

# Cài đặt môi trường Android (Android Studio)
https://developer.android.com/studio

# Cài đặt react-native-cli
npm install -g react-native-cli
````

Kiểm tra cài đặt:

```bash
node -v
npm -v
adb devices
```

---

### 2️⃣ Clone & cài dependencies

```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>

# Cài các package
npm install
```

Hoặc nếu bạn dùng Yarn:

```bash
yarn install
```

---

### 3️⃣ Chạy ứng dụng

#### 🔹 Android

```bash
npx react-native run-android
```

#### 🔹 iOS (nếu có Mac)

```bash
npx pod-install ios
npx react-native run-ios
```

---

## 🎧 Các chức năng chính

| Tính năng                     | Mô tả                                                                   |
| ----------------------------- | ----------------------------------------------------------------------- |
| 🔍 **Scan Music**             | Tự động quét thư mục nhạc trên thiết bị và thêm vào DB                  |
| 👨‍🎤 **Auto Create Artists** | Tự động tạo nghệ sĩ từ `artist_name_string` (vd: "Drake feat. Rihanna") |
| 🎶 **Playlists**              | Tạo, sửa, xoá playlist                                                  |
| 🕒 **Play History**           | Lưu lại lịch sử phát nhạc                                               |
| ⚙️ **Settings**               | Cho phép đồng bộ lại nghệ sĩ thủ công, hoặc reset dữ liệu               |
| 🔈 **Mini Player**            | Hiển thị bài hát đang phát ở dưới cùng màn hình                         |

---

## 🧩 Các module chính

| File                            | Vai trò                                                    |
| ------------------------------- | ---------------------------------------------------------- |
| `database/autoCreateArtists.js` | Xử lý tự động tạo và liên kết nghệ sĩ từ thông tin bài hát |
| `context/AppContext.jsx`        | Quản lý state toàn ứng dụng                                |
| `screens/SongsScreen.jsx`       | Hiển thị danh sách bài hát                                 |
| `screens/ArtistsScreen.jsx`     | Hiển thị danh sách nghệ sĩ                                 |
| `screens/PlayListsScreen.jsx`   | Hiển thị playlist và các bài hát trong playlist            |

---

## 🛠️ Một số lệnh hữu ích

```bash
# Xoá cache để tránh lỗi Metro
npx react-native start --reset-cache

# Chạy ứng dụng với log
npx react-native run-android --variant=debug

# Kiểm tra thiết bị đang kết nối
adb devices
```

---

## ⚡ Ghi chú phát triển

* Khi thêm hoặc cập nhật `artist_name_string` cho bài hát, hệ thống sẽ tự:

  * Tạo các nghệ sĩ mới nếu chưa tồn tại.
  * Liên kết song ↔ artist trong database.

* Bạn có thể gọi hàm sync thủ công:

  ```js
  import { syncAllSongsWithArtists } from '../database/autoCreateArtists';
  syncAllSongsWithArtists();
  ```

---

## 🧑‍💻 Tác giả

**Nahn**
📧 <nhanteo258@gmail.com>
💡 “Vibe coder”

---

