#!/bin/bash
cd "$(dirname "$0")"
echo "==============================================="
echo "   ĐANG TIẾN HÀNH TRIỂN KHAI LÊN VERCEL...     "
echo "==============================================="
echo ""
echo "Nếu là lần đầu, trình duyệt sẽ tự mở để bạn đăng nhập Vercel."
echo "Bạn chỉ cần nhấn Enter để đồng ý với các cài đặt mặc định."
echo ""
npx vercel --prod
echo ""
echo "Hoàn tất! Nhấn phím bất kỳ để thoát."
read -n 1 -s
