// ==========================================
// 🌐 통합 다국어(i18n) 및 모달 관리 모듈
// ==========================================

const i18nData = {
  ko: {
    settingBtn: "⚙ 설정", settingTitle: "설정", 
    historyBtn: "📜 기록", historyModalTitle: "최근 매칭 기록", emptyHistory: "아직 매칭 기록이 없습니다.", clearHistoryBtn: "기록 모두 지우기", closeHistoryBtn: "닫기",
    langMenuBtn: "🌐 언어 설정", langModalTitle: "언어 설정", closeLangModal: "닫기",
    prevBtn: "이전 단계", nextBtn: "다음 단계", nextBtnResult: "추천 결과 보기 ✨",
    alert_primary: "기준을 선택해주세요.", alert_situation: "현재 상황을 선택해주세요.", alert_detail: "상세 항목을 선택해주세요.",
    alert_ott: "올바른 OTT를 선택해주세요.", alert_error: "결과를 불러오는 중 문제가 발생했습니다.", alert_copied: "결과가 이미지로 저장되었습니다!",
    mainTitle: "🍿 뭐 볼까, 뭐 먹을까", mainDesc: "OTT와 음식 조합을 한 번에 추천해주는 서비스",
    step1Title: "1. 어떤 것을 먼저 고르시겠어요?", step1Opt1: "📺 볼 콘텐츠(OTT) 기준", step1Opt2: "🍕 먹을 음식 메뉴 기준",
    step2Title: "2. 현재 식사 상황은 어떠신가요?",
    meal_honbab: "혼밥", meal_yasik: "야식", meal_friends: "친구와 함께", meal_couple: "연인과 함께", meal_light: "간단한 식사", meal_heavy: "든든한 식사",
    step3OttTitle: "3. 이용 중인 OTT 플랫폼을 알려주세요.", step3FoodTitle: "3. 어떤 종류의 음식이 끌리시나요?", step4OttTitle: "4. 이용 중인 OTT 플랫폼을 알려주세요.",
    food_chicken_pizza: "치킨/피자", food_bunsik: "분식(떡볶이 등)", food_korean: "한식(국밥/찌개)", food_western: "양식(파스타 등)",
    ott_netflix: "Netflix", ott_disney: "Disney+", ott_tving: "TVING", ott_wavve: "wavve",
    loadingTitle: "맞춤 조합을 찾는 중입니다...", loadingDesc: "잠시만 기다려주세요 🍿",
    resultTitle: "✨ 맞춤 추천 결과 ✨", resContentTitle: "🎬 추천 콘텐츠", resFoodTitle: "🍕 추천 음식", resComboTitle: "💡 Best Match Combo",
    shareBtn: "결과 공유하기 🔗", resetBtn: "처음부터 다시하기",
    genreTitle: "장르 카테고리", tab_all: "전체", tab_action: "액션", tab_comedy: "코미디", tab_drama: "드라마", tab_romance: "로맨스", tab_thriller: "스릴러", tab_animation: "애니메이션",
    clickPosterInfo: "영화 포스터를 클릭하면 설명과 추천 음식이 표시됩니다.", backToMainBtn: "메인으로 돌아가기",
    loadingText: "영화 목록을 불러오는 중입니다...", movieDescHeader: "🎬 영화 설명", foodRecHeader: "🍽 추천 음식",
    releaseDate: "개봉일", rating: "평점", noReleaseInfo: "개봉일 정보 없음", noRatingInfo: "정보 없음",
    noOverview: "줄거리 정보가 없습니다.", noTitle: "제목 없음", noMoviesTitle: "선택한 조건에 맞는 영화가 없습니다.", noMoviesDesc: "다른 장르를 선택하거나 검색을 다시 시도해보세요.",
    modalResultTitle: "✨ 맞춤 추천 결과 ✨", modalMovieHeader: "🎬 선택한 영화", modalFoodHeader: "🍽 추천 음식", modalShareBtn: "결과 공유하기 🔗", closeFinalResultModal: "닫기",
    recommendInfoTitle: "이렇게 추천해요",
    infoLabel1: "영화 장르", infoDesc1: "선택한 영화의 분위기를 반영해요.",
    infoLabel2: "식사 상황", infoDesc2: "혼밥, 야식, 친구와 함께 등 상황을 고려해요.",
    infoLabel3: "음식 카테고리", infoDesc3: "장르와 상황에 어울리는 메뉴를 추천해요.",
    recommendPageTitle: "추천 상세", recommendPageInfo: "선택한 영화와 어울리는 음식을 확인해보세요.",
    recommendLoadingText: "추천 정보를 불러오는 중입니다...", reactionTitle: "이 추천은 어땠나요?",
    likeBtn: "👍 좋아요", dislikeBtn: "👎 싫어요", saveComboBtn: "💾 조합 저장", backToMovieBtn: "영화 목록으로 돌아가기",
    errorLoadMovie: "영화 정보를 불러오지 못했습니다.",
    savedComboTitle: "최근 저장한 조합", savedComboDesc: "마음에 든 조합을 다시 확인해보세요.", editSavedComboBtn: "수정",
    savedManageTitle: "저장한 조합 관리", savedViewTitle: "저장한 조합 전체보기", savedManageDoneBtn: "닫기", savedViewDoneBtn: "닫기",
    savedEmptyTitle: "아직 저장한 조합이 없어요", savedEmptyDesc: "영화 상세 페이지에서 마음에 드는 조합을 저장하면 이곳에 표시됩니다.", noPoster: "포스터 없음", cancelSave: "저장 취소", noSavedCombo: "저장된 조합이 없습니다.", comboDeleted: "저장한 조합이 삭제되었습니다.",
    
    // AI 추천 관련 추가 다국어
    aiPickTitle: "AI가 골라본 조합", aiPickDesc: "저장한 취향과 랜덤 추천을 섞어 3가지를 보여드려요.", refreshAiPickBtn: "새로 추천",
    aiPickLoadingTitle: "AI가 조합을 고르는 중이에요", aiPickLoadingDesc: "저장한 조합을 참고해서 추천을 만들고 있어요. 잠시만 기다려주세요.",
    aiPickErrorTitle: "AI 추천을 불러오지 못했어요", aiPickErrorDesc: "잠시 후 다시 시도해주세요. 지금은 기본 추천 조합을 대신 보여드릴게요.", aiPickErrorAlert: "AI 추천 연결이 불안정해요. 잠시 후 다시 시도해주세요.",
    aiBadgeBased: "취향 기반", aiBadgeRandom: "랜덤 추천",
    aiTitleWait: "저장 조합을 기다리는 추천", aiReasonWait: "아직 저장한 조합이 많지 않아, 누구나 편하게 즐길 수 있는 조합으로 추천했어요.",
    aiTitleRecent: "최근 저장 조합을 참고했어요", aiTitleRandom: "오늘은 이런 조합 어때요?", aiReasonRandom: "평소와 다른 조합을 시도해볼 수 있도록 무작위로 골라봤어요.",
    aiRowMovie: "🎬 추천 영화 분위기", aiRowGenre: "🎭 추천 장르", aiRowFood: "🍽 추천 음식", aiClickGuide: "이 장르 영화 보러가기 →",
    aiHint_action: "빠른 전개의 액션 영화", aiHint_comedy: "가볍게 웃기 좋은 코미디 영화", aiHint_drama: "잔잔하게 몰입하기 좋은 드라마 영화", aiHint_romance: "분위기 있게 보기 좋은 로맨스 영화", aiHint_thriller: "긴장감 있는 스릴러 영화", aiHint_animation: "편하게 보기 좋은 애니메이션 영화",
    
    // 💡 누락되었던 한국어 데이터 복구 (알림 및 상세 페이지 항목)
    recDate: "개봉일:", recRating: "평점:", recRuntime: "상영 시간:", recGenreLabel: "영화 장르:", recMovieDesc: "🎬 영화 설명", recFoodRec: "🍽 추천 음식", recReason: "💡 추천 사유",
    alert_like: "좋아요가 반영되었습니다.", alert_dislike: "싫어요가 반영되었습니다.", alert_already_saved: "이미 저장된 조합입니다.", alert_saved: "조합이 저장되었습니다.",
    mins: "분", infoNone: "정보 없음",
    sortPop: "인기순 ▾", sortRate: "평점순 ▾", sortLate: "최신순 ▾", sortName: "이름순 ▾", sortOptPop: "인기순", sortOptRate: "평점순", sortOptLate: "최신순", sortOptName: "이름순"
  },
  en: {
    settingBtn: "⚙ Settings", settingTitle: "Settings", 
    historyBtn: "📜 History", historyModalTitle: "Recent Matches", emptyHistory: "No match history yet.", clearHistoryBtn: "Clear History", closeHistoryBtn: "Close",
    langMenuBtn: "🌐 Language", langModalTitle: "Language Settings", closeLangModal: "Close",
    prevBtn: "Previous", nextBtn: "Next", nextBtnResult: "View Result ✨",
    alert_primary: "Please select a criteria.", alert_situation: "Please select your current situation.", alert_detail: "Please select a detailed item.",
    alert_ott: "Please select a valid OTT.", alert_error: "A problem occurred while fetching results.", alert_copied: "Result saved as an image!",
    mainTitle: "🍿 What to Watch, What to Eat", mainDesc: "OTT and food combination recommendation service",
    step1Title: "1. Which one would you like to choose first?", step1Opt1: "📺 Based on Content (OTT)", step1Opt2: "🍕 Based on Food Menu",
    step2Title: "2. What is your current meal situation?",
    meal_honbab: "Eating Alone", meal_yasik: "Late Snack", meal_friends: "With Friends", meal_couple: "With Partner", meal_light: "Light Meal", meal_heavy: "Hearty Meal",
    step3OttTitle: "3. Please select your OTT platform.", step3FoodTitle: "3. What kind of food are you craving?", step4OttTitle: "4. Please select your OTT platform.",
    food_chicken_pizza: "Chicken/Pizza", food_bunsik: "Street Food", food_korean: "Korean Food", food_western: "Western Food",
    ott_netflix: "Netflix", ott_disney: "Disney+", ott_tving: "TVING", ott_wavve: "wavve",
    loadingTitle: "Finding the perfect match...", loadingDesc: "Please wait a moment 🍿",
    resultTitle: "✨ Recommendation Results ✨", resContentTitle: "🎬 Recommended Content", resFoodTitle: "🍕 Recommended Food", resComboTitle: "💡 Best Match Combo",
    shareBtn: "Save Image 🔗", resetBtn: "Restart",
    genreTitle: "Genre Categories", tab_all: "All", tab_action: "Action", tab_comedy: "Comedy", tab_drama: "Drama", tab_romance: "Romance", tab_thriller: "Thriller", tab_animation: "Animation",
    clickPosterInfo: "Click a movie poster to view description and food pairing.", backToMainBtn: "Go to Main",
    loadingText: "Loading movies...", movieDescHeader: "🎬 Movie Details", foodRecHeader: "🍽 Food Pairing",
    releaseDate: "Release", rating: "Rating", noReleaseInfo: "No date info", noRatingInfo: "No info",
    noOverview: "No plot description available.", noTitle: "No Title", noMoviesTitle: "No movies found matching criteria.", noMoviesDesc: "Try selecting another genre or search again.",
    modalResultTitle: "✨ Recommendation Result ✨", modalMovieHeader: "🎬 Selected Movie", modalFoodHeader: "🍽 Food Pairing", modalShareBtn: "Save Image 🔗", closeFinalResultModal: "Close",
    recommendInfoTitle: "How We Recommend",
    infoLabel1: "Movie Genre", infoDesc1: "Reflects the mood of your selected movie.",
    infoLabel2: "Meal Setting", infoDesc2: "Considers your situation like eating alone or with friends.",
    infoLabel3: "Food Category", infoDesc3: "Suggests the best menu matching the genre and setting.",
    recommendPageTitle: "Recommendation Details", recommendPageInfo: "Check out the food pairing for your selected movie.",
    recommendLoadingText: "Loading recommendation info...", reactionTitle: "How was this recommendation?",
    likeBtn: "👍 Like", dislikeBtn: "👎 Dislike", saveComboBtn: "💾 Save Combo", backToMovieBtn: "Back to Movies",
    errorLoadMovie: "Failed to load movie information.",
    savedComboTitle: "Recently Saved Combos", savedComboDesc: "Check out your favorite combos again.", editSavedComboBtn: "Edit",
    savedManageTitle: "Manage Saved Combos", savedViewTitle: "View All Saved Combos", savedManageDoneBtn: "Close", savedViewDoneBtn: "Close",
    savedEmptyTitle: "No saved combos yet", savedEmptyDesc: "Save your favorite combos on the movie details page and they will appear here.", noPoster: "No Poster", cancelSave: "Unsave", noSavedCombo: "There are no saved combos.", comboDeleted: "Saved combo has been deleted.",
    
    aiPickTitle: "AI Picked Combos", aiPickDesc: "Here are 3 combos mixing your tastes and random picks.", refreshAiPickBtn: "Refresh",
    aiPickLoadingTitle: "AI is picking a combo", aiPickLoadingDesc: "Creating recommendations based on your saved combos. Please wait.",
    aiPickErrorTitle: "Failed to load AI recommendations", aiPickErrorDesc: "Please try again later. Showing default recommendations for now.", aiPickErrorAlert: "AI connection unstable. Try again later.",
    aiBadgeBased: "Taste Based", aiBadgeRandom: "Random Pick",
    aiTitleWait: "Awaiting saved combos", aiReasonWait: "Not many saved combos yet, so we recommend a universally enjoyable combo.",
    aiTitleRecent: "Based on recently saved combos", aiTitleRandom: "How about this combo today?", aiReasonRandom: "Picked randomly so you can try something different.",
    aiRowMovie: "🎬 Movie Vibe", aiRowGenre: "🎭 Genre", aiRowFood: "🍽 Recommended Food", aiClickGuide: "Watch this genre →",
    aiHint_action: "Fast-paced action", aiHint_comedy: "Lighthearted comedy", aiHint_drama: "Immersive emotional drama", aiHint_romance: "Atmospheric romantic movie", aiHint_thriller: "Tense thriller", aiHint_animation: "Easy-to-watch animation",
    
    recDate: "Release:", recRating: "Rating:", recRuntime: "Runtime:", recGenreLabel: "Genre:", recMovieDesc: "🎬 Movie Description", recFoodRec: "🍽 Recommended Food", recReason: "💡 Reason",
    alert_like: "Like recorded.", alert_dislike: "Dislike recorded.", alert_already_saved: "Already saved combo.", alert_saved: "Combo saved.",
    mins: " min", infoNone: "No info",
    sortPop: "Popular ▾", sortRate: "Rating ▾", sortLate: "Latest ▾", sortName: "Title ▾", sortOptPop: "Popular", sortOptRate: "Rating", sortOptLate: "Latest", sortOptName: "Title"
  },
  zh: {
    settingBtn: "⚙ 设置", settingTitle: "设置", 
    historyBtn: "📜 记录", historyModalTitle: "最近匹配记录", emptyHistory: "暂无匹配记录。", clearHistoryBtn: "清空记录", closeHistoryBtn: "关闭",
    langMenuBtn: "🌐 语言设置", langModalTitle: "语言设置", closeLangModal: "关闭",
    prevBtn: "上一步", nextBtn: "下一步", nextBtnResult: "查看推荐结果 ✨",
    alert_primary: "请选择基准。", alert_situation: "请选择当前的用餐场景。", alert_detail: "请选择详细项目。",
    alert_ott: "请选择正确的 OTT 平台。", alert_error: "加载结果时出错，请重试。", alert_copied: "结果已保存为图片！",
    mainTitle: "🍿 看什么，吃什么", mainDesc: "一键推荐 OTT 视频与美食的高端搭配服务",
    step1Title: "1. 您想先选择哪一项？", step1Opt1: "📺 基于观看内容 (OTT)", step1Opt2: "🍕 基于想吃的食物",
    step2Title: "2. 您目前的用餐场景是什么？",
    meal_honbab: "一人食", meal_yasik: "夜宵", meal_friends: "朋友聚会", meal_couple: "恋人约会", meal_light: "简单便餐", meal_heavy: "丰盛正餐",
    step3OttTitle: "3. 请选择您正在使用的 OTT 平台。", step3FoodTitle: "3. 您现在想吃哪类食物？", step4OttTitle: "4. 请选择您正在使用的 OTT 平台。",
    food_chicken_pizza: "炸鸡/披萨", food_bunsik: "韩式小吃 (辣炒年糕等)", food_korean: "韩餐 (汤饭/汤锅)", food_western: "西餐 (意面等)",
    ott_netflix: "网飞", ott_disney: "迪士尼+", ott_tving: "TVING", ott_wavve: "wavve",
    loadingTitle: "正在为您寻找完美搭配...", loadingDesc: "请稍等片刻 🍿",
    resultTitle: "✨ 专属推荐结果 ✨", resContentTitle: "🎬 推荐内容", resFoodTitle: "🍕 推荐美食", resComboTitle: "💡 最佳绝配 Combo",
    shareBtn: "保存图片 🔗", resetBtn: "重新开始",
    genreTitle: "类型目录", tab_all: "全部", tab_action: "动作", tab_comedy: "喜剧", tab_drama: "剧情", tab_romance: "爱情", tab_thriller: "惊悚", tab_animation: "动画",
    clickPosterInfo: "点击电影海报可查看说明与美食搭配。", backToMainBtn: "返回主页",
    loadingText: "正在加载电影列表...", movieDescHeader: "🎬 电影简介", foodRecHeader: "🍽 美食搭配",
    releaseDate: "上映日期", rating: "评分", noReleaseInfo: "暂无上映信息", noRatingInfo: "暂无评分",
    noOverview: "暂无剧情简介。", noTitle: "无题", noMoviesTitle: "没有找到符合条件的电影。", noMoviesDesc: "尝试选择其他类型或重新搜索。",
    modalResultTitle: "✨ 专属推荐结果 ✨", modalMovieHeader: "🎬 已选电影", modalFoodHeader: "🍽 美食搭配", modalShareBtn: "保存图片 🔗", closeFinalResultModal: "关闭",
    recommendInfoTitle: "推荐方式",
    infoLabel1: "电影类型", infoDesc1: "反映所选电影的氛围。",
    infoLabel2: "用餐场景", infoDesc2: "考虑一人食、夜宵、朋友聚会等场景。",
    infoLabel3: "美食类别", infoDesc3: "推荐适合类型与场景的绝佳菜单。",
    recommendPageTitle: "推荐详情", recommendPageInfo: "查看与所选电影搭配的美食。",
    recommendLoadingText: "正在加载推荐信息...", reactionTitle: "这个推荐怎么样？",
    likeBtn: "👍 喜欢", dislikeBtn: "👎 不喜欢", saveComboBtn: "💾 保存组合", backToMovieBtn: "返回电影列表",
    errorLoadMovie: "无法加载电影信息。",
    savedComboTitle: "最近保存的组合", savedComboDesc: "再次查看您喜欢的组合。", editSavedComboBtn: "编辑",
    savedManageTitle: "管理保存的组合", savedViewTitle: "查看所有组合", savedManageDoneBtn: "关闭", savedViewDoneBtn: "关闭",
    savedEmptyTitle: "暂无保存的组合", savedEmptyDesc: "在电影详情页保存您喜欢的组合，它们会显示在这里。", noPoster: "无海报", cancelSave: "取消保存", noSavedCombo: "没有保存的组合。", comboDeleted: "保存的组合已删除。",
    
    aiPickTitle: "AI为您挑选的组合", aiPickDesc: "结合您的口味和随机推荐，为您展示3种组合。", refreshAiPickBtn: "换一批",
    aiPickLoadingTitle: "AI正在为您挑选组合", aiPickLoadingDesc: "正在参考您保存的组合生成推荐。请稍候。",
    aiPickErrorTitle: "无法加载AI推荐", aiPickErrorDesc: "请稍后再试。现在将显示默认推荐组合。", aiPickErrorAlert: "AI连接不稳定。请稍后再试。",
    aiBadgeBased: "基于口味", aiBadgeRandom: "随机推荐",
    aiTitleWait: "等待保存组合的推荐", aiReasonWait: "因为保存的组合还不多，为您推荐大家都喜欢的组合。",
    aiTitleRecent: "参考了最近保存的组合", aiTitleRandom: "今天尝试这个组合怎么样？", aiReasonRandom: "随机挑选，让您尝试与平时不同的组合。",
    aiRowMovie: "🎬 推荐电影氛围", aiRowGenre: "🎭 推荐类型", aiRowFood: "🍽 推荐美食", aiClickGuide: "查看此类型电影 →",
    aiHint_action: "快节奏动作片", aiHint_comedy: "轻松搞笑喜剧", aiHint_drama: "沉浸式温情剧情片", aiHint_romance: "唯美浪漫爱情片", aiHint_thriller: "紧张刺激的惊悚片", aiHint_animation: "轻松治愈的动画片",

    recDate: "上映日期:", recRating: "评分:", recRuntime: "时长:", recGenreLabel: "电影类型:", recMovieDesc: "🎬 电影简介", recFoodRec: "🍽 推荐美食", recReason: "💡 推荐理由",
    alert_like: "已点赞。", alert_dislike: "已点踩。", alert_already_saved: "已保存过该组合。", alert_saved: "组合已保存。",
    mins: "分钟", infoNone: "暂无信息",
    sortPop: "热门 ▾", sortRate: "评分 ▾", sortLate: "最新 ▾", sortName: "名称 ▾", sortOptPop: "热门", sortOptRate: "评分", sortOptLate: "最新", sortOptName: "名称"
  },
  ja: {
    settingBtn: "⚙ 設定", settingTitle: "設定", 
    historyBtn: "📜 履歴", historyModalTitle: "最近のマッチング履歴", emptyHistory: "まだ履歴がありません。", clearHistoryBtn: "履歴をすべて消去", closeHistoryBtn: "閉じる",
    langMenuBtn: "🌐 言語設定", langModalTitle: "言語設定", closeLangModal: "閉じる",
    prevBtn: "前へ", nextBtn: "次へ", nextBtnResult: "おすすめ結果を見る ✨",
    alert_primary: "基準を選択してください。", alert_situation: "現在の状況を選択してください。", alert_detail: "詳細項目を選択してください。",
    alert_ott: "正しいOTTを選択してください。", alert_error: "結果の読み込み中に問題が発生しました。", alert_copied: "結果が画像として保存されました！",
    mainTitle: "🍿 何見る？何食べる？", mainDesc: "OTTと食べ物の組み合わせを一度におすすめするサービス",
    step1Title: "1. どちらを先に選びますか？", step1Opt1: "📺 コンテンツ(OTT)基準", step1Opt2: "🍕 食べ物基準",
    step2Title: "2. 現在の食事の状況は？",
    meal_honbab: "一人ご飯", meal_yasik: "夜食", meal_friends: "友達と一緒に", meal_couple: "恋人と一緒に", meal_light: "軽食", meal_heavy: "がっつり食事",
    step3OttTitle: "3. ご利用のOTTプラットフォームを教えてください。", step3FoodTitle: "3. どんな食べ物が食べたいですか？", step4OttTitle: "4. ご利用のOTTプラットフォームを教えてください。",
    food_chicken_pizza: "チキン/ピザ", food_bunsik: "粉食(トッポッキなど)", food_korean: "韓国料理", food_western: "洋食",
    ott_netflix: "Netflix", ott_disney: "Disney+", ott_tving: "TVING", ott_wavve: "wavve",
    loadingTitle: "ぴったりな組み合わせを探しています...", loadingDesc: "少々お待ちください 🍿",
    resultTitle: "✨ おすすめの結果 ✨", resContentTitle: "🎬 おすすめコンテンツ", resFoodTitle: "🍕 おすすめの食べ物", resComboTitle: "💡 ベストマッチコンボ",
    shareBtn: "結果をシェアする 🔗", resetBtn: "最初からやり直す",
    genreTitle: "ジャンルカテゴリー", tab_all: "すべて", tab_action: "アクション", tab_comedy: "コメディ", tab_drama: "ドラマ", tab_romance: "ロマンス", tab_thriller: "スリラー", tab_animation: "アニメ",
    clickPosterInfo: "映画のポスターをクリックすると、説明とおすすめの食べ物が表示されます。", backToMainBtn: "メインに戻る",
    loadingText: "映画リストを読み込んでいます...", movieDescHeader: "🎬 映画の説明", foodRecHeader: "🍽 おすすめの食べ物",
    releaseDate: "公開日", rating: "評価", noReleaseInfo: "公開日情報なし", noRatingInfo: "情報なし",
    noOverview: "あらすじ情報がありません。", noTitle: "タイトルなし", noMoviesTitle: "条件に一致する映画がありません。", noMoviesDesc: "別のジャンルを選択するか、再度検索してみてください。",
    modalResultTitle: "✨ おすすめの結果 ✨", modalMovieHeader: "🎬 選択した映画", modalFoodHeader: "🍽 おすすめの食べ物", modalShareBtn: "結果をシェアする 🔗", closeFinalResultModal: "閉じる",
    recommendInfoTitle: "おすすめの理由",
    infoLabel1: "映画のジャンル", infoDesc1: "選択した映画の雰囲気を反映します。",
    infoLabel2: "食事の状況", infoDesc2: "一人ご飯、夜食、友達と一緒などの状況を考慮します。",
    infoLabel3: "食べ物のカテゴリー", infoDesc3: "ジャンルと状況に合うメニューをおすすめします。",
    recommendPageTitle: "おすすめの詳細", recommendPageInfo: "選択した映画に合う食べ物を確認してみてください。",
    recommendLoadingText: "おすすめ情報を読み込んでいます...", reactionTitle: "このおすすめはどうでしたか？",
    likeBtn: "👍 いいね", dislikeBtn: "👎 いまいち", saveComboBtn: "💾 コンボを保存", backToMovieBtn: "映画リストに戻る",
    errorLoadMovie: "映画情報を読み込めませんでした。",
    savedComboTitle: "最近保存したコンボ", savedComboDesc: "お気に入りのコンボをもう一度確認してみてください。", editSavedComboBtn: "編集",
    savedManageTitle: "保存したコンボの管理", savedViewTitle: "保存したコンボをすべて見る", savedManageDoneBtn: "閉じる", savedViewDoneBtn: "閉じる",
    savedEmptyTitle: "まだ保存したコンボがありません", savedEmptyDesc: "映画の詳細ページでお気に入りのコンボを保存すると、ここに表示されます。", noPoster: "ポスターなし", cancelSave: "保存取消", noSavedCombo: "保存されたコンボはありません。", comboDeleted: "保存したコンボが削除されました。",
    
    aiPickTitle: "AIが選んだコンボ", aiPickDesc: "保存した好みとランダムおすすめを混ぜて3つご紹介します。", refreshAiPickBtn: "新しくおすすめ",
    aiPickLoadingTitle: "AIがコンボを選んでいます", aiPickLoadingDesc: "保存したコンボを参考におすすめを作成しています。少々お待ちください。",
    aiPickErrorTitle: "AIのおすすめを読み込めませんでした", aiPickErrorDesc: "後でもう一度お試しください。現在はデフォルトのおすすめを表示しています。", aiPickErrorAlert: "AI接続が不安定です。後でもう一度お試しください。",
    aiBadgeBased: "好みベース", aiBadgeRandom: "ランダムおすすめ",
    aiTitleWait: "保存コンボ待ちのおすすめ", aiReasonWait: "まだ保存されたコンボが多くないため、誰でも楽しめるコンボをおすすめしました。",
    aiTitleRecent: "最近保存したコンボを参考にしました", aiTitleRandom: "今日はこんなコンボいかがですか？", aiReasonRandom: "いつもと違うコンボを試せるよう、ランダムに選びました。",
    aiRowMovie: "🎬 おすすめ映画の雰囲気", aiRowGenre: "🎭 おすすめジャンル", aiRowFood: "🍽 おすすめの食べ物", aiClickGuide: "このジャンルの映画を見る →",
    aiHint_action: "テンポの速いアクション", aiHint_comedy: "気軽に笑えるコメディ", aiHint_drama: "静かに没入できるドラマ", aiHint_romance: "雰囲気の良いロマンス", aiHint_thriller: "緊張感のあるスリラー", aiHint_animation: "見やすいアニメ",

    recDate: "公開日:", recRating: "評価:", recRuntime: "上映時間:", recGenreLabel: "映画ジャンル:", recMovieDesc: "🎬 映画の説明", recFoodRec: "🍽 おすすめの食べ物", recReason: "💡 おすすめの理由",
    alert_like: "いいねを反映しました。", alert_dislike: "いまいちを反映しました。", alert_already_saved: "すでに保存されたコンボです。", alert_saved: "コンボが保存されました。",
    mins: "分", infoNone: "情報なし",
    sortPop: "人気順 ▾", sortRate: "評価順 ▾", sortLate: "最新順 ▾", sortName: "名前順 ▾", sortOptPop: "人気順", sortOptRate: "評価順", sortOptLate: "最新順", sortOptName: "名前順"
  }
};

