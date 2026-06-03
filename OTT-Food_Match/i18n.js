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
    ott_netflix: "넷플릭스", ott_disney: "디즈니+", ott_tving: "티빙", ott_wavve: "웨이브",
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
    
    // 추가된 부분: 저장된 조합 및 모달창
    savedComboTitle: "최근 저장한 조합",
    savedComboDesc: "마음에 든 조합을 다시 확인해보세요.",
    editSavedComboBtn: "수정",
    savedManageTitle: "저장한 조합 관리",
    savedViewTitle: "저장한 조합 전체보기",
    savedManageDoneBtn: "닫기",
    savedViewDoneBtn: "닫기"
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
    
    // 추가된 부분: 저장된 조합 및 모달창
    savedComboTitle: "Recently Saved Combos",
    savedComboDesc: "Check out your favorite combos again.",
    editSavedComboBtn: "Edit",
    savedManageTitle: "Manage Saved Combos",
    savedViewTitle: "View All Saved Combos",
    savedManageDoneBtn: "Close",
    savedViewDoneBtn: "Close"
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
    
    // 추가된 부분: 저장된 조합 및 모달창
    savedComboTitle: "最近保存的组合",
    savedComboDesc: "再次查看您喜欢的组合。",
    editSavedComboBtn: "编辑",
    savedManageTitle: "管理保存的组合",
    savedViewTitle: "查看所有组合",
    savedManageDoneBtn: "关闭",
    savedViewDoneBtn: "关闭"
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
    
    // 추가된 부분: 저장된 조합 및 모달창
    savedComboTitle: "最近保存したコンボ",
    savedComboDesc: "お気に入りのコンボをもう一度確認してみてください。",
    editSavedComboBtn: "編集",
    savedManageTitle: "保存したコンボの管理",
    savedViewTitle: "保存したコンボをすべて見る",
    savedManageDoneBtn: "閉じる",
    savedViewDoneBtn: "閉じる"
  }
  , es: {
    settingBtn: "⚙ Configuración", settingTitle: "Configuración", 
    historyBtn: "📜 Historial", historyModalTitle: "Historial Reciente", emptyHistory: "Aún no hay historial.", clearHistoryBtn: "Borrar Historial", closeHistoryBtn: "Cerrar",
    langMenuBtn: "🌐 Idioma", langModalTitle: "Configuración de Idioma", closeLangModal: "Cerrar",
    prevBtn: "Anterior", nextBtn: "Siguiente", nextBtnResult: "Ver Resultado ✨",
    alert_primary: "Por favor, seleccione un criterio.", alert_situation: "Por favor, seleccione su situación actual.", alert_detail: "Por favor, seleccione un elemento detallado.",
    alert_ott: "Por favor, seleccione un OTT válido.", alert_error: "Ocurrió un error al cargar los resultados.", alert_copied: "¡Resultado guardado como imagen!",
    mainTitle: "🍿 Qué ver, Qué comer", mainDesc: "Servicio de recomendación de combinaciones de OTT y comida",
    step1Title: "1. ¿Qué le gustaría elegir primero?", step1Opt1: "📺 Basado en Contenido (OTT)", step1Opt2: "🍕 Basado en Comida",
    step2Title: "2. ¿Cuál es su situación actual de comida?",
    meal_honbab: "Comiendo Solo", meal_yasik: "Snack Nocturno", meal_friends: "Con Amigos", meal_couple: "Con Pareja", meal_light: "Comida Ligera", meal_heavy: "Comida Pesada",
    step3OttTitle: "3. Seleccione su plataforma OTT.", step3FoodTitle: "3. ¿Qué tipo de comida se le antoja?", step4OttTitle: "4. Seleccione su plataforma OTT.",
    food_chicken_pizza: "Pollo/Pizza", food_bunsik: "Comida Callejera", food_korean: "Comida Coreana", food_western: "Comida Occidental",
    ott_netflix: "Netflix", ott_disney: "Disney+", ott_tving: "TVING", ott_wavve: "wavve",
    loadingTitle: "Buscando la combinación perfecta...", loadingDesc: "Por favor espere un momento 🍿",
    resultTitle: "✨ Resultados de Recomendación ✨", resContentTitle: "🎬 Contenido Recomendado", resFoodTitle: "🍕 Comida Recomendada", resComboTitle: "💡 Mejor Combinación",
    shareBtn: "Guardar Imagen 🔗", resetBtn: "Reiniciar",
    genreTitle: "Categorías de Género", tab_all: "Todo", tab_action: "Acción", tab_comedy: "Comedia", tab_drama: "Drama", tab_romance: "Romance", tab_thriller: "Suspense", tab_animation: "Animación",
    clickPosterInfo: "Haga clic en el póster para ver la descripción y la recomendación de comida.", backToMainBtn: "Ir al Menú Principal",
    loadingText: "Cargando películas...", movieDescHeader: "🎬 Detalles de la Película", foodRecHeader: "🍽 Recomendación",
    releaseDate: "Estreno", rating: "Calificación", noReleaseInfo: "Sin fecha", noRatingInfo: "Sin info",
    noOverview: "No hay descripción disponible.", noTitle: "Sin Título", noMoviesTitle: "No se encontraron películas.", noMoviesDesc: "Intente seleccionar otro género o busque nuevamente.",
    modalResultTitle: "✨ Resultado de Recomendación ✨", modalMovieHeader: "🎬 Película Seleccionada", modalFoodHeader: "🍽 Comida Recomendada", modalShareBtn: "Guardar Imagen 🔗", closeFinalResultModal: "Cerrar",
    recommendInfoTitle: "Cómo Recomendamos",
    infoLabel1: "Género de Película", infoDesc1: "Refleja el ambiente de la película seleccionada.",
    infoLabel2: "Situación de Comida", infoDesc2: "Considera su situación, como comer solo o con amigos.",
    infoLabel3: "Categoría de Comida", infoDesc3: "Sugiere el mejor menú para el género y la situación.",
    recommendPageTitle: "Detalles de Recomendación", recommendPageInfo: "Revise la comida recomendada para su película.",
    recommendLoadingText: "Cargando información...", reactionTitle: "¿Qué tal esta recomendación?",
    likeBtn: "👍 Me gusta", dislikeBtn: "👎 No me gusta", saveComboBtn: "💾 Guardar Combinación", backToMovieBtn: "Volver a Películas",
    errorLoadMovie: "Error al cargar la información de la película.",
    savedComboTitle: "Combinaciones Guardadas",
    savedComboDesc: "Revise sus combinaciones favoritas.",
    editSavedComboBtn: "Editar",
    savedManageTitle: "Gestionar Combinaciones",
    savedViewTitle: "Ver Todas las Combinaciones",
    savedManageDoneBtn: "Cerrar",
    savedViewDoneBtn: "Cerrar"
  };
}



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
  document.dispatchEvent(new Event("languageChanged"));
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
    });
  });
  
  applyLanguage();
});

// 동적으로 렌더링되는 "더보기" 버튼 언어 변경 감지용 패치
document.addEventListener("languageChanged", () => {
  const savedMoreBtn = document.getElementById("savedMoreBtn");
  if (savedMoreBtn && !savedMoreBtn.classList.contains("hidden")) {
    const savedCombos = JSON.parse(localStorage.getItem("savedCombos")) || [];
    if (savedCombos.length > 4) {
       const lang = getLang();
       if (lang === "ko") savedMoreBtn.textContent = `저장 조합 더보기 (${savedCombos.length})`;
       else if (lang === "en") savedMoreBtn.textContent = `View More Combos (${savedCombos.length})`;
       else if (lang === "zh") savedMoreBtn.textContent = `查看更多组合 (${savedCombos.length})`;
       else if (lang === "ja") savedMoreBtn.textContent = `もっと見る (${savedCombos.length})`;
    }
  }
});