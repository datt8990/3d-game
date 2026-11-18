# 🧋 TRÀ SỮA ĐẠI CHIẾN 3D – MILK TEA TYCOON ONLINE

**Thể loại:** Simulation + Tycoon + Multiplayer 3D Online  
Dự án Front-end 3D hoàn chỉnh được thiết kế tối ưu để mở trực tiếp trong **VS Code**.

---

## 🚀 Cách mở và chạy trong VS Code

1. Mở **VS Code** -> chọn **File > Open Folder...** -> chọn thư mục `Game_3D` này.
2. Mở Terminal trong VS Code (`Ctrl + ~`) và chạy:
   ```bash
   npm install
   npm run dev
   ```
   *(Nếu đã cài sẵn `node_modules`, bạn chỉ cần gõ `npm run dev` hoặc bấm `Ctrl + Shift + B` trong VS Code — trình duyệt sẽ tự động mở tại `http://localhost:5173`!)*

---

## ✨ Các Thư Viện JS 3D & Model Hiện Đại Được Sử Dụng

1. **Three.js (`three` v0.174)** – Engine đồ họa 3D WebGL vật lý kính khúc xạ (`MeshPhysicalMaterial`) cho ly trà sữa trong suốt, đá viên, trân châu bóng bẩy.
2. **React Three Fiber (`@react-three/fiber` v9)** – Kiến trúc Component 3D hiện đại chuẩn công nghiệp cho Web Game 3D.
3. **Drei (`@react-three/drei` v10)** – Hệ thống tải model `.glb` (`useGLTF`, `Clone`), bầu trời sao (`Stars`), đổ bóng tiếp xúc (`ContactShadows`), hạt lấp lánh (`Sparkles`), ánh sáng HDR (`Environment`) và UI 3D nổi (`Html`).
4. **Postprocessing (`@react-three/postprocessing` + `postprocessing`)** – Hiệu ứng hậu kỳ điện ảnh **Bloom Neon** phát sáng cho bảng hiệu Boba, đĩa bay UFO, hào quang Idol và pháo hoa.
5. **Bộ 45+ Model 3D GLTF/GLB (`public/models/`)** – Tuyển chọn từ bộ CC0 **Kenney 3D Kits** (Nhân vật Chibi 3D, Quầy Bar, Máy xay, Máy pha, Thu ngân, Bàn ghế đệm, Sofa VIP, Gấu bông, Bánh ngọt, Ly Frappe, Tòa nhà Thành phố Boba Land) chạy **100% offline không lo lỗi mạng**.
6. **Zustand (`zustand` v5)** – Quản lý trạng thái game tốc độ cao + tự động lưu tiến trình (`localStorage`).
7. **Framer Motion (`framer-motion` v12) + Tailwind CSS v4 + Canvas Confetti** – Giao diện Glassmorphism mượt mà, hiệu ứng rung màn hình khi khách ném ly trà sữa vào mặt 😂.
8. **BroadcastChannel Multiplayer Sync + Web Audio Synthesizer** – Hỗ trợ mở **2 Tab trình duyệt** để thấy người chơi thật di chuyển trong Thành Phố Trà Sữa 3D & chat trực tiếp, kèm âm thanh pha chế/lắc bình/dập nắp & nhạc nền Lo-Fi.

---

## 🎮 Đầy Đủ Tính Năng Theo Kịch Bản

- **Cốt truyện khởi nghiệp:** Khởi đầu tại Boba Land với 500 Xu & chiếc máy dập nắp cũ, đặt tên Chủ Quán & Thương Hiệu.
- **Pha chế 6 bước trực quan 3D:** Chọn trà -> Sữa -> Đường & Đá -> Topping -> Lắc bình 3D (Spacebar/Click) -> Đổ vào cốc & Dập nắp. Cho nhầm topping sẽ bị **khách ném ly trà sữa thẳng vào màn hình!** 😂
- **6 Kiểu khách hàng + Khách Ngoài Hành Tinh 👽:** Học sinh, Dân văn phòng, Đại gia (x3 xu), Reviewer (tăng/giảm Sao ⭐), Khách troll (đơn siêu dị), Idol (buff x2 khách), và sự kiện **UFO 60 giây** (200 viên trân châu + 5 lớp pudding + 0% đường + ngọt như tình yêu 💖 -> thắng 5.000 Xu, thua bị hút sạch trân châu!).
- **Xây dựng cửa hàng & Chuỗi thương hiệu:** Mua bàn ghế, mở rộng quán, máy tự động, thuê nhân viên 3D, mở **Khu VIP**, xây **Tầng Thượng Sky Bar**, mở chuỗi đa thành phố.
- **3 Chế độ Online:** Đấu Chủ Quán (4 người), Đại Chiến Pha Chế (Solo 1v1 nhận Huy hiệu), Thành Phố Trà Sữa 3D (di chuyển `WASD`, thăm quán, mua trà, tặng quà, kết bạn, mở Tiệc Trà Sữa 🎉).
- **Sự kiện đặc biệt:** Săn **Boss Trân Châu 3D**, minigame **Đua Cốc Khổng Lồ 3D**, Lễ Hội Trà Sữa, Giải Đấu Vua Pha Chế.