function getLang() { return localStorage.getItem("lang") || "ko"; }
function t(key) { return i18nData[getLang()][key] || key; }

function applyLanguage() {
  const lang = getLang();
  Object.keys(i18nData[lang]).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = i18nData[lang][id];
  });

  const darkModeToggle = document.getElementById("darkModeToggle");
  if (darkModeToggle) {
    if (document.body.classList.contains("dark-mode")) {
      darkModeToggle.textContent = lang === "ko" ? "☀️ 라이트 모드" : (lang === "en" ? "☀️ Light Mode" : (lang === "zh" ? "☀️ 浅色模式" : "☀️ ライトモード"));
    } else {
      darkModeToggle.textContent = lang === "ko" ? "🌙 다크 모드" : (lang === "en" ? "🌙 Dark Mode" : (lang === "zh" ? "🌙 深色模式" : "🌙 ダークモード"));
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const langMenuBtn = document.getElementById("langMenuBtn");
  const langModal = document.getElementById("langModal");
  const closeLangModal = document.getElementById("closeLangModal");
  const settingPopup = document.getElementById("settingPopup");

  if (langMenuBtn && langModal) {
    langMenuBtn.addEventListener("click", () => {
      if (settingPopup) settingPopup.classList.add("hidden");
      langModal.classList.add("show");
      
      const currentLang = getLang();
      document.querySelectorAll(".lang-select-btn").forEach(btn => {
        if(btn.dataset.lang === currentLang) btn.classList.add("active-lang");
        else btn.classList.remove("active-lang");
      });
    });
  }

  if (closeLangModal) {
    closeLangModal.addEventListener("click", () => langModal.classList.remove("show"));
  }
  if (langModal) {
    langModal.addEventListener("click", (e) => {
      if (e.target === langModal) langModal.classList.remove("show");
    });
  }

  document.querySelectorAll(".lang-select-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const selectedLang = e.currentTarget.dataset.lang;
      localStorage.setItem("lang", selectedLang);
      applyLanguage();
      langModal.classList.remove("show");
      document.dispatchEvent(new Event("languageChanged"));
    });
  });
  
  applyLanguage();
});
