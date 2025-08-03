const { v2: cloudinary } = require('cloudinary');

/**
 * Cloudinary 기반 GIF용 4프레임 이미지 생성
 * 
 * 동작 과정:
 * 1. 사용자 텍스트 받기
 * 2. 텍스트 길이에 따라 동적 높이 계산
 * 3. HTML 템플릿 동적 생성
 * 4. Cloudinary API로 4프레임 생성
 * 5. Base64 이미지 배열 반환
 */

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. 요청 데이터 파싱
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: '텍스트를 입력해주세요.' });
    }

    console.log('📝 받은 텍스트:', text);

    // 2. 동적 높이 계산
    const calculateHeight = (userText) => {
      const lines = userText.split('\n').length;
      const baseHeight = 600; // 제목, 버튼 등 고정 영역
      const lineHeight = 25; // 줄당 높이
      const padding = 100; // 여유 공간
      
      const calculatedHeight = baseHeight + (lines * lineHeight) + padding;
      
      // 최소 900px, 최대 5000px (Cloudinary 안정성 고려)
      return Math.min(Math.max(900, calculatedHeight), 5000);
    };

    const dynamicHeight = calculateHeight(text);
    console.log(`📏 계산된 높이: ${dynamicHeight}px`);

    // 3. 동적 HTML 템플릿 생성 함수
    const getTemplate = (userText, frameNumber, height) => {
      return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>더블랙샵 GIF 버전</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      background: #000000;
      margin: 0;
      padding: 0;
      font-family: 'Noto Sans KR', Arial, sans-serif;
    }
    
    .render-target {
      width: 720px;
      height: ${height}px; /* 동적 높이 */
      margin: 0;
      background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
      color: #ffffff;
      padding: 15px;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;
    }
    
    .shop-title {
      font-size: 55px;
      font-weight: 800;
      text-align: center;
      margin: 2px 0;
      letter-spacing: 2px;
      transition: all 0.3s ease;
    }
    
    /* 제목 자연스러운 그라데이션 흐르는 효과 */
    .frame-1 .shop-title {
      background: linear-gradient(45deg, #ffd700, #ffb347, #ff8c00);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .frame-2 .shop-title {
      background: linear-gradient(90deg, #ffb347, #ff8c00, #ff6347);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .frame-3 .shop-title {
      background: linear-gradient(135deg, #ff8c00, #ff6347, #ff4500);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .frame-4 .shop-title {
      background: linear-gradient(180deg, #ff6347, #ff4500, #ffd700);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .icon {
      display: inline-block;
      margin: 0 10px;
      font-size: 32px;
      transition: all 0.3s ease;
    }
    
    .frame-1 .icon { transform: scale(1.0); }
    .frame-2 .icon { transform: scale(1.05); }
    .frame-3 .icon { transform: scale(1.1); }
    .frame-4 .icon { transform: scale(1.05); }
    
    .shop-subtitle {
      text-align: center;
      font-size: 18px;
      color: #cccccc;
      margin-bottom: 10px;
    }
    
    .subtitle-divider {
      border: none;
      border-top: 1px solid #444444;
      margin: 20px auto;
      width: 80%;
    }
    
    .info-list {
      list-style: none;
      padding: 0;
      margin: 1px 0;
      text-align: center;
    }
    
    .info-list li {
      font-size: 18px;
      margin: 3px 0;
      color: #ffffff;
      text-align: center;
    }
    
    .info-list .icon {
      margin-right: 15px;
      font-size: 24px;
    }
    
    .cta-btn {
      text-align: center;
      font-size: 22px;
      font-weight: 700;
      padding: 15px 1px;
      margin: 15px auto;
      border-radius: 15px;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      max-width: 400px;
    }
    
    /* 오픈채팅 버튼 자연스러운 그라데이션 흐르는 효과 */
    .frame-1 .cta-btn {
      background: linear-gradient(45deg, #4169e1, #6a5acd, #8a2be2);
      border-color: #4169e1;
      box-shadow: 0 0 20px rgba(65, 105, 225, 0.4);
    }
    
    .frame-2 .cta-btn {
      background: linear-gradient(90deg, #6a5acd, #8a2be2, #9370db);
      border-color: #6a5acd;
      box-shadow: 0 0 22px rgba(106, 90, 205, 0.5);
    }
    
    .frame-3 .cta-btn {
      background: linear-gradient(135deg, #8a2be2, #9370db, #ba55d3);
      border-color: #8a2be2;
      box-shadow: 0 0 25px rgba(138, 43, 226, 0.6);
    }
    
    .frame-4 .cta-btn {
      background: linear-gradient(180deg, #9370db, #ba55d3, #4169e1);
      border-color: #9370db;
      box-shadow: 0 0 22px rgba(147, 112, 219, 0.5);
    }
    
    .divider {
      border: none;
      border-top: 2px solid #444444;
      margin: 20px auto;
      width: 90%;
    }
    
    .section-price-title {
      text-align: center;
      font-size: 33px;
      font-weight: 700;
      color: #ffaa00;
      margin: 5px 0;
      transition: all 0.3s ease;
    }
    
    .frame-1 .section-price-title { 
      color: #ffaa00; 
      text-shadow: 0 0 4px rgba(255, 170, 0, 0.7);
    }
    .frame-2 .section-price-title { 
      color: #ff6600; 
      text-shadow: 0 0 2px rgba(255, 102, 0, 0.8);
    }
    .frame-3 .section-price-title { 
      color: #ff0066; 
      text-shadow: 0 0 4px rgba(255, 0, 102, 0.9);
    }
    .frame-4 .section-price-title { 
      color: #ffaa00; 
      text-shadow: 0 0 5px rgba(255, 170, 0, 0.7);
    }
    
    .description {
      text-align: center;
      font-size: 16px;
      color: #aaaaaa;
      margin: 20px 0;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
      padding: 15px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      min-height: 50px; /* 텍스트가 짧아도 최소 높이 보장 */
    }
    
    /* 추가 서비스 아이콘 깜빡임 효과 */
    .frame-1 .info-list li:nth-child(1) .icon { color: #ff6666; transform: scale(1.1); }
    .frame-2 .info-list li:nth-child(2) .icon { color: #66ff66; transform: scale(1.1); }
    .frame-3 .info-list li:nth-child(3) .icon { color: #6666ff; transform: scale(1.1); }
    .frame-4 .info-list li:nth-child(4) .icon { color: #ffff66; transform: scale(1.1); }
  </style>
</head>
<body>
  <div class="render-target frame-${frameNumber}">
    <div>
      <h1 class="shop-title">
        THE BLACK SHOP
      </h1>
      <div class="shop-subtitle">디아블로4 시즌9 버스 · 대리 · 아이템 전문 거래소</div>
      <hr class="subtitle-divider">
    </div>
    
    <ul class="info-list">
      <li><span class="icon">🦾</span>모든 장비, 아이템, 재료 완비</li>
      <li><span class="icon">🚌</span>버스, 대리, 세팅 풀 지원</li>
      <li><span class="icon">🦸‍♂️</span>경험 많은 전문 기사 상시 대기</li>
      <li><span class="icon">🔥</span>합리적인 실시간 최저가 보장</li>
    </ul>
    
    <div class="cta-btn">
      💬 오픈채팅은 가격표 클릭!
    </div>
    
    <hr class="divider">
    
    <div>
      <h2 class="section-price-title">💰 실시간 가격표</h2>
    </div>
    
    <!-- 사용자 텍스트 영역 -->
    <div class="description">
      ${userText.replace(/\n/g, '<br>')}
    </div>
  </div>
</body>
</html>`;
    };

    console.log('✅ 템플릿 생성 완료');

    // 4. Cloudinary로 4프레임 생성
    const frames = [];
    
    for (let frameNumber = 1; frameNumber <= 4; frameNumber++) {
      console.log(`📸 프레임 ${frameNumber} 생성 중...`);
      
      // 각 프레임별 HTML 생성
      const frameHtml = getTemplate(text, frameNumber, dynamicHeight);
      
      try {
        // Cloudinary HTML to Image API 호출
        const response = await cloudinary.uploader.upload(
          `data:text/html;base64,${Buffer.from(frameHtml).toString('base64')}`,
          {
            public_id: `theblack_frame_${frameNumber}_${Date.now()}`,
            resource_type: 'image',
            format: 'png',
            width: 720,
            height: dynamicHeight,
            crop: 'limit', // 크기 제한 모드
            quality: 90,
            flags: 'immutable_cache', // 캐싱 최적화
          }
        );
        
        // Cloudinary URL을 Base64로 변환
        const imageResponse = await fetch(response.secure_url);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = `data:image/png;base64,${Buffer.from(imageBuffer).toString('base64')}`;
        
        frames.push(base64Image);
        console.log(`✅ 프레임 ${frameNumber} 완료 (URL: ${response.secure_url})`);
        
      } catch (cloudinaryError) {
        console.error(`❌ 프레임 ${frameNumber} Cloudinary 오류:`, cloudinaryError);
        throw new Error(`프레임 ${frameNumber} 생성 실패: ${cloudinaryError.message}`);
      }
    }

    console.log('🎉 모든 프레임 생성 완료');

    // 5. 성공 응답 반환
    return res.status(200).json({
      success: true,
      frames: frames,
      frameCount: 4,
      dynamicHeight: dynamicHeight,
      message: '프레임 생성 완료'
    });

  } catch (error) {
    console.error('❌ 프레임 생성 오류:', error);
    
    return res.status(500).json({
      success: false,
      error: `프레임 생성 실패: ${error.message}`,
      details: error.stack
    });
  }
}

/**
 * 사용법:
 * 
 * POST /api/generate-frames
 * Content-Type: application/json
 * 
 * {
 *   "text": "실시간 가격표\n아이템1: 100원\n아이템2: 200원\n..."
 * }
 * 
 * 응답:
 * {
 *   "success": true,
 *   "frames": ["data:image/png;base64,...", ...],
 *   "frameCount": 4,
 *   "dynamicHeight": 1500,
 *   "message": "프레임 생성 완료"
 * }
 */